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
assert.match(html,/class="theme-sun"[^>]*viewBox="0 0 24 24"/,"Sun must be an SVG");
assert.match(html,/class="theme-moon"[^>]*viewBox="0 0 24 24"/,"Moon must be an SVG");
assert.match(html,/<rect x="143" y="130" width="34" height="34"/,"Professional center mark must be centered at x=160");
assert.doesNotMatch(html,/data-i18n="atlasNote"/,"Atlas should not display unnecessary explanatory copy");
assert.match(css,/\.theme-toggle svg/,"Centered theme-vector layout must be present");
assert.match(css,/html\[data-theme=light\] \.city-atlas/,"The city atlas needs intentional light-mode styling");
assert.match(css,/html\[data-theme=light\] :is\(\.observatory-details,\.cv-library-details\)>summary/,"Light disclosures must not be generic grey");

assert.match(html,/constellation-lotus/,"Botanical yoga icon missing");
assert.match(html,/circuit-chip/,"Systems Lab chip missing");
assert.doesNotMatch(html,/hero-orbit-signature/,"Professional Deck emblem must not appear");
assert.match(html,/data-constellation-sky/);
assert.match(html,/class="cosmic-bridge"/,"Visible star paths should unite the three universes");
assert.match(html,/class="cosmic-origin"/,"There must be a central GracianB origin");
assert.equal((html.match(/data-route-world="/g)||[]).length,3,"Exactly three visible routes to three worlds");
assert.match(js,/const clusters = \[/,"Background stars must form identifiable constellations too");
assert.match(js,/links:\[\[/,"Constellation groups need paths between a limited number of stars");
assert.match(css,/\.bridge-route-pro/,"Professional requires its own visible route");
assert.match(css,/\.bridge-route-yoga/,"Yoga requires its own visible route");
assert.match(css,/\.bridge-route-lab/,"Systems Lab requires its own visible route");
assert.match(js,/function constellationSky/);
assert.match(js,/canvas\.dataset\.ambientClusters/,"Star formations must be scoped to post-hero chapters");
assert.match(js,/scrollTop-fadeStart/,"Star connections should fade in after the hero");
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
assert.match(html,/styles\.css\?v=29/,"Latest shared CSS must bypass old cache");
assert.match(html,/hub-finish\.css\?v=3/,"Latest dark sections must bypass old cache");
assert.match(html,/portal-v11\.css\?v=(?:5|v1-atlas-20261019)/);
assert.match(html,/i18n\.js\?v=27" defer/);
assert.equal((html.match(/data-command-category="/g)||[]).length,10,"Quick atlas has ten actionable destinations");
assert.equal((html.match(/data-command-filter="/g)||[]).length,4,"Quick atlas filters are required");
assert.match(html,/role="combobox"/);
assert.match(html,/id="command-empty"/);
assert.match(js,/function normalizeCommand/,"Search must ignore accents");
assert.doesNotMatch(js,/items\[commandIndex\]\?\.scrollIntoView/,"Quick navigation must not scroll the underlying page");
assert.match(js,/commandList\.scrollTop/,"Only the quick-result list should scroll");
assert.match(read("styles.css"),/\.command-backdrop\{[^}]*background:rgba/);
assert.doesNotMatch(read("styles.css"),/\.command-backdrop\{[^}]*backdrop-filter/,"A blurred modal background causes flickering");
assert.match(css,/\.observatory-details \.evidence-grid\{[^}]*repeat\(2,minmax\(0,1fr\)\)/,"Project cards need stable columns");
assert.match(html,/main\.js\?v=(?:p124-quicknav|v1-atlas-20261019)" defer/);
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
const og = readFileSync("og-cover.png");
assert.equal(og.subarray(0,8).toString("hex"),"89504e470d0a1a0a","Social cover must be a PNG");
assert.equal(og.readUInt32BE(16),1200,"OG preview width must be 1200px");
assert.equal(og.readUInt32BE(20),630,"OG preview height must be 630px");
assert.ok(og.length<100_000,"Keep social preview small");
assert.match(html,/og-cover\.png\?v=12/,"Social meta must load the new constellation PNG");
assert.match(read("og-cover.svg"),/CONSTELLATION ATLAS/,"Legacy brown OG SVG returned");
assert.match(read("scripts/render-og-p12.py"),/random\.Random\(127\)/,"Image build must be deterministic");
console.log("P12 CONSTELLATION STATIC PASS · "+ids.length+" unique ids · 3 worlds · 6 cities · 12 CV PDFs · ES/EN");
