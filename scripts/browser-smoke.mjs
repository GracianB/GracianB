#!/usr/bin/env node
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const HOST = "127.0.0.1";
const PORT = 4173;
const externalUrl = process.env.GB_E2E_URL;
const URL = externalUrl || `http://${HOST}:${PORT}/`;
const artifacts = "artifacts/e2e";
mkdirSync(artifacts, { recursive: true });

const server = externalUrl
  ? null
  : spawn("python3", ["-m", "http.server", String(PORT), "--bind", HOST], {
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
  assert.match(await page.locator(".hero-name").innerText(), /GRACIÁN\s+BAENA/);
  const heroFits = await page.locator(".hero-wow").evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return rect.left >= -1 && rect.right <= innerWidth + 1;
  });
  assert.equal(heroFits, true, "Hero must fit the desktop viewport");
  assert.equal(await page.locator(".evidence-card").count(), 5);
  assert.equal(await page.locator(".method-flow li").count(), 7);
  assert.equal(await page.locator("[data-world-slide]").count(), 3);
  assert.equal(await page.locator('[data-world="professional"]').getAttribute("aria-hidden"), "false");

  await page.locator("[data-world-next]").click();
  assert.equal(await page.locator('[data-world="yoga"]').getAttribute("aria-hidden"), "false");
  await page.locator("[data-world-next]").click();
  assert.equal(await page.locator('[data-world="lab"]').getAttribute("aria-hidden"), "false");
  assert.match(
    await page.locator('[data-world="lab"] .world-card-link').getAttribute("href"),
    /systems-lab\/$/,
  );

  await page.locator("[data-world-prev]").focus();
  await page.keyboard.press("ArrowLeft");
  assert.equal(await page.locator('[data-world="yoga"]').getAttribute("aria-hidden"), "false");

  await page.getByRole("button", { name: "EN", exact: true }).click();
  assert.equal(await page.locator("html").getAttribute("lang"), "en");
  assert.match(await page.getByRole("heading", { level: 1 }).innerText(), /customer and operational problems/i);
  assert.match(await page.locator("[data-cv-link]").getAttribute("href"), /_EN\.pdf$/);

  await page.locator("[data-theme-toggle]").click();
  assert.equal(await page.locator("html").getAttribute("data-theme"), "light");

  await page.keyboard.press("Control+K");
  await page.locator("#command:not([hidden])").waitFor();
  await page.locator("#command-input").fill("ohana");
  assert.equal(await page.locator("#command-list li:not([hidden])").count(), 1);
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => document.getElementById("command")?.hidden === true);

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
  assert.match(await page.locator(".hero-name").innerText(), /GRACIÁN\s+BAENA/);
  const nameClipped = await page.locator(".hero-name").evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return rect.left < -1 || rect.right > innerWidth + 1;
  });
  assert.equal(nameClipped, false, "Hero name must not clip at 320px");

  const worldClipped = await page.locator("[data-world-carousel]").evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return rect.left < -1 || rect.right > innerWidth + 1;
  });
  assert.equal(worldClipped, false, "Three-world selector must fit at 320px");
  await page.locator("[data-world-next]").click();
  assert.equal(await page.locator('[data-world="yoga"]').getAttribute("aria-hidden"), "false");

  await page.locator("[data-menu-toggle]").click();
  await page.locator("#mobile-menu:not([hidden])").waitFor();
  await page.locator('#mobile-menu a[href="#evidence"]').click();
  await page.waitForFunction(() => document.getElementById("mobile-menu")?.hidden === true);

  const clipped = await page.evaluate(() =>
    [...document.querySelectorAll("a,button,input")].some((node) => {
      if (node.closest('[aria-hidden="true"]')) return false;
      const style = getComputedStyle(node);
      if (style.visibility === "hidden" || style.display === "none" || Number(style.opacity) === 0) {
        return false;
      }
      const rect = node.getBoundingClientRect();
      return rect.left < -1 || rect.right > innerWidth + 1;
    }),
  );
  assert.equal(clipped, false, "Visible interactive element clipped at 320px");
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

async function cabinCrew(browser){
  for (const width of [320,390,1280]){
    const context=await browser.newContext({viewport:{width,height:900}});
    const page=await context.newPage();
    const events=watch(page);
    await page.goto(URL+"cabin-crew.html",{waitUntil:"domcontentloaded"});
    await assertClean(page,events);
    assert.equal(await page.locator("[data-cabin-lang='es']").getAttribute("aria-pressed"),"true");
    await page.locator("[data-cabin-lang='en']").click();
    assert.equal(await page.locator("html").getAttribute("lang"),"en");
    assert.equal(await page.locator("[data-cabin-lang='en']").getAttribute("aria-pressed"),"true");
    assert.match(await page.locator("[data-language='en'] h1").innerText(),/Some journeys/);
    await page.locator("[data-cabin-lang='es']").click();
    assert.equal(await page.locator("html").getAttribute("lang"),"es");
    assert.equal(await page.locator(".document-grid .document").count(),2);
    assert.equal(await page.locator(".cabin-chapters article").count(),4,"four story chapters");
    assert.equal(await page.locator("[data-credential-kind]").count(),7,"all seven documented learning milestones");
    assert.equal(await page.locator(".tile").count(),3,"three transferable strengths");
    assert.match(await page.locator("[data-credential-kind='aviation']").innerText(),/ESATUR/);
    await page.locator('[data-training-filter="aviation"]').click();
    assert.equal(await page.locator(".credential:visible").count(),1);
    assert.match(await page.locator(".credential:visible").innerText(),/Mallorca/);
    await page.locator('[data-training-filter="tourism"]').click();
    assert.equal(await page.locator(".credential:visible").count(),2);
    await page.locator('[data-training-filter="all"]').click();
    assert.equal(await page.locator(".credential:visible").count(),7);
    await page.locator('[data-city="bergamo"]').click();
    assert.equal(await page.locator("#atlasCounter").innerText(),"05 / 06");
    assert.match(await page.locator("#atlasCity").innerText(),/Bérgamo/);
    assert.equal(await page.locator('[data-city="bergamo"]').getAttribute("aria-pressed"),"true");
    await page.locator("#atlasNext").click();
    assert.match(await page.locator("#atlasCity").innerText(),/Varsovia/);
    assert.match(await page.locator("#atlasContext").innerText(),/SIN EMPLEO ATRIBUIDO/);
    await page.locator("[data-cabin-lang='en']").click();
    assert.match(await page.locator("#atlasCity").innerText(),/Warsaw/);
    assert.match(await page.locator("#atlasContext").innerText(),/NO EMPLOYMENT CLAIM/);
    await page.locator('[data-city="lisboa"]').click();
    assert.match(await page.locator("#atlasCity").innerText(),/Lisbon/);
    await page.locator("[data-cabin-lang='es']").click();
    assert.match(await page.locator("#atlasCity").innerText(),/Lisboa/);
    assert.equal(await page.locator(".languages-board>div").count(),5);
    assert.equal(await page.locator('[data-city]').count(),6);
    assert.equal(await page.locator('.map-lines').count(),1);
    for (const filename of ["cabin-letter-es.html","cabin-letter-en.html"]){
      await page.goto(URL+filename,{waitUntil:"domcontentloaded"});
      await assertClean(page,events);
      assert.equal(await page.locator(".letter-body p").count(),8);
      assert.equal(await page.locator(".print-action").count(),1);
    }
    await context.close();
  }
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  const page=await context.newPage();
  await page.goto(URL,{waitUntil:"domcontentloaded"});
  assert.equal(await page.locator("[data-world-slide]").count(),3,"fourth main universe must NOT be added");
  assert.equal(await page.locator(".document-group").count(),3);
  assert.equal(await page.locator("a[href='./cabin-crew.html']").count(),2,"document and quick navigation");
  await page.locator("a[href='./cabin-letter-es.html']").first().click();
  await page.waitForURL(/cabin-letter-es\.html$/);
  assert.match(await page.locator("h1").innerText(),/El servicio empieza/);
  await context.close();
  console.log("CABIN CREW HUB + LETTERS E2E PASS (320/390/1280, bilingual, navigable, three worlds preserved)");
}

if (!externalUrl) await waitForServer();
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
try {
  await desktop(browser);
  await mobile(browser);
  await reduced(browser);
  await cabinCrew(browser);
  console.log("GRACIANB BROWSER E2E PASS");
} finally {
  await browser.close();
  server?.kill("SIGTERM");
}
