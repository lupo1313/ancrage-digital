/* =========================================================
   ANCRAGE DIGITAL — interactions studio
   ========================================================= */
(function () {
  "use strict";
  var pageLoadedAt = Date.now();
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Scroll progress + header hide/show ---------- */
  var header = document.getElementById("header");
  var progress = document.getElementById("scrollProgress");
  var lastY = window.scrollY;

  function onScroll() {
    var y = window.scrollY;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";

    header.classList.toggle("scrolled", y > 20);
    if (y > lastY && y > 300) header.classList.add("hide");
    else header.classList.remove("hide");
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pageshow", onScroll);
  onScroll();

  /* ---------- Spotlight (suit la souris) ---------- */
  var spot = document.getElementById("spotlight");
  if (spot && !reduce && window.matchMedia("(pointer:fine)").matches) {
    var sx = 0, sy = 0, cx = 0, cy = 0, raf;
    window.addEventListener("mousemove", function (e) {
      sx = e.clientX; sy = e.clientY;
      spot.style.opacity = "1";
      if (!raf) raf = requestAnimationFrame(loop);
    });
    function loop() {
      cx += (sx - cx) * 0.12; cy += (sy - cy) * 0.12;
      spot.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%)";
      raf = requestAnimationFrame(loop);
    }
  }

  /* ---------- Menu mobile ---------- */
  var toggle = document.getElementById("menuToggle");
  var nav = document.getElementById("mainNav");
  var scrim = document.getElementById("menuScrim");
  function closeMenu() {
    nav.classList.remove("open"); toggle.classList.remove("open"); scrim.classList.remove("show");
    toggle.setAttribute("aria-expanded", "false"); document.body.style.overflow = "";
  }
  function openMenu() {
    nav.classList.add("open"); toggle.classList.add("open"); scrim.classList.add("show");
    toggle.setAttribute("aria-expanded", "true"); document.body.style.overflow = "hidden";
  }
  toggle.addEventListener("click", function () { nav.classList.contains("open") ? closeMenu() : openMenu(); });
  scrim.addEventListener("click", closeMenu);
  nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

  /* ---------- Hero title reveal (setTimeout, pas de rAF) ---------- */
  var heroTitle = document.querySelector(".hero-title");
  var heroSignal = document.querySelector(".hero-signal");
  if (heroTitle) {
    heroTitle.querySelectorAll(".w").forEach(function (w, i) { w.style.transitionDelay = (i * 45) + "ms"; });
    setTimeout(function () { heroTitle.classList.add("in"); }, 140);
  }

  /* ---------- Counters (setInterval, robuste) ---------- */
  var counted = false;
  function startCounters() {
    if (counted) return; counted = true;
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      var steps = 38, i = 0, cur = 0, inc = target / steps;
      var iv = setInterval(function () {
        i++; cur += inc;
        if (i >= steps) { cur = target; clearInterval(iv); }
        el.textContent = Math.round(cur) + suffix;
      }, 26);
    });
  }

  /* ---------- Reveal on scroll (fiable, pas d'IntersectionObserver) ---------- */
  var revealEls = [].slice.call(document.querySelectorAll(".reveal, .section-head, .bento-card, .m-step, .stat-cell, .work-row, .price-card, .review, .faq-list details, .about-copy, .about-emblem, .devis-form, .cta-copy"));
  revealEls.forEach(function (el) { el.classList.add("reveal"); });
  if (heroSignal && revealEls.indexOf(heroSignal) === -1) revealEls.push(heroSignal);

  function revealOnScroll() {
    var vh = window.innerHeight;
    for (var i = 0; i < revealEls.length; i++) {
      var el = revealEls[i];
      if (el.classList.contains("in")) continue;
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.9 && r.bottom > 0) {
        el.classList.add("in");
        if (el.classList.contains("stat-cell") || el === heroSignal) startCounters();
      }
    }
  }
  window.addEventListener("scroll", revealOnScroll, { passive: true });
  window.addEventListener("resize", revealOnScroll);
  revealOnScroll();
  // filet de sécurité : tout révélé au pire après 2s
  setTimeout(function () { revealEls.forEach(function (el) { el.classList.add("in"); }); startCounters(); }, 2000);

  /* ---------- Manifesto : mots qui s'allument au scroll ---------- */
  var manifesto = document.getElementById("manifesto");
  if (manifesto) {
    // enveloppe chaque mot dans un span (en gardant les <b>)
    (function wrap(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (part.trim() === "") { frag.appendChild(document.createTextNode(part)); }
            else { var s = document.createElement("span"); s.className = "mword"; s.textContent = part; frag.appendChild(s); }
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) { wrap(child); }
      });
    })(manifesto);

    var words = manifesto.querySelectorAll(".mword, b");
    function litScroll() {
      var rect = manifesto.getBoundingClientRect();
      var vh = window.innerHeight;
      var prog = (vh * 0.85 - rect.top) / (rect.height + vh * 0.35);
      prog = Math.max(0, Math.min(1, prog));
      var n = Math.floor(prog * words.length);
      words.forEach(function (w, i) { w.classList.toggle("lit", i < n); });
    }
    window.addEventListener("scroll", litScroll, { passive: true });
    litScroll();
  }

  /* ---------- Méthode : ligne de progression + steps actifs ---------- */
  var mFill = document.getElementById("mLineFill");
  var mSteps = document.querySelectorAll(".m-step");
  var mWrap = document.querySelector(".method-steps");
  if (mFill && mWrap) {
    function methodScroll() {
      var rect = mWrap.getBoundingClientRect();
      var vh = window.innerHeight;
      var prog = (vh * 0.55 - rect.top) / rect.height;
      prog = Math.max(0, Math.min(1, prog));
      mFill.style.height = (prog * 100) + "%";
      var active = Math.ceil(prog * mSteps.length);
      mSteps.forEach(function (s, i) { s.classList.toggle("active", i < Math.max(1, active)); });
    }
    window.addEventListener("scroll", methodScroll, { passive: true });
    methodScroll();
  }

  /* ---------- Boutons magnétiques ---------- */
  if (!reduce && window.matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll("[data-magnetic]").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var mx = e.clientX - r.left - r.width / 2;
        var my = e.clientY - r.top - r.height / 2;
        btn.style.setProperty("--mag-x", (mx * 0.25) + "px");
        btn.style.setProperty("--mag-y", (my * 0.35) + "px");
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.setProperty("--mag-x", "0px");
        btn.style.setProperty("--mag-y", "0px");
      });
    });

    /* ---------- Tilt sur les cartes ---------- */
    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty("--ry", (px * 6) + "deg");
        card.style.setProperty("--rx", (-py * 6) + "deg");
      });
      card.addEventListener("mouseleave", function () {
        card.style.setProperty("--ry", "0deg");
        card.style.setProperty("--rx", "0deg");
      });
    });
  }

  /* ---------- Footer year ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Formulaire (FormSubmit AJAX) ---------- */
  // TODO Fabien : remplacer par l'endpoint FormSubmit HASHÉ de contact@ancrage-digital.fr
  var FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/flopezoanes@gmail.com";
  var form = document.getElementById("devisForm");
  var status = document.getElementById("formStatus");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "form-status mono"; status.textContent = "";
      if (form.querySelector('[name="_gotcha"]').value) return;
      if (Date.now() - pageLoadedAt < 3000) return;
      var nom = form.nom.value.trim(), email = form.email.value.trim();
      if (!nom || !email) { status.className = "form-status mono err"; status.textContent = "Renseignez au moins nom + email."; return; }
      var btn = form.querySelector('button[type="submit"]'), original = btn.innerHTML;
      btn.disabled = true; btn.textContent = "Envoi en cours...";
      fetch(FORMSUBMIT_ENDPOINT, {
        method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          nom: nom, telephone: form.telephone.value.trim(), email: email,
          besoin: form.besoin.value, message: form.message.value.trim(),
          _subject: "Nouvelle demande — Ancrage Digital", _template: "table"
        })
      }).then(function (r) { return r.json(); })
        .then(function () { form.reset(); status.className = "form-status mono ok"; status.textContent = "Reçu ! On revient vers vous très vite."; })
        .catch(function () { status.className = "form-status mono err"; status.textContent = "Souci d'envoi. Écrivez à contact@ancrage-digital.fr."; })
        .finally(function () { btn.disabled = false; btn.innerHTML = original; });
    });
  }
})();
