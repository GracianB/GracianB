#!/usr/bin/env node
// P12 · Purpose-based contract: the public hub is an atlas, not a second CV.
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");
const html=read("index.html"),js=read("main.js"),i18n=read("i18n.js");
const css=read("portal-v11.css"),dark=read("deck-dark.css");
const resources=["index.html","styles.css","portal-v11.css","hub-finish.css","deck-dark.css",
"main.js","i18n.js","README.md","favicon.svg","docs/portfolio-banner.svg","docs/three-worlds.svg",
"apply.html","apply.js","apply.css","robots.txt","sitemap.xml","site.webmanifest","og-cover.png",
"cabin-crew.html","cabin-letter-es.html","cabin-letter-en.html"];
const pdfs=["Gracian_Baena_CV_2026_ES.pdf","Gracian_Baena_CV_2026_EN.pdf",
"Gracian_Baena_Carta_Presentacion_ES.pdf","Gracian_Baena_Cover_Letter_EN.pdf",
"Gracian_Baena_CV_Yoga_ES.pdf","Gracian_Baena_CV_Yoga_EN.pdf",
"Gracian_Baena_Carta_Yoga_ES.pdf","Gracian_Baena_Cover_Letter_Yoga_EN.pdf",
"Gracian_Baena_CV_TCP_ES.pdf","Gracian_Baena_CV_TCP_EN.pdf",
"Gracian_Baena_Carta_TCP_ES.pdf","Gracian_Baena_Cover_Letter_TCP_EN.pdf"];
for(const p of [...resources,...pdfs])assert.ok(existsSync(p),"Missing protected asset "+p);
assert.match(read(".gitattributes"),/^\*\.pdf binary\s*$/m,"PDFs must remain binary");
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size,"Duplicate IDs");
for(const m of html.matchAll(/\bhref="#([^"]+)"/g))
  assert.ok(ids.includes(m[1]),"Broken local anchor: "+m[1]);
for(const id of ["main","worlds","universes","arc","evidence","documents","contact"])
  assert.ok(ids.includes(id),"Missing section "+id);
assert.doesNotMatch(html,/id="method"|data-world-overview|data-world-prev|data-world-slide|class="doors-grid"|class="arc-grid"/,
  "The recycled CV timeline or carousel returned");
assert.equal((html.match(/class="world-portal world-/g)||[]).length,3,"Three worlds must be available");
for(const [world,slug] of [["professional","professional-deck"],["yoga","yoga-instructor"],["lab","systems-lab"]]){
  assert.match(html,new RegExp('id="portal-'+world+'"'));
  assert.match(html,new RegExp('data-portal="'+world+'"'));
  assert.match(html,new RegExp('href="#portal-'+world+'"'));
  assert.ok(html.includes('href="https://gracianb.github.io/'+slug+'/"'),"Broken world link "+slug);
}
assert.match(html,/atlas-systems-mark/,"Professional graph icon missing");
assert.match(html,/constellation-lotus/,"Botanical yoga icon missing");
assert.match(html,/circuit-chip/,"Systems Lab chip missing");
assert.doesNotMatch(html,/hero-orbit-signature/,"Professional Deck emblem must not appear");
assert.match(html,/data-constellation-sky/);
assert.match(js,/function constellationSky/);
assert.match(js,/visibilitychange/);
assert.match(js,/reduceMotion/);
assert.match(js,/updateAtlasReadout/);
assert.equal((html.match(/data-atlas-city="/g)||[]).length,6,"Six city markers required");
for(const city of ["murcia","gran-canaria","madrid","lisboa","bergamo","varsovia"])
  assert.ok(html.includes('data-atlas-city="'+city+'"'));
assert.equal((html.match(/class="atlas-pin is-current"/g)||[]).length,1);
assert.match(html,/data-atlas-readout[^>]*aria-live="polite"/);
assert.match(html,/class="about-experience"/);
assert.doesNotMatch(html,/class="facts-strip"|class="method-flow"/,"Professional dossier clutter returned");
for(const cl of ["observatory-details","cv-library-details"])
  assert.ok(html.includes('class="'+cl+'"'),"Expandable archive missing "+cl);
assert.equal((html.match(/class="evidence-card evidence-/g)||[]).length,5);
assert.equal((html.match(/class="document-group document-group-/g)||[]).length,3);
assert.match(html,/data-application-link/);
assert.match(html,/styles\.css\?v=28/,"Latest shared CSS must bypass old cache");
assert.match(html,/hub-finish\.css\?v=3/,"Latest dark sections must bypass old cache");
assert.match(html,/portal-v11\.css\?v=2/);
assert.match(html,/i18n\.js\?v=26" defer/);
assert.match(html,/main\.js\?v=p12-sky" defer/);
for(const pattern of [/\.constellation-hero/,/\.cosmic-node/,/\.atlas-pin/,/prefers-reduced-motion/])
  assert.match(css,pattern);
assert.match(dark,/--deck-bg:#02070b/,"Abyss petrol should remain");
const en=i18n.indexOf("  en: {");
assert.ok(en>0,"Both dictionaries required");
const dictionaries=[i18n.slice(0,en),i18n.slice(en)];
const keys=new Set([...html.matchAll(/data-i18n(?:-placeholder|-aria-label)?="([^"]+)"/g)].map(m=>m[1]));
for(const language of dictionaries)
  for(const key of keys)assert.match(language,new RegExp("\\b"+key+":\\s*"),"Missing i18n key "+key);
assert.match(read("apply.css"),/@media print/,"A4 print mode must remain");
for(const m of html.matchAll(/href="\.\/([^"#?]+\.pdf)"/g))
  assert.ok(existsSync(m[1]),"Broken original PDF link "+m[1]);
const perf=read("scripts/performance-audit.mjs");
assert.match(perf,/decodedBytes <= c\.maxSourceBytes/,"Keep measured P6 budget");
assert.match(perf,/transferredBytes/,"Keep real network measurements");
assert.match(read("README.md"),/docs\/portfolio-banner\.svg/);
assert.match(read("README.md"),/docs\/three-worlds\.svg/);
console.log("P12 CONSTELLATION STATIC PASS · "+ids.length+" unique ids · 3 worlds · 6 cities · 12 CV PDFs · ES/EN");
