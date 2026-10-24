#!/usr/bin/env node
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {chromium} from 'playwright';
// Reproduce the standalone HTML experience directly, without opening a local port.
const base=new URL('../maria-romera-vista-previa/index.html',import.meta.url).href;
mkdirSync('artifacts/e2e',{recursive:true});
const b=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const width of [320,390,768,1440]){
  for(const lang of ['es','en']){
   const ctx=await b.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
   const page=await ctx.newPage(),errors=[];
   await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.__lastCopy=String(value)}}}));

   page.on('pageerror',err=>errors.push(String(err?.stack||err)));
   page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text())});
   const url=base+(lang==='en'?'?lang=en':'');
   await page.goto(url,{waitUntil:'load'});
   await page.locator('#mrCandidates .mr-candidate').first().waitFor();
   assert.equal(await page.locator('html').getAttribute('lang'),lang);
   assert.equal(await page.locator('.mr-case').count(),3);
   assert.equal(await page.locator('.mr-candidate').count(),3);
   assert.equal(await page.locator('.mr-insight-factor').count(),3);
   assert.equal(await page.locator('#mrMinSpeed').inputValue(),'1');
   assert.equal(await page.locator('#mrMinRisk').inputValue(),'1');
   assert.match(await page.locator('#mrEligibility').innerText(),/3/);
   await page.locator('#mrCopySummary').click();
   assert.match(await page.evaluate(()=>window.__lastCopy),/5/);
   await page.locator('#mrCopyLink').click();
   const generatedLink=await page.evaluate(()=>window.__lastCopy);
   assert.match(generatedLink,/scenario=0/);
   assert.match(generatedLink,/decision-lab/);

   await page.locator('.mr-case[data-mr-case="1"]').click();
   assert.equal(await page.locator('.mr-case[data-mr-case="1"]').getAttribute('aria-pressed'),'true');
   await page.locator('.mr-case[data-mr-case="2"]').focus();
   await page.keyboard.press('Home');
   assert.equal(await page.locator('.mr-case[data-mr-case="0"]').getAttribute('aria-pressed'),'true');
   // Cost-heavy should select fictional A; delivery + reliability-heavy should select C.
   const setValue=async(selector,value)=>page.locator(selector).evaluate((el,v)=>{el.value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}))},value);
   await setValue('#mrWeightCost',5);await setValue('#mrWeightSpeed',1);await setValue('#mrWeightRisk',1);
   assert.match(await page.locator('#mrVerdictName').innerText(),lang==='es'?/Opción A/:/Option A/);
   await setValue('#mrWeightCost',1);await setValue('#mrWeightSpeed',5);await setValue('#mrWeightRisk',5);
   assert.match(await page.locator('#mrVerdictName').innerText(),lang==='es'?/Opción C/:/Option C/);
   assert.match(await page.locator('#mrInsightGap').innerText(),lang==='es'?/Ventaja|Empate/:/Lead|tie/i);
   await page.locator('#mrCopyLink').click();
   const persisted=await page.evaluate(()=>window.__lastCopy);
   const persistedUrl=new URL(persisted);
   assert.equal(persistedUrl.searchParams.get('wc'),'1');
   assert.equal(persistedUrl.searchParams.get('ws'),'5');
   assert.equal(persistedUrl.searchParams.get('wr'),'5');
   await page.goto(persisted,{waitUntil:'load'});
   assert.equal(await page.locator('#mrWeightCost').inputValue(),'1');
   assert.equal(await page.locator('#mrWeightSpeed').inputValue(),'5');
   assert.equal(await page.locator('#mrWeightRisk').inputValue(),'5');

   await page.locator('.mr-case[data-mr-case="2"]').click();
   await setValue('#mrMinSpeed',5);
   await setValue('#mrMinRisk',5);
   assert.equal(await page.locator('#mrEligibility').getAttribute('data-empty'),'true');
   assert.equal(await page.locator('.mr-candidate.is-ineligible').count(),3);
   await page.locator('#mrCopyLink').click();
   const constrainedLink=await page.evaluate(()=>window.__lastCopy);
   assert.equal(new URL(constrainedLink).searchParams.get('gs'),'5');
   assert.equal(new URL(constrainedLink).searchParams.get('gr'),'5');
   await page.goto(constrainedLink,{waitUntil:'load'});
   assert.equal(await page.locator('#mrMinSpeed').inputValue(),'5');
   assert.equal(await page.locator('#mrEligibility').getAttribute('data-empty'),'true');
   await page.locator('.mr-case[data-mr-case="0"]').click();
   assert.equal(await page.locator('.mr-candidate:not(.is-ineligible)').count(),1);
   assert.equal(await page.locator('#mrChecks li').count(),3);
   await page.locator('#mrLabReset').click();
   assert.equal(await page.locator('#mrWeightCost').inputValue(),'3');
   assert.equal(await page.locator('#mrMinSpeed').inputValue(),'1');
   assert.equal(await page.locator('#mrMinRisk').inputValue(),'1');
   await page.locator('#lang').click();
   assert.equal(await page.locator('html').getAttribute('lang'),lang==='es'?'en':'es');
   assert.equal(await page.locator('.mr-candidate').count(),3);
   await page.locator('#theme').click();
   assert.ok(['light','dark'].includes(await page.locator('html').getAttribute('data-theme')));
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(overflow<=1,lang+' '+width+' overflow '+overflow);
   assert.deepEqual(errors,[],lang+' '+width+' JavaScript errors');
   if(width===390||width===1440){
    await page.locator('#decision-lab').scrollIntoViewIfNeeded();
    await page.screenshot({path:'artifacts/e2e/maria-v20-'+lang+'-'+width+'.png',fullPage:true});
   }
   console.log('MARIA V22 BROWSER PASS',lang,width);
   await ctx.close();
  }
 }
}finally{await b.close();}
