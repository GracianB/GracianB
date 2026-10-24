#!/usr/bin/env node
// PUBLIC preview must never copy CV drafts from private Aga repository.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const prefix='aga-vista-previa/';
const locales=[['en','index.html'],['pl','pl/index.html'],['es','es/index.html']];
for(const [lang,file] of locales){
 const path=prefix+file;
 assert.ok(fs.existsSync(path),path+' missing');
 const page=fs.readFileSync(path,'utf8');
 assert.match(page,new RegExp('<html lang="'+lang+'"'),'Wrong document language');
 assert.match(page,/noindex,nofollow/,'Preview must opt out of indexing');
 assert.match(page,/PUBLIC EDITORIAL PREVIEW|PUBLICZNA WERSJA POGLĄDOWA|VISTA EDITORIAL PÚBLICA/,'Public status notice missing');
 assert.match(page,/id="decision-json"/,'Decision scenarios not present');
 assert.match(page,/id="focus-json"/,'Decision matrix not present');
 assert.match(page,/id="leadership"/,'V4 design narrative missing');
 assert.match(page,/id="review"/,'Evidence caveats absent');
 assert.equal((page.match(/data-scenario="[012]"/g)||[]).length,3);
 assert.equal((page.match(/data-focus="[012]"/g)||[]).length,3);
 assert.match(page,/<style>[\s\S]{10000,}<\/style>/,'Styles not embedded');
 assert.match(page,/<script>[\s\S]{1000,}<\/script>/,'Interactions not embedded');
 assert.doesNotMatch(page,/Agnieszka_Piazzese_CV_|\.pdf\b|application\/pdf|JVBERi0|data:application|@font-face[^}]*data:/i,'Private file or leaked PDF found');
 assert.doesNotMatch(page,/(?:href|src)="(?:\.\.\/)?(?:assets|cv)\//i,'Public preview contains broken private relative assets');
 assert.match(page,/href="https:\/\/es\.linkedin\.com\/in\/agnieszka-piazzese-012368177"/);
 const ids=[...page.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(ids.length,new Set(ids).size,path+' duplicate element IDs');
 for(const m of page.matchAll(/href="#([^"]+)"/g)){
  assert.ok(ids.includes(m[1]),path+' has broken anchor #'+m[1]);
 }
 console.log('AGA PUBLIC PREVIEW STATIC PASS',lang,page.length,'bytes');
}
for(const file of ['cv/Agnieszka_Piazzese_CV_EN.pdf','cv/Agnieszka_Piazzese_CV_PL.pdf','cv/Agnieszka_Piazzese_CV_ES.pdf']){
 assert.ok(!fs.existsSync(prefix+file),'Private CV must not be copied to public Pages');
}
console.log('AGA PUBLIC PREVIEW · No private CVs or external assets');
