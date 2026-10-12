#!/usr/bin/env node
/**
 * Publish only when source binary PDFs are absent. We deliberately do not
 * replace a real uploaded CV or letter with a browser-generated alternative.
 * Generated PDFs are reviewable, real PDF files; they are not byte-identical
 * to the original design files supplied to the candidate.
 */
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const publicBase = "https://gracianb.github.io/GracianB/";
const inputs = [
  ["cabin-cv-es.html", "Gracian_Baena_CV_TCP_ES.pdf", ["ESATUR", "Bodytone", "Minderest"]],
  ["cabin-cv-en.html", "Gracian_Baena_CV_TCP_EN.pdf", ["ESATUR", "Bodytone", "Minderest"]],
  ["cabin-letter-es.html", "Gracian_Baena_Carta_TCP_ES.pdf", ["ESATUR"]],
  ["cabin-letter-en.html", "Gracian_Baena_Cover_Letter_TCP_EN.pdf", ["ESATUR"]]
];

const browser = await chromium.launch({ headless: true });
try {
  for (const [source, target, terms] of inputs) {
    const sourcePath = resolve(root, source);
    const targetPath = resolve(root, target);
    assert.ok(existsSync(sourcePath), "Source HTML missing: " + source);
    if (existsSync(targetPath)) {
      const original = readFileSync(targetPath);
      assert.equal(original.subarray(0, 5).toString("ascii"), "%PDF-", "Existing PDF is invalid: " + target);
      console.log("PRESERVED ORIGINAL " + target);
      continue;
    }

    const page = await browser.newPage({ viewport: { width: 1150, height: 1400 } });
    try {
      await page.goto(pathToFileURL(sourcePath).href, { waitUntil: "load" });
      await page.emulateMedia({ media: "print" });
      await page.evaluate((base) => {
        for (const link of document.querySelectorAll("a[href]")) {
          const raw = link.getAttribute("href");
          if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:")) continue;
          if (raw.startsWith("file:")) continue;
          if (/^(https?:)?\/\//i.test(raw)) continue;
          link.setAttribute("href", new URL(raw, base).href);
        }
      }, publicBase);
      const body = await page.locator("body").innerText();
      for (const term of terms) {
        assert.ok(body.includes(term), source + " missing documented section: " + term);
      }
      const bytes = await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
        displayHeaderFooter: false,
        tagged: true
      });
      assert.ok(bytes.byteLength > 3000, "Generated PDF unexpectedly small: " + target);
      assert.equal(bytes.subarray(0, 5).toString("ascii"), "%PDF-");
      writeFileSync(targetPath, bytes);
      console.log("CREATED " + target + " (" + bytes.byteLength + " bytes)");
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
}
