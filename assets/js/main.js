/* =====================================================================
   Affan Khan — personal site · vanilla JS, no dependencies
   theme · nav · reveal · flow-field canvas · rail · filters · misc
   ===================================================================== */
(function () {
  "use strict";

  var body = document.body;
  var root = document.documentElement;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Theme toggle (dark default, persisted) ---- */
  document.querySelectorAll(".theme-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = root.dataset.theme === "light" ? "dark" : "light";
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) { /* private mode */ }
    });
  });

  /* ---- Sticky header + scroll progress ---- */
  var progress = document.createElement("div");
  progress.className = "progress-bar";
  body.appendChild(progress);

  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
    var max = root.scrollHeight - window.innerHeight;
    progress.style.width = max > 0 ? (100 * window.scrollY / max) + "%" : "0";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile nav ---- */
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", body.classList.contains("nav-open") ? "true" : "false");
    });
    document.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () { body.classList.remove("nav-open"); });
    });
  }

  /* ---- Scroll reveal (stagger via data-d) ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length && !reducedMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(function (el) {
      if (el.dataset.d) el.style.setProperty("--d", el.dataset.d);
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Active nav link (section spy, home page) ---- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href*="#"]'));
  var sections = navLinks.map(function (a) {
    var id = a.getAttribute("href").split("#")[1];
    return id ? document.getElementById(id) : null;
  }).filter(Boolean);
  if (sections.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          navLinks.forEach(function (a) {
            a.classList.toggle("active", a.getAttribute("href").indexOf("#" + e.target.id) !== -1);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* =================================================================
     Flow-field hero canvas — particles advected through a curl-ish
     velocity field. A nod to CFD streamlines.
     ================================================================= */
  var canvas = document.getElementById("field");
  if (canvas && !reducedMotion) {
    var ctx = canvas.getContext("2d");
    var particles = [];
    var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var mouse = { x: -9999, y: -9999 };
    var running = true;
    var t = 0;

    function colors() {
      var cs = getComputedStyle(root);
      return {
        faint: cs.getPropertyValue("--faint").trim(),
        accent: cs.getPropertyValue("--accent").trim()
      };
    }
    var pal = colors();
    new MutationObserver(function () {
      pal = colors();
      ctx.clearRect(0, 0, W, H);
    }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function seed() {
      var n = Math.min(260, Math.floor(W * H / 9000));
      particles = [];
      for (var i = 0; i < n; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          life: 60 + Math.random() * 160,
          accent: Math.random() < 0.12
        });
      }
    }

    /* layered-sine pseudo curl field */
    function angleAt(x, y) {
      var s = 0.0016;
      return (
        Math.sin(x * s * 1.7 + t * 0.0007) +
        Math.cos(y * s * 2.3 - t * 0.0005) +
        Math.sin((x + y) * s * 0.9 + t * 0.0003)
      ) * 1.35;
    }

    function step() {
      if (!running) return;
      t += 16;

      /* fade previous frame (transparent canvas → erase, not paint) */
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.045)";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        var a = angleAt(p.x, p.y);

        /* mouse swirl */
        var dx = p.x - mouse.x, dy = p.y - mouse.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 22500) { a += (1 - d2 / 22500) * 2.2; }

        var speed = p.accent ? 1.15 : 0.75;
        var nx = p.x + Math.cos(a) * speed;
        var ny = p.y + Math.sin(a) * speed;

        ctx.strokeStyle = p.accent ? pal.accent : pal.faint;
        ctx.globalAlpha = p.accent ? 0.8 : 0.5;
        ctx.lineWidth = p.accent ? 1.4 : 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        p.x = nx; p.y = ny;
        p.life--;

        if (p.life <= 0 || p.x < -10 || p.x > W + 10 || p.y < -10 || p.y > H + 10) {
          p.x = Math.random() * W;
          p.y = Math.random() * H;
          p.life = 60 + Math.random() * 160;
        }
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(step);
    }

    canvas.parentElement.addEventListener("pointermove", function (e) {
      var r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });
    canvas.parentElement.addEventListener("pointerleave", function () {
      mouse.x = -9999; mouse.y = -9999;
    });

    /* pause when hero offscreen */
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        var vis = entries[0].isIntersecting;
        if (vis && !running) { running = true; step(); }
        else if (!vis) { running = false; }
      }, { threshold: 0 }).observe(canvas);
    }

    window.addEventListener("resize", resize);
    resize();
    step();
  }

  /* =================================================================
     Accolades rail — wheel steps one card per notch, arrows, snap.
     Clicking a card opens its certificate (it's a plain <a>).
     ================================================================= */
  document.querySelectorAll(".rail-wrap").forEach(function (wrap) {
    var rail = wrap.querySelector(".rail");
    var cards = Array.prototype.slice.call(wrap.querySelectorAll(".rail-card"));
    var prev = wrap.querySelector(".rail-prev");
    var next = wrap.querySelector(".rail-next");
    var now = wrap.querySelector(".rail-now");
    if (!rail || !cards.length) return;

    var active = 0;

    function center(card) {
      rail.scrollTo({ left: card.offsetLeft + card.offsetWidth / 2 - rail.clientWidth / 2, behavior: "smooth" });
    }
    function highlight(i) {
      active = Math.max(0, Math.min(cards.length - 1, i));
      cards.forEach(function (c, idx) { c.classList.toggle("is-active", idx === active); });
      if (now) now.textContent = active + 1;
    }
    function setActive(i) { highlight(i); center(cards[active]); }
    function nearest() {
      var mid = rail.scrollLeft + rail.clientWidth / 2, best = 0, bd = Infinity;
      cards.forEach(function (c, idx) {
        var d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
        if (d < bd) { bd = d; best = idx; }
      });
      return best;
    }

    if (prev) prev.addEventListener("click", function () { setActive(active - 1); });
    if (next) next.addEventListener("click", function () { setActive(active + 1); });

    var lock = false;
    rail.addEventListener("wheel", function (e) {
      var delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (!delta) return;
      var dir = delta > 0 ? 1 : -1;
      if ((dir < 0 && active === 0) || (dir > 0 && active === cards.length - 1)) return;
      e.preventDefault();
      if (lock) return;
      lock = true;
      setTimeout(function () { lock = false; }, 240);
      setActive(active + dir);
    }, { passive: false });

    var st;
    rail.addEventListener("scroll", function () {
      clearTimeout(st);
      st = setTimeout(function () { highlight(nearest()); }, 90);
    }, { passive: true });

    highlight(0);
  });

  /* ---- Work grid filters ---- */
  var chips = document.querySelectorAll(".filters .chip");
  if (chips.length) {
    var items = document.querySelectorAll("[data-cat]");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("on"); });
        chip.classList.add("on");
        var f = chip.dataset.filter;
        items.forEach(function (el) {
          el.classList.toggle("hide", f !== "all" && el.dataset.cat.indexOf(f) === -1);
        });
      });
    });
  }

  /* ---- Copy email ---- */
  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.dataset.copy || "";
      function done() {
        var label = btn.querySelector("span");
        if (!label) return;
        var old = label.textContent;
        label.textContent = "Copied!";
        setTimeout(function () { label.textContent = old; }, 1600);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, done);
      } else { done(); }
    });
  });

  /* ---- Footer year ---- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
