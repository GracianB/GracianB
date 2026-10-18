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
assert.ok(html.includes('data-b6-copy-link'),"Shareable application copy action missing");
for(const focus of focuses) {
 assert.ok(html.includes('data-b6-focus="' + focus + '"'),"Missing focus choice: " + focus);
 assert.ok(html.includes('data-b6-focus-panel="' + focus + '"'),"Missing focus proof: " + focus);
}
assert.match(readFileSync("apply.js","utf8"), /navigator\.clipboard\?\.writeText/,
  "P2 share action must copy the actual URL on direct user interaction");
assert.equal((html.match(/data-b6-home-link/g) || []).length, 3,
  "Application desk needs three language-aware return routes");
assert.match(html, /apply\.js\?v=p2-1/,
  "Application JS cache key must reflect bilingual return navigation");
assert.match(readFileSync("apply.js", "utf8"), /\.\/\?lang=en/,
  "English recruiter must be able to return to the English hub");
for(const track of tracks)assert.ok(html.includes('data-b6-panel="'+track+'"'));
for(const lang of langs)assert.ok(html.includes('data-b6-set-lang="'+lang+'"'));
for(const pdf of pdfs){
 assert.ok(existsSync(pdf),"Public document missing from repo: "+pdf);
 assert.ok(html.includes('href="./'+pdf+'"'),"Unlinked CV or letter: "+pdf);
 assert.equal(readFileSync(pdf).subarray(0,5).toString("ascii"),"%PDF-","Invalid PDF: "+pdf);
}
assert.ok(hub.includes('href="./apply.html"'),"Main hub must expose application desk");
assert.match(html, /apply\.css\?v=p2-1/, "P2 application CSS must be refreshed");
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
  await noJs.close();
  console.log("B6 APPLICATION BROWSER PASS: 3 tracks × 2 languages × desktop/mobile + shareable states");
  console.log("P2 ROLE PROOF PASS: 3 role focuses × 2 languages × desktop/mobile + clipboard + no-JS");
 }finally{await browser.close();}
}finally{server?.kill();}
