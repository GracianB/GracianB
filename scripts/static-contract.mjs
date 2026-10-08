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

assert.match(html, /People → Operations → Data → Systems → AI/);
assert.equal((html.match(/data-world-slide/g) || []).length, 3, "Exactly three world slides are required");
assert.match(html, /https:\/\/gracianb\.github\.io\/professional-deck\//);
assert.match(html, /https:\/\/gracianb\.github\.io\/yoga-instructor\//);
assert.match(html, /https:\/\/gracianb\.github\.io\/systems-lab\//);
assert.match(html, /href="\.\/cabin-crew\.html"/);
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
assert.match(cabinPage,/not a second degree/);
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
