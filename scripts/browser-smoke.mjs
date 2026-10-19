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
  const bridge=await page.locator(".cosmic-bridge").evaluate(svg=>{
    const paths=[...svg.querySelectorAll(".bridge-route path")];
    return {width:svg.getBoundingClientRect().width,height:svg.getBoundingClientRect().height,
      count:paths.length,lengths:paths.map(p=>p.getTotalLength()),
      colors:paths.map(p=>getComputedStyle(p).stroke)};
  });
  assert.ok(bridge.width>190&&bridge.height>170,"Hero constellation must have space to read");
  assert.equal(bridge.count,3,"Three worlds need three distinct connections");
  assert.ok(bridge.lengths.every(n=>n>170),"Every universe route must be visually recognisable: "+JSON.stringify(bridge.lengths));
  assert.equal(new Set(bridge.colors).size,3,"World routes must be visibly differentiated by color");
  assert.equal(await page.locator(".cosmic-origin").count(),1,"Missing common GB origin");
  const core=await page.locator(".cosmic-origin").boundingBox();
  assert.ok(core.width>=45,"Central GracianB origin must be legible");
  if(width>=1280){
    const pro=page.locator(".cosmic-pro");
    await pro.focus();
    const stroke=await page.locator(".bridge-route-pro").evaluate(n=>getComputedStyle(n).strokeWidth);
    assert.ok(parseFloat(stroke)>=3.8,"Keyboard focus must illuminate the Professional constellation route");
    await page.locator(".constellation-signature").click();
  }
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
  // P12.1: inspect the actual CSS resolved by Chromium, not only author tokens.
  const lightAudit = await page.evaluate(()=>{
    const el=s=>document.querySelector(s),style=s=>getComputedStyle(el(s));
    const t=el(".theme-toggle").getBoundingClientRect(),
      sun=el(".theme-sun").getBoundingClientRect(),moon=el(".theme-moon").getBoundingClientRect();
    const center=r=>r.left+r.width/2;
    const summaries=[".observatory-details>summary",".cv-library-details>summary"].map(q=>({
      bg:style(q).backgroundImage,color:style(q).color,border:style(q).borderTopColor
    }));
    const worlds=["professional","yoga","lab"].map(w=>style(".world-portal.world-"+w).getPropertyValue("--portal-color").trim());
    return {themeToggle:{width:t.width,height:t.height,sunOffset:Math.abs(center(sun)-(t.left+t.width*.25)),moonOffset:Math.abs(center(moon)-(t.left+t.width*.75))},
      lightBg:style("html").getPropertyValue("--bg").trim(),
      header:style(".topbar").backgroundColor,worlds,
      atlas:style(".city-atlas").backgroundImage,atlasGrid:style(".city-atlas-chart").backgroundImage,
      atlasPin:style(".atlas-pin").color,summaries,
      extraAtlasNote:document.querySelectorAll("[data-i18n=atlasNote]").length};
  });
  assert.equal(lightAudit.extraAtlasNote,0,"Atlas copy should not pollute the map");
  assert.ok(lightAudit.themeToggle.sunOffset<=3.5 && lightAudit.themeToggle.moonOffset<=3.5,
    "Theme toggle vector icons must be geometrically centered: "+JSON.stringify(lightAudit.themeToggle));
  assert.ok(lightAudit.themeToggle.height>=44,"Theme control must be touch accessible");
  if(theme==="light"){
    assert.equal(lightAudit.lightBg,"#eff4f5","Light mode must use mineral silver, not beige CV paper");
    assert.deepEqual(lightAudit.worlds,["#526c7a","#26744f","#166f9d"],"Three worlds need distinct accessible light accents");
    assert.match(lightAudit.atlas,/linear-gradient/,"Light atlas must have a designed panel");
    assert.match(lightAudit.atlasGrid,/linear-gradient/,"Light map must have a legible grid");
    for(const summary of lightAudit.summaries){
      assert.match(summary.bg,/linear-gradient/,"Light disclosure cannot revert to flat grey");
      assert.equal(summary.color,"rgb(27, 57, 70)","Light disclosure text needs deliberate contrast");
    }
    if(width>=1280){
      await page.evaluate(()=>{document.documentElement.style.scrollBehavior="auto";window.scrollTo(0,0);});
      await page.screenshot({path:artifacts+"/constellation-light-desktop.png",fullPage:true});
    }
    if(width<=420){
      await page.evaluate(()=>{document.documentElement.style.scrollBehavior="auto";window.scrollTo(0,0);});
      await page.screenshot({path:artifacts+"/constellation-light-mobile-"+width+".png",fullPage:true});
    }
  }

  for(const world of ["professional","yoga","lab"]){
    const portal=page.locator('.world-portal[data-portal="'+world+'"]');
    const rect=await portal.boundingBox();
    assert.ok(rect.width>120,"Portal "+world+" has collapsed");
    assert.ok(rect.x>=-1 && rect.x+rect.width<=width+1,"Portal "+world+" clipped at "+width);
  }
  if(width>=1280 && theme==="dark"){
    await page.evaluate(()=>{document.documentElement.style.scrollBehavior="auto";window.scrollTo(0,0);});
    await page.screenshot({path:artifacts+"/visible-constellation-hero.png",fullPage:false});
    const expected={professional:[199,205,208],yoga:[145,220,178],lab:[139,218,250]};
    for(const [world,color] of Object.entries(expected)){
      const portal=page.locator('.world-portal[data-portal="'+world+'"]');
      await portal.scrollIntoViewIfNeeded();
      await page.waitForTimeout(850); // reveal transition and smooth scroll settle first
      await portal.hover();
      await page.waitForTimeout(400);
      if(!(await portal.evaluate(n=>n.matches(":hover"))))await portal.hover();
      const state=await portal.evaluate(n=>({
        color:getComputedStyle(n).borderTopColor,
        hovered:n.matches(":hover"),
        pointerFine:matchMedia("(hover:hover) and (pointer:fine)").matches,
        accent:getComputedStyle(n).getPropertyValue("--portal-color")
      }));
      console.log("P12 HOVER",world,JSON.stringify(state));
      const nums=state.color.match(/[\d.]+/g).map(Number);
      assert.deepEqual(nums.slice(0,3),color,world+" lacks its unique hover color");
      assert.ok(state.hovered,world+" hover never stabilizes after scroll");
      assert.ok((nums[3]??1)>.74,world+" border is too faint: "+JSON.stringify(state));
    }
    await page.mouse.move(0,0);
    await page.evaluate(()=>{document.documentElement.style.scrollBehavior="auto";window.scrollTo(0,0);});
    await page.waitForTimeout(350);
    await page.screenshot({path:artifacts+"/constellation-desktop-viewport.png",fullPage:false});
    await page.screenshot({path:artifacts+"/constellation-desktop.png",fullPage:true});
    await page.locator(".observatory-details summary").click();
    assert.equal(await page.locator(".evidence-card:visible").count(),5);
    await page.locator(".cv-library-details summary").click();
    assert.equal(await page.locator(".document-group:visible").count(),3);
    assert.equal(await page.locator('.cv-library-details a[href$=".pdf"]').count(),12);
  }
  if(width===320 && theme==="dark"){
    await page.evaluate(()=>{document.documentElement.style.scrollBehavior="auto";window.scrollTo(0,0);});
    await page.waitForTimeout(350);
    await page.screenshot({path:artifacts+"/constellation-mobile-320-viewport.png",fullPage:false});
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
  // The real toggle must switch both ways, not merely look centered.
  if(width>=1280){
    await page.locator("[data-theme-toggle]").click();
    assert.equal(await page.locator("html").getAttribute("data-theme"),theme==="light"?"dark":"light");
    await page.locator("[data-theme-toggle]").click();
    assert.equal(await page.locator("html").getAttribute("data-theme"),theme);
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
