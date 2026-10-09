#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const hub = readFileSync("index.html", "utf8");
const worlds = [
  { name: "Professional Deck", url: "https://gracianb.github.io/professional-deck/", title: /<title>[^<]*Professional Deck/i },
  { name: "Yoga Instructor", url: "https://gracianb.github.io/yoga-instructor/", title: /<title>[^<]*Instructor de Yoga/i },
  { name: "Systems Lab", url: "https://gracianb.github.io/systems-lab/", title: /<title>[^<]*(Systems Lab|PLAY)/i },
];

assert.equal((hub.match(/data-world-slide(?=\s|>)/g) || []).length, 3,
  "Exactly three first-class worlds must remain present");
for (const world of worlds) {
  assert.ok(hub.includes('href="' + world.url + '"'),
    world.name + " must have a visible public destination on the hub");
}
if (process.argv.includes("--static")) {
  console.log("Portfolio navigation STATIC PASS · three distinct linked worlds");
  process.exit(0);
}

async function probe(world) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(world.url, {
        redirect: "follow",
        headers: { "user-agent": "GracianB-portfolio-links-contract/1" },
        signal: AbortSignal.timeout(15000),
      });
      assert.equal(response.status, 200,
        world.name + ": must return 200, received " + response.status);
      assert.equal(new URL(response.url).hostname, "gracianb.github.io",
        world.name + ": should stay on the canonical GitHub Pages host");
      const html = await response.text();
      assert.match(html, world.title, world.name + ": destination title mismatch");
      console.log("Portfolio link PASS: " + world.name + " · " + response.status);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise(resolve => setTimeout(resolve, 1500 * attempt));
    }
  }
  throw new Error(world.name + ": live destination not verified after retries: " + lastError);
}
await Promise.all(worlds.map(probe));
console.log("Portfolio navigation LIVE PASS · all three destinations");
