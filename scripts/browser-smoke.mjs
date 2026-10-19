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
  assert.equal(await page.locator(".cosmic-node .world-orb-sigil").count(),3,"Each universe needs its own visible illustrated icon");
  for(const selector of [".cosmic-pro",".cosmic-yoga",".cosmic-lab"]){
    const icon = page.locator(selector+" .world-orb-sigil");
    assert.equal(await icon.isVisible(),true,"Universe identity must be visible: "+selector);
  }
  const bridge=await page.locator(".cosmic-bridge").evaluate(svg=>{
    const paths=[...svg.querySelectorAll(".bridge-route path")];
    return {width:svg.getBoundingClientRect().width,height:svg.getBoundingClientRect().height,
      count:paths.length,lengths:paths.map(p=>p.getTotalLength()),
      colors:paths.map(p=>getComputedStyle(p).stroke)};
  });
  assert.ok(bridge.width>190&&bridge.height>170,"Hero constellation must have space to read");
  assert.equal(bridge.count,3,"Three worlds need three distinct connections");
  assert.ok(bridge.lengths.every(n=>n>8),"Every universe route must be visually recognisable: "+JSON.stringify(bridge.lengths));
  assert.equal(new Set(bridge.colors).size,3,"World routes must be visibly differentiated by color");
  assert.equal(await page.locator(".cosmic-origin").count(),1,"Missing common GB origin");
  if(theme==="dark"){
    const heroCluster=await page.locator("[data-constellation-sky]").getAttribute("data-ambient-clusters");
    assert.equal(heroCluster,"subdued","Background lines should not cross the hero text");
    if(width>=1280){
      await page.screenshot({path:artifacts+"/actual-constellation-hero-dark.png",fullPage:false});
    }
  }
  const core=await page.locator(".cosmic-origin").boundingBox();
  assert.ok(core.width>=45,"Central GracianB origin must be legible");
  // Solar geometry: every physical planet center must sit on its colored SVG ring.
  const geometry=await page.locator(".cosmic-atlas").evaluate(atlas=>{
    const bounds=atlas.getBoundingClientRect();
    const center=atlas.querySelector(".cosmic-origin").getBoundingClientRect();
    const origin=[center.left+center.width/2,center.top+center.height/2];
    const worlds=[[".cosmic-pro",".gb-orbit--pro",.15],[".cosmic-lab",".gb-orbit--lab",.26],[".cosmic-yoga",".gb-orbit--yoga",.36]];
    return {width:bounds.width,worlds:worlds.map(([node,ring,scale])=>{
      const body=atlas.querySelector(node+" .cosmic-node-star").getBoundingClientRect();
      const circle=atlas.querySelector(ring);
      const cx=body.left+body.width/2,cy=body.top+body.height/2;
      return {node,actual:Math.hypot(cx-origin[0],cy-origin[1]),expected:bounds.width*scale,dx:cx-origin[0],dy:cy-origin[1],cssTransform:getComputedStyle(atlas.querySelector(node)).transform,anim:getComputedStyle(atlas.querySelector(node)).animationName,computedRadius:getComputedStyle(atlas.querySelector(node)).getPropertyValue("--orbit-radius"),
        svgRadius:Number(circle.getAttribute("r")),stroke:getComputedStyle(circle).stroke};
    })};
  });
  console.log("SOLAR_GEOMETRY",JSON.stringify(geometry));
  for(const world of geometry.worlds){
    assert.ok(Math.abs(world.actual-world.expected)<5,"Planet not on its own ring: "+JSON.stringify({width,world}));
    assert.ok(Math.abs(world.svgRadius/1000*geometry.width-world.expected)<1,"SVG track and orbit radius differ: "+JSON.stringify(world));
  }
  assert.equal(new Set(geometry.worlds.map(x=>x.stroke)).size,3,"The three orbital tracks must have different colors");
  if(width>=1280){
    const pro=page.locator(".cosmic-pro");
    await pro.focus();
    // Focus highlights the matching orbital ring, without scaling the planet.
    await page.waitForFunction(() => {
      const ring=document.querySelector(".gb-orbit--pro");
      return document.querySelector(".cosmic-pro")?.matches(":focus") &&
        parseFloat(getComputedStyle(ring).strokeWidth)>=2.2;
    },null,{timeout:2500});
    const stroke=await page.locator(".gb-orbit--pro").evaluate(n=>getComputedStyle(n).strokeWidth);
    assert.ok(parseFloat(stroke)>=2.2,"Focused Professional orbit must glow");
    await page.locator(".constellation-signature").click();
  }
  assert.equal(await page.locator("[data-world-overview],[data-world-prev],[data-world-next]").count(),0);
  assert.equal(await page.locator(".atlas-pin").count(),6);
  assert.equal(await page.locator(".atlas-pin[aria-pressed=true]").count(),1);
  await page.locator('.atlas-pin[data-atlas-city="bergamo"]').click();
  assert.equal(await page.locator('.atlas-pin[data-atlas-city="bergamo"]').getAttribute("aria-pressed"),"true");
  assert.match(await page.locator("[data-atlas-readout]").innerText(),/BÉRGAMO · (ITALIA|ITALY)/);
  const cityStory=page.locator("[data-atlas-story]");
  assert.ok((await cityStory.innerText()).trim().length>28,"City selection must provide a meaningful description");
  await page.locator('.atlas-pin[data-atlas-city="lisboa"]').click();
  assert.equal(await page.locator('.atlas-pin[data-atlas-city="lisboa"]').getAttribute("aria-pressed"),"true");
  assert.ok((await cityStory.innerText()).toLowerCase().includes("majorel"),"Lisbon should show its own professional chapter");
  await page.locator('.atlas-pin[data-atlas-city="bergamo"]').click();

  // Verify the decorative star formations become visible only beyond the hero.
  if(theme==="dark"){
    await page.waitForFunction(()=>document.querySelector("[data-constellation-sky]")?.dataset.ambientClusters==="visible",null,{timeout:3000});
    if(width>=1280){
      await page.waitForFunction(()=>{
        const section=document.querySelector(".about-atlas");
        return section && section.classList.contains("is-visible")
          && parseFloat(getComputedStyle(section).opacity)>.96;
      },null,{timeout:4000});
      await page.screenshot({path:artifacts+"/ambient-constellations-about.png",fullPage:false});
    }
  }
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
      await page.evaluate(()=>{
      document.documentElement.style.setProperty("scroll-behavior","auto","important");
      window.scrollTo({top:0,behavior:"instant"});
    });
    await page.waitForFunction(()=>window.scrollY<2,null,{timeout:4000}).catch(()=>{}); // Page can retain scroll during continuous constellation animation
      await page.screenshot({path:artifacts+"/constellation-light-desktop.png",fullPage:true});
    }
    if(width<=420){
      await page.evaluate(()=>{
      document.documentElement.style.setProperty("scroll-behavior","auto","important");
      window.scrollTo({top:0,behavior:"instant"});
    });
    await page.waitForFunction(()=>window.scrollY<2,null,{timeout:1800}).catch(()=>{});
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
    await page.evaluate(()=>{
      document.documentElement.style.setProperty("scroll-behavior","auto","important");
      window.scrollTo({top:0,behavior:"instant"});
    });
    await page.waitForFunction(()=>window.scrollY<2,null,{timeout:1800}).catch(()=>{});
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
    await page.evaluate(()=>{
      document.documentElement.style.setProperty("scroll-behavior","auto","important");
      window.scrollTo({top:0,behavior:"instant"});
    });
    await page.waitForFunction(()=>window.scrollY<2,null,{timeout:1800}).catch(()=>{});
    await page.waitForTimeout(350);
    await page.screenshot({path:artifacts+"/constellation-desktop-viewport.png",fullPage:false});
    await page.screenshot({path:artifacts+"/constellation-desktop.png",fullPage:true});
    await page.locator(".observatory-details summary").click();
    assert.equal(await page.locator(".evidence-card:visible").count(),5);
    await page.locator(".cv-library-details summary").click();
    assert.equal(await page.locator(".document-group:visible").count(),3);
    assert.equal(await page.locator('.cv-library-details a[href$=".pdf"]').count(),12);
  }

  // P12.4: the quick atlas must never move the background or deform the project grid.
  if(width>=1280 || width===320 || (width===390 && theme==="light")){
    if(width>=1280) {
      const disclosure=page.locator(".observatory-details");
      if(!(await disclosure.evaluate(n=>n.open)))await disclosure.locator("summary").click();
      const cards=await page.locator(".evidence-card").evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().width));
      assert.equal(cards.length,5);
      assert.ok(cards.every(n=>n>350),"Project cards are too narrow: "+JSON.stringify(cards));
    }
    const previousY=await page.evaluate(()=>scrollY);
    const previousWidth=await page.evaluate(()=>document.documentElement.clientWidth);
    await page.keyboard.press("Control+k");
    assert.equal(await page.locator("#command").getAttribute("aria-hidden"),"false");
    const pageLayout=await page.evaluate(()=>({
      bodyDisplay:getComputedStyle(document.body).display,
      bodyHeight:document.body.getBoundingClientRect().height,
      bodyWidth:document.body.getBoundingClientRect().width,
      lock:document.body.classList.contains("command-active"),
      buttonClassCollision:document.body.classList.contains("command-open")
    }));
    assert.equal(pageLayout.bodyDisplay,"block","Opening Ctrl+K must not turn the body into the flex-styled command button");
    assert.ok(pageLayout.bodyHeight>900,"Opening the palette must not collapse the document");
    assert.ok(pageLayout.bodyWidth>=width-22,"Opening the palette must not compress the page");
    assert.ok(pageLayout.lock&&!pageLayout.buttonClassCollision,"Palette state class must not collide with the trigger class");

    await page.locator("#command-input").waitFor({state:"visible"});
    assert.ok(await page.locator("#command-panel").count()===0 || await page.locator(".command-panel").isVisible());
    const jump=await page.evaluate(()=>Math.abs(scrollY));
    assert.ok(Math.abs(jump-previousY)<3,"Ctrl+K scrolled the page from "+previousY+" to "+jump);
    assert.equal(await page.evaluate(()=>document.documentElement.clientWidth),previousWidth,"Command open shifted the layout");
    const dialog=await page.locator(".command-panel").boundingBox();
    assert.ok(dialog.x>=0&&dialog.x+dialog.width<=width+1,"Command dialog clips the screen");
    assert.ok(dialog.height<=900,"Quick navigation is oversized");
    assert.equal(await page.locator("#command-list li:visible").count(),10);
    if(width>=1280&&theme==="dark")
      await page.screenshot({path:artifacts+"/quick-atlas-dark-desktop.png",fullPage:false});
    if(width===390&&theme==="light")
      await page.screenshot({path:artifacts+"/quick-atlas-light-mobile.png",fullPage:false});
    await page.locator('[data-command-filter="projects"]').click();
    assert.equal(await page.locator("#command-list li:visible").count(),4);
    await page.locator("#command-input").fill("Vortice");
    assert.equal(await page.locator("#command-list li:visible").count(),1,"Accent-insensitive search failed");
    await page.locator("#command-input").fill("nonsense-search-000");
    assert.equal(await page.locator("#command-list li:visible").count(),0);
    assert.ok(await page.locator("#command-empty").isVisible(),"Missing useful zero-results state");
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("#command").getAttribute("aria-hidden"),"true");
    assert.ok(Math.abs(await page.evaluate(()=>scrollY)-previousY)<3,"Closing Ctrl+K scrolled the page");
    await page.keyboard.press("Control+k");
    await page.locator('[data-command-filter="documents"]').click();
    await page.locator("#command-input").fill(lang==="es"?"Documentos":"Documents");
    assert.equal(await page.locator("#command-list li:visible").count(),1);
    await page.keyboard.press("Enter");
    assert.equal(await page.locator("#command").getAttribute("aria-hidden"),"true");
    assert.ok(await page.locator(".cv-library-details").evaluate(n=>n.open),"Document jump must reveal its contents");
    assert.equal(await page.locator(".document-group:visible").count(),3);
    if(width>=1280 && theme==="dark"){
      const cards=await page.locator(".evidence-card").evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().width));
      assert.ok(cards.every(n=>n>350),"Project cards collapsed after the palette: "+JSON.stringify(cards));
    }
  }
  if(width===320 && theme==="dark"){
    await page.evaluate(()=>{
      document.documentElement.style.setProperty("scroll-behavior","auto","important");
      window.scrollTo({top:0,behavior:"instant"});
    });
    await page.waitForFunction(()=>window.scrollY<2,null,{timeout:1800}).catch(()=>{});
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
