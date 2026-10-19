#!/usr/bin/env node
// P6: reproducible Chromium network/paint observations, not a Lighthouse score.
// Uses the same browser version as the functional E2E suite.
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const HOST = "127.0.0.1";
const PORT = 4191;
const external = process.env.GB_PERF_URL || "";
const ROOT = external || `http://${HOST}:${PORT}/`;
const origin = new URL(ROOT).origin;
const artifacts = "artifacts/e2e";
mkdirSync(artifacts, { recursive: true });

const server = external ? null : spawn("python3", ["-m", "http.server", String(PORT), "--bind", HOST], {
  stdio: ["ignore", "pipe", "pipe"],
});
async function ready() {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(ROOT);
      if (response.ok) return;
    } catch { /* still starting */ }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error("P6 local performance server not available");
}

const cases = [
  { route: "", label: "hub", maxSourceBytes: 350000, maxRequests: 24 },
  { route: "apply.html?lang=es&track=professional", label: "applications", maxSourceBytes: 120000, maxRequests: 18 },
];
const results = [];
if (!external) await ready();
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
try {
  for (const c of cases) for (const width of [390, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 900 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const errors = [];
    const unexpectedRemote = new Set();
    page.on("pageerror", (error) => errors.push(String(error)));
    page.on("request", (request) => {
      const url = request.url();
      if (/^https?:/.test(url) && new URL(url).origin !== origin) unexpectedRemote.add(url);
    });
    const response = await page.goto(new URL(c.route, ROOT).href, { waitUntil: "load", timeout: 30000 });
    assert.equal(response?.status(), 200, "P6 route must return HTTP 200");
    await page.locator(c.label === "hub" ? "#main" : ".candidate-brief").waitFor();
    // Paint entries can arrive one frame after the load event in headless Chromium.
    // The delay changes only when we sample, not the reported performance timestamps.
    await page.waitForTimeout(120);
    const observed = await page.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0];
      const resources = performance.getEntriesByType("resource")
        .filter((entry) => /^https?:/.test(entry.name))
        .map((entry) => ({
          path: new URL(entry.name).pathname,
          initiator: entry.initiatorType,
          decodedBytes: entry.decodedBodySize,
          encodedBytes: entry.encodedBodySize,
          transferredBytes: entry.transferSize,
          milliseconds: Math.round(entry.duration * 10) / 10,
        }));
      const fcp = performance.getEntriesByType("paint")
        .find((entry) => entry.name === "first-contentful-paint");
      return {
        navigation: {
          transferredBytes: nav.transferSize,
          decodedBytes: nav.decodedBodySize,
          domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd),
          loadMs: Math.round(nav.loadEventEnd),
        },
        fcpMs: fcp ? Math.round(fcp.startTime) : null,
        resources,
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: innerWidth,
      };
    });
    const decodedBytes = observed.navigation.decodedBytes +
      observed.resources.reduce((sum, entry) => sum + entry.decodedBytes, 0);
    const transferredBytes = observed.navigation.transferredBytes +
      observed.resources.reduce((sum, entry) => sum + entry.transferredBytes, 0);
    assert.deepEqual(errors, [], "P6 encountered JavaScript page errors");
    assert.deepEqual([...unexpectedRemote], [], "P6 must not add third-party resource dependencies");
    assert.ok(observed.documentWidth <= observed.viewportWidth + 1, "P6 horizontal overflow");
    assert.ok(decodedBytes <= c.maxSourceBytes, `P6 source budget exceeded: ${c.label} ${decodedBytes} > ${c.maxSourceBytes}`);
    assert.ok(observed.resources.length <= c.maxRequests, `P6 request budget exceeded: ${c.label}`);
    if (c.label === "hub") {
      const bar = page.locator(".scroll-progress i");
      const initial = await bar.evaluate((el) => getComputedStyle(el).transform);
      await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
      await page.waitForFunction(() => {
        const el = document.querySelector(".scroll-progress i");
        return el && Number.parseFloat(el.style.transform.match(/scaleX\(([^)]+)\)/)?.[1]) > 0.5;
      }, null, { timeout: 5000 });
      const final = await bar.evaluate((el) => getComputedStyle(el).transform);
      assert.notEqual(final, initial, "Compositor-driven scroll progress must move");
      assert.equal(await page.evaluate(() => document.documentElement.style.getPropertyValue("--scroll-progress")), "",
        "Scroll must not invalidate a CSS variable on the entire document");
    }
    results.push({
      case: c.label, width,
      decodedBytes, transferredBytes,
      requests: observed.resources.length,
      fcpMs: observed.fcpMs,
      domContentLoadedMs: observed.navigation.domContentLoadedMs,
      loadMs: observed.navigation.loadMs,
      resources: observed.resources,
    });
    console.log(`P6 ${c.label} ${width}px: source=${decodedBytes} B, transfer=${transferredBytes} B, requests=${observed.resources.length}, FCP=${observed.fcpMs ?? "n/a"} ms, load=${observed.navigation.loadMs} ms`);
    await context.close();
  }
  writeFileSync(`${artifacts}/p6-performance.json`, JSON.stringify({
    measurement: "Chromium resource timing; measured resource timings with source-size and request-count guardrails; CI runner conditions, not end-user Core Web Vitals",
    target: ROOT,
    browser: "Playwright pinned Chromium",
    cases: results,
  }, null, 2) + "\n");
  console.log("P6 PERFORMANCE AUDIT PASS · desktop/mobile, hub/app, network and scroll");
} finally {
  await browser.close();
  server?.kill("SIGTERM");
}
