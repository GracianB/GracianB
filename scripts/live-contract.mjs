#!/usr/bin/env node
import assert from "node:assert/strict";

const base=process.env.GB_LIVE_URL || "https://gracianb.github.io/GracianB/";
async function load(url){
  const response=await fetch(url,{redirect:"follow",headers:{"user-agent":"gracianb-constellation-live-contract/12"}});
  assert.ok(response.ok,url+" failed HTTP "+response.status);
  return {url:response.url,body:await response.text()};
}
const {url,body:html}=await load(base);
assert.match(html,/Gracián Baena/);
for(const section of ["worlds","universes","arc","evidence","documents","contact"])
  assert.ok(html.includes('id="'+section+'"'),"P12 live chapter missing: "+section);
assert.equal((html.match(/data-portal="(?:professional|yoga|lab)"/g)||[]).length,3);
assert.equal((html.match(/data-atlas-city="/g)||[]).length,6);
assert.match(html,/data-constellation-sky/);
assert.match(html,/id="hero-title"[^>]*data-i18n="heroStatement"/);
assert.match(html,/atlas-systems-mark/); 
assert.match(html,/class="theme-sun"[^>]*viewBox="0 0 24 24"/);
assert.doesNotMatch(html,/data-i18n="atlasNote"/);

assert.match(html,/constellation-lotus/);
assert.match(html,/circuit-chip/);
assert.match(html,/styles\.css\?v=28/,"Latest shared CSS must bypass old cache");
assert.match(html,/hub-finish\.css\?v=3/,"Latest dark sections must bypass old cache");
assert.match(html,/portal-v11\.css\?v=3/);
assert.match(html,/i18n\.js\?v=26/);
assert.match(html,/main\.js\?v=p12-sky/);
assert.doesNotMatch(html,/hero-orbit-signature|data-world-overview|data-world-prev|data-world-next/,
  "Old Professional Deck emblem or carousel must not return");
for(const path of ["portal-v11.css?v=3","main.js?v=p12-sky","i18n.js?v=26"]){
 const {body}=await load(new URL("./"+path,url).href);
 assert.ok(body.length>2000,"Public P12 resource unexpectedly empty: "+path);
 if(path.includes("main.js"))assert.match(body,/function constellationSky/);
 if(path.includes("portal-v11.css"))assert.match(body,/\.cosmic-atlas/);
}
for(const site of ["professional-deck","yoga-instructor","systems-lab"])
  assert.ok(html.includes("https://gracianb.github.io/"+site+"/"),"Missing universe "+site);
assert.doesNotMatch(html,/Listos para revisar o enviar|Ready to review or send/i);
console.log("GRACIANB P12 CONSTELLATION LIVE PASS · 3 universes · 6 cities · sky assets · no old carousel");
console.log("Public URL:",url);
