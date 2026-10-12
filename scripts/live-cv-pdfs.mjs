#!/usr/bin/env node
/**
 * Confirm that the exact four committed Cabin Crew PDFs are served by GitHub
 * Pages. A green HTML build is not enough, nor is a 200 response serving HTML.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const base = "https://gracianb.github.io/GracianB/";
const names = [
  "Gracian_Baena_CV_TCP_ES.pdf",
  "Gracian_Baena_CV_TCP_EN.pdf",
  "Gracian_Baena_Carta_TCP_ES.pdf",
  "Gracian_Baena_Cover_Letter_TCP_EN.pdf"
];
const sha256 = bytes => createHash("sha256").update(bytes).digest("hex");
for (const name of names) {
  const local = readFileSync(new URL("../" + name, import.meta.url));
  assert.equal(local.subarray(0, 5).toString("ascii"), "%PDF-");
  const expected = sha256(local);
  const url = base + name + "?sha=" + expected.slice(0, 12);
  let lastError;
  let passed = false;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        headers: { "user-agent": "GracianB-CV-B1-PDF-Integrity/1", "cache-control": "no-cache" },
        signal: AbortSignal.timeout(20000)
      });
      assert.equal(response.status, 200, "PDF URL returned " + response.status + ": " + url);
      assert.match(response.headers.get("content-type") ?? "", /application\/pdf/i, "PDF URL served incorrect type");
      assert.equal(new URL(response.url).hostname, "gracianb.github.io", "Unexpected redirect");
      const remote = Buffer.from(await response.arrayBuffer());
      assert.equal(remote.subarray(0, 5).toString("ascii"), "%PDF-");
      assert.equal(sha256(remote), expected, "Published file differs from repository: " + name);
      console.log("LIVE PDF PASS " + name + " (" + remote.length + " bytes)");
      passed = true;
      break;
    } catch (e) {
      lastError = e;
      if (attempt < 4) await new Promise(resolve => setTimeout(resolve, attempt * 1500));
    }
  }
  if (!passed) throw new Error("LIVE PDF FAIL " + name + ": " + lastError);
}
console.log("CV B1 GITHUB PAGES PDF 4/4 VERIFIED");
