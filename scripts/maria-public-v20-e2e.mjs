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
   page.on('pageerror',err=>errors.push(String(err)));
   page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text())});
   const url=base+(lang==='en'?'?lang=en':'');
   await page.goto(url,{waitUntil:'load'});
   await page.locator('#mrCandidates .mr-candidate').first().waitFor();
   assert.equal(await page.locator('html').getAttribute('lang'),lang);
   assert.equal(await page.locator('.mr-case').count(),3);
   assert.equal(await page.locator('.mr-candidate').count(),3);
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
   assert.equal(await page.locator('#mrChecks li').count(),3);
   await page.locator('#mrLabReset').click();
   assert.equal(await page.locator('#mrWeightCost').inputValue(),'3');
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
   console.log('MARIA V20 BROWSER PASS',lang,width);
   await ctx.close();
  }
 }
}finally{await b.close();}
