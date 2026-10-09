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
    document.querySelectorAll("[data-set-lang]").forEach((button) => {
      const active = button.dataset.setLang === lang;
      button.setAttribute("aria-pressed", String(active));
      button.classList.toggle("is-active", active);
    });

    const cv = document.querySelector("[data-cv-link]");
    if (cv) {
      cv.href = lang === "en"
        ? "./Gracian_Baena_CV_2026_EN.pdf"
        : "./Gracian_Baena_CV_2026_ES.pdf";
    }

    if (persist) {
      safeSet(LANG_KEY, lang);
      const url = new URL(location.href);
      url.searchParams.set("lang", lang);
      history.replaceState(null, "", url);
    }
  }

  function applyTheme({ persist = false } = {}) {
    root.dataset.theme = theme;
    const color = theme === "light" ? "#f7f5ef" : "#14140f";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", color);
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
    document.body.classList.toggle("menu-open", open);
    if (open) {
      requestAnimationFrame(() => mobileMenu.querySelector("a")?.focus());
    } else if (mobileMenu.contains(document.activeElement)) {
      menuToggle.focus();
    }
  }

  menuToggle?.addEventListener("click", () => setMenu(mobileMenu?.hidden ?? true));
  mobileMenu?.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });

  const worldCarousel = document.querySelector("[data-world-carousel]");
  const worldSlides = [...document.querySelectorAll("[data-world-slide]")];
  const worldDots = [...document.querySelectorAll("[data-world-dot]")];
  const worldCounter = document.querySelector("[data-world-counter]");
  const worldPrev = document.querySelector("[data-world-prev]");
  const worldNext = document.querySelector("[data-world-next]");
  let worldIndex = 0;
  let swipeStartX = null;

  function setWorld(nextIndex, { focus = false } = {}) {
    if (!worldSlides.length) return;
    worldIndex = (nextIndex + worldSlides.length) % worldSlides.length;

    worldSlides.forEach((slide, index) => {
      const active = index === worldIndex;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
      const link = slide.querySelector("a");
      if (link) link.tabIndex = active ? 0 : -1;
    });

    worldDots.forEach((dot, index) => {
      const active = index === worldIndex;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-selected", String(active));
      dot.tabIndex = active ? 0 : -1;
    });

    if (worldCounter) {
      worldCounter.textContent = `0${worldIndex + 1} / 0${worldSlides.length}`;
    }

    if (focus) worldDots[worldIndex]?.focus();
  }

  worldPrev?.addEventListener("click", () => setWorld(worldIndex - 1));
  worldNext?.addEventListener("click", () => setWorld(worldIndex + 1));
  worldDots.forEach((dot, index) => {
    dot.addEventListener("click", () => setWorld(index, { focus: true }));
  });

  worldCarousel?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setWorld(worldIndex - 1, { focus: true });
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setWorld(worldIndex + 1, { focus: true });
    } else if (event.key === "Home") {
      event.preventDefault();
      setWorld(0, { focus: true });
    } else if (event.key === "End") {
      event.preventDefault();
      setWorld(worldSlides.length - 1, { focus: true });
    }
  });

  worldCarousel?.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch") return;
    swipeStartX = event.clientX;
  }, { passive: true });

  worldCarousel?.addEventListener("pointerup", (event) => {
    if (event.pointerType !== "touch" || swipeStartX == null) return;
    const delta = event.clientX - swipeStartX;
    swipeStartX = null;
    if (Math.abs(delta) < 44) return;
    setWorld(delta < 0 ? worldIndex + 1 : worldIndex - 1);
  }, { passive: true });

  setWorld(0);

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
      )].filter((node) => !node.hasAttribute("disabled") && node.offsetParent !== null);

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
  let ticking = false;

  function updateScroll() {
    const height = document.documentElement.scrollHeight - innerHeight;
    const progress = height > 0 ? Math.min(1, Math.max(0, scrollY / height)) : 0;
    root.style.setProperty("--scroll-progress", `${(progress * 100).toFixed(2)}%`);
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
      ".evidence-card, .method-flow li, .arc-grid article, .door, .document-group, .contact-panel, .world-selector",
    ).forEach((node) => {
      node.classList.add("reveal");
      observer.observe(node);
    });
  } else {
    document.querySelectorAll(".reveal").forEach((node) => node.classList.add("is-visible"));
  }

  if (!reduceMotion && window.matchMedia?.("(hover:hover) and (pointer:fine)").matches) {
    addEventListener("pointermove", (event) => {
      root.style.setProperty("--pointer-x", `${event.clientX}px`);
      root.style.setProperty("--pointer-y", `${event.clientY}px`);
    }, { passive: true });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
