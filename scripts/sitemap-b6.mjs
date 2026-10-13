#!/usr/bin/env node
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const map=readFileSync("sitemap.xml","utf8");
const urls=["","apply.html","cabin-crew.html","cabin-cv-es.html","cabin-cv-en.html"];
for(const path of urls){
 assert.ok(path===""||existsSync(path),"Sitemap target absent from repository: "+path);
 assert.ok(map.includes("<loc>https://gracianb.github.io/GracianB/"+path+"</loc>"),"Sitemap canonical entry missing: "+path);
}
assert.ok(readFileSync("robots.txt","utf8").includes("https://gracianb.github.io/GracianB/sitemap.xml"));
console.log("B6 SITEMAP PASS: 5 first-party indexed destinations with matching local pages");
