#!/usr/bin/env node
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const HOST='127.0.0.1',PORT=4189;
const base='http://'+HOST+':'+PORT+'/aga-vista-previa/';
const server=spawn('python3',['-m','http.server',String(PORT),'--bind',HOST],{stdio:['ignore','pipe','pipe']});
async function wait(){
 for(let n=0;n<70;n++){
  try{const r=await fetch(base);if(r.ok)return}catch{}
  await new Promise(resolve=>setTimeout(resolve,230));
 }
 throw Error('Local Pages preview unavailable');
}
await wait();
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const [lang,route] of [['en',''],['pl','pl/'],['es','es/']]){
  for(const width of [320,390,768,1440]){
   const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
   const page=await context.newPage(),errors=[];
   await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.__lastCopy=String(value)}}}));

   page.on('pageerror',e=>errors.push(String(e)));
   page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
   const response=await page.goto(base+route,{waitUntil:'load'});
   assert.equal(response.status(),200);
   assert.equal(await page.locator('html').getAttribute('lang'),lang);
   assert.equal(await page.locator('.decision-choice').count(),3);
   assert.equal(await page.locator('.focus-choice').count(),3);
   assert.equal(await page.locator('#leadership').count(),1);
   assert.equal(await page.locator('#control-tower').count(),1);
   assert.equal(await page.locator('.tower-case').count(),3);
   assert.equal(await page.locator('.tower-lever input').count(),3);
   const baseline=await page.locator('#towerResponse').innerText();
   await page.locator('.tower-case[data-tower-case="2"]').click();
   assert.equal(await page.locator('.tower-case[data-tower-case="2"]').getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('.decision-choice[data-scenario="2"]').getAttribute('aria-pressed'),'true');
   assert.notEqual(await page.locator('#towerResponse').innerText(),baseline);
   assert.equal(await page.locator('.tower-audit-factor').count(),3);
   assert.ok(Number(await page.locator('#towerIndex').innerText())>=0);
   assert.equal(await page.locator('#towerComparisonResults').isHidden(),true);
   await page.locator('#towerSave').click();
   assert.equal(await page.locator('#towerComparisonResults').isVisible(),true);
   assert.equal(await page.locator('#towerClear').isEnabled(),true);
   const referenceScore=await page.locator('#towerBaselineScore').innerText();
   assert.equal(referenceScore,await page.locator('#towerCurrentScore').innerText());
   await page.locator('#towerCopyBrief').click();
   assert.match(await page.evaluate(()=>window.__lastCopy),/\/20/);
   await page.locator('#towerCopyLink').click();
   const linked=await page.evaluate(()=>window.__lastCopy);
   assert.match(linked,/case=2/);
   assert.match(linked,/control-tower/);

   const move=async(selector,value)=>page.locator(selector).evaluate((el,v)=>{el.value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}));},value);
   await move('#tower-urgency',4);await move('#tower-buffer',0);await move('#tower-paper',0);
   assert.equal(await page.locator('#towerStatus').getAttribute('data-level'),'2');
   assert.ok(Number(await page.locator('#towerIndex').innerText())>=15);
   assert.equal(await page.locator('#towerBaselineScore').innerText(),referenceScore);
   assert.notEqual(await page.locator('#towerDifference').innerText(),'0');
   await page.locator('#towerClear').click();
   assert.equal(await page.locator('#towerComparisonResults').isHidden(),true);
   const factors=await page.locator('.tower-audit-factor strong').allInnerTexts();
   assert.equal(factors.length,3);
   assert.ok(factors.every(v=>v.includes('/')),'Explainable factors missing');
   await page.reload({waitUntil:'load'});
   assert.equal(await page.locator('.tower-case[data-tower-case="2"]').getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('#tower-urgency').inputValue(),'4');
   assert.equal(await page.locator('#tower-buffer').inputValue(),'0');

   const severe=await page.locator('#towerResponse').innerText();
   await page.locator('#towerReset').click();
   assert.equal(await page.locator('.tower-case[data-tower-case="0"]').getAttribute('aria-pressed'),'true');
   assert.notEqual(await page.locator('#towerResponse').innerText(),severe);
   const accessible=await page.locator('.tower-case').first().evaluate(el=>({height:el.getBoundingClientRect().height,tabIndex:el.tabIndex}));
   assert.ok(accessible.height>=44&&accessible.tabIndex>=0,'V20 button accessible hit area missing');

   assert.equal(await page.locator('a[href$=".pdf"]').count(),0);
   const before=await page.locator('#decisionTitle').innerText();
   await page.locator('.decision-choice[data-scenario="2"]').click();
   const after=await page.locator('#decisionTitle').innerText();
   assert.notEqual(after,before,'Scenario not interactive');
   await page.locator('.focus-choice[data-focus="1"]').click();
   assert.equal(await page.locator('.focus-choice[data-focus="1"]').getAttribute('aria-pressed'),'true');
   await page.locator('#theme').click();
   assert.ok(['light','dark'].includes(await page.locator('html').getAttribute('data-theme')));
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
   assert.ok(overflow<=1,lang+' overflow at '+width+': '+overflow);
   assert.deepEqual(errors,[],lang+' JS errors '+width);
   if(width===390||width===1440){
    const {mkdirSync}=await import('node:fs');
    mkdirSync('artifacts/e2e',{recursive:true});
    await page.locator('#control-tower').scrollIntoViewIfNeeded();
    await page.screenshot({path:'artifacts/e2e/aga-v20-'+lang+'-'+width+'.png',fullPage:true});
   }
   console.log('AGA V22 PUBLIC E2E PASS',lang,width);
   await context.close();
  }
 }
}finally{await browser.close();server.kill('SIGTERM')}
