#!/usr/bin/env node
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const HOST = "127.0.0.1";
const PORT = 4173;
const URL = `http://${HOST}:${PORT}/`;
const artifacts = "artifacts/e2e";
mkdirSync(artifacts, { recursive: true });

const server = spawn("python3", ["-m", "http.server", String(PORT), "--bind", HOST], {
  stdio: ["ignore", "pipe", "pipe"],
});

async function waitForServer() {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(URL);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error("Static server did not start");
}

function watch(page) {
  const state = { consoleErrors: [], pageErrors: [] };
  page.on("console", (message) => {
    if (message.type() === "error") state.consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => state.pageErrors.push(String(error)));
  return state;
}

async function assertClean(page, state) {
  await page.locator("#main").waitFor();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  assert.equal(overflow, false, "Horizontal overflow detected");
  assert.deepEqual(state.consoleErrors, [], "Console errors detected");
  assert.deepEqual(state.pageErrors, [], "Page errors detected");
}

async function desktop(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const state = watch(page);
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await assertClean(page, state);

  await page.getByRole("heading", { level: 1 }).waitFor();
  assert.equal(await page.locator(".evidence-card").count(), 5);
  assert.equal(await page.locator(".method-flow li").count(), 7);

  await page.getByRole("button", { name: "EN" }).click();
  assert.equal(await page.locator("html").getAttribute("lang"), "en");
  assert.match(await page.getByRole("heading", { level: 1 }).innerText(), /complex operations/i);
  assert.match(await page.locator("[data-cv-link]").getAttribute("href"), /_EN\.pdf$/);

  await page.locator("[data-theme-toggle]").click();
  assert.equal(await page.locator("html").getAttribute("data-theme"), "light");

  await page.keyboard.press("Control+K");
  await page.locator("#command:not([hidden])").waitFor();
  await page.locator("#command-input").fill("ohana");
  assert.equal(await page.locator("#command-list li:not([hidden])").count(), 1);
  await page.keyboard.press("Escape");
  await page.locator("#command[hidden]").waitFor();

  await page.screenshot({ path: `${artifacts}/desktop.png`, fullPage: true });
  await context.close();
}

async function mobile(browser) {
  const context = await browser.newContext({
    viewport: { width: 320, height: 568 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const state = watch(page);
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await assertClean(page, state);

  await page.locator("[data-menu-toggle]").click();
  await page.locator("#mobile-menu:not([hidden])").waitFor();
  await page.locator('#mobile-menu a[href="#evidence"]').click();
  await page.locator("#mobile-menu[hidden]").waitFor();

  const clipped = await page.evaluate(() =>
    [...document.querySelectorAll("a,button,input")].some((node) => {
      const rect = node.getBoundingClientRect();
      return rect.left < -1 || rect.right > innerWidth + 1;
    }),
  );
  assert.equal(clipped, false, "Interactive element clipped at 320px");
  await page.screenshot({ path: `${artifacts}/mobile-320.png`, fullPage: true });
  await context.close();
}

async function reduced(browser) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const state = watch(page);
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await assertClean(page, state);
  assert.equal(
    await page.locator(".evidence-card").first().evaluate((node) => getComputedStyle(node).opacity),
    "1",
  );
  await context.close();
}

await waitForServer();
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
try {
  await desktop(browser);
  await mobile(browser);
  await reduced(browser);
  console.log("GRACIANB BROWSER E2E PASS");
} finally {
  await browser.close();
  server.kill("SIGTERM");
}
