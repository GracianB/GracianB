#!/usr/bin/env node
// P12 · Behavioural browser audit for a constellation, not a slide deck.
import assert from "node:assert/strict";
import {mkdirSync} from "node:fs";
import {spawn} from "node:child_process";
import {chromium} from "playwright";
const HOST="127.0.0.1",PORT=4173,external=process.env.GB_E2E_URL;
const URL=external || "http://"+HOST+":"+PORT+"/";
const artifacts="artifacts/e2e";
mkdirSync(artifacts,{recursive:true});
const server=external?null:spawn("python3",["-m","http.server",String(PORT),"--bind",HOST],{stdio:["ignore","pipe","pipe"]});
async function waitServer(){
  for(let i=0;i<80;i++){
    try{if((await fetch(URL)).ok)return;}catch{}
    await new Promise(resolve=>setTimeout(resolve,250));
  }
  throw Error("Local static test server unavailable");
}
function monitor(page){
  const errors=[];
  page.on("pageerror",e=>errors.push("JS: "+e));
  page.on("console",m=>{if(m.type()==="error")errors.push("Console: "+m.text());});
  return errors;
}
async function inspect(browser,width,lang="es",theme="dark",motion="reduce"){
  const ctx=await browser.newContext({viewport:{width,height:width<=420?830:900},reducedMotion:motion});
  const page=await ctx.newPage(),errors=monitor(page);
  await page.goto(URL+(URL.includes("?")?"&":"?")+"lang="+lang+"&theme="+theme,{waitUntil:"load"});
  await page.locator("#main").waitFor();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(overflow<=1,"P12 horizontal overflow at "+width+"px: "+overflow);
  assert.equal(await page.locator("html").getAttribute("lang"),lang);
  assert.equal(await page.locator("html").getAttribute("data-theme"),theme);
  const heading=await page.locator("#hero-title").innerText();
  assert.match(heading,lang==="es"?/universo de ideas/i:/universe of ideas/i);
  const name=page.locator(".constellation-signature .hero-name");
  assert.ok(await name.isVisible(),"Small Gracián Baena signature must be visible");
  const fits=await name.evaluate(node=>node.getBoundingClientRect().right<=innerWidth+1);
  assert.ok(fits,"Small brand signature overflows "+width);
  assert.equal(await page.locator(".hero-orbit-signature").count(),0,"Recycled Professional Deck emblem returned");
  assert.equal(await page.locator(".world-portal").count(),3);
  assert.equal(await page.locator(".world-portal:visible").count(),3);
  assert.equal(await page.locator(".cosmic-node").count(),3);
  assert.equal(await page.locator("[data-world-overview],[data-world-prev],[data-world-next]").count(),0);
  assert.equal(await page.locator(".atlas-pin").count(),6);
  assert.equal(await page.locator(".atlas-pin[aria-pressed=true]").count(),1);
  await page.locator('.atlas-pin[data-atlas-city="bergamo"]').click();
  assert.equal(await page.locator('.atlas-pin[data-atlas-city="bergamo"]').getAttribute("aria-pressed"),"true");
  assert.match(await page.locator("[data-atlas-readout]").innerText(),/BÉRGAMO · (ITALIA|ITALY)/);
  await page.locator('.atlas-pin[data-atlas-city="varsovia"]').click();
  assert.match(await page.locator("[data-atlas-readout]").innerText(),lang==="es"?/VARSOVIA · POLONIA/:/WARSAW · POLAND/);
  assert.equal(await page.locator(".observatory-details").getAttribute("open"),null);
  assert.equal(await page.locator(".cv-library-details").getAttribute("open"),null);
  const sky=await page.locator("[data-constellation-sky]").evaluate(node=>({w:node.width,h:node.height,
    visible:getComputedStyle(node).display!=="none",
    ink:(()=>{const ctx=node.getContext("2d"),step=Math.max(2,Math.floor(node.width/20));
      let colored=0;for(let x=step;x<node.width;x+=step)for(let y=step;y<node.height;y+=step){
      colored+=Number(ctx.getImageData(x,y,1,1).data[3]>0);}return colored;})()
  }));
  assert.ok(sky.w>0 && sky.h>0,"The star canvas is not sized");
  if(theme==="light")assert.equal(sky.visible,false,"Light mode must not have a dark star overlay");
  if(theme==="dark")assert.equal(sky.visible,true,"Dark mode needs constellation stars");
  for(const world of ["professional","yoga","lab"]){
    const portal=page.locator('.world-portal[data-portal="'+world+'"]');
    const rect=await portal.boundingBox();
    assert.ok(rect.width>120,"Portal "+world+" has collapsed");
    assert.ok(rect.x>=-1 && rect.x+rect.width<=width+1,"Portal "+world+" clipped at "+width);
  }
  if(width>=1280 && theme==="dark"){
    const expected={professional:[199,205,208],yoga:[145,220,178],lab:[139,218,250]};
    for(const [world,color] of Object.entries(expected)){
      const portal=page.locator('.world-portal[data-portal="'+world+'"]');
      await portal.hover();await page.waitForTimeout(500);
      const actual=await portal.evaluate(n=>getComputedStyle(n).borderTopColor);
      const nums=actual.match(/[\d.]+/g).map(Number);
      assert.deepEqual(nums.slice(0,3),color,world+" lacks its unique hover color");
      assert.ok((nums[3]??1)>.74,world+" border must be readable");
    }
    await page.mouse.move(0,0);
    await page.screenshot({path:artifacts+"/constellation-desktop.png",fullPage:true});
    await page.locator(".observatory-details summary").click();
    assert.equal(await page.locator(".evidence-card:visible").count(),5);
    await page.locator(".cv-library-details summary").click();
    assert.equal(await page.locator(".document-group:visible").count(),3);
    assert.equal(await page.locator('.cv-library-details a[href$=".pdf"]').count(),12);
  }
  if(width===320 && theme==="dark"){
    await page.screenshot({path:artifacts+"/constellation-mobile-320.png",fullPage:true});
  }
  if(width>=1280 && theme==="dark"){
    await page.getByRole("button",{name:lang==="es"?"EN":"ES",exact:true}).first().click();
    assert.equal(await page.locator("html").getAttribute("lang"),lang==="es"?"en":"es");
  }
  if(width===390&&theme==="dark"&&lang==="es"){
    const toggle=page.locator("[data-menu-toggle]");
    await toggle.click();
    assert.equal(await page.locator("#mobile-menu").isVisible(),true);
    await page.locator('#mobile-menu a[href="#evidence"]').click();
    assert.equal(await page.locator("#mobile-menu").isVisible(),false);
    const cv=page.locator(".portal-after [data-application-link]");
    await cv.click();
    await page.waitForURL(/apply\.html/);
    assert.match(await page.title(),/Gracián/i);
  }
  assert.deepEqual(errors,[],"Runtime errors at "+width+"px, "+theme+", "+lang);
  await ctx.close();
  console.log("P12 BROWSER PASS "+width+"px / "+lang+" / "+theme+" / "+motion);
}
if(!external)await waitServer();
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
try{
  await inspect(browser,1440,"es","dark","no-preference");
  await inspect(browser,320,"es","dark","reduce");
  await inspect(browser,390,"es","dark","reduce");
  await inspect(browser,768,"en","dark","reduce");
  await inspect(browser,1440,"en","light","reduce");
  await inspect(browser,390,"en","light","reduce");
  console.log("P12 CONSTELLATION BROWSER E2E PASS");
}finally{await browser.close();server?.kill("SIGTERM");}
