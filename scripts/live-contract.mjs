#!/usr/bin/env node
import assert from "node:assert/strict";

const url = process.env.GB_LIVE_URL || "https://gracianb.github.io/GracianB/";
const response = await fetch(url, {
  redirect: "follow",
  headers: { "user-agent": "gracianb-final-live-smoke/7" },
});

assert.equal(response.ok, true, `Live hub returned HTTP ${response.status}`);
const html = await response.text();

assert.match(html, /Gracián Baena/);
assert.match(html, /People → Operations → Data → Systems → AI/);
assert.match(html, /id="evidence"/);
assert.match(html, /id="documents"/);
assert.doesNotMatch(html, /systems[- ]lab/i);

console.log("GRACIANB LIVE CONTRACT PASS");
console.log(`URL: ${response.url}`);
console.log(`HTTP: ${response.status}`);
