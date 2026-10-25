import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {mkdirSync} from 'node:fs';
const cases=[
 ['Aga EN','aga-vista-previa/index.html','en','Direction'],
 ['Aga PL','aga-vista-previa/pl/index.html','pl','Jasny'],
 ['Aga ES','aga-vista-previa/es/index.html','es','Una dirección'],
 ['Maria ES','maria-romera-vista-previa/index.html','es','De la estrategia'],
 ['Maria EN','maria-romera-vista-previa/en/index.html','en','From strategy']
];
mkdirSync('artifacts/e2e',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let count=0;
try{
 for(const [name,path,lang,heading] of cases){
  for(const width of [320,390,768,1440]){
   const context=await browser.newContext({viewport:{width,height:850},reducedMotion:'reduce',colorScheme:'light'});
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(String(e)));
   await page.goto(pathToFileURL(resolve(path)).href,{waitUntil:'load'});
   assert.equal(await page.locator('html').getAttribute('lang'),lang,name+' lang');
   assert.match(await page.locator('h1').innerText(),new RegExp(heading,'i'),name+' headline');
   assert.equal(await page.locator('main').count(),1);
   assert.equal(await page.locator('nav a').count(),3);
   const dims=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
   assert.ok(dims.scroll<=dims.client+2,name+' overflow '+width+' '+JSON.stringify(dims));
   const c1=await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor);
   await page.locator('#theme').click();
   assert.equal(await page.locator('html').getAttribute('data-theme'),'dark',name+' dark');
   const c2=await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor);
   assert.notEqual(c1,c2,name+' theme colors');
   await page.reload({waitUntil:'load'});
   assert.equal(await page.locator('html').getAttribute('data-theme'),'dark',name+' persisted theme');
   if(width<900){
    const toggle=page.locator('#menu');assert.equal(await toggle.isVisible(),true);
    await toggle.click();assert.equal(await toggle.getAttribute('aria-expanded'),'true');
    await page.keyboard.press('Escape');assert.equal(await toggle.getAttribute('aria-expanded'),'false');
   }
   assert.deepEqual(errors,[],name+' browser errors');
   if(width===390)await page.screenshot({path:'artifacts/e2e/'+lang+'-'+name.toLowerCase().replaceAll(' ','-')+'-mobile.png',fullPage:true});
   if(width===1440)await page.screenshot({path:'artifacts/e2e/'+lang+'-'+name.toLowerCase().replaceAll(' ','-')+'-desktop.png',fullPage:true});
   await context.close();count++;
  }
 }
}finally{await browser.close();}
console.log('EDITORIAL BROWSER PASS — '+count+' routes x widths, themes, mobile, language, navigation, overflow');
