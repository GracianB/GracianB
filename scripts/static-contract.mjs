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
  [...html.matchAll(/data-i18n(?:-placeholder)?="([^"]+)"/g)].map((match) => match[1]),
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

const publicText = [html, js, readme, sitemap].join("\n");
assert.equal(/systems[- ]lab/i.test(publicText), false, "Legacy Systems Lab reference must not return");
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
assert.match(readme, /Proof before promise|Proof before claims/i);
assert.match(sitemap, /https:\/\/gracianb\.github\.io\/GracianB\//);

console.log(`STATIC CONTRACT PASS · ${ids.length} ids · ${htmlKeys.size} i18n keys`);
