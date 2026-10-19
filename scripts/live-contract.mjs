#!/usr/bin/env node
import assert from "node:assert/strict";

const url = process.env.GB_LIVE_URL || "https://gracianb.github.io/GracianB/";
const response = await fetch(url, {
  redirect: "follow",
  headers: { "user-agent": "gracianb-final-live-smoke/8" },
});

assert.equal(response.ok, true, `Live hub returned HTTP ${response.status}`);
const html = await response.text();

assert.match(html, /Gracián Baena/);
assert.match(html, /People → Operations → Data → Systems → AI/);
assert.match(html, /id="worlds"/);
assert.match(html, /id="evidence"/);
assert.match(html, /id="documents"/);
assert.equal((html.match(/data-portal="(?:professional|yoga|lab)"/g)||[]).length,3,
  "The live site must expose three direct linked portals, not carousel slides");
assert.doesNotMatch(html,/data-world-overview|data-world-prev|data-world-next/,
  "The tiny expand/reduce control must not return in production");
assert.match(html,/id="hero-title"[^>]*data-i18n="heroStatement"/,
  "The live cover must keep the single-sentence statement");
assert.match(html, /https:\/\/gracianb\.github\.io\/professional-deck\//);
assert.match(html, /https:\/\/gracianb\.github\.io\/yoga-instructor\//);
assert.match(html, /https:\/\/gracianb\.github\.io\/systems-lab\//);
assert.doesNotMatch(html, /Listos para revisar o enviar|Ready to review or send/i);

console.log("GRACIANB P11 LIVE CONTRACT PASS");
console.log(`URL: ${response.url}`);
console.log(`HTTP: ${response.status}`);
console.log("Worlds: Professional / Yoga / Systems Lab PASS");
