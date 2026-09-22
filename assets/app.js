/* mserdyuk.ru — site behaviour
   ------------------------------------------------------------------
   Everything here is progressive enhancement: the page is fully
   readable (in Russian) with JavaScript disabled.
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================= Theme ================= */
  var themeToggle = document.getElementById('theme-toggle');
  function currentTheme() {
    if (root.dataset.theme === 'light' || root.dataset.theme === 'dark') return root.dataset.theme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  /* ================= i18n =================
     Russian lives in the HTML; English lives here. Originals are
     captured once so switching back never loses markup. */
  var EN = {
    'skip': 'Skip to content',
    'nav.exp': 'Experience', 'nav.edu': 'Education', 'nav.skills': 'Skills',
    'nav.awards': 'Awards', 'nav.contact': 'Contact', 'nav.game': 'PM Runner',

    'brand': 'Mark Serdyuk',
    'hero.eyebrow': 'Product Manager · Moscow',
    'hero.first': 'Mark',
    'hero.last': 'Serdyuk',
    'hero.lead': 'I build <strong>AI products and B2B platforms</strong> — from research and the business case through to production and scale.',
    'hero.cv': 'Download CV',
    'hero.tg': 'Message on Telegram',
    'hero.now': 'Currently:',
    'hero.nowCo': 'AI product manager at Magnit Tech',

    'logos.label': 'Worked with and delivered projects for',

    'stat.1': 'verified economic impact per year',
    'stat.2': 'senior managers use the AI assistant weekly',
    'stat.3': 'PMs and team leads trained to work with AI',
    'stat.4': 'in-depth interviews in a single discovery',

    'sec.exp': 'Experience', 'sec.expNote': 'Product, AI and platforms',
    'sec.selected': 'Selected projects and entrepreneurship',
    'sec.edu': 'Education and teaching',
    'sec.skills': 'Skills',
    'sec.awards': 'Awards',
    'sec.contact': 'Contact', 'sec.contactNote': 'I reply within a day',
    'sec.gameNote': 'Easter egg',
    'badge.now': 'now',

    'r1.dates': 'June 2026 — present', 'r1.place': 'Moscow',
    'r1.title': 'Product Manager · AI products and internal platforms',
    'r1.p1': 'Built and shipped a corporate <strong>AI assistant on a multi-agent architecture</strong> — used weekly by 700+ employees in senior positions.',
    'r1.p2': 'Delivered a verified economic impact of <strong>100M ₽ per year</strong> by automating information retrieval, calculations, metric analysis and management reporting.',
    'r1.p3': 'Launched a learning portal from scratch and trained <strong>150+ product managers and team leads</strong> to work with AI tools.',
    'r1.p4': 'Relaunched the corporate knowledge base as a single platform with a shared design system and a personal employee workspace, uniting key internal services in one flow.',
    'r1.p5': 'Integrated corporate models and AI agents for semantic search, calculations, metric analysis and report generation.',

    'r2.dates': 'February — June 2026', 'r2.place': 'Moscow', 'r2.co': 'Yandex',
    'r2.title': 'Product Manager · "Mover without a van" service',
    'r2.p1': 'Launched a new service scenario <strong>from idea to production</strong>: needs research → business case → backlog → testing → launch.',
    'r2.p2': 'Defined the value proposition, user journey, requirements and backlog priorities; coordinated engineering, design, analytics and operations.',
    'r2.p3': 'Built the <strong>demand model and unit economics</strong>, sizing annual revenue potential and the conditions for scaling.',
    'r2.p4': 'Handed the product over to production and set up the metric system: demand, conversion, fulfilment quality and repeat usage.',

    'r3.dates': 'July — September 2025', 'r3.place': 'St. Petersburg',
    'r3.co': 'Gazpromneft Business Service',
    'r3.title': 'Project Lead',
    'r3.p1': 'Ran <strong>CustDev across 10 subsidiaries</strong> and piloted LLMs for processing primary accounting documents and working with ERP systems.',
    'r3.p2': 'Built a calculator and dashboards for assessing robotisation impact; improved the investment appraisal methodology for IT solutions.',
    'r3.p3': 'Initiated research into the company’s transition to a product approach and launched an internal networking and collaboration service.',

    'p1.dates': '2026 — present', 'p1.place': 'Own product',
    'p1.co': 'GenAI startup in the beauty industry',
    'p1.p1': 'Growing the product from hypothesis testing and customer research to monetisation — reached <strong>multi-million revenue</strong>. I have been starting my own ventures since childhood.',

    'p2.dates': 'June — October 2025',
    'p2.co': 'Auto services — partner acquisition',
    'p2.p1': 'Ran <strong>131 in-depth interviews</strong> with auto services, analysed competitors and built a partner pipeline for launch across 5 regions; created the acquisition landing page.',

    'p3.dates': 'March — September 2025',
    'p3.co': 'Partner directors authority system',
    'p3.p1': 'Ran field research in stores across <strong>9 regions</strong>, built the CJM and produced 50+ proposals to improve the system.',

    'p4.dates': 'December 2024 — December 2025', 'p4.place': 'Government of Russia',
    'p4.co': 'National Education Strategy 2040',
    'p4.p1': 'Moved <strong>from contributor to working group lead</strong> of 8 people; gathered input from 100+ experts and presented results to heads of executive and legislative bodies.',

    'p5.dates': 'May 2025', 'p5.place': 'Brazil',
    'p5.co': 'Research: Ministry of Finance, Yakov & Partners, BRICS',
    'p5.p1': 'Retail investor analytics across BRICS countries and a payment system transformation proposal estimated to save <strong>up to $30B annually</strong>; presented at a BRICS venue in Brazil.',

    'e1.name': 'Central University',
    'e1.what': '<strong>Mathematics and Computer Science</strong>, Product Management specialisation. Moscow.',
    'e1.courses': 'Core subjects: product management, analytics, economics and finance, SQL, marketing, systems and project management, AI-centric entrepreneurship.',
    'e2.name': 'Lecturer, "Fundamentals of Business Analytics"',
    'e2.what': 'Designed course materials and assignments, reviewed <strong>100+ cases</strong>, taught classes of <strong>up to 170 students</strong>.',
    'e3.name': 'Gazprom Neft Corporate University',
    'e3.what': 'Development programme for project leads and product teams.',

    'sk.product': 'Product', 'sk.ai': 'AI and analytics', 'sk.langs': 'Languages',
    'sk.dd': 'Discovery and delivery', 'sk.strategy': 'Product strategy and roadmap',
    'sk.prio': 'Prioritisation', 'sk.ab': 'A/B testing', 'sk.metrics': 'Product metrics',
    'sk.unit': 'Unit economics', 'sk.backlog': 'Backlog and stakeholder management',
    'sk.llm': 'LLM products', 'sk.ma': 'Multi-agent systems', 'sk.auto': 'AI automation',
    'sk.metrika': 'Yandex Metrica',
    'sk.ru': 'Russian — native', 'sk.uk': 'Ukrainian — B2', 'sk.en': 'English — B1',

    'tag.multiagent': 'Multi-agent systems', 'tag.platform': 'Internal platforms',
    'tag.discovery': 'Discovery → Delivery', 'tag.launch': '0→1 launch',
    'tag.metrics': 'Metrics and analytics', 'tag.roi': 'Impact assessment',

    'a1.h': 'academic and corporate scholarships',
    'a1.p': 'Potanin Foundation, T-Bank ("Academic" track), Central University olympiad scholarship, Avito, Sber, Reksoft Consulting, Moscow Exchange. 2024–2026.',
    'a2.h': 'hackathon wins and podium finishes',
    'a2.p': 'AI&Business SPB, "Idea. Code. Release." by MSU and T-Bank, Datathon 2.0 — winning team lead.',
    'a3.h': 'case championship finalist and mentor',
    'a3.p': 'Finalist 2024; mentor of podium and winning teams in the 2025–2026 finals.',
    'a4.h': 'beyond product',
    'a4.p': 'Founded the largest student sports club, won 4 awards for piano performance, created the generative art exhibition CU:/dev/art.',

    'c.phone': 'Phone',
    'c.foot': 'Full CV in PDF — every project and number.',
    'foot.name': 'Mark Serdyuk',

    'game.intro': 'Jump over bugs, deadlines and unhappy stakeholders, collect coffee. Space or tap to jump, double jump available.',
    'game.score': 'Score', 'game.best': 'Best', 'game.speed': 'Speed: normal',
    'game.desc': 'Jump over bugs, deadlines and unhappy stakeholders. Collect coffee for +10 points.',
    'game.start': 'Start sprint', 'game.hint': 'Space / tap — jump · double jump available',
    'game.board': 'Top players', 'game.loading': 'Loading…',
    'game.over': 'Sprint failed', 'game.by': 'Taken out by', 'game.save': 'Save',
    'game.saved': 'Saved', 'game.name': 'Your name', 'game.again': 'New sprint',
    'game.speedUp': 'Speed up', 'game.coffee': 'Coffee +10'
  };

  var nodes = [];
  document.querySelectorAll('[data-i18n], [data-i18n-html]').forEach(function (el) {
    var html = el.hasAttribute('data-i18n-html');
    nodes.push({
      el: el,
      key: html ? el.getAttribute('data-i18n-html') : el.getAttribute('data-i18n'),
      html: html,
      ru: html ? el.innerHTML : el.textContent
    });
  });

  var lang = 'ru';
  function setLang(next) {
    lang = next === 'en' ? 'en' : 'ru';
    nodes.forEach(function (n) {
      var value = lang === 'en' ? EN[n.key] : n.ru;
      if (value === undefined) return;
      if (n.html) n.el.innerHTML = value; else n.el.textContent = value;
    });
    root.lang = lang;
    document.querySelectorAll('.lang button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });
    if (window.__pmRunner) window.__pmRunner.setLang(lang);
    try { localStorage.setItem('lang', lang); } catch (e) {}
  }
  document.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.lang); });
  });
  try { if (localStorage.getItem('lang') === 'en') setLang('en'); } catch (e) {}

  /* ================= Mobile nav ================= */
  var burger = document.getElementById('burger');
  var mobileNav = document.getElementById('mobile-nav');
  if (burger && mobileNav) {
    burger.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });
    mobileNav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        mobileNav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ================= Header state + scroll spy ================= */
  var header = document.getElementById('site-header');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
  var sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  var toTop = document.getElementById('to-top');

  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('is-stuck', y > 8);
    if (toTop) toTop.classList.toggle('is-visible', y > 600);
    var active = -1;
    sections.forEach(function (s, i) {
      if (s && s.getBoundingClientRect().top <= 120) active = i;
    });
    navLinks.forEach(function (a, i) {
      if (i === active) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ================= Reveal on scroll =================
     Safety net: if IntersectionObserver is missing or never fires
     (print, headless capture, odd browsers) everything is revealed. */
  var revealables = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  function revealAll() { revealables.forEach(function (el) { el.classList.add('is-in'); }); }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    revealables.forEach(function (el) { io.observe(el); });
    setTimeout(revealAll, 2500);
    window.addEventListener('beforeprint', revealAll);
  }

  /* ================= Counters ================= */
  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
  function settle(el) {
    el.dataset.settled = '1';
    el.textContent = el.dataset.count;
  }

  function runCounter(el) {
    var target = parseInt(el.dataset.count, 10);
    if (!isFinite(target)) return;
    if (reduceMotion) { settle(el); return; }
    var started = null, dur = 1400;
    function step(now) {
      if (el.dataset.settled) return;
      if (started === null) started = now;
      var p = Math.min((now - started) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(step); else settle(el);
    }
    requestAnimationFrame(step);
  }

  // Printing mid-animation would put half-counted numbers on paper.
  window.addEventListener('beforeprint', function () { counters.forEach(settle); });

  if ('IntersectionObserver' in window && !reduceMotion) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        cio.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ================= Copy to clipboard ================= */
  var toast = document.getElementById('toast');
  var toastTimer;
  function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 1800);
  }
  document.querySelectorAll('.ccard__copy').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var text = btn.dataset.copy || '';
      var done = function () {
        btn.classList.add('is-done');
        showToast(lang === 'en' ? 'Copied' : 'Скопировано');
        setTimeout(function () { btn.classList.remove('is-done'); }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () {});
      } else {
        var ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (err) {}
        document.body.removeChild(ta);
      }
    });
  });

  /* ================= Year ================= */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ================================================================
     PM Runner
     ================================================================ */
  (function pmRunner() {
    var canvas = document.getElementById('g-canvas');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var overlay = document.getElementById('g-overlay');
    var scoreEl = document.getElementById('g-score');
    var hiEl = document.getElementById('g-hi');
    var speedEl = document.getElementById('g-speed');
    var startBtn = document.getElementById('g-start');
    var boardList = document.getElementById('lb-list');

    var W = 700, H = 200, GROUND = H - 44;
    var glang = 'ru';

    // Match the backing store to the element's real size so the canvas
    // stays crisp on wide screens and on high-DPI displays.
    function fit() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var cssW = Math.round(canvas.clientWidth) || 700;
      W = cssW; H = 200; GROUND = H - 44;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function css(name, fallback) {
      var v = getComputedStyle(root).getPropertyValue(name).trim();
      return v || fallback;
    }

    var OBSTACLES = [
      { ru: 'БАГ', en: 'BUG', w: 32, h: 28, kind: 'bug' },
      { ru: 'ДЕДЛАЙН', en: 'DEADLINE', w: 30, h: 38, kind: 'deadline' },
      { ru: 'СТЕЙКХОЛДЕР', en: 'STAKEHOLDER', w: 26, h: 46, kind: 'stakeholder' }
    ];

    var state = 'idle', rafId = null;
    var score = 0, hi = 0, speed = 5.2, t = 0;
    var player, obstacles, coffees, jumps;

    try { hi = parseInt(localStorage.getItem('pmrunner-hi'), 10) || 0; } catch (e) { hi = 0; }
    if (hiEl) hiEl.textContent = String(hi);

    function reset() {
      score = 0; speed = 5.2; t = 0; jumps = 0;
      player = { x: 66, y: GROUND, vy: 0, w: 24, h: 34 };
      obstacles = []; coffees = [];
      if (scoreEl) scoreEl.textContent = '0';
      if (speedEl) speedEl.textContent = glang === 'en' ? 'Speed: normal' : 'Скорость: нормальная';
    }

    function jump() {
      if (state !== 'running') return;
      if (jumps >= 2) return;
      player.vy = jumps === 0 ? -12.4 : -10.6;
      jumps++;
    }

    function drawGround(ink, faint) {
      ctx.strokeStyle = faint; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, GROUND + 0.5); ctx.lineTo(W, GROUND + 0.5); ctx.stroke();
      ctx.fillStyle = faint;
      for (var i = 0; i < 22; i++) {
        var x = ((i * 53) - (t * speed * 0.55) % 53 + W) % W;
        ctx.fillRect(x, GROUND + 9, 14, 1.5);
      }
    }

    function drawPlayer(ink, accent) {
      // player.y is the foot line, so nothing is drawn below it.
      var x = player.x, y = player.y;
      var grounded = player.y >= GROUND;
      var phase = state === 'running' && grounded ? Math.sin(t * 0.38) : 0.55;

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // legs
      ctx.strokeStyle = ink; ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(x - 2.5, y - 11); ctx.lineTo(x - 2.5 + phase * 7, y);
      ctx.moveTo(x + 2.5, y - 11); ctx.lineTo(x + 2.5 - phase * 7, y);
      ctx.stroke();

      // torso
      ctx.fillStyle = ink;
      rrect(x - 7, y - 25, 14, 15, 4); ctx.fill();

      // head
      ctx.beginPath(); ctx.arc(x, y - 31, 6.8, 0, Math.PI * 2); ctx.fill();

      // arm reaching for the laptop
      ctx.strokeStyle = ink; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 4, y - 22); ctx.lineTo(x + 10, y - 18);
      ctx.stroke();

      // laptop: open lid plus base
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.moveTo(x + 8, y - 24); ctx.lineTo(x + 17, y - 22);
      ctx.lineTo(x + 17, y - 17); ctx.lineTo(x + 8, y - 19);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + 7, y - 18); ctx.lineTo(x + 18, y - 16);
      ctx.lineTo(x + 18, y - 14); ctx.lineTo(x + 7, y - 16);
      ctx.closePath(); ctx.fill();
    }

    function rrect(x, y, w, h, r) {
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
      else ctx.rect(x, y, w, h);
    }

    function label(text, cx, baseline, c) {
      ctx.save();
      ctx.fillStyle = c;
      ctx.font = '700 9px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      try { ctx.letterSpacing = '0.7px'; } catch (e) {}
      ctx.fillText(text, cx, baseline);
      ctx.restore();
    }

    function drawObstacle(o, c) {
      var x = o.x, y = GROUND, w = o.w, h = o.h;
      var cx = x + w / 2;
      var bg = c.bg, ink = c.ink, accent = c.accent;

      label(glang === 'en' ? o.en : o.ru, cx, y - h - 9, c.muted);

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (o.kind === 'bug') {
        var by = y - h / 2 - 1, rx = w / 2 - 4, ry = h / 2 - 2;
        // legs, drawn behind the shell
        ctx.strokeStyle = ink; ctx.lineWidth = 2;
        ctx.beginPath();
        for (var i = -1; i <= 1; i++) {
          var ly = by + i * 6;
          ctx.moveTo(cx - rx + 2, ly); ctx.lineTo(cx - rx - 5, ly + (i === 1 ? 5 : i === -1 ? -3 : 1));
          ctx.moveTo(cx + rx - 2, ly); ctx.lineTo(cx + rx + 5, ly + (i === 1 ? 5 : i === -1 ? -3 : 1));
        }
        ctx.stroke();
        // antennae
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(cx - 3, by - ry + 1); ctx.lineTo(cx - 8, by - ry - 6);
        ctx.moveTo(cx + 3, by - ry + 1); ctx.lineTo(cx + 8, by - ry - 6);
        ctx.stroke();
        ctx.fillStyle = ink;
        ctx.beginPath(); ctx.arc(cx - 8, by - ry - 6, 1.6, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 8, by - ry - 6, 1.6, 0, 7); ctx.fill();
        // shell
        ctx.fillStyle = accent;
        ctx.beginPath(); ctx.ellipse(cx, by, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
        // wing split + spots
        ctx.strokeStyle = ink; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(cx, by - ry + 4); ctx.lineTo(cx, by + ry - 1); ctx.stroke();
        ctx.fillStyle = ink;
        ctx.beginPath(); ctx.arc(cx - 5, by + 1, 2.1, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 5, by + 3, 1.8, 0, 7); ctx.fill();
        // head
        ctx.beginPath(); ctx.ellipse(cx, by - ry + 1, 5, 3.6, 0, 0, Math.PI * 2); ctx.fill();

      } else if (o.kind === 'deadline') {
        // binding rings
        ctx.strokeStyle = ink; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 7, y - h - 4); ctx.lineTo(cx - 7, y - h + 3);
        ctx.moveTo(cx + 7, y - h - 4); ctx.lineTo(cx + 7, y - h + 3);
        ctx.stroke();
        // page
        ctx.fillStyle = bg; rrect(x, y - h, w, h, 3); ctx.fill();
        ctx.strokeStyle = ink; ctx.lineWidth = 1.6;
        rrect(x + 0.8, y - h + 0.8, w - 1.6, h - 1.6, 3); ctx.stroke();
        // header band
        ctx.fillStyle = accent;
        ctx.save();
        rrect(x + 0.8, y - h + 0.8, w - 1.6, 9, 3); ctx.clip();
        ctx.fillRect(x, y - h, w, 10);
        ctx.restore();
        // exclamation mark
        ctx.fillStyle = accent;
        ctx.font = '800 17px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('!', cx, y - (h - 10) / 2 + 1);
        ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';

      } else {
        var hr = 7, hy = y - h + hr + 1;
        // head
        ctx.fillStyle = ink;
        ctx.beginPath(); ctx.arc(cx, hy, hr, 0, Math.PI * 2); ctx.fill();
        // angry brows
        ctx.strokeStyle = bg; ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(cx - 4.5, hy - 3); ctx.lineTo(cx - 1.5, hy - 1.2);
        ctx.moveTo(cx + 4.5, hy - 3); ctx.lineTo(cx + 1.5, hy - 1.2);
        ctx.stroke();
        // suit
        var sy = hy + hr + 1;
        ctx.fillStyle = ink;
        ctx.beginPath();
        ctx.moveTo(cx - w / 2, y);
        ctx.lineTo(cx - w / 2 + 2, sy + 2);
        ctx.lineTo(cx + w / 2 - 2, sy + 2);
        ctx.lineTo(cx + w / 2, y);
        ctx.closePath(); ctx.fill();
        // collar
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.moveTo(cx - 5, sy + 1); ctx.lineTo(cx, sy + 8); ctx.lineTo(cx + 5, sy + 1);
        ctx.closePath(); ctx.fill();
        // tie
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.moveTo(cx, sy + 4);
        ctx.lineTo(cx + 2.6, sy + 8);
        ctx.lineTo(cx, y - 2);
        ctx.lineTo(cx - 2.6, sy + 8);
        ctx.closePath(); ctx.fill();
      }
    }

    function drawCoffee(c2, c) {
      var x = c2.x, y = c2.y, bg = c.bg, ink = c.ink, accent = c.accent;
      // steam
      ctx.strokeStyle = c.muted; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x + 5, y - 20); ctx.quadraticCurveTo(x + 8, y - 24, x + 5, y - 28);
      ctx.moveTo(x + 11, y - 20); ctx.quadraticCurveTo(x + 14, y - 24, x + 11, y - 28);
      ctx.stroke();
      // handle
      ctx.strokeStyle = accent; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.arc(x + 17, y - 9, 4.5, -Math.PI / 2, Math.PI / 2); ctx.stroke();
      // cup
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.moveTo(x, y - 16);
      ctx.lineTo(x + 16, y - 16);
      ctx.lineTo(x + 13.5, y);
      ctx.lineTo(x + 2.5, y);
      ctx.closePath(); ctx.fill();
      // crema
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.ellipse(x + 8, y - 15.5, 7, 2, 0, 0, Math.PI * 2); ctx.fill();
    }

    function hit(a, ax, ay, aw, ah, b, bx, by, bw, bh) {
      return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    }

    function loop() {
      var ink = css('--ink', '#111');
      var faint = css('--line', 'rgba(0,0,0,.15)');
      var accent = css('--accent', '#D93A16');

      ctx.clearRect(0, 0, W, H);
      drawGround(ink, faint);

      if (state === 'running') {
        t++;
        score += 1;
        speed = 5.2 + Math.min(score / 260, 6.5);

        player.vy += 0.66;
        player.y += player.vy;
        if (player.y >= GROUND) { player.y = GROUND; player.vy = 0; jumps = 0; }

        if (!obstacles.length || W - obstacles[obstacles.length - 1].x > 210 + Math.random() * 190) {
          var spec = OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)];
          obstacles.push({ x: W + 20, w: spec.w, h: spec.h, kind: spec.kind, ru: spec.ru, en: spec.en });
        }
        if (Math.random() < 0.006) coffees.push({ x: W + 20, y: GROUND - 46 - Math.random() * 26 });

        var i;
        for (i = obstacles.length - 1; i >= 0; i--) {
          obstacles[i].x -= speed;
          if (obstacles[i].x + obstacles[i].w < -10) { obstacles.splice(i, 1); continue; }
          var o = obstacles[i];
          if (hit(null, player.x - 8, player.y - 36, 16, 36, null, o.x + 3, GROUND - o.h, o.w - 6, o.h)) {
            return endGame(o);
          }
        }
        for (i = coffees.length - 1; i >= 0; i--) {
          coffees[i].x -= speed;
          if (coffees[i].x < -20) { coffees.splice(i, 1); continue; }
          if (hit(null, player.x - 8, player.y - 36, 16, 36, null, coffees[i].x, coffees[i].y - 16, 18, 16)) {
            score += 10; coffees.splice(i, 1);
          }
        }

        if (scoreEl) scoreEl.textContent = String(Math.floor(score / 3));
        if (speedEl) {
          var fast = speed > 9;
          speedEl.textContent = glang === 'en'
            ? (fast ? 'Speed: crunch' : 'Speed: normal')
            : (fast ? 'Скорость: аврал' : 'Скорость: нормальная');
        }
      }

      var palette = { ink: ink, accent: accent, bg: css('--bg', '#fff'), muted: css('--ink-3', '#888') };
      obstacles && obstacles.forEach(function (o) { drawObstacle(o, palette); });
      coffees && coffees.forEach(function (c) { drawCoffee(c, palette); });
      if (player) drawPlayer(ink, accent);

      rafId = requestAnimationFrame(loop);
    }

    function t9(key, ru) { return glang === 'en' ? (EN[key] || ru) : ru; }

    function endGame(o) {
      state = 'dead';
      cancelAnimationFrame(rafId);
      var final = Math.floor(score / 3);
      if (final > hi) {
        hi = final;
        try { localStorage.setItem('pmrunner-hi', String(hi)); } catch (e) {}
      }
      if (hiEl) hiEl.textContent = String(hi);

      overlay.textContent = '';
      var title = document.createElement('p');
      title.className = 'game__title';
      title.textContent = t9('game.over', 'Спринт провален');

      var desc = document.createElement('p');
      desc.className = 'game__desc';
      desc.textContent = t9('game.by', 'Тебя снёс') + ' ' + (glang === 'en' ? o.en : o.ru) +
        ' · ' + t9('game.score', 'Очки') + ': ' + final + ' · ' + t9('game.best', 'Рекорд') + ': ' + hi;

      var row = document.createElement('div');
      row.className = 'game__row';
      var input = document.createElement('input');
      input.type = 'text'; input.maxLength = 20;
      input.placeholder = t9('game.name', 'Твоё имя');
      var save = document.createElement('button');
      save.type = 'button'; save.className = 'btn btn--ghost btn--sm';
      save.textContent = t9('game.save', 'Сохранить');
      save.addEventListener('click', function () {
        var name = input.value.trim().slice(0, 20);
        if (!name) { input.focus(); return; }
        save.disabled = true;
        save.textContent = t9('game.saved', 'Сохранено');
        saveScore(name, final);
      });
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') save.click(); });
      row.appendChild(input); row.appendChild(save);

      var again = document.createElement('button');
      again.type = 'button'; again.className = 'btn btn--primary btn--sm';
      again.textContent = t9('game.again', 'Новый спринт');
      again.addEventListener('click', start);

      overlay.appendChild(title);
      overlay.appendChild(desc);
      overlay.appendChild(row);
      overlay.appendChild(again);
      overlay.hidden = false;
    }

    function start() {
      reset();
      state = 'running';
      overlay.hidden = true;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(loop);
    }

    if (startBtn) startBtn.addEventListener('click', start);
    canvas.addEventListener('pointerdown', function (e) { e.preventDefault(); jump(); });
    document.addEventListener('keydown', function (e) {
      if (e.code !== 'Space' && e.code !== 'ArrowUp') return;
      if (state !== 'running') return;
      e.preventDefault();
      jump();
    });

    /* ---- Leaderboard (text only — never HTML) ---- */
    var FB = 'https://mserdyuk-site-default-rtdb.europe-west1.firebasedatabase.app';

    function renderBoard(entries) {
      boardList.textContent = '';
      if (!entries.length) {
        var empty = document.createElement('p');
        empty.className = 'board__empty';
        empty.textContent = glang === 'en' ? 'No scores yet' : 'Пока пусто';
        boardList.appendChild(empty);
        return;
      }
      entries.forEach(function (e, i) {
        var row = document.createElement('div');
        row.className = 'board__row' + (i < 3 ? ' top' : '');
        var rank = document.createElement('span');
        rank.className = 'board__rank';
        rank.textContent = String(i + 1);
        var name = document.createElement('span');
        name.className = 'board__name';
        // textContent, not innerHTML: leaderboard names are untrusted input.
        name.textContent = String(e.name).slice(0, 20);
        var sc = document.createElement('span');
        sc.className = 'board__score';
        sc.textContent = String(e.score);
        row.appendChild(rank); row.appendChild(name); row.appendChild(sc);
        boardList.appendChild(row);
      });
    }

    function loadBoard() {
      if (!boardList) return;
      fetch(FB + '/leaderboard.json')
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          // One row per player: keep each name's personal best, not every run.
          // Object.create(null) so names like "constructor" cannot collide
          // with prototype keys.
          var best = Object.create(null);
          if (data && typeof data === 'object') {
            Object.keys(data).forEach(function (k) {
              var e = data[k];
              if (!e || typeof e.name !== 'string') return;
              var s = parseInt(e.score, 10);
              if (!isFinite(s) || s < 0) return;
              var name = e.name.trim().slice(0, 20);
              if (!name) return;
              var key = name.toLowerCase();
              if (!best[key] || s > best[key].score) best[key] = { name: name, score: s };
            });
          }
          var list = Object.keys(best).map(function (k) { return best[k]; });
          list.sort(function (a, b) { return b.score - a.score; });
          renderBoard(list.slice(0, 10));
        })
        .catch(function () {
          if (boardList) {
            boardList.textContent = '';
            var p = document.createElement('p');
            p.className = 'board__empty';
            p.textContent = glang === 'en' ? 'Leaderboard unavailable' : 'Рейтинг недоступен';
            boardList.appendChild(p);
          }
        });
    }

    function saveScore(name, sc) {
      fetch(FB + '/leaderboard.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, score: sc, ts: Date.now() })
      }).then(loadBoard).catch(function () {});
    }

    window.__pmRunner = {
      setLang: function (l) {
        glang = l;
        if (state === 'idle' && speedEl) {
          speedEl.textContent = l === 'en' ? 'Speed: normal' : 'Скорость: нормальная';
        }
      }
    };

    fit();
    var fitTimer;
    window.addEventListener('resize', function () {
      clearTimeout(fitTimer);
      fitTimer = setTimeout(function () {
        fit();
        if (player) player.y = Math.min(player.y, GROUND);
      }, 150);
    });

    reset();
    state = 'idle';
    overlay.hidden = false;
    rafId = requestAnimationFrame(loop);
    loadBoard();
    // Refresh only while the tab is visible — no pointless background traffic.
    setInterval(function () { if (!document.hidden) loadBoard(); }, 30000);
  })();
})();
