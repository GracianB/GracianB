#!/usr/bin/env node
import assert from "node:assert/strict";
import {existsSync,readFileSync,mkdirSync} from "node:fs";
import {spawn} from "node:child_process";


const html=readFileSync("apply.html","utf8"), hub=readFileSync("index.html","utf8");
const tracks=["professional","yoga","aviation"],langs=["es","en"];
const pdfs=[
"Gracian_Baena_CV_2026_ES.pdf","Gracian_Baena_CV_2026_EN.pdf",
"Gracian_Baena_Carta_Presentacion_ES.pdf","Gracian_Baena_Cover_Letter_EN.pdf",
"Gracian_Baena_CV_Yoga_ES.pdf","Gracian_Baena_CV_Yoga_EN.pdf",
"Gracian_Baena_Carta_Yoga_ES.pdf","Gracian_Baena_Cover_Letter_Yoga_EN.pdf",
"Gracian_Baena_CV_TCP_ES.pdf","Gracian_Baena_CV_TCP_EN.pdf",
"Gracian_Baena_Carta_TCP_ES.pdf","Gracian_Baena_Cover_Letter_TCP_EN.pdf"];
assert.equal((html.match(/class="panel /g)||[]).length,3);
assert.equal((html.match(/data-b6-home-link/g) || []).length, 3,
  "Application desk needs three language-aware return routes");
assert.match(html, /apply\.js\?v=b6-3/,
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
assert.match(html, /apply\\.css\\?v=b6-3/, "Application CSS must be refreshed");
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
  console.log("B6 APPLICATION BROWSER PASS: 3 tracks × 2 languages × desktop/mobile + shareable states");
 }finally{await browser.close();}
}finally{server?.kill();}
