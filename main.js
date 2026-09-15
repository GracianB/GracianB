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
    document.querySelectorAll(".mode, .stat, .cv-lane, .contact-panel, .hero-copy, .constellation").forEach((el) => {
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

  /* —— constellation parallax —— */
  const stage = document.querySelector(".hero-stage");
  const field = document.querySelector(".constellation");
  if (!reduce && stage && field && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    stage.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      field.style.setProperty("--cx", (px * 14).toFixed(1) + "px");
      field.style.setProperty("--cy", (py * 10).toFixed(1) + "px");
    });
    stage.addEventListener("pointerleave", () => {
      field.style.setProperty("--cx", "0px");
      field.style.setProperty("--cy", "0px");
    });
  }

  /* —— world cards: keyboard + hover tilt —— */
  const worlds = document.querySelectorAll(".modes-worlds .mode");
  const fineHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  worlds.forEach((card) => {
    card.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      if (e.target !== card) return;
      e.preventDefault();
      card.querySelector(".mode-sats a")?.click();
    });
    if (reduce || !fineHover) return;
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `translateY(-8px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 7).toFixed(2)}deg)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
})();

/* ══════════════════════════════════════════════════════════════
   MAX PASS · v=max-1 — added behaviours (self-contained)
   ══════════════════════════════════════════════════════════════ */
(() => {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const root = document.documentElement;
  const rAF = window.requestAnimationFrame || ((f) => setTimeout(f, 16));

  /* —— 1 · cinematic intro controller —— */
  (function intro() {
    if (!root.classList.contains("intro-on")) return;
    try { sessionStorage.setItem("gb-intro-seen", "1"); } catch (_) {}
    let done = false;
    const finish = () => {
      if (done) return; done = true;
      root.classList.add("intro-done");
      document.dispatchEvent(new CustomEvent("gb:intro-done"));
    };
    const timer = setTimeout(finish, 2100);
    const skip = () => { clearTimeout(timer); finish(); };
    ["pointerdown", "keydown", "wheel", "touchstart"].forEach((ev) =>
      window.addEventListener(ev, skip, { once: true, passive: true })
    );
  })();

  /* —— 2 · hero name letter reveal —— */
  (function letters() {
    const lines = document.querySelectorAll(".hero-name .name-line");
    if (!lines.length) return;
    let idx = 0;
    const chars = [];
    lines.forEach((line) => {
      const text = line.textContent;
      line.textContent = "";
      [...text].forEach((ch) => {
        const s = document.createElement("span");
        s.className = "char" + (ch === " " ? " space" : "");
        s.textContent = ch === " " ? " " : ch;
        if (reduce) s.classList.add("lit");
        line.appendChild(s);
        if (ch !== " ") chars.push(s);
      });
    });
    if (reduce) return;
    const lightUp = () => {
      chars.forEach((s, i) => setTimeout(() => s.classList.add("lit"), 40 * i));
    };
    if (root.classList.contains("intro-on")) {
      document.addEventListener("gb:intro-done", () => setTimeout(lightUp, 120), { once: true });
      setTimeout(lightUp, 3400); // failsafe
    } else {
      setTimeout(lightUp, 200);
    }
  })();

  /* —— 3 · scroll progress rail + topbar state —— */
  (function scrollRail() {
    const topbar = document.querySelector(".topbar");
    let ticking = false;
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (h.scrollTop || document.body.scrollTop) / max * 100 : 0;
      root.style.setProperty("--sp", pct.toFixed(2) + "%");
      if (topbar) topbar.classList.toggle("scrolled", (h.scrollTop || 0) > 8);
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; rAF(update); }
    }, { passive: true });
    update();
  })();

  /* —— 4 · cursor spotlight —— */
  (function spotlight() {
    if (reduce || !fine) return;
    let shown = false;
    window.addEventListener("pointermove", (e) => {
      root.style.setProperty("--sx", (e.clientX / window.innerWidth * 100).toFixed(1) + "%");
      root.style.setProperty("--sy", (e.clientY / window.innerHeight * 100).toFixed(1) + "%");
      if (!shown) { shown = true; document.body.classList.add("has-spot"); }
    }, { passive: true });
  })();

  /* —— 5 · magnetic hero buttons —— */
  (function magnetic() {
    if (reduce || !fine) return;
    document.querySelectorAll(".hero-actions .btn").forEach((btn) => {
      const R = 60;
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.setProperty("--mfx", (dx * 0.28).toFixed(1) + "px");
        btn.style.setProperty("--mfy", (dy * 0.34).toFixed(1) + "px");
      });
      btn.addEventListener("pointerleave", () => {
        btn.style.setProperty("--mfx", "0px");
        btn.style.setProperty("--mfy", "0px");
      });
    });
  })();

  /* —— 6 · count-up stats —— */
  (function counters() {
    const nums = document.querySelectorAll(".stat b[data-count]");
    if (!nums.length) return;
    const run = (el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      const suffix = el.dataset.suffix || "";
      if (reduce) { el.textContent = target + suffix; return; }
      const dur = 1100; const t0 = performance.now();
      const step = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) rAF(step);
        else el.closest(".stat")?.classList.add("counted");
      };
      rAF(step);
    };
    if (!("IntersectionObserver" in window)) { nums.forEach(run); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    nums.forEach((n) => io.observe(n));
  })();

  /* —— 7 · interactive particle network —— */
  (function net() {
    const canvas = document.querySelector(".fx-net");
    if (!canvas || reduce) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const PALETTE = [
      [196, 165, 116], // champagne
      [122, 243, 255], // ice
      [125, 202, 165], // sage
      [232, 217, 195]  // nude
    ];
    let w = 0, h = 0, dpr = 1, parts = [];
    const mouse = { x: -9999, y: -9999, active: false };

    function resize() {
      w = window.innerWidth; h = window.innerHeight;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(28, Math.min(92, Math.round(w * h / 22000)));
      parts = [];
      for (let i = 0; i < count; i++) {
        parts.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.32,
          vy: (Math.random() - 0.5) * 0.32,
          r: Math.random() * 1.6 + 0.7,
          c: PALETTE[(Math.random() * PALETTE.length) | 0]
        });
      }
    }

    const LINK = 128, MOUSE_LINK = 168;
    function frame() {
      if (document.hidden) { rAF(frame); return; }
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = w + 20; else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20; else if (p.y > h + 20) p.y = -20;
        // gentle pull toward pointer
        if (mouse.active) {
          const mdx = mouse.x - p.x, mdy = mouse.y - p.y;
          const md = Math.hypot(mdx, mdy);
          if (md < MOUSE_LINK && md > 0.1) {
            p.vx += (mdx / md) * 0.008;
            p.vy += (mdy / md) * 0.008;
          }
        }
        p.vx = Math.max(-0.7, Math.min(0.7, p.vx));
        p.vy = Math.max(-0.7, Math.min(0.7, p.vy));
        // node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fillStyle = `rgba(${p.c[0]},${p.c[1]},${p.c[2]},0.9)`;
        ctx.fill();
        // mouse line
        if (mouse.active) {
          const dx = mouse.x - p.x, dy = mouse.y - p.y;
          const d = Math.hypot(dx, dy);
          if (d < MOUSE_LINK) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(${p.c[0]},${p.c[1]},${p.c[2]},${(1 - d / MOUSE_LINK) * 0.5})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      // links between particles
      for (let i = 0; i < parts.length; i++) {
        for (let j = i + 1; j < parts.length; j++) {
          const a = parts[i], b = parts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            const al = (1 - d / LINK) * 0.28;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${a.c[0]},${a.c[1]},${a.c[2]},${al})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }
      rAF(frame);
    }

    window.addEventListener("pointermove", (e) => {
      mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true;
    }, { passive: true });
    window.addEventListener("pointerleave", () => { mouse.active = false; });
    window.addEventListener("blur", () => { mouse.active = false; });
    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(resize, 180); }, { passive: true });
    resize();
    rAF(frame);
  })();
})();
