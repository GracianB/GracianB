/* B6 application selector. Progressive HTML links remain usable without JS.
   Only URL parameters are read; no tracking, third-party API or storage. */
(() => {
  "use strict";
  const choices = ["professional", "yoga", "aviation"];
  const languages = ["es", "en"];
  const params = new URLSearchParams(location.search);
  let track = choices.includes(params.get("track")) ? params.get("track") : "professional";
  let lang = languages.includes(params.get("lang")) ? params.get("lang") : "es";

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
  }

  function select(nextTrack, nextLang) {
    track = nextTrack;
    lang = nextLang;
    const url = new URL(location.href);
    url.searchParams.set("track", track);
    url.searchParams.set("lang", lang);
    history.replaceState(null, "", url.pathname + url.search + url.hash);
    updateDocument();
  }
  document.querySelectorAll("[data-b6-track]").forEach(button => {
    button.addEventListener("click", () => select(button.dataset.b6Track, lang));
  });
  document.querySelectorAll("[data-b6-set-lang]").forEach(button => {
    button.addEventListener("click", () => select(track, button.dataset.b6SetLang));
  });
  addEventListener("popstate", () => {
    const p = new URLSearchParams(location.search);
    track = choices.includes(p.get("track")) ? p.get("track") : "professional";
    lang = languages.includes(p.get("lang")) ? p.get("lang") : "es";
    updateDocument();
  });
  updateDocument();
})();
