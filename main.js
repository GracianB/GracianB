(() => {
  "use strict";

  const I18N = window.GB_I18N || {};
  const LANG_KEY = "gb-hub-lang";
  const THEME_KEY = "gb-hub-theme";
  const root = document.documentElement;
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

  let lang = "es";
  let theme = "dark";
  let lastFocus = null;
  let skyController = null;
  const cityNames = {
    murcia:"Murcia", "gran-canaria":"Gran Canaria", madrid:"Madrid",
    lisboa:"Lisboa", bergamo:"Bérgamo", varsovia:lang==="en"?"Warsaw":"Varsovia"
  };


  const safeGet = (key) => {
    try { return localStorage.getItem(key); } catch { return null; }
  };
  const safeSet = (key, value) => {
    try { localStorage.setItem(key, value); } catch { /* storage is optional */ }
  };

  const params = new URLSearchParams(location.search);
  const storedLang = safeGet(LANG_KEY);
  const storedTheme = safeGet(THEME_KEY);
  if (storedLang === "es" || storedLang === "en") lang = storedLang;
  if (storedTheme === "dark" || storedTheme === "light") theme = storedTheme;
  if (params.get("lang") === "es" || params.get("lang") === "en") lang = params.get("lang");
  if (params.get("theme") === "dark" || params.get("theme") === "light") theme = params.get("theme");

  function dictionary() {
    return I18N[lang] || I18N.es || {};
  }

  function applyLanguage({ persist = false } = {}) {
    const t = dictionary();
    root.lang = t.htmlLang || lang;
    root.dataset.lang = lang;
    document.title = t.docTitle || document.title;

    const meta = document.querySelector('meta[name="description"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    const twDesc = document.querySelector('meta[name="twitter:description"]');

    if (meta && t.meta) meta.content = t.meta;
    if (ogTitle && t.ogTitle) ogTitle.content = t.ogTitle;
    if (ogDesc && t.ogDesc) ogDesc.content = t.ogDesc;
    if (twTitle && t.ogTitle) twTitle.content = t.ogTitle;
    if (twDesc && t.ogDesc) twDesc.content = t.ogDesc;
    if (ogLocale) ogLocale.content = lang === "en" ? "en_US" : "es_ES";

    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const value = t[node.dataset.i18n];
      if (value != null) node.textContent = value;
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
      const value = t[node.dataset.i18nPlaceholder];
      if (value != null) node.setAttribute("placeholder", value);
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
      const value = t[node.dataset.i18nAriaLabel];
      if (value != null) node.setAttribute("aria-label", value);
    });
    document.querySelectorAll("[data-command-label]").forEach((node) => {
      const value = t[node.dataset.commandLabel];
      if (value != null) node.textContent = value;
    });
    const openMenu = document.getElementById("mobile-menu")?.hidden === false;
    document.querySelector("[data-menu-toggle]")?.setAttribute("aria-label",
      openMenu ? (t.menuCloseLabel || "Close menu") : (t.menuOpenLabel || "Open menu"));
    document.querySelectorAll("[data-set-lang]").forEach((button) => {
      const active = button.dataset.setLang === lang;
      button.setAttribute("aria-pressed", String(active));
      button.classList.toggle("is-active", active);
    });

    document.querySelectorAll("[data-application-link]").forEach((link) => {
      link.href = lang === "en" ? "./apply.html?lang=en" : "./apply.html";
    });

    const cv = document.querySelector("[data-cv-link]");
    if (cv) {
      cv.href = lang === "en"
        ? "./Gracian_Baena_CV_2026_EN.pdf"
        : "./Gracian_Baena_CV_2026_ES.pdf";
    }

    const selectedAtlas = document.querySelector('.atlas-pin[aria-pressed="true"]');
    if (selectedAtlas) updateAtlasReadout(selectedAtlas);
    if (persist) {
      safeSet(LANG_KEY, lang);
      const url = new URL(location.href);
      url.searchParams.set("lang", lang);
      history.replaceState(null, "", url);
    }
  }

  function applyTheme({ persist = false } = {}) {
    root.dataset.theme = theme;
    skyController?.sync();
    const color = theme === "light" ? "#f7f5ef" : "#02070b";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", color);
    document.querySelectorAll("[data-application-link]").forEach((link) => {
      const parts = [];
      if (lang === "en") parts.push("lang=en");
      if (theme === "light") parts.push("theme=light");
      link.href = "./apply.html" + (parts.length ? "?" + parts.join("&") : "");
    });
    document.querySelector("[data-theme-toggle]")?.setAttribute(
      "aria-label",
      lang === "en"
        ? (theme === "dark" ? "Switch to light theme" : "Switch to dark theme")
        : (theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"),
    );

    if (persist) {
      safeSet(THEME_KEY, theme);
      const url = new URL(location.href);
      url.searchParams.set("theme", theme);
      history.replaceState(null, "", url);
    }
  }

  applyLanguage();
  applyTheme();

  document.addEventListener("click", (event) => {
    const langButton = event.target.closest("[data-set-lang]");
    if (langButton) {
      lang = langButton.dataset.setLang === "en" ? "en" : "es";
      applyLanguage({ persist: true });
      applyTheme();
      return;
    }
    const themeButton = event.target.closest("[data-theme-toggle]");
    if (themeButton) {
      theme = theme === "dark" ? "light" : "dark";
      applyTheme({ persist: true });
    }
  });

  const mobileMenu = document.getElementById("mobile-menu");
  const menuToggle = document.querySelector("[data-menu-toggle]");

  function setMenu(open) {
    if (!mobileMenu || !menuToggle) return;
    mobileMenu.hidden = !open;
    mobileMenu.classList.toggle("is-open", open);
    menuToggle.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    const t = dictionary();
    menuToggle.setAttribute("aria-label", open ? (t.menuCloseLabel || "Close menu") : (t.menuOpenLabel || "Open menu"));
    document.body.classList.toggle("menu-open", open);
    if (open) {
      requestAnimationFrame(() => {
        if (!mobileMenu.hidden && !mobileMenu.contains(document.activeElement)) {
          mobileMenu.querySelector("a")?.focus();
        }
      });
    } else if (mobileMenu.contains(document.activeElement)) {
      menuToggle.focus();
    }
  }

  menuToggle?.addEventListener("click", () => setMenu(mobileMenu?.hidden ?? true));
  mobileMenu?.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });
  mobileMenu?.addEventListener("keydown", (event) => {
    if (event.key !== "Tab" || mobileMenu.hidden) return;
    const focusables = [...mobileMenu.querySelectorAll('a[href], button:not([disabled])')]
      .filter((node) => node.getClientRects().length > 0);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });


  // P12.4 · Command atlas: never scroll the underlying document on selection.
  const command = document.getElementById("command");
  const commandPanel = command?.querySelector(".command-panel");
  const commandInput = document.getElementById("command-input");
  const commandList = document.getElementById("command-list");
  const commandCount = document.getElementById("command-count");
  const commandEmpty = document.getElementById("command-empty");
  const commandFilters = [...document.querySelectorAll("[data-command-filter]")];
  let commandCategory = "all", commandIndex = 0, commandTrigger = null;
  const commandItems = [...(commandList?.querySelectorAll("li") || [])];

  function normalizeCommand(value) {
    return value.toLocaleLowerCase(lang).normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  }
  function visibleCommands() {
    return commandItems.filter(item => !item.hidden);
  }
  function commandSelection({scroll=false}={}) {
    const items=visibleCommands();
    if(!items.length)commandIndex=-1;
    else commandIndex=Math.max(0,Math.min(commandIndex,items.length-1));
    commandItems.forEach(item=>{
      const link=item.querySelector("a");
      const active=items.indexOf(item)===commandIndex&&commandIndex>=0;
      item.classList.toggle("is-active",active);
      if(link) {
        if(active) link.setAttribute("aria-current","true");
        else link.removeAttribute("aria-current");
      }
    });
    const selected=items[commandIndex];
    if(selected && scroll && commandList) {
      // Only move the result list; scrollIntoView() also scrolls the page behind it.
      const above=selected.offsetTop-commandList.offsetTop;
      const bottom=above+selected.offsetHeight;
      if(above<commandList.scrollTop)commandList.scrollTop=above;
      else if(bottom>commandList.scrollTop+commandList.clientHeight)
        commandList.scrollTop=bottom-commandList.clientHeight;
    }
  }
  function updateCommandResults() {
    const query=normalizeCommand(commandInput?.value||"");
    commandItems.forEach(item=>{
      const haystack=normalizeCommand((item.textContent||"")+" "+(item.dataset.search||""));
      item.hidden=!(commandCategory==="all"||item.dataset.commandCategory===commandCategory)
        || !!(query&&!haystack.includes(query));
    });
    commandIndex=0;
    if(commandList)commandList.scrollTop=0;
    const count=visibleCommands().length;
    if(commandEmpty)commandEmpty.hidden=count!==0;
    if(commandCount)commandCount.textContent=lang==="en"?
      (count+" "+(count===1?"destination":"destinations")):
      (count+" "+(count===1?"destino":"destinos"));
    commandSelection();
  }
  function setCommandCategory(category) {
    commandCategory=category;
    commandFilters.forEach(button=>{
      const selected=button.dataset.commandFilter===category;
      button.classList.toggle("is-active",selected);
      button.setAttribute("aria-pressed",String(selected));
    });
    updateCommandResults();
  }
  function openCommand() {
    if(!command || !command.hidden)return;
    setMenu(false);
    commandTrigger=document.activeElement;
    command.hidden=false;
    command.setAttribute("aria-hidden","false");
    document.body.classList.add("command-open");
    if(commandInput)commandInput.value="";
    setCommandCategory("all");
    requestAnimationFrame(()=>{if(!command.hidden)commandInput?.focus({preventScroll:true});});
  }
  function closeCommand({restoreFocus=true}={}) {
    if(!command||command.hidden)return;
    command.hidden=true;
    command.setAttribute("aria-hidden","true");
    document.body.classList.remove("command-open");
    if(restoreFocus&&commandTrigger instanceof HTMLElement&&commandTrigger.isConnected)
      commandTrigger.focus({preventScroll:true});
  }
  function activateCommand() {
    const item=visibleCommands()[commandIndex];
    const link=item?.querySelector("a");
    if(link)link.click();
  }
  document.querySelectorAll("[data-command-open]").forEach(button=>button.addEventListener("click",openCommand));
  document.querySelectorAll("[data-command-close]").forEach(button=>
    button.addEventListener("click",()=>closeCommand()));
  commandInput?.addEventListener("input",updateCommandResults);
  commandFilters.forEach(button=>button.addEventListener("click",()=>{
    setCommandCategory(button.dataset.commandFilter);
    commandInput?.focus({preventScroll:true});
  }));
  commandList?.addEventListener("pointermove",event=>{
    const item=event.target.closest("li[data-command-category]");
    const index=visibleCommands().indexOf(item);
    if(index>=0&&commandIndex!==index){commandIndex=index;commandSelection();}
  },{passive:true});
  commandList?.addEventListener("click",event=>{
    const link=event.target.closest("a");
    if(!link)return;
    // Local sections are revealed before native fragment navigation.
    if(link.dataset.commandReveal==="documents"){
      const documents=document.querySelector(".cv-library-details");
      if(documents)documents.open=true;
    }
    closeCommand({restoreFocus:false});
  });
  document.addEventListener("keydown",event=>{
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="k"){
      event.preventDefault();
      command?.hidden===false?closeCommand():openCommand();
      return;
    }
    if(event.key==="Escape"){
      if(command?.hidden===false){event.preventDefault();closeCommand();}
      else setMenu(false);
      return;
    }
    if(!command||command.hidden)return;
    if(event.key==="ArrowDown"||event.key==="ArrowUp"){
      event.preventDefault();
      const count=visibleCommands().length;
      if(count){
        commandIndex=(commandIndex+(event.key==="ArrowDown"?1:-1)+count)%count;
        commandSelection({scroll:true});
      }
    }else if(event.key==="Enter"&&(document.activeElement===commandInput)){
      event.preventDefault();
      activateCommand();
    }else if(event.key==="Tab"){
      const focusables=[...commandPanel.querySelectorAll('button:not([disabled]),input:not([disabled]),a[href]')]
        .filter(node=>node.tabIndex>=0&&!node.closest("[hidden]")&&node.getClientRects().length);
      if(focusables.length){
        const first=focusables[0],last=focusables[focusables.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus({preventScroll:true});}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus({preventScroll:true});}
      }
    }
  });

  const topbar = document.querySelector("[data-topbar]");
  const progressFill = document.querySelector(".scroll-progress i");
  let ticking = false;

  function updateScroll() {
    const height = document.documentElement.scrollHeight - innerHeight;
    const progress = height > 0 ? Math.min(1, Math.max(0, scrollY / height)) : 0;
    if (progressFill) progressFill.style.transform = `scaleX(${progress.toFixed(4)})`;
    topbar?.classList.toggle("is-scrolled", scrollY > 12);
    ticking = false;
  }

  addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateScroll);
  }, { passive: true });
  updateScroll();

  if (!reduceMotion && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });

    document.querySelectorAll(
      ".evidence-card, .about-atlas, .world-portal, .document-group, .contact-panel",
    ).forEach((node) => {
      node.classList.add("reveal");
      observer.observe(node);
    });
  } else {
    document.querySelectorAll(".reveal").forEach((node) => node.classList.add("is-visible"));
  }


  function updateAtlasReadout(pin) {
    const label = pin.dataset.atlasCity;
    const name = label === "varsovia" && lang === "en" ? "Warsaw" : cityNames[label] || pin.getAttribute("aria-label");
    const country = lang === "en" ? pin.dataset.countryEn : pin.dataset.countryEs;
    const output = document.querySelector("[data-atlas-readout]");
    if (output) output.textContent = (name + " · " + country).toUpperCase();
  }
  document.querySelectorAll(".atlas-pin").forEach(pin => pin.addEventListener("click", () => {
    document.querySelectorAll(".atlas-pin").forEach(node => {
      node.setAttribute("aria-pressed", String(node === pin));
      node.classList.toggle("is-current", node === pin);
    });
    updateAtlasReadout(pin);
  }));

  function constellationSky() {
    const canvas = document.querySelector("[data-constellation-sky]");
    const ctx = canvas?.getContext?.("2d", {alpha:true});
    if (!ctx) return { sync() {} };
    let stars = [], raf = 0, last = 0, running = false, mx = 0, my = 0;
    const seedRand = (() => {
      let n = 18429;
      return () => ((n = (1664525 * n + 1013904223) >>> 0) / 4294967296);
    })();
    function reset() {
      const width = innerWidth, height = innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      const count = Math.min(155, Math.max(46, Math.floor(width * height / 8400)));
      stars = Array.from({length:count}, () => ({
        x:seedRand() * width, y:seedRand() * height,
        r:.35 + seedRand() * 1.35, a:.18 + seedRand()*.48,
        phase:seedRand() * 6.283, twinkle:.25 + seedRand()*.55,
        type:seedRand()
      }));
      paint(0);
    }
    function paint(time) {
      const width=innerWidth,height=innerHeight;
      ctx.clearRect(0,0,width,height);

      // Three atmospheric formations; the hero has its own navigable star map.
      const clusters = [
        {color:[196,209,219],points:[[.04,.10],[.12,.04],[.23,.13],[.20,.28],[.07,.31],[.145,.18]],
          links:[[0,1],[1,2],[2,5],[5,3],[3,4],[4,0],[1,5]]},
        {color:[135,213,173],points:[[.77,.11],[.87,.16],[.96,.26],[.90,.42],[.77,.36],[.84,.27]],
          links:[[0,1],[1,2],[2,3],[3,4],[4,0],[1,5],[5,4]]},
        {color:[125,209,241],points:[[.70,.72],[.78,.61],[.91,.65],[.95,.81],[.81,.91],[.74,.82]],
          links:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[1,5]]}
      ];
      // Fade ambient geometry in after the hero to preserve headline legibility.
      const scrollTop=Math.max(0,scrollY || 0);
      const fadeStart=height*.52,fadeEnd=height*1.18;
      const reveal=Math.max(0,Math.min(1,(scrollTop-fadeStart)/(fadeEnd-fadeStart)));
      canvas.dataset.ambientClusters=reveal>.25?"visible":"subdued";
      const movement = reduceMotion ? 0 : Math.sin(time * .00022) * .05;
      ctx.save();
      ctx.globalAlpha=reveal*(width<600?.45:.68);
      if(reveal>.01) for(const c of clusters){
        const [red,green,blue] = c.color;
        const w=Math.max(280,width), h=Math.max(250,height);
        const pts=c.points.map(([x,y])=>[x*w, y*h]);
        ctx.strokeStyle="rgba("+red+","+green+","+blue+","+((width<600?.20:.28)+movement).toFixed(3)+")";
        ctx.lineWidth=1;
        for(const [start,end] of c.links){
          ctx.beginPath();ctx.moveTo(...pts[start]);ctx.lineTo(...pts[end]);ctx.stroke();
        }
        pts.forEach(([x,y],i)=>{
          if(i===5){
            ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);
            ctx.strokeStyle="rgba("+red+","+green+","+blue+",0.23)";
            ctx.stroke();
          }
          ctx.beginPath();ctx.arc(x,y,i===5?2.7:1.9,0,Math.PI*2);
          ctx.fillStyle="rgba("+red+","+green+","+blue+","+(i===5?.95:.77)+")";
          ctx.fill();
        });
      }
      ctx.restore();
      for (const star of stars) {
        const x=star.x+mx*star.r*.009, y=star.y+my*star.r*.009;
        const opacity=star.a * (reduceMotion ? 1 : (.86+.14*Math.sin(time*.00045*star.twinkle+star.phase)));
        ctx.beginPath();ctx.arc(x,y,star.r,0,Math.PI*2);
        const tint=star.type>.92?"150,214,211":star.type>.84?"146,185,229":"217,227,235";
        ctx.fillStyle="rgba("+tint+","+opacity.toFixed(3)+")";
        ctx.fill();
      }
    }
    function frame(time) {
      if (!running) return;
      if(time-last>=42){last=time;paint(time);}
      raf=requestAnimationFrame(frame);
    }
    function sync() {
      const should=theme==="dark" && !reduceMotion && document.visibilityState==="visible";
      if(should && !running){running=true;raf=requestAnimationFrame(frame);}
      if(!should && running){running=false;cancelAnimationFrame(raf);paint(0);}
    }
    addEventListener("resize",reset,{passive:true});
    // Static redraw on scroll when reduced motion disables animation.
    addEventListener("scroll",()=>{if(!running && theme==="dark")paint(0);},{passive:true});
    addEventListener("pointermove",e=>{mx=e.clientX-innerWidth/2;my=e.clientY-innerHeight/2;},{passive:true});
    document.addEventListener("visibilitychange",sync);
    reset();sync();
    return {sync};
  }
  skyController = constellationSky();

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
