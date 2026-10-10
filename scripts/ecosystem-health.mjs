#!/usr/bin/env node
/**
 * Public portfolio release gate. The hub remains three-world by design.
 * This independent audit checks the six actual published surfaces, including
 * their distinct Open Graph artwork. No credentials, tracking or private files.
 */
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";

const host = "https://gracianb.github.io";
const portfolios = [
  { slug: "GracianB", name: "GracianB hub", title: /Gracián Baena/i, image: "og-cover.png" },
  { slug: "professional-deck", name: "Professional Deck", title: /Professional Deck/i, image: "og-cover.png" },
  { slug: "systems-lab", name: "Systems Lab", title: /PLAY|Systems Lab/i, image: "og-cover.png" },
  { slug: "revops-studio", name: "RevOps Studio", title: /RevOps Studio/i, image: "assets/og.png" },
  { slug: "cabin-crew-site", name: "Cabin Crew", title: /Cabin Crew/i, image: "og-cover.png" },
  { slug: "yoga-instructor", name: "Yoga Instructor", title: /Instructor de Yoga/i, image: "og-cover.png" },
];

const hub = readFileSync("index.html", "utf8");
assert.equal(portfolios.length, 6, "Ecosystem must cover exactly six public sites");
assert.equal(new Set(portfolios.map(({slug}) => slug)).size, 6, "Duplicate portfolio slug");
assert.equal((hub.match(/data-world-slide(?=\\s|>)/g) || []).length, 3,
  "Hub must keep exactly three first-class worlds");
for (const slug of ["professional-deck", "yoga-instructor", "systems-lab"]) {
  assert.ok(hub.includes('href="' + host + '/' + slug + '/"'),
    "Hub is missing its public world link: " + slug);
}
if (process.argv.includes("--static")) {
  console.log("ECOSYSTEM STATIC PASS: 6 portfolios · 3 hub worlds");
  process.exit(0);
}

function attr(tag, key) {
  const pattern = new RegExp('(?:^|\\s)' + key + '\\s*=\\s*"([^"]*)"', "i");
  return pattern.exec(tag)?.[1] ?? null;
}
function meta(html, key) {
  const tags = [...html.matchAll(/<meta\\b[^>]*>/gi)].map(match => match[0]);
  const item = tags.find(tag => attr(tag, "property") === key || attr(tag, "name") === key);
  return item ? attr(item, "content") : null;
}
function canonical(html) {
  const tags = [...html.matchAll(/<link\\b[^>]*>/gi)].map(match => match[0]);
  const item = tags.find(tag => attr(tag, "rel") === "canonical");
  return item ? attr(item, "href") : null;
}
async function request(url) {
  let error;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        headers: { "user-agent": "GracianB-Ecosystem-Integrity/1" },
        signal: AbortSignal.timeout(18000)
      });
      assert.equal(response.status, 200, url + ": returned HTTP " + response.status);
      assert.equal(new URL(response.url).host, "gracianb.github.io",
        "Off-domain redirect: " + url);
      return response;
    } catch (cause) {
      error = cause;
      if (attempt < 3) await new Promise(resolve => setTimeout(resolve, attempt * 1200));
    }
  }
  throw error;
}
async function inspect(site) {
  const url = host + "/" + site.slug + "/";
  const response = await request(url);
  const html = await response.text();
  const pageTitle = /<title>([^<]+)<\\/title>/i.exec(html)?.[1] ?? "";
  assert.match(pageTitle, site.title, site.name + ": incorrect document title");
  assert.equal(canonical(html), url, site.name + ": incorrect canonical");
  assert.equal(meta(html, "og:url"), url, site.name + ": incorrect Open Graph URL");
  assert.ok(meta(html, "description")?.length >= 35,
    site.name + ": missing useful meta description");
  assert.ok(meta(html, "og:image:alt")?.length >= 15,
    site.name + ": image needs descriptive alternate text");
  assert.equal(meta(html, "twitter:card"), "summary_large_image",
    site.name + ": the share card should use a full-size preview");
  const imageUrl = meta(html, "og:image");
  const image = new URL(imageUrl ?? "", url);
  const expectedPath = "/" + site.slug + "/" + site.image;
  assert.equal(image.origin, host, site.name + ": image origin mismatch");
  assert.equal(image.pathname, expectedPath, site.name + ": image belongs to another portfolio");
  assert.equal(meta(html, "twitter:image"), imageUrl,
    site.name + ": Twitter and Open Graph images must match");

  const imageResponse = await request(image.href);
  assert.match(imageResponse.headers.get("content-type") ?? "", /^image\\/png/i,
    site.name + ": social asset must be a PNG");
  const bytes = Buffer.from(await imageResponse.arrayBuffer());
  assert.ok(bytes.byteLength > 32, site.name + ": social PNG is empty");
  assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a",
    site.name + ": invalid PNG signature");
  assert.equal(bytes.readUInt32BE(16), 1200, site.name + ": image width");
  assert.equal(bytes.readUInt32BE(20), 630, site.name + ": image height");
  return { portfolio: site.name, url, title: pageTitle, image: image.href, imageBytes: bytes.length, status: "PASS" };
}

const results = await Promise.allSettled(portfolios.map(inspect));
const records = results.map((result, index) =>
  result.status === "fulfilled" ? result.value : {
    portfolio: portfolios[index].name,
    url: host + "/" + portfolios[index].slug + "/",
    status: "FAIL",
    error: String(result.reason?.message ?? result.reason)
  }
);
for (const record of records) {
  console.log(record.status + " " + record.portfolio + (record.error ? ": " + record.error : " · PNG " + record.imageBytes + " bytes"));
}
const summary = { checkedAt: new Date().toISOString(), results: records,
  passed: records.filter(x => x.status === "PASS").length,
  total: portfolios.length };
mkdirSync("artifacts", { recursive: true });
writeFileSync("artifacts/ecosystem-health.json", JSON.stringify(summary, null, 2) + "\\n");
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY,
    "## Portfolio ecosystem health\\n" +
    records.map(r => "- " + r.status + " " + r.portfolio + (r.error ? " · " + r.error : "")).join("\\n") + "\\n");
}
if (summary.passed !== summary.total) process.exitCode = 1;
else console.log("ECOSYSTEM LIVE PASS: 6 / 6 public sites and 1200x630 PNG previews");
