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
})();
