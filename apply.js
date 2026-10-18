/* B6 application selector. Progressive HTML links remain usable without JS.
   Only URL parameters are read; no tracking, third-party API or storage. */
(() => {
  "use strict";
  const choices = ["professional", "yoga", "aviation"];
  const languages = ["es", "en"];
  const focuses = ["customer-success", "revops", "data-automation"];
  const params = new URLSearchParams(location.search);
  let track = choices.includes(params.get("track")) ? params.get("track") : "professional";
  let lang = languages.includes(params.get("lang")) ? params.get("lang") : "es";
  let focus = focuses.includes(params.get("focus")) ? params.get("focus") : "customer-success";

  function updateDocument() {
    document.documentElement.lang = lang;
    document.documentElement.dataset.b6Lang = lang;
    document.title = (lang === "es" ? "Candidaturas" : "Applications") + " | Gracián Baena";
    const visible = document.querySelector('[data-b6-panel="' + track + '"]');
    // An EN application should also return to an EN hub, including via shared URLs.
    for (const link of document.querySelectorAll("[data-b6-home-link]")) {
      link.href = lang === "en" ? "./?lang=en" : "./";
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
    const feedback = document.querySelector("[data-b6-copy-status]");
    if (feedback) feedback.textContent = "";
  }

  function select(nextTrack, nextLang, nextFocus = focus) {
    track = nextTrack;
    lang = nextLang;
    focus = nextFocus;
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
    lang = languages.includes(p.get("lang")) ? p.get("lang") : "es";
    focus = focuses.includes(p.get("focus")) ? p.get("focus") : "customer-success";
    updateDocument();
  });
  updateDocument();
})();
