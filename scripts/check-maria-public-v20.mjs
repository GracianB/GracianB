#!/usr/bin/env node
// Maria V20 PUBLIC preview only. Never copy private CVs or credentials.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root='maria-romera-vista-previa/';
const html=fs.readFileSync(root+'index.html','utf8');
const css=fs.readFileSync(root+'mr-v20.css','utf8');
const js=fs.readFileSync(root+'mr-v20.js','utf8');
assert.match(html,/<html\b[^>]*data-mr-version="21"[^>]*lang="es"/);
assert.match(html,/noindex,nofollow/);
assert.match(html,/id="decision-lab"/);
assert.match(html,/id="mrLabNav"/);
assert.match(html,/mr-v20\.css\?v=21/);
assert.match(html,/mr-v20\.js\?v=21/);
assert.equal((html.match(/data-mr-case="[012]"/g)||[]).length,3);
for(const id of ['mrWeightCost','mrWeightSpeed','mrWeightRisk','mrCandidates','mrLabReset','mrVerdictName','mrChecks','mrInsightFactors','mrInsightGap','mrCopySummary','mrCopyLink','mrCopyStatus']){
 assert.ok(html.includes('id="'+id+'"'),id+' is missing');
}
assert.match(html,/V21<\/strong>/);
assert.match(html,/Vista editorial pública/);
assert.match(js,/MutationObserver/);
assert.match(js,/aria-pressed/);
assert.ok(js.includes("getLang()") && js.includes("en:") && js.includes("es:"),'ES/EN coverage');
assert.ok(css.length>3000);
for(const content of [html,css,js]){
 assert.doesNotMatch(content,/\.pdf\b|JVBERi0|data:application\/pdf|María_Romera_CV_(?:ES|EN)/i,'A private CV was exposed');
 assert.doesNotMatch(content,/https?:\/\/[^"'\s]*(?:track|analytics|collect)/i,'Unexpected tracking');
}
for(const pdf of ['cv/María_Romera_CV_ES.pdf','cv/Maria_Romera_CV_EN.pdf']){
 assert.equal(fs.existsSync(root+pdf),false,'Private PDF copied');
}
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
assert.equal(ids.length,new Set(ids).size,'Duplicate element IDs');
for(const m of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(m[1]),'Broken anchor '+m[1]);
console.log('MARIA V21 STATIC PASS · bilingual sourcing scenarios · no CVs · privacy boundary');
