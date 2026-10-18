/* B6 application selector. Progressive HTML links remain usable without JS.
   Only URL parameters are read; no tracking, third-party API or storage. */
(() => {
  "use strict";
  const choices = ["professional", "yoga", "aviation"];
  const languages = ["es", "en"];
  const focuses = ["customer-success", "revops", "data-automation"];
  // One-minute briefs are summaries of existing public evidence, never alternate CVs.
  const documents = {
    professional: {
      es: ["./Gracian_Baena_CV_2026_ES.pdf","./Gracian_Baena_Carta_Presentacion_ES.pdf"],
      en: ["./Gracian_Baena_CV_2026_EN.pdf","./Gracian_Baena_Cover_Letter_EN.pdf"],
    },
    yoga: {
      es: ["./Gracian_Baena_CV_Yoga_ES.pdf","./Gracian_Baena_Carta_Yoga_ES.pdf"],
      en: ["./Gracian_Baena_CV_Yoga_EN.pdf","./Gracian_Baena_Cover_Letter_Yoga_EN.pdf"],
    },
    aviation: {
      es: ["./Gracian_Baena_CV_TCP_ES.pdf","./Gracian_Baena_Carta_TCP_ES.pdf"],
      en: ["./Gracian_Baena_CV_TCP_EN.pdf","./Gracian_Baena_Cover_Letter_TCP_EN.pdf"],
    },
  };
  const evidence = {
    professional: {
      "customer-success": "https://gracianb.github.io/professional-deck/proyecto-bodytone.html",
      revops: "https://gracianb.github.io/professional-deck/",
      "data-automation": "https://gracianb.github.io/systems-lab/",
    },
    yoga: "https://gracianb.github.io/yoga-instructor/",
    aviation: "https://gracianb.github.io/cabin-crew-site/",
  };
  const THEME_KEY = "gb-hub-theme";
  const LANG_KEY = "gb-hub-lang";
  const safeGetLang = () => {
    try { return localStorage.getItem(LANG_KEY); } catch { return null; }
  };
  const safeSaveLang = (value) => {
    try { localStorage.setItem(LANG_KEY, value); } catch { /* storage optional */ }
  };
  const safeGetTheme = () => {
    try { return localStorage.getItem(THEME_KEY); } catch { return null; }
  };
  const safeSaveTheme = (value) => {
    try { localStorage.setItem(THEME_KEY, value); } catch { /* storage optional */ }
  };
  const validTheme = (value) => value === "dark" || value === "light";
  const params = new URLSearchParams(location.search);
  let theme = validTheme(params.get("theme")) ? params.get("theme")
    : (validTheme(safeGetTheme()) ? safeGetTheme() : "dark");
  let track = choices.includes(params.get("track")) ? params.get("track") : "professional";
  let lang = languages.includes(params.get("lang")) ? params.get("lang")
    : (languages.includes(safeGetLang()) ? safeGetLang() : "es");
  let focus = focuses.includes(params.get("focus")) ? params.get("focus") : "customer-success";

  function applyTheme({persist = false} = {}) {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content",
      theme === "dark" ? "#0f1a20" : "#f7f5f0");
    const toggle = document.querySelector("[data-b6-theme-toggle]");
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(theme === "dark"));
      toggle.setAttribute("aria-label", lang === "es"
        ? (theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro")
        : (theme === "dark" ? "Switch to light theme" : "Switch to dark theme"));
    }
    const label = document.querySelector("[data-b6-theme-label]");
    if (label) label.textContent = lang === "es"
      ? (theme === "dark" ? "Claro" : "Oscuro")
      : (theme === "dark" ? "Light" : "Dark");
    const icon = document.querySelector("[data-b6-theme-icon]");
    if (icon) icon.textContent = theme === "dark" ? "☼" : "◐";
    if (persist) {
      safeSaveTheme(theme);
      const url = new URL(location.href);
      url.searchParams.set("theme", theme);
      history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
  }
  // Explicit incoming theme overrides sync the preference back to the main hub.
  if (validTheme(params.get("theme"))) safeSaveTheme(theme);
  // A shared deep link explicitly in ES or EN must also update the hub preference.
  if (languages.includes(params.get("lang"))) safeSaveLang(lang);

  function updateDocument() {
    document.documentElement.lang = lang;
    document.documentElement.dataset.b6Lang = lang;
    document.title = (lang === "es" ? "Candidaturas" : "Applications") + " | Gracián Baena";
    const visible = document.querySelector('[data-b6-panel="' + track + '"]');
    // Always pass ES or EN explicitly: an earlier saved hub language must never override this choice.
    const currentTheme = new URLSearchParams(location.search).get("theme");
    const themeSuffix = validTheme(currentTheme) ? "theme=" + theme : "";
    for (const link of document.querySelectorAll("[data-b6-home-link]")) {
      const parameters = [];
      parameters.push("lang=" + lang);
      if (themeSuffix) parameters.push(themeSuffix);
      link.href = "./" + (parameters.length ? "?" + parameters.join("&") : "");
    }
    for (const button of document.querySelectorAll("[data-b6-track]")) {
      button.setAttribute("aria-pressed", String(button.dataset.b6Track === track));
      button.setAttribute("aria-controls", "profile-" + button.dataset.b6Track);
    }
    for (const panel of document.querySelectorAll("[data-b6-panel]")) {
      panel.hidden = panel !== visible;
    }
    for (const button of document.querySelectorAll("[data-b6-set-lang]")) {
      button.setAttribute("aria-pressed", String(button.dataset.b6SetLang === lang));
    }
    for (const button of document.querySelectorAll("[data-b6-focus]")) {
      button.setAttribute("aria-pressed", String(button.dataset.b6Focus === focus));
    }
    for (const panel of document.querySelectorAll("[data-b6-focus-panel]")) {
      panel.hidden = panel.dataset.b6FocusPanel !== focus;
    }
    // Exactly one visible summary: track and professional focus determine its evidence.
    for (const card of document.querySelectorAll("[data-brief-track]")) {
      card.hidden = card.dataset.briefTrack !== track ||
        (track === "professional" && card.dataset.briefFocus !== focus);
    }
    const files = documents[track][lang];
    const cv = document.querySelector("[data-brief-cv]");
    const letter = document.querySelector("[data-brief-letter]");
    const proof = document.querySelector("[data-brief-proof]");
    if (cv) cv.href = files[0];
    if (letter) letter.href = files[1];
    if (proof) proof.href = track === "professional" ? evidence.professional[focus] : evidence[track];
    const briefUrl = document.querySelector("[data-brief-url]");
    if (briefUrl) briefUrl.textContent = location.href;
    applyTheme();

    const feedback = document.querySelector("[data-b6-copy-status]");
    if (feedback) feedback.textContent = "";
  }

  function select(nextTrack, nextLang, nextFocus = focus) {
    track = nextTrack;
    lang = nextLang;
    focus = nextFocus;
    safeSaveLang(lang);
    const url = new URL(location.href);
    url.searchParams.set("track", track);
    url.searchParams.set("lang", lang);
    if (focus === "customer-success") url.searchParams.delete("focus");
    else url.searchParams.set("focus", focus);
    history.replaceState(null, "", url.pathname + url.search + url.hash);
    updateDocument();
  }
  document.querySelectorAll("[data-b6-track]").forEach(button => {
    button.addEventListener("click", () => select(button.dataset.b6Track, lang));
  });
  document.querySelectorAll("[data-b6-set-lang]").forEach(button => {
    button.addEventListener("click", () => select(track, button.dataset.b6SetLang));
  });
  document.querySelectorAll("[data-b6-focus]").forEach(button => {
    button.addEventListener("click", () => select("professional", lang, button.dataset.b6Focus));
  });
  document.querySelector("[data-b6-theme-toggle]")?.addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark";
    applyTheme({persist:true});
    updateDocument();
  });
  document.querySelector("[data-brief-print]")?.addEventListener("click", () => window.print());
  document.querySelector("[data-b6-copy-link]")?.addEventListener("click", async () => {
    const feedback = document.querySelector("[data-b6-copy-status]");
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(location.href);
      if (feedback) feedback.textContent = lang === "es" ? "Enlace copiado" : "Link copied";
    } catch {
      if (feedback) feedback.textContent = lang === "es"
        ? "No se pudo copiar. Usa la dirección del navegador."
        : "Copy unavailable. Use the browser address.";
    }
  });
  addEventListener("popstate", () => {
    const p = new URLSearchParams(location.search);
    track = choices.includes(p.get("track")) ? p.get("track") : "professional";
    lang = languages.includes(p.get("lang")) ? p.get("lang")
      : (languages.includes(safeGetLang()) ? safeGetLang() : "es");
    if (languages.includes(p.get("lang"))) safeSaveLang(lang);
    focus = focuses.includes(p.get("focus")) ? p.get("focus") : "customer-success";
    theme = validTheme(p.get("theme")) ? p.get("theme") :
      (validTheme(safeGetTheme()) ? safeGetTheme() : "dark");
    updateDocument();
  });
  document.documentElement.dataset.b6Enhanced = "true";
  updateDocument();
})();
