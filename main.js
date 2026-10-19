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

    // Preserve the visitor’s chosen language when handing off to the application desk.
    // Keep the Spanish/default URL unchanged for progressive HTML navigation.
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
    // The application desk uses the same theme, even without localStorage.
    // Keep default-dark URLs as they were for existing shared links.
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
        // Don't steal focus from a fast keyboard action between opening and paint.
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
  // The open mobile sheet blocks page scrolling; keep keyboard focus inside it.
  // Escape closes it through the existing global handler and restores the menu button.
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

  // The three worlds are now ordinary, always-visible links.
  // No carousel state, hidden slides, swipe handlers or preference required.

  const command = document.getElementById("command");
  const commandInput = document.getElementById("command-input");
  const commandList = document.getElementById("command-list");
  let commandIndex = 0;

  function visibleCommands() {
    return [...(commandList?.querySelectorAll("li") || [])].filter((item) => !item.hidden);
  }

  function paintCommand() {
    const items = visibleCommands();
    if (commandIndex >= items.length) commandIndex = Math.max(0, items.length - 1);
    items.forEach((item, index) => {
      item.classList.toggle("is-active", index === commandIndex);
    });
    items[commandIndex]?.scrollIntoView({ block: "nearest" });
  }

  function filterCommand(query) {
    const needle = query.trim().toLocaleLowerCase(lang);
    commandList?.querySelectorAll("li").forEach((item) => {
      const text = (item.textContent || "").toLocaleLowerCase(lang);
      item.hidden = needle ? !text.includes(needle) : false;
    });
    commandIndex = 0;
    paintCommand();
  }

  function openCommand() {
    if (!command) return;
    setMenu(false);
    lastFocus = document.activeElement;
    command.hidden = false;
    command.setAttribute("aria-hidden", "false");
    document.body.classList.add("command-open");
    if (commandInput) commandInput.value = "";
    filterCommand("");
    requestAnimationFrame(() => commandInput?.focus());
  }

  function closeCommand() {
    if (!command || command.hidden) return;
    command.hidden = true;
    command.setAttribute("aria-hidden", "true");
    document.body.classList.remove("command-open");
    if (lastFocus instanceof HTMLElement) lastFocus.focus();
  }

  function activateCommand() {
    const link = visibleCommands()[commandIndex]?.querySelector("a");
    if (!link) return;
    closeCommand();
    link.click();
  }

  document.querySelectorAll("[data-command-open]").forEach((button) => {
    button.addEventListener("click", openCommand);
  });
  document.querySelectorAll("[data-command-close]").forEach((button) => {
    button.addEventListener("click", closeCommand);
  });
  commandInput?.addEventListener("input", () => filterCommand(commandInput.value));

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      command?.hidden === false ? closeCommand() : openCommand();
      return;
    }

    if (event.key === "Escape") {
      closeCommand();
      setMenu(false);
      return;
    }

    if (!command || command.hidden) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const count = visibleCommands().length;
      commandIndex = count ? (commandIndex + 1) % count : 0;
      paintCommand();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const count = visibleCommands().length;
      commandIndex = count ? (commandIndex - 1 + count) % count : 0;
      paintCommand();
    } else if (event.key === "Enter") {
      event.preventDefault();
      activateCommand();
    } else if (event.key === "Tab") {
      const focusables = [...command.querySelectorAll(
        'button, input, a[href], [tabindex]:not([tabindex="-1"])',
      )].filter((node) => node.tabIndex >= 0 && !node.hasAttribute("disabled") && node.offsetParent !== null);

      if (focusables.length) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
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


  // P12 · Six authentic locations from the Professional Deck atlas; no claimed travel route.
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

  // P12 · Tiny deterministic star canvas, no library, no particles linked by lines.
  // Suspends animation when hidden, in light mode or when reduced motion is requested.
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
    addEventListener("pointermove",e=>{mx=e.clientX-innerWidth/2;my=e.clientY-innerHeight/2;},{passive:true});
    document.addEventListener("visibilitychange",sync);
    reset();sync();
    return {sync};
  }
  skyController = constellationSky();

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
