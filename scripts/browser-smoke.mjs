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
  assert.equal(await page.locator(".hero-recruiter-route a").getAttribute("href"), "./apply.html");
  assert.match(await page.locator(".hero-recruiter-route").innerText(), /CV y carta/i);
  assert.equal(await page.locator(".hero-proof-link").getAttribute("href"),
    "https://gracianb.github.io/professional-deck/proyecto-bodytone.html");
  assert.match(await page.locator(".facts-strip").innerText(), /hasta 80/);
  assert.equal(await page.locator(".method-flow li").count(), 7);
  assert.equal(await page.locator(".world-portal").count(),3);
  assert.equal(await page.locator(".world-portal:visible").count(),3);
  assert.equal(await page.locator("[data-world-overview],[data-world-prev],[data-world-next]").count(),0,
    "The tiny expand switch and carousel must be gone");
  assert.match(await page.locator("#hero-title").innerText(),/De problemas reales a sistemas que funcionan/);
  assert.equal(await page.locator("#hero-title").locator("p,span,em").count(),0,
    "The headline is a single clean sentence");
  for(const [key,site] of [
    ["professional","professional-deck/"],["yoga","yoga-instructor/"],["lab","systems-lab/"]
  ]) {
    const portal=page.locator('.world-portal[data-portal="'+key+'"]');
    assert.equal(await portal.isVisible(),true);
    assert.match(await portal.getAttribute("href"),new RegExp(site.replace("/","\\/")+"$"));
  }
  const hoverExpected={professional:"rgb(199, 205, 208)",yoga:"rgb(145, 220, 178)",lab:"rgb(139, 218, 250)"};
  for(const [key,color] of Object.entries(hoverExpected)){
    const portal=page.locator('.world-portal[data-portal="'+key+'"]');
    await portal.hover();await page.waitForTimeout(550);
    const actual=await portal.evaluate(node=>getComputedStyle(node).borderTopColor);
    const components=actual.match(/[\\d.]+/g).map(Number);
    const expected=color.match(/[\\d.]+/g).map(Number);
    assert.deepEqual(components.slice(0,3),expected,
      key+" hover must use its own universe color");
    assert.ok((components[3] ?? 1) >= .8, key+" hover border must be clearly visible");
  }
  await page.mouse.move(0,0);
  await page.screenshot({path:`${artifacts}/three-portals-desktop.png`,fullPage:false});

  await page.getByRole("button", { name: "EN", exact: true }).click();
  assert.equal(await page.locator("html").getAttribute("lang"), "en");
  assert.match(await page.locator(".hero-recruiter-route").innerText(), /Choose resume and letter/);
  assert.match(await page.locator(".facts-strip").innerText(), /up to 80/);
  assert.equal(await page.locator("[data-command-open]").getAttribute("aria-label"), "Open quick navigation");
  assert.equal(await page.locator(".desktop-nav").getAttribute("aria-label"), "Main navigation");
  assert.match(await page.getByRole("heading", { level: 1 }).innerText(), /from real-world problems to systems that work/i);
  assert.equal(await page.locator(".hero-actions a[href='#universes']").count(),1);

  await page.locator("[data-theme-toggle]").click();
  assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
  assert.equal(await page.locator("[data-theme-toggle]").getAttribute("aria-label"), "Switch to dark theme");

  await page.keyboard.press("Control+K");
  await page.locator("#command:not([hidden])").waitFor();
  assert.equal(await page.locator(".command-backdrop").getAttribute("tabindex"), "-1");
  assert.equal(await page.locator(".command-backdrop").getAttribute("aria-hidden"), "true");
    await page.locator("#command-input").fill("ohana");
  assert.equal(await page.locator("#command-list li:not([hidden])").count(), 1);
  await page.locator('#command-list li:not([hidden]) a').last().focus();
  await page.keyboard.press("Tab");
  assert.equal(await page.locator(".command-head button[data-command-close]")
    .evaluate((node) => document.activeElement === node), true,
    "Quick navigation must wrap focus to its close button, never its visual backdrop");
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => document.getElementById("command")?.hidden === true);

  await page.evaluate(() => { document.activeElement?.blur?.(); scrollTo(0, 0); });
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

  assert.equal(await page.locator(".world-portal").count(),3);
  assert.equal(await page.locator(".world-portal:visible").count(),3);
  for(const portal of await page.locator(".world-portal").all()){
    const fits=await portal.evaluate(node=>{
      const r=node.getBoundingClientRect();
      return r.left >= -1 && r.right <= innerWidth+1;
    });
    assert.equal(fits,true,"Each world portal must fit at 320px");
  }
  assert.equal(await page.locator("[data-world-overview]").count(),0);
  await page.locator("[data-menu-toggle]").click();
  await page.locator("#mobile-menu:not([hidden])").waitFor();
  assert.equal(await page.locator("[data-menu-toggle]").getAttribute("aria-label"), "Cerrar menú");
  const firstMenuLink = page.locator("#mobile-menu nav a").first();
  const lastMenuButton = page.locator("#mobile-menu .mobile-lang-switch button").last();
  await firstMenuLink.focus();
  await page.keyboard.press("Shift+Tab");
  assert.equal(await lastMenuButton.evaluate((node) => document.activeElement === node), true,
    "Shift+Tab from the first mobile link must wrap to the last control");
  await page.keyboard.press("Tab");
  assert.equal(await firstMenuLink.evaluate((node) => document.activeElement === node), true,
    "Tab from the final mobile menu button must wrap to its first link");
    await page.locator('#mobile-menu [data-set-lang="en"]').click();
  assert.equal(await page.locator("html").getAttribute("lang"), "en");
  assert.equal(await page.locator("[data-menu-toggle]").getAttribute("aria-label"), "Close menu");
  assert.equal(await page.locator("#mobile-menu nav").getAttribute("aria-label"), "Mobile navigation");
  assert.match(await page.locator(".portal-after [data-application-link]").getAttribute("href"), /apply\.html\?lang=en$/, "English applications route must be direct");
  assert.equal(await page.locator('#mobile-menu [data-set-lang="en"]').getAttribute("aria-pressed"), "true");
  await page.locator('#mobile-menu [data-set-lang="es"]').click();
  assert.equal(await page.locator("html").getAttribute("lang"), "es");
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
  await page.evaluate(() => { document.activeElement?.blur?.(); scrollTo(0, 0); });
  await page.screenshot({ path: `${artifacts}/mobile-320.png`, fullPage: true });
  await context.close();
}

async function applicationHandoff(browser) {
  // Opening the application desk must not silently change an English visitor back to Spanish.
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 820 } });
    const page = await context.newPage();
    for (const lang of ["es", "en"]) {
      await page.goto(URL + "?lang=" + lang, { waitUntil: "domcontentloaded" });
      assert.equal(await page.locator("html").getAttribute("lang"), lang);
      const expected = lang === "en" ? "./apply.html?lang=en" : "./apply.html";
      const links = page.locator("[data-application-link]");
      assert.equal(await links.count(), 2, "Hero and documents must both link to applications");
      for (const href of await links.evaluateAll((elements) => elements.map((node) => node.getAttribute("href")))) {
        assert.equal(href, expected, "Application link must preserve visitor language");
      }
      await page.locator(".hero-recruiter-route [data-application-link]").click();
      await page.waitForURL(/apply\.html(?:\?|$)/);
      assert.equal(await page.locator("html").getAttribute("lang"), lang,
        "Language must survive hub-to-application navigation");
      assert.equal(await page.locator('[data-b6-panel="professional"]').isVisible(), true);
      assert.equal(await page.locator('[data-b6-set-lang="' + lang + '"]').getAttribute("aria-pressed"), "true");
      const homeLinks = page.locator("[data-b6-home-link]");
      assert.equal(await homeLinks.count(), 3, "Brand, nav and footer must lead back to the hub");
      const expectedHome = "./?lang=" + lang;
      for (const href of await homeLinks.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")))) {
        assert.equal(href, expectedHome, "Return route must retain language");
      }
      await page.locator(".top nav [data-b6-home-link]").click();
      await page.locator(".hero-name").waitFor();
      assert.equal(await page.locator("html").getAttribute("lang"), lang,
        "Return from application desk must preserve hub language");
    }
    // Reproduce the stale-preference bug: saved English, then choose Spanish
    // directly from a recruiter deep link. Both return navigation and reload
    // must remain Spanish, regardless of the earlier cached hub language.
    await page.goto(URL, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => localStorage.setItem("gb-hub-lang", "en"));
    await page.goto(URL + "apply.html?track=professional&lang=es", { waitUntil: "domcontentloaded" });
    assert.equal(await page.locator("html").getAttribute("lang"), "es");
    assert.equal(await page.evaluate(() => localStorage.getItem("gb-hub-lang")), "es");
    assert.equal(await page.locator(".top nav [data-b6-home-link]").getAttribute("href"), "./?lang=es");
    await page.locator(".top nav [data-b6-home-link]").click();
    assert.equal(await page.locator("html").getAttribute("lang"), "es");
    await page.reload({ waitUntil: "domcontentloaded" });
    assert.equal(await page.locator("html").getAttribute("lang"), "es",
      "Spanish language must persist beyond the immediate return navigation");
    await context.close();
  }
  console.log("APPLICATION HANDOFF E2E PASS: ES/EN × desktop/mobile + stale-language regression");
}

async function finalResponsiveAudit(browser) {
  // P1.5 + P1.7: inspect intermediate breakpoints as well as the smallest
  // phone and desktop. These are actual layout measurements, not Lighthouse.
  for (const width of [320, 768, 1440]) {
    for (const mode of ["dark", "light"]) {
      const context = await browser.newContext({
        viewport: { width, height: width === 320 ? 720 : 900 },
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      const state = watch(page);
      await page.goto(URL + "?lang=en&theme=" + mode, { waitUntil: "domcontentloaded" });
      await assertClean(page, state);
      assert.equal(await page.locator("html").getAttribute("lang"), "en");
      assert.equal(await page.locator("html").getAttribute("data-theme"), mode);
      assert.equal(await page.locator(".document-group").count(), 3);
      assert.equal(await page.locator(".world-portal").count(), 3);
      const typography = await page.evaluate(() => {
        const pixels = (selector) => parseFloat(getComputedStyle(document.querySelector(selector)).fontSize);
        const visuals = [...document.querySelectorAll(".document-visual")]
          .map(node => getComputedStyle(node).backgroundImage);
        return {
          footer: pixels(".footer"),
          years: pixels(".arc-years"),
          cardTop: pixels(".card-top"),
          visualStyles: new Set(visuals).size,
          clipped: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        };
      });
      assert.equal(typography.clipped, false, "P1.5 horizontal clipping " + width + "/" + mode);
      assert.ok(typography.footer >= 11.2, "Footer must be readable: " + width + "/" + mode);
      assert.ok(typography.years >= 11.2, "Career dates must be readable");
      assert.ok(typography.cardTop >= 10.5, "Project evidence labels must remain legible");
      assert.equal(typography.visualStyles, 3, "Three document families must remain visually distinct");
      // P4: Professional silver matches the approved CV + Deck V24.
      // Yoga and Cabin Crew must keep their own visuals.
      const identity = await page.evaluate(() => {
        const professional = document.querySelector(".document-group-professional");
        const yoga = document.querySelector(".document-group-yoga");
        const cabin = document.querySelector(".document-group-cabin");
        return {
          page: getComputedStyle(professional.querySelector(".document-visual-page")).backgroundColor,
          professional: getComputedStyle(professional.querySelector(".document-visual")).backgroundImage,
          professionalLabel: getComputedStyle(professional.querySelector(".document-group-head span")).color,
          yoga: getComputedStyle(yoga.querySelector(".document-visual")).backgroundImage,
          cabin: getComputedStyle(cabin.querySelector(".document-visual")).backgroundImage,
        };
      });
      assert.equal(identity.page, "rgb(243, 238, 229)", "Professional mini-document must match Deck ivory");
      assert.match(identity.professional,
        mode === "dark" ? /rgb\(13, 32, 40\).*rgb\(4, 13, 18\)/
                        : /rgb\(38, 48, 57\).*rgb\(21, 28, 34\)/,
        "Professional document preview must match petrol dark / original light identity");
      assert.equal(identity.professionalLabel, mode === "light" ? "rgb(82, 99, 109)" : "rgb(199, 205, 208)");
      assert.match(identity.yoga, /rgb\(32, 84, 62\)/, "Yoga green identity changed");
      assert.match(identity.cabin, /rgb\(21, 33, 49\)/, "Cabin navy identity changed");
      if (mode === "dark") {
        const unified = await page.evaluate(() => {
          const css = (q) => getComputedStyle(document.querySelector(q));
          return {
            background: getComputedStyle(document.documentElement).getPropertyValue("--bg").trim(),
             kicker: css(".hero-kicker-row .eyebrow").color,
            page: css("body").backgroundColor,
            title: css(".hero-name-last").color,
            button: css(".hero-actions .button-primary").backgroundColor,
            brand: css(".brand-mark").borderTopColor,
            panel: css(".document-group").backgroundColor,
            professionalCode: css(".world-professional .portal-category").color,
            professionalSigil: css(".world-professional .world-professional-sigil").color,
            professionalArtwork: css(".world-professional .portal-art").backgroundColor,
            professionalCopy: css(".world-professional .portal-copy").backgroundImage,
            methodSurface: css(".method-section").backgroundImage,
            documentsSurface: css(".documents-section").backgroundImage,
            evidenceSurface: css(".evidence-card").backgroundImage,
            browser: document.querySelector('meta[name="theme-color"]').content,
          };
        });
        assert.equal(unified.background, "#02070b", "Deep petrol base must replace Deck graphite");
        assert.equal(unified.page, "rgb(2, 7, 11)");
        assert.equal(unified.title, "rgb(199, 205, 208)", "Hero title must be silver");
         assert.equal(unified.kicker, "rgb(199, 205, 208)", "Customer Success kicker must be silver");
        assert.equal(unified.button, "rgb(199, 205, 208)", "Primary action must be silver");
        assert.equal(unified.brand, "rgba(199, 205, 208, 0.52)");
        assert.equal(unified.panel, "rgb(7, 21, 28)");
        assert.equal(unified.professionalCode,"rgb(199, 205, 208)","First world label must be silver");
        assert.equal(unified.professionalSigil,"rgb(216, 223, 226)","Professional emblem must be cool silver");
        assert.equal(unified.professionalArtwork,"rgb(11, 22, 28)","Professional art must be deep neutral ink, not brown");
        assert.match(unified.professionalCopy,/rgb\(11, 23, 29\).*rgb\(4, 12, 17\)/,"First card text panel must be petrol");
        assert.match(unified.methodSurface,/rgb\(4, 11, 17\).*rgb\(2, 8, 13\)/,"Method section must be dark");
        assert.match(unified.documentsSurface,/rgb\(4, 11, 17\).*rgb\(2, 8, 13\)/,"Documents section must be dark");
        assert.match(unified.evidenceSurface,/linear-gradient\(155deg, color\(srgb .*rgb\(4, 12, 18\) 89%\)/,"Evidence cards must be dark");
        assert.equal(unified.browser, "#02070b");
        const contrast = await page.evaluate(() => {
          const rgb = (s) => s.match(/[\d.]+/g).slice(0,3).map(Number);
          const luminance = (c) => {
            const channels = rgb(c).map((n) => {
              const v = n / 255;
              return v <= .04045 ? v / 12.92 : ((v+.055)/1.055)**2.4;
            });
            return .2126*channels[0]+.7152*channels[1]+.0722*channels[2];
          };
          const ratio = (a,b) => { const x=luminance(a), y=luminance(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); };
          const button=getComputedStyle(document.querySelector(".hero-actions .button-primary"));
          const body=getComputedStyle(document.body);
          return {text:ratio(body.color,body.backgroundColor),cta:ratio(button.color,button.backgroundColor)};
        });
        assert.ok(contrast.text>=4.5 && contrast.cta>=4.5,
          "Deep petrol body and silver primary action must meet WCAG AA text contrast");
        await page.screenshot({ path: `${artifacts}/p7-deck-dark-${width}.png`, fullPage: true });
      }
      if (mode === "light") {
        await page.screenshot({ path: `${artifacts}/p1-final-${width}-light.png`, fullPage: true });
      }
      await context.close();
    }
  }
  console.log("P1.5 VISUAL QA PASS · 320 / 768 / 1440 × dark / light");
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
    assert.equal(await page.locator(".document-grid .document").count(),4,"two cover letters and two printable CVs");
    for (const path of ["cabin-cv-es.html","cabin-cv-en.html"]) {
      const href="./"+path;
      assert.equal(await page.locator('.document-grid a[href="'+href+'"]').count(),1,"printable CV must be linked");
      const response=await page.request.get(URL+path);
      assert.equal(response.status(),200,"printable CV must resolve");
      assert.match(await response.text(),/window\.print\(\)/,"print action must exist");
    }
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
  assert.equal(await page.locator(".world-portal").count(),3,"fourth main universe must NOT be added");
  assert.equal(await page.locator(".document-group").count(),3);
  assert.equal(await page.locator("a[href='./cabin-crew.html']").count(),1,"legacy TCP chapter remains in documents");
  assert.equal(await page.locator("a[href='https://gracianb.github.io/cabin-crew-site/']").count(),2,"TCP standalone destination appears in documents and quick navigation");
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
  await applicationHandoff(browser);
  await finalResponsiveAudit(browser);
  await reduced(browser);
  await cabinCrew(browser);
  console.log("GRACIANB BROWSER E2E PASS");
} finally {
  await browser.close();
  server?.kill("SIGTERM");
}
