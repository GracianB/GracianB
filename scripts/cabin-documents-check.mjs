#!/usr/bin/env node
/** Block 1: no invisible dead ends in public cabin crew application paths.
 * The PDF files are optional until real binaries are uploaded. Missing PDFs
 * MUST have an explicitly working, printable HTML equivalent in 404.html.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
const source = readFileSync("cabin-crew.html","utf8");
const fallback = readFileSync("404.html","utf8");
const pairs = [
 ["Gracian_Baena_CV_TCP_ES.pdf","cabin-cv-es.html"],
 ["Gracian_Baena_CV_TCP_EN.pdf","cabin-cv-en.html"],
 ["Gracian_Baena_Carta_TCP_ES.pdf","cabin-letter-es.html"],
 ["Gracian_Baena_Cover_Letter_TCP_EN.pdf","cabin-letter-en.html"]
];
for (const [pdf, html] of pairs) {
 assert.ok(existsSync(html), "Missing printable alternative: "+html);
 const rendered = readFileSync(html,"utf8");
 assert.match(rendered, /<html\s+lang=(?:["'])(?:en|es)/i, "HTML language missing: "+html);
 assert.match(rendered, /<title>.+<\/title>/i, "Document title missing: "+html);
 assert.match(rendered, /window\.print\(\)/, "Print to PDF must work: "+html);
 assert.match(fallback, new RegExp(pdf.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")), "Missing PDF recovery: "+pdf);
 assert.ok(fallback.includes(html), "Broken fallback target: "+html);
 if (existsSync(pdf)) {
  const bytes=readFileSync(pdf);
  assert.equal(bytes.subarray(0,5).toString("ascii"),"%PDF-", "Invalid PDF: "+pdf);
  assert.ok(bytes.lastIndexOf(Buffer.from("%%EOF"))>=bytes.length-1024,"Truncated PDF: "+pdf);
 }
}
for (const html of ["cabin-cv-es.html","cabin-cv-en.html"]) {
 assert.ok(source.includes('href="./'+html+'"'),"Missing visible public CV link: "+html);
 const doc=readFileSync(html,"utf8");
 for (const text of ["ESATUR","Bodytone","Minderest","Majorel","Mood Fitness","cabin-letter-"]) {
  assert.ok(doc.includes(text),html+" missing factual career section: "+text);
 }
}
console.log("CABIN CV STATIC PASS: 2 bilingual accessible/printable resumes, 2 letters, 4 404 recovery paths, optional original PDFs validated when available.");
