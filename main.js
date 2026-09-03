(() => {
  "use strict";
  const I18N = window.GB_I18N || {};
  const LANG_KEY = "gb-hub-lang";
  const THEME_KEY = "gb-hub-theme";
  let lang = "es";
  let theme = "dark";

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  function path(obj, key) {
    return obj && obj[key] != null ? obj[key] : null;
  }

  function applyI18n() {
    const t = I18N[lang] || I18N.es || {};
    document.documentElement.lang = t.htmlLang || lang;
    document.title = t.docTitle || document.title;

    const meta = document.querySelector('meta[name="description"]');
    if (meta && t.meta) meta.setAttribute("content", t.meta);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (ogTitle && t.ogTitle) ogTitle.setAttribute("content", t.ogTitle);
    if (ogDesc && t.ogDesc) ogDesc.setAttribute("content", t.ogDesc);
    if (twTitle && t.ogTitle) twTitle.setAttribute("content", t.ogTitle);
    if (twDesc && t.ogDesc) twDesc.setAttribute("content", t.ogDesc);

    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute("content", lang === "en" ? "en_US" : "es_ES");

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const v = path(t, el.dataset.i18n);
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.dataset.i18nHtml;
      const v = path(t, key);
      if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const v = path(t, el.dataset.i18nPlaceholder);
      if (v != null) el.setAttribute("placeholder", v);
    });
    document.querySelectorAll("[data-cmd]").forEach((el) => {
      const v = path(t, el.dataset.cmd);
      if (v != null) el.textContent = v;
    });

    document.querySelectorAll("[data-set-lang]").forEach((btn) => {
      const on = btn.getAttribute("data-set-lang") === lang;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", String(on));
    });
  }

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#f3f0e7" : "#06070a");
    document.querySelectorAll("[data-set-theme]").forEach((btn) => {
      const on = btn.getAttribute("data-set-theme") === theme;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", String(on));
    });
  }

  function setLang(next, persist = true) {
    lang = next === "en" ? "en" : "es";
    document.documentElement.setAttribute("data-lang", lang);
    if (persist) {
      try { localStorage.setItem(LANG_KEY, lang); } catch (_) {}
      const url = new URL(location.href);
      url.searchParams.set("lang", lang);
      history.replaceState(null, "", url);
    }
    applyI18n();
  }

  function setTheme(next, persist = true) {
    theme = next === "light" ? "light" : "dark";
    if (persist) {
      try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
      const url = new URL(location.href);
      url.searchParams.set("theme", theme);
      history.replaceState(null, "", url);
    }
    applyTheme();
  }

  try {
    const s = localStorage.getItem(LANG_KEY);
    if (s === "en" || s === "es") lang = s;
  } catch (_) {}
  try {
    const s = localStorage.getItem(THEME_KEY);
    if (s === "light" || s === "dark") theme = s;
  } catch (_) {}

  const params = new URLSearchParams(location.search);
  if (params.get("lang") === "en" || params.get("lang") === "es") lang = params.get("lang");
  if (params.get("theme") === "light" || params.get("theme") === "dark") theme = params.get("theme");

  setLang(lang, false);
  setTheme(theme, false);

  document.addEventListener("click", (e) => {
    const l = e.target.closest("[data-set-lang]");
    if (l) { e.preventDefault(); setLang(l.getAttribute("data-set-lang")); return; }
    const th = e.target.closest("[data-set-theme]");
    if (th) { e.preventDefault(); setTheme(th.getAttribute("data-set-theme")); }
  });

  /* —— mobile drawer —— */
  const drawer = document.getElementById("drawer");
  const menuBtn = document.querySelector("[data-menu-toggle]");
  function setMenu(open) {
    if (!drawer || !menuBtn) return;
    drawer.hidden = !open;
    drawer.classList.toggle("is-open", open);
    menuBtn.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-on", open);
    if (open) {
      const first = drawer.querySelector("a");
      requestAnimationFrame(() => first?.focus());
    } else {
      menuBtn.focus();
    }
  }
  menuBtn?.addEventListener("click", () => setMenu(drawer.hidden));
  drawer?.addEventListener("click", (e) => {
    if (e.target.closest("a")) setMenu(false);
  });

  /* —— command palette —— */
  const cmd = document.getElementById("cmd");
  const cmdInput = document.getElementById("cmd-input");
  const cmdList = document.getElementById("cmd-list");
  let cmdIndex = 0;
  let lastFocus = null;

  function visibleCmds() {
    return [...(cmdList?.querySelectorAll("li") || [])].filter((li) => !li.hidden);
  }
  function paintCmd() {
    const items = visibleCmds();
    items.forEach((li, i) => li.classList.toggle("is-active", i === cmdIndex));
    items[cmdIndex]?.scrollIntoView({ block: "nearest" });
  }
  function filterCmd(q) {
    const needle = q.trim().toLowerCase();
    cmdList?.querySelectorAll("li").forEach((li) => {
      const text = (li.textContent || "").toLowerCase();
      li.hidden = needle ? !text.includes(needle) : false;
    });
    cmdIndex = 0;
    paintCmd();
  }
  function openCmd() {
    if (!cmd) return;
    setMenu(false);
    lastFocus = document.activeElement;
    cmd.hidden = false;
    cmdIndex = 0;
    if (cmdInput) cmdInput.value = "";
    filterCmd("");
    paintCmd();
    requestAnimationFrame(() => cmdInput?.focus());
  }
  function closeCmd() {
    if (!cmd || cmd.hidden) return;
    cmd.hidden = true;
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }
  function goCmd() {
    const items = visibleCmds();
    const a = items[cmdIndex]?.querySelector("a");
    if (!a) return;
    closeCmd();
    const href = a.getAttribute("href");
    if (href?.startsWith("#")) location.hash = href;
    else window.open(href, a.host === location.host ? "_self" : "_blank", "noopener");
  }

  document.querySelectorAll("[data-cmd-open]").forEach((el) => {
    el.addEventListener("click", openCmd);
  });
  document.querySelector("[data-cmd-close]")?.addEventListener("click", closeCmd);
  cmdInput?.addEventListener("input", () => filterCmd(cmdInput.value));

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      cmd?.hidden ? openCmd() : closeCmd();
      return;
    }
    if (e.key === "Escape") {
      closeCmd();
      setMenu(false);
      return;
    }
    if (cmd && !cmd.hidden) {
      const n = visibleCmds().length;
      if (e.key === "ArrowDown") { e.preventDefault(); cmdIndex = (cmdIndex + 1) % Math.max(n, 1); paintCmd(); }
      if (e.key === "ArrowUp") { e.preventDefault(); cmdIndex = (cmdIndex - 1 + n) % Math.max(n, 1); paintCmd(); }
      if (e.key === "Enter") { e.preventDefault(); goCmd(); }
    }
  });
  cmdList?.addEventListener("pointerdown", (e) => {
    const li = e.target.closest("li");
    if (!li || li.hidden) return;
    cmdIndex = visibleCmds().indexOf(li);
    paintCmd();
  });

  /* —— reveal —— */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".mode, .stat, .cv-lane, .contact-panel, .name-panel").forEach((el) => {
      el.classList.add("reveal");
      io.observe(el);
    });
  }

  /* —— pointer orbs —— */
  if (!reduce) {
    const fx = document.querySelector(".fx");
    window.addEventListener("pointermove", (e) => {
      if (!fx) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 24;
      const y = (e.clientY / window.innerHeight - 0.5) * 16;
      fx.style.setProperty("--mx", x.toFixed(1) + "px");
      fx.style.setProperty("--my", y.toFixed(1) + "px");
    }, { passive: true });
  }
})();
