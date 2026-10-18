#!/usr/bin/env node
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const requiredFiles = [
  "index.html",
  "styles.css",
  "main.js",
  "i18n.js",
  "README.md",
  "site.webmanifest",
  "robots.txt",
  "sitemap.xml",
  "favicon.svg",
  "og-cover.png",
  "Gracian_Baena_CV_2026_ES.pdf",
  "Gracian_Baena_CV_2026_EN.pdf",
  "Gracian_Baena_Carta_Presentacion_ES.pdf",
  "Gracian_Baena_Cover_Letter_EN.pdf",
  "Gracian_Baena_CV_Yoga_ES.pdf",
  "Gracian_Baena_CV_Yoga_EN.pdf",
  "Gracian_Baena_Carta_Yoga_ES.pdf",
  "Gracian_Baena_Cover_Letter_Yoga_EN.pdf",
  "cabin-crew.html",
  "cabin-crew.css",
  "cabin-crew.js",
  "cabin-letter-es.html",
  "cabin-letter-en.html",
];

for (const file of requiredFiles) {
  assert.equal(existsSync(file), true, `Missing required file: ${file}`);
}

const html = readFileSync("index.html", "utf8");
const css = readFileSync("styles.css", "utf8");
const binaryAttributes = readFileSync(".gitattributes", "utf8");
assert.match(binaryAttributes, /^\*\.pdf binary\s*$/m,
  "All CVs and cover letters must remain non-mergeable binary Git assets");
// The professional dossier follows the approved silver / graphite Deck V24,
// without recoloring Yoga's botanical green or Cabin Crew's aviation blue.
for (const [label,token] of [
  ["graphite","--pro-graphite:#151c22"],
  ["graphite-soft","--pro-graphite-soft:#263039"],
  ["silver","--pro-silver:#c8cccd"],
  ["ivory","--pro-ivory:#f3eee5"],
  ["light silver","--pro-silver-dark:#52636d"],
]) {
  assert.ok(css.includes(token), "Missing approved professional color token " + label);
}
assert.match(css, /\.document-group-professional\{--document-accent:var\(--pro-silver\)\}/,
  "Professional documents must not revert to the legacy golden badge");
assert.match(css, /\.document-group-yoga\{--document-accent:#ceaa78\}/,
  "Yoga visual identity unexpectedly changed");
assert.match(css, /\.document-group-cabin\{--document-accent:#d2a0ae\}/,
  "Cabin visual identity unexpectedly changed");
assert.match(readFileSync("apply.css","utf8"), /\.candidate-brief\{\s*background:#f3eee5/,
  "Recruiter briefing must use approved silver/ivory in light mode");
const js = readFileSync("i18n.js", "utf8");
const readme = readFileSync("README.md", "utf8");
const sitemap = readFileSync("sitemap.xml", "utf8");

for (const token of [
  "<!doctype html>",
  'id="main"',
  'id="worlds"',
  'id="evidence"',
  'id="method"',
  'id="arc"',
  'id="documents"',
  'id="contact"',
  'rel="canonical"',
  'application/ld+json',
  'property="og:image"',
  'name="twitter:card"',
]) {
  assert.ok(html.includes(token), `HTML contract missing: ${token}`);
}

const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
assert.deepEqual([...new Set(duplicates)], [], "Duplicate HTML ids detected");

const htmlKeys = new Set(
  [...html.matchAll(/data-i18n(?:-placeholder|-aria-label)?="([^"]+)"/g)].map((match) => match[1]),
);
const es = js.match(/es:\s*\{([\s\S]*?)\n\s*\},\n\s*en:\s*\{/);
const en = js.match(/en:\s*\{([\s\S]*?)\n\s*\}\s*;?\s*$/);
assert.ok(es && en, "Could not locate ES/EN dictionaries");

function keys(block) {
  return new Set([...block.matchAll(/^\s*([A-Za-z0-9_]+)\s*:/gm)].map((match) => match[1]));
}
const esKeys = keys(es[1]);
const enKeys = keys(en[1]);
assert.deepEqual([...htmlKeys].filter((key) => !esKeys.has(key)), [], "Missing ES i18n keys");
assert.deepEqual([...htmlKeys].filter((key) => !enKeys.has(key)), [], "Missing EN i18n keys");

for (const match of html.matchAll(/<a\b([^>]*target=["']_blank["'][^>]*)>/gi)) {
  const attrs = match[1];
  assert.match(attrs, /rel=["'][^"']*noopener[^"']*["']/i, "target=_blank link without noopener");
}

// Keep the main hub limited to three primary working languages; the complementary TCP
// path and README may truthfully disclose basic Portuguese/French without overclaiming.
const publicText = [html, js, sitemap].join("\n");
assert.match(publicText, /https:\/\/gracianb\.github\.io\/systems-lab\//, "Systems Lab must be directly reachable");
assert.equal(/Portuguese|French|Portugu[eê]s|Franc[eê]s/i.test(publicText), false, "Unsupported language claim found");

let depth = 0;
for (const char of css) {
  if (char === "{") depth += 1;
  if (char === "}") depth -= 1;
  assert.ok(depth >= 0, "CSS closes a block before it opens");
}
assert.equal(depth, 0, "CSS braces are unbalanced");
assert.ok((css.match(/!important/g) || []).length <= 10, "Too many !important declarations");

const colorSignature = {
  ink: "#14140f",
  parchment: "#f7f5ef",
  ochre: "#daa428",
  forest: "#26332f",
};
for (const [name, hex] of Object.entries(colorSignature)) {
  assert.ok(css.includes(`--cv-${name === "parchment" ? "paper" : name === "forest" ? "forest" : name === "ochre" ? "ochre" : "ink"}:${hex}`),
    `GracianB CV palette is missing ${name}: ${hex}`);
}
assert.match(css, /--bg:var\(--cv-ink\)/, "Dark hub must match the CV header");
assert.match(css, /--bg:var\(--cv-paper\)/, "Light hub must match the CV paper");
assert.match(css, /\.world-professional\s*\{--world-accent:#d6d5d0;--gold:#d6d5d0\}/,
  "Professional artwork must remain silver and not inherit the hub ochre");
assert.match(css, /\.world-yoga\{--world-accent:#87cfae;--sage:#87cfae\}/,
  "Yoga artwork must keep its botanical green");
assert.match(css, /\.world-lab\{--world-accent:#7af3ff;--cyan:#7af3ff;--violet:#bd9cff\}/,
  "Systems Lab artwork must keep its electric cyan");
assert.match(html, /styles\.css\?v=26/, "P1.3 CSS must bypass old cached bytes");
assert.equal((html.match(/class="mobile-lang-switch"/g) || []).length, 1, "Mobile must expose ES/EN");

assert.match(css, /\/\* P1\.5 \/ Final legibility pass/, "P1.5 design pass missing");
assert.match(css, /\.arc-years\{[\s\S]*?font-size:\.72rem/, "Career microcopy is too small");
assert.match(css, /\.footer\{font-size:clamp\(\.72rem/, "Footer must retain readable type");
assert.match(readFileSync("apply.html", "utf8"), /apply\.css\?v=p4-silver-1/, "Application stylesheet needs final cache version");
const application = readFileSync("apply.html", "utf8");
assert.equal((application.match(/data-b6-focus-panel="/g)||[]).length, 3,
  "P2 should expose exactly three professional proof briefs");
assert.equal((application.match(/data-brief-track="/g)||[]).length, 5,
  "P3 must include three professional and two specialist briefs");
assert.match(application, /data-brief-print/, "P3 printable brief entry missing");
assert.match(application, /data-b6-theme-toggle/, "Application theme control missing");
assert.match(application, /<meta name="theme-color" content="#14191f">/,
  "First paint on application desk must be dark by default");
assert.match(application, /apply\.js\?v=p3-dark-1/,
  "Theme application JavaScript cache key missing");
assert.match(readFileSync("apply.js", "utf8"), /gb-hub-theme/,
  "Both pages must share the same saved theme preference");
assert.match(application, /data-brief-proof/, "P3 linked evidence action missing");
assert.match(readFileSync("apply.js","utf8"), /window\.print\(\)/,
  "P3 print action must be wired to an explicit visitor click");
assert.match(application, /data-b6-copy-link/, "P2 copy-link action missing");
assert.match(application, /RevOps Studio continúa en desarrollo/,
  "P2 must preserve explicit no-public-demo disclosure");


assert.match(css, /\/\* V19 · CV-inspired editorial finish/, "V19 typography polish is missing");
assert.match(html, /main\.js\?v=26/, "P1.3 JS must bypass old cached bytes");
assert.match(html, /i18n\.js\?v=24" defer/, "P1.3 i18n dictionary must be deferred, preserving script order");
assert.match(html, /og-cover\.png\?v=21/, "OG card URL must bypass the obsolete cached PNG");
// Replaced CSS artwork is gone from the actual hub: never restore inert orbit components.
assert.doesNotMatch(css, /\.hero-system\b|\.hero-orbit\b|\.orbit-core\b|\.orbit-node\b|\.signal-chain\b|@keyframes gb-orbit-spin/,
  "CSS still contains obsolete components removed before the three-world selector");
assert.doesNotMatch(readFileSync("main.js", "utf8"), /addEventListener\("pointermove"/,
  "Global pointer tracking for deleted artwork must not return");
assert.doesNotMatch(html, /rel="preload" href="\.\/styles\.css/,
  "Do not preload the same blocking stylesheet redundantly");
assert.match(html, /<script src="\.\/i18n\.js\?v=24" defer><\/script>\s*<script src="\.\/main\.js\?v=26" defer><\/script>/,
  "Dictionary must execute before the app, with both scripts deferred");
const socialPng = readFileSync("og-cover.png");
assert.equal(socialPng.toString("hex", 0, 8), "89504e470d0a1a0a", "OG must remain an actual PNG");
assert.equal(socialPng.readUInt32BE(16), 1200, "OG must be 1200 px wide");
assert.equal(socialPng.readUInt32BE(20), 630, "OG must be 630 px tall");
assert.equal((html.match(/data-world-overview/g) || []).length >= 1, true,
  "Overview control must be available");
assert.match(html, /id="world-stage"/);
assert.match(js, /worldOverviewOn: "Ver los 3"/);
assert.match(js, /worldOverviewOn: "View all 3"/);
assert.match(css, /\/\* V20 · Two ways to explore the same three worlds/, "V20 overview layout missing");
assert.match(css, /\.world-carousel-controls \.world-overview-toggle\{/, "Final selector rules missing");
assert.match(css, /width:auto;max-width:none/, "World switch must override fixed 44px arrow dimensions");
assert.doesNotMatch(css, /world-overview-toggle\[aria-pressed="true"\]\{background:var\(--cv-ochre\)/, 
  "The overview must not use a solid yellow active tile");
assert.match(html, /class="world-view-icon"/, "Restrained CSS view icon missing");
const behavior = readFileSync("main.js", "utf8");
assert.match(behavior, /gb-world-overview/, "Overview preference must persist");
assert.match(behavior, /slide\.setAttribute\("aria-hidden", String\(!overview && !active\)\)/,
  "Overview must expose all three slides to assistive technology");
const themeJs = readFileSync("main.js", "utf8");
assert.match(themeJs, /"#f7f5ef" : "#14140f"/, "Browser theme color must reflect the CV");
assert.match(readFileSync("site.webmanifest", "utf8"), /"theme_color": "#14140f"/);
assert.match(readFileSync("favicon.svg", "utf8"), /#daa428/);


assert.match(html, /People → Operations → Data → Systems → AI/);
assert.equal((html.match(/data-world-slide/g) || []).length, 3, "Exactly three world slides are required");
assert.match(html, /https:\/\/gracianb\.github\.io\/professional-deck\//);
assert.match(html, /https:\/\/gracianb\.github\.io\/yoga-instructor\//);
assert.match(html, /https:\/\/gracianb\.github\.io\/systems-lab\//);
assert.match(html, /href="\.\/cabin-crew\.html"/);
// P1.4: the first and final entrances must use the same universe numbering/order.
const doorOrder = [...html.matchAll(/<a class="door door-(gold|sage|cyan)"(?=\s|>)/g)].map((item) => item[1]);
assert.deepEqual(doorOrder, ["gold", "sage", "cyan"],
  "Lower universe choices must follow Professional → Yoga → Systems Lab");
assert.match(html, /<span>02 \/ YOGA<\/span>/);
assert.match(html, /<span>03 \/ SYSTEMS LAB<\/span>/);
assert.equal((html.match(/data-application-link/g) || []).length, 2,
  "Recruiter and document handoff links should preserve visitor language");
assert.match(readFileSync("main.js", "utf8"), /\.\/apply\.html\?lang=en/,
  "English visitors must retain their language at application handoff");
assert.match(js, /doorHumanBody: "Mi experiencia docente/);
assert.match(js, /doorBuildBody: "Proyectos de software/);
// P1 recruiter conversion must be actionable without discovering a hidden document section.
assert.match(html, /class="hero-recruiter-route"/);
assert.match(html, /class="hero-recruiter-route"[^>]*>[\s\S]*?href="\.\/apply\.html"/);
assert.match(html, /class="hero-proof-link" href="https:\/\/gracianb\.github\.io\/professional-deck\/proyecto-bodytone\.html"/);
assert.match(html, /data-i18n="factAccountsNumber"/);
assert.match(js, /factAccountsNumber: "hasta 80"/);
assert.match(js, /factAccountsNumber: "up to 80"/);
for (const [tab, panel] of [["professional", "professional"], ["yoga", "yoga"], ["lab", "lab"]]) {
  assert.ok(html.includes(`id="world-tab-${tab}"`), `Missing ${tab} tab`);
  assert.ok(html.includes(`aria-controls="world-panel-${panel}"`), `${tab} tab controls wrong panel`);
  assert.ok(html.includes(`id="world-panel-${panel}" role="tabpanel"`), `Missing ${panel} tabpanel`);
  assert.ok(html.includes(`aria-labelledby="world-tab-${tab}"`), `Missing ${tab} panel label`);
}
assert.equal((html.match(/class="document-visual"/g) || []).length, 3, "Three document identities required");
assert.equal((html.match(/class="document-summary"/g) || []).length, 3, "Each document track needs its summary");
assert.match(css, /\.document-group-professional \.document-visual/);
assert.match(css, /\.document-group-yoga \.document-visual/);
assert.match(css, /\.document-group-cabin \.document-visual/);
// Evidence actions must open the actual documented case, not the Deck cover.
assert.match(html, /href="https:\/\/gracianb\.github\.io\/professional-deck\/proyecto-bodytone\.html"[^>]*>\s*<span data-i18n="openCase">/,
  "Bodytone case action must deep-link to its public case study");
// Cabin Crew has its own safely published portfolio; the older hub page stays available.
assert.match(html, /href="https:\/\/gracianb\.github\.io\/cabin-crew-site\/"[^>]*>\s*<span>Portfolio TCP · ES\/EN<\/span>/,
  "TCP public standalone site must be reachable from hub documents");
assert.match(html, /href="\.\/cabin-letter-es\.html"/);
assert.match(html, /href="\.\/cabin-letter-en\.html"/);
assert.match(readFileSync("cabin-crew.html","utf8"), /data-language="en"/);
assert.match(readFileSync("cabin-crew.html","utf8"), /ESATUR/);
assert.doesNotMatch(readFileSync("cabin-crew.html","utf8"), /licencia vigente|valid cabin crew attestation/i);
assert.match(readFileSync("cabin-letter-en.html","utf8"), /previously completed Cabin Crew/);
const cabinPage=readFileSync("cabin-crew.html","utf8");
const cabinScript=readFileSync("cabin-crew.js","utf8");
assert.equal((cabinPage.match(/data-city="/g)||[]).length,6,"TCP atlas needs six city stops");
assert.equal((cabinPage.match(/data-credential-kind=/g)||[]).length,7,"TCP page needs seven distinct learning milestones");
assert.equal((cabinPage.match(/class="cabin-chapters"/g)||[]).length,1);
assert.match(cabinPage,/2015.*?ESATUR/s);
assert.match(cabinPage,/2019.*?Yoga/s);
assert.match(cabinPage,/2023.*?Google/s);
assert.match(cabinPage,/2025.*?Columbia/s);
assert.match(cabinPage,/Fourth-year Erasmus top-up/);
assert.match(cabinPage,/Cuarto año Erasmus de adaptación/);
assert.match(readme,/fourth Erasmus year/);
assert.match(cabinPage,/no se presenta como una habilitación actualmente vigente/);
assert.match(cabinScript,/const cities=/);
assert.match(cabinScript,/data-training-filter/);

assert.match(html, /data-world-prev/);
assert.match(html, /data-world-next/);
assert.match(html, /world-noscript/);
assert.match(html, /GRACIÁN[\s\S]*BAENA/);
assert.doesNotMatch(html, /Listos para revisar o enviar|Ready to review or send/i);
assert.match(readme, /Proof before promise|Proof before claims/i);
assert.match(sitemap, /https:\/\/gracianb\.github\.io\/GracianB\//);

console.log(`STATIC CONTRACT PASS · ${ids.length} ids · ${htmlKeys.size} i18n keys`);
