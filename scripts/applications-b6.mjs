#!/usr/bin/env node
import assert from "node:assert/strict";
import {existsSync,readFileSync,mkdirSync} from "node:fs";
import {spawn} from "node:child_process";


const html=readFileSync("apply.html","utf8"), hub=readFileSync("index.html","utf8");
const tracks=["professional","yoga","aviation"],langs=["es","en"];
const focuses=["customer-success","revops","data-automation"];
const pdfs=[
"Gracian_Baena_CV_2026_ES.pdf","Gracian_Baena_CV_2026_EN.pdf",
"Gracian_Baena_Carta_Presentacion_ES.pdf","Gracian_Baena_Cover_Letter_EN.pdf",
"Gracian_Baena_CV_Yoga_ES.pdf","Gracian_Baena_CV_Yoga_EN.pdf",
"Gracian_Baena_Carta_Yoga_ES.pdf","Gracian_Baena_Cover_Letter_Yoga_EN.pdf",
"Gracian_Baena_CV_TCP_ES.pdf","Gracian_Baena_CV_TCP_EN.pdf",
"Gracian_Baena_Carta_TCP_ES.pdf","Gracian_Baena_Cover_Letter_TCP_EN.pdf"];
assert.equal((html.match(/class="panel /g)||[]).length,3);
assert.equal((html.match(/data-b6-focus="/g)||[]).length,3,"P2 must offer three professional role focuses");
assert.equal((html.match(/data-b6-focus-panel="/g)||[]).length,3,"P2 must offer three grounded evidence panels");
assert.equal((html.match(/data-brief-track="/g)||[]).length,5,
  "P3 must render one candidate brief for each of five role routes");
for(const symbol of ["data-brief-cv","data-brief-letter","data-brief-proof","data-brief-print","data-brief-url"]) {
  assert.ok(html.includes(symbol),"P3 candidate brief output missing: "+symbol);
}
assert.ok(html.includes("RevOps Studio sigue en desarrollo y no dispone de demo pública"),
  "P3 brief must explicitly disclose that RevOps lacks a public demo");
assert.ok(html.includes('data-b6-copy-link'),"Shareable application copy action missing");
for(const focus of focuses) {
 assert.ok(html.includes('data-b6-focus="' + focus + '"'),"Missing focus choice: " + focus);
 assert.ok(html.includes('data-b6-focus-panel="' + focus + '"'),"Missing focus proof: " + focus);
}
assert.match(readFileSync("apply.js","utf8"), /navigator\.clipboard\?\.writeText/,
  "P2 share action must copy the actual URL on direct user interaction");
assert.equal((html.match(/data-b6-home-link/g) || []).length, 3,
  "Application desk needs three language-aware return routes");
assert.match(html, /apply\.js\?v=p7-1/,
  "Application JS cache key must reflect bilingual return navigation");
assert.match(readFileSync("apply.js", "utf8"), /parameters\.push\("lang=" \+ lang\)/,
  "English recruiter must be able to return to the English hub");
assert.match(readFileSync("apply.js", "utf8"), /gb-hub-lang/,
  "The application desk must share the same saved ES/EN language as the main hub");
assert.match(readFileSync("apply.js", "utf8"), /safeSaveLang\(lang\)/,
  "Explicit application languages must be persisted for future navigation");
for(const track of tracks)assert.ok(html.includes('data-b6-panel="'+track+'"'));
for(const lang of langs)assert.ok(html.includes('data-b6-set-lang="'+lang+'"'));
for(const pdf of pdfs){
 assert.ok(existsSync(pdf),"Public document missing from repo: "+pdf);
 assert.ok(html.includes('href="./'+pdf+'"'),"Unlinked CV or letter: "+pdf);
 assert.equal(readFileSync(pdf).subarray(0,5).toString("ascii"),"%PDF-","Invalid PDF: "+pdf);
}
assert.ok(hub.includes('href="./apply.html"'),"Main hub must expose application desk");
assert.match(html, /apply\.css\?v=p4-silver-1/, "P2 application CSS must be refreshed");
for (const stale of ["Las versiones editoriales/ATS en revisión", "generated from printable HTML", "generadas desde páginas imprimibles"]) {
 assert.ok(!html.includes(stale), "Outdated PDF explanation remains: " + stale);
}
assert.match(html, /versiones editoriales publicadas en octubre de 2026/, "Updated professional PDF provenance missing");
assert.match(html, /nuevos CV y cartas editoriales/, "Updated Cabin Crew PDF provenance missing");
for(const pdf of pdfs.slice(8))assert.ok(hub.includes('href="./'+pdf+'"'),"Main hub misses aviation document "+pdf);
assert.ok(!/https:\/\/github\.com\/GracianB\/aigoritmo/.test(html),"Private source advertised");
for(const resource of ["professional-deck/","yoga-instructor/","cabin-crew.html","systems-lab/#aigoritmo"])assert.ok(html.includes(resource),"Missing public evidence: "+resource);
console.log("B6 APPLICATION STATIC PASS: 12 linked PDFs, 3 tracks, ES/EN and safe local evidence");

if(process.argv.includes("--static"))process.exit(0);
const {chromium}=await import("playwright");

const external=process.env.GB_E2E_URL;
const ROOT=external||"http://127.0.0.1:4183/";
const server=external?null:spawn("python3",["-m","http.server","4183","--bind","127.0.0.1"],{stdio:"ignore"});
try{
 if(server){let ok=false;for(let n=0;n<45;n++){try{const r=await fetch(ROOT);if(r.ok){ok=true;break;}}catch{}await new Promise(r=>setTimeout(r,180));}assert.ok(ok,"Local server unavailable");}
 const browser=await chromium.launch({headless:true});
 try{
  for(const width of [1440,390]){
   const context=await browser.newContext({viewport:{width,height:820},reducedMotion:"reduce"});
   const page=await context.newPage();
   const errors=[];page.on("pageerror",e=>errors.push(String(e)));
   page.on("console",m=>{if(m.type()==="error")errors.push(m.text());});
   for(const lang of langs)for(const track of tracks){
    const target=ROOT+"apply.html?lang="+lang+"&track="+track;
    const response=await page.goto(target,{waitUntil:"domcontentloaded"});
    assert.equal(response.status(),200,"Application page missing: "+target);
    assert.equal(await page.locator("html").getAttribute("lang"),lang);
    assert.equal(await page.locator("[data-b6-panel]:visible").count(),1,"Exactly one panel should be visible");
    assert.equal(await page.locator('[data-b6-panel="'+track+'"]').isVisible(),true);
    assert.equal(await page.locator('[data-b6-track="'+track+'"]').getAttribute("aria-pressed"),"true");
    assert.equal(await page.locator('[data-b6-set-lang="'+lang+'"]').getAttribute("aria-pressed"),"true");
    // A selected language must determine the first shown CV and cover letter,
    // while all twelve PDF links remain present for direct use.
    const docFirst = await page.locator('[data-b6-panel="' + track + '"] .resource-columns section:not(.evidence)').evaluateAll(
      sections => sections.map(section => {
        const links = [...section.querySelectorAll('a[href$=".pdf"]')];
        links.sort((a,b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
        return links[0]?.getAttribute("href") || "";
      })
    );
    assert.equal(docFirst.length,2,"CV and letter columns required");
    assert.ok(docFirst.every(href => href.endsWith("_" + lang.toUpperCase() + ".pdf")),
      "CV and letter must prioritize visitor language: " + lang + "/" + track + ": " + docFirst);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
    assert.equal(overflow,false,"Horizontal overflow "+width+"/"+lang+"/"+track);
   }
   // P2 recruiter focus: three shareable deep-links in both languages, without changing PDFs.
   for (const focusLang of langs) for (const focus of focuses) {
     const target = ROOT + "apply.html?track=professional&lang=" + focusLang + "&focus=" + focus;
     await page.goto(target, { waitUntil: "domcontentloaded" });
     assert.equal(await page.locator("html").getAttribute("lang"), focusLang);
     assert.equal(await page.locator('[data-b6-focus="' + focus + '"]').getAttribute("aria-pressed"), "true");
     assert.equal(await page.locator('[data-b6-focus-panel]:visible').count(), 1,
       "Only one role proof may be visible");
     assert.equal(await page.locator('[data-b6-focus-panel="' + focus + '"]').isVisible(), true);
     assert.equal(await page.locator('[data-b6-focus-panel="' + focus + '"] .role-proof-links a').count(), 2,
       "Each proof needs two public and relevant routes");
     assert.equal(await page.locator('[data-b6-panel="professional"] .resource-columns a[href$=".pdf"]').count(), 4,
       "Selecting a role must not change any professional CV or letter");
     const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
     assert.equal(noOverflow, true, "P2 role proof overflow " + width + "/" + focusLang + "/" + focus);
     if (focus === "revops") {
       assert.match(await page.locator('[data-b6-focus-panel="revops"]').innerText(),
         focusLang === "es" ? /no se presenta como demo pública/ : /not a public demo/,
         "RevOps public-demo caveat must be explicit");
     }
   }
   await page.goto(ROOT+"apply.html?track=professional&lang=en&focus=revops", {waitUntil:"domcontentloaded"});
   await page.locator('[data-b6-focus="data-automation"]').click();
   assert.match(page.url(), /focus=data-automation/,"Role choices must update the sharable URL");
   assert.equal(await page.locator('[data-b6-focus-panel="data-automation"]').isVisible(),true);
   await page.locator('[data-b6-set-lang="es"]').click();
   assert.equal(await page.locator('[data-b6-focus="data-automation"]').getAttribute("aria-pressed"),"true",
     "Language change must retain role focus");
   assert.match(page.url(),/focus=data-automation/,"Role focus must survive ES/EN switch");
   // Simulate a successful browser clipboard so the copied value can be verified deterministically.
   await page.evaluate(() => {
     Object.defineProperty(navigator, "clipboard", {
       configurable: true, value: {writeText: async (value) => {window.__lastCopiedApplication = value;}}
     });
   });
   await page.locator("[data-b6-copy-link]").click();
   assert.equal(await page.evaluate(() => window.__lastCopiedApplication), page.url());
   assert.match(await page.locator("[data-b6-copy-status]").innerText(), /Enlace copiado/);
   await page.goto(ROOT+"apply.html?track=professional&lang=en&focus=unknown", {waitUntil:"domcontentloaded"});
   assert.equal(await page.locator('[data-b6-focus="customer-success"]').getAttribute("aria-pressed"),"true",
     "Invalid deep-link focus should fall back safely to Customer Success");
   // P3 dark-mode completion: both themes, role contexts, shared preference and A4 print.
   for(const chosenTheme of ["dark","light"]) {
     await page.goto(ROOT+"apply.html?track=professional&lang=en&focus=revops&theme="+chosenTheme,
       {waitUntil:"domcontentloaded"});
     assert.equal(await page.locator("html").getAttribute("data-theme"),chosenTheme);
     assert.equal(await page.locator("[data-b6-theme-toggle]").getAttribute("aria-pressed"),
       String(chosenTheme==="dark"));
     const surfaces=await page.evaluate(()=>({
       brief:getComputedStyle(document.querySelector(".candidate-brief")).backgroundColor,
       proof:getComputedStyle(document.querySelector(".role-proof:not([hidden])")).backgroundColor,
       selectedFocus:getComputedStyle(document.querySelector('.role-focus-options button[aria-pressed="true"]')).backgroundColor,
       scroll:document.documentElement.scrollWidth>innerWidth+1,
     }));
     assert.equal(surfaces.scroll,false,"Theme must not introduce horizontal overflow");
     assert.notEqual(surfaces.brief,surfaces.proof,"Brief must be a distinct surface");
     if(chosenTheme==="dark") {
       assert.equal(surfaces.brief,"rgb(19, 33, 41)",
         "Recruiter brief must use the deeper petrol low surface");
       assert.equal(surfaces.proof,"rgb(23, 38, 46)",
         "Evidence card should match the deeper petrol card surface");
       assert.equal(surfaces.selectedFocus,"rgb(199, 205, 208)",
         "Selected focus must use cool silver, not legacy beige");
       const shared = await page.evaluate(() => ({
         canvas: getComputedStyle(document.querySelector(".canvas")).backgroundColor,
         hero: getComputedStyle(document.querySelector(".hero")).backgroundImage,
         footer: getComputedStyle(document.querySelector(".foot")).backgroundColor,
         meta: document.querySelector('meta[name="theme-color"]').content,
       }));
       assert.equal(shared.canvas,"rgb(15, 26, 32)");
       assert.equal(shared.footer,"rgb(9, 18, 24)");
       assert.equal(shared.meta,"#0f1a20");
       assert.match(shared.hero,/199, 205, 208/);
       await page.screenshot({path:`artifacts/e2e/p7-applications-dark-${width}.png`,fullPage:true});
     }
     else {
       assert.equal(surfaces.brief,"rgb(243, 238, 229)",
         "Light-mode candidate brief must match the Professional Deck ivory");
       assert.equal(surfaces.selectedFocus,"rgb(38, 48, 57)",
         "Selected professional focus must use graphite, not gold");
     }
     // Even the dark site must print a light paper sheet.
     await page.emulateMedia({media:"print"});
     assert.equal(await page.locator(".candidate-brief").isVisible(),true);
     assert.equal(await page.locator(".app-theme-toggle").isVisible(),false);
     assert.equal(await page.locator(".candidate-brief").evaluate(el=>getComputedStyle(el).backgroundColor),
       "rgb(255, 255, 255)","A4 brief must print on white paper");
     await page.emulateMedia({media:"screen"});
   }
   await page.goto(ROOT+"apply.html?track=professional&lang=en&focus=revops&theme=dark",
     {waitUntil:"domcontentloaded"});
   assert.equal(await page.locator("[data-b6-theme-toggle]").getAttribute("aria-label"),"Switch to light theme");
   await page.locator("[data-b6-theme-toggle]").click();
   assert.equal(await page.locator("html").getAttribute("data-theme"),"light");
   assert.match(page.url(),/theme=light/);
   assert.equal(await page.locator("[data-b6-theme-toggle]").getAttribute("aria-label"),"Switch to dark theme");
   assert.equal(await page.evaluate(()=>localStorage.getItem("gb-hub-theme")),"light");
   await page.locator('[data-b6-focus="data-automation"]').click();
   assert.equal(await page.locator("html").getAttribute("data-theme"),"light",
     "Changing role must not reset selected theme");
   const homeLink = await page.locator('.top nav a[data-b6-home-link]').getAttribute("href");
   assert.match(homeLink,/theme=light/,"Application return URL must preserve light mode");
   await page.locator('.top nav a[data-b6-home-link]').click();
   await page.waitForFunction(() => document.documentElement.dataset.theme === "light");
   assert.equal(await page.locator("html").getAttribute("data-theme"),"light",
     "Hub must preserve selected theme after navigation");
   // The pre-paint theme arrives before deferred JS populates locale-aware links.
   // Wait for link hydration, not merely documentElement.dataset.theme.
   await page.waitForFunction(() =>
     document.querySelector(".hero-recruiter-route [data-application-link]")?.getAttribute("href") ===
     "./apply.html?lang=en&theme=light",
     null, { timeout: 10000 });
   assert.equal(await page.locator("html").getAttribute("lang"), "en");
   assert.equal(await page.locator(".hero-recruiter-route [data-application-link]").getAttribute("href"),
     "./apply.html?lang=en&theme=light","Returning to application must retain light theme");
   await page.locator(".hero-recruiter-route [data-application-link]").click();
   await page.waitForFunction(() => document.documentElement.dataset.theme === "light");
   assert.equal(await page.locator("html").getAttribute("data-theme"),"light",
     "Roundtrip hub ↔ application must retain theme");
      // P3: role and language must choose one truthful brief and the ORIGINAL PDFs.
   const documentMatrix = {
     professional: {
       es: ["Gracian_Baena_CV_2026_ES.pdf","Gracian_Baena_Carta_Presentacion_ES.pdf"],
       en: ["Gracian_Baena_CV_2026_EN.pdf","Gracian_Baena_Cover_Letter_EN.pdf"],
     },
     yoga: {
       es: ["Gracian_Baena_CV_Yoga_ES.pdf","Gracian_Baena_Carta_Yoga_ES.pdf"],
       en: ["Gracian_Baena_CV_Yoga_EN.pdf","Gracian_Baena_Cover_Letter_Yoga_EN.pdf"],
     },
     aviation: {
       es: ["Gracian_Baena_CV_TCP_ES.pdf","Gracian_Baena_Carta_TCP_ES.pdf"],
       en: ["Gracian_Baena_CV_TCP_EN.pdf","Gracian_Baena_Cover_Letter_TCP_EN.pdf"],
     },
   };
   const proofMatrix = {
     professional: {
       "customer-success": "professional-deck/proyecto-bodytone.html",
       revops: "professional-deck/",
       "data-automation": "systems-lab/",
     },
     yoga: "yoga-instructor/",
     aviation: "cabin-crew-site/",
   };
   for(const selectedTrack of tracks) for(const selectedLang of langs) {
     const candidates = selectedTrack === "professional" ? focuses : ["_"];
     for(const selectedFocus of candidates) {
       const suffix = selectedFocus === "_" ? "" : "&focus=" + selectedFocus;
       await page.goto(ROOT + "apply.html?track=" + selectedTrack + "&lang=" + selectedLang + suffix,
         {waitUntil:"domcontentloaded"});
       const shown = page.locator("[data-brief-track]:visible");
       assert.equal(await shown.count(),1,"Exactly one P3 brief should be visible");
       assert.equal(await shown.getAttribute("data-brief-track"),selectedTrack);
       if(selectedTrack==="professional") {
         assert.equal(await shown.getAttribute("data-brief-focus"),selectedFocus);
       }
       const originals=documentMatrix[selectedTrack][selectedLang];
       assert.ok((await page.locator("[data-brief-cv]").getAttribute("href")).endsWith(originals[0]));
       assert.ok((await page.locator("[data-brief-letter]").getAttribute("href")).endsWith(originals[1]));
       const expectedProof=selectedTrack==="professional" ? proofMatrix.professional[selectedFocus] : proofMatrix[selectedTrack];
       assert.ok((await page.locator("[data-brief-proof]").getAttribute("href")).includes(expectedProof));
       assert.equal(await page.locator("[data-brief-url]").textContent(),page.url(),
         "Printed brief must include a working shareable link");
       const clipped=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
       assert.equal(clipped,false,"P3 brief horizontal clipping");
     }
   }
   await page.goto(ROOT+"apply.html?track=professional&lang=en&focus=revops",{waitUntil:"domcontentloaded"});
   await page.evaluate(()=>{window.print=()=>{window.__briefPrintCalled=true;}});
   await page.locator("[data-brief-print]").click();
   assert.equal(await page.evaluate(()=>window.__briefPrintCalled),true,"Print must work from click");
   await page.emulateMedia({media:"print"});
   assert.equal(await page.locator(".top").isVisible(),false,"Print output must exclude navigation");
   assert.equal(await page.locator(".selector").isVisible(),false,"Print output must exclude selectors");
   assert.equal(await page.locator(".candidate-brief").isVisible(),true,"Print brief must be visible");
   assert.equal(await page.locator("[data-brief-print]").isVisible(),false,"Print button must disappear");
   assert.equal(await page.locator('[data-b6-focus="revops"]').isVisible(),false,
     "Print output must hide focus buttons, not the selected visible summary");
   assert.equal(await page.locator('[data-brief-track="professional"][data-brief-focus="revops"]').isVisible(),true);
   await page.emulateMedia({media:"screen"});
      await page.locator('[data-b6-track="aviation"]').click();
   assert.match(page.url(),/track=aviation/,"Track should be shareable");
   await page.locator('[data-b6-set-lang="en"]').click();
   assert.match(page.url(),/lang=en/);
   assert.equal(await page.locator("html").getAttribute("lang"),"en");
   assert.deepEqual(errors,[],"Application desk browser errors");
   if(width===1440){
    mkdirSync("artifacts/e2e",{recursive:true});
    await page.screenshot({path:"artifacts/e2e/b6-applications-desktop.png",fullPage:true});
   }else{
    await page.screenshot({path:"artifacts/e2e/b6-applications-mobile.png",fullPage:true});
   }
   await context.close();
  }
  const noJs = await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:820}});
  const fallback = await noJs.newPage();
  await fallback.goto(ROOT+"apply.html",{waitUntil:"domcontentloaded"});
  assert.equal(await fallback.locator('[data-b6-focus-panel="customer-success"]').isVisible(),true,
    "No-JS visitors must still see the default verified case");
  assert.equal(await fallback.locator(".role-focus-options").isVisible(),false,
    "No-JS visitors must not see inert focus buttons");
  assert.equal(await fallback.locator(".share-application").isVisible(),false,
    "No-JS visitors must not see an unusable copy action");
  assert.equal(await fallback.locator('[data-brief-track="professional"][data-brief-focus="customer-success"]').isVisible(),true,
    "P3 must show a useful default brief without JavaScript");
  assert.equal(await fallback.locator("[data-brief-print]").isVisible(),false,
    "P3 must hide inert print button when scripting is disabled");
    await noJs.close();
  console.log("B6 APPLICATION BROWSER PASS: 3 tracks × 2 languages × desktop/mobile + shareable states");
  console.log("P2 ROLE PROOF PASS: 3 role focuses × 2 languages × desktop/mobile + clipboard + no-JS");
 }finally{await browser.close();}
}finally{server?.kill();}
