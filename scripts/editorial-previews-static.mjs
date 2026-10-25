import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {join,dirname} from 'node:path';
const sections=[
 {key:'Aga EN',file:'aga-vista-previa/index.html',lang:'en',marker:'data-ap-release="editorial"'},
 {key:'Aga PL',file:'aga-vista-previa/pl/index.html',lang:'pl',marker:'data-ap-release="editorial"'},
 {key:'Aga ES',file:'aga-vista-previa/es/index.html',lang:'es',marker:'data-ap-release="editorial"'},
 {key:'Maria ES',file:'maria-romera-vista-previa/index.html',lang:'es',marker:'data-mr-release="editorial"'},
 {key:'Maria EN',file:'maria-romera-vista-previa/en/index.html',lang:'en',marker:'data-mr-release="editorial"'}
];
for(const item of sections){
 const html=readFileSync(item.file,'utf8');
 assert.match(html,/<!doctype html>/i,item.key+' doctype');
 assert.ok(html.includes('lang="'+item.lang+'"'),item.key+' locale');
 assert.ok(html.includes(item.marker),item.key+' editorial release');
 assert.match(html,/noindex,nofollow/i,item.key+' must not be indexed before personal approval');
 assert.ok(html.includes('name="referrer" content="no-referrer"'),item.key+' referrer privacy');
 assert.match(html,/<main id="main">/,item.key+' main');
 assert.match(html,/<h1>/,item.key+' hero');
 assert.match(html,/href="#(record|trayectoria)"/,item.key+' clear career focus');
 assert.ok(!/data:(?:application\/pdf)|JVBERi0|\.pdf(?=["?#])/i.test(html),item.key+' no private CV');
 assert.ok(!/mrLabReset|control-tower|towerIndex|mrCandidates|towerSave|decision-lab/i.test(html),item.key+' no legacy simulations');
 assert.ok(!/<script[^>]+src="https?:/i.test(html),item.key+' no external script');
 for(const ref of [...html.matchAll(/(?:href|src)="([^"]+\.(?:css|js))"/g)]){
  const filename=join(dirname(item.file),ref[1]);assert.ok(existsSync(filename),item.key+' missing asset '+filename);
 }
 if(item.key.startsWith('Aga'))for(const id of ['"en"','"es"','"pl"'])assert.ok(html.includes('>'+id.slice(1,-1).toUpperCase()+'</a>'),item.key+' localized navigation');
 else for(const text of ['>ES</a>','>EN</a>'])assert.ok(html.includes(text),item.key+' languages');
 console.log('PASS',item.key,html.length,'bytes');
}
for(const f of ['aga-vista-previa/editorial.js','maria-romera-vista-previa/editorial.js']){const js=readFileSync(f,'utf8');assert.match(js,/aria-expanded/);assert.match(js,/localStorage/);}
console.log('EDITORIAL STATIC PASS — 5 routes, provenance/privacy guard, local assets');
