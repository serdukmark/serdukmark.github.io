(() => {
  'use strict';
  const root = document.documentElement;
  const en = root.lang === 'en';
  const tr = (ru, eng) => en ? eng : ru;
  const themeButton = document.querySelector('.theme-toggle');
  function syncTheme() {
    const light = root.dataset.theme === 'light';
    themeButton?.setAttribute('aria-pressed', String(light));
    themeButton?.setAttribute('aria-label', light ? tr('Включить тёмную тему', 'Switch to dark theme') : tr('Включить светлую тему', 'Switch to light theme'));
    const icon = themeButton?.querySelector('.theme-icon');
    if (icon) icon.textContent = light ? '☾' : '☀';
    const color = document.querySelector('#theme-color');
    if (color) color.content = light ? '#f6f7f2' : '#0b0e11';
    window.dispatchEvent(new Event('themechange'));
  }
  themeButton?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (_) {}
    syncTheme();
  });
  syncTheme();
  const menuButton = document.querySelector('.menu-button');
  const menu = document.querySelector('#mobile-nav');
  function closeMenu(focus = false) {
    if (!menu || !menuButton) return;
    menu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', tr('Открыть меню', 'Open menu'));
    menuButton.firstElementChild.textContent = '☰';
    if (focus) menuButton.focus();
  }
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    if (open) return closeMenu();
    menu.hidden = false;
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.setAttribute('aria-label', tr('Закрыть меню', 'Close menu'));
    menuButton.firstElementChild.textContent = '×';
  });
  menu?.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu?.hidden) closeMenu(true); });
  document.addEventListener('click', e => { if (!menu?.hidden && !e.target.closest('.site-header')) closeMenu(); });
  window.matchMedia('(min-width:701px)').addEventListener('change', e => { if (e.matches) closeMenu(); });

  const toast = document.querySelector('#toast');
  let toastTimer;
  function notify(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2800);
  }
  document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      notify(tr('Email скопирован', 'Email copied'));
    } catch (_) { notify(tr('Не удалось скопировать. Email: m.gov@internet.ru', 'Could not copy. Email: m.gov@internet.ru')); }
  }));

  // Analytics stays off until configured and never loads on local previews.
  const id = Number(window.SITE_CONFIG?.metricaId || 0);
  const production = ['mserdyuk.ru', 'www.mserdyuk.ru', 'serdukmark.github.io'].includes(location.hostname);
  const analyticsEnabled = production && Number.isSafeInteger(id) && id > 0;
  if (analyticsEnabled) {
    window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
    window.ym.l = Date.now();
    const script = document.createElement('script'); script.async = true; script.src = 'https://mc.yandex.ru/metrika/tag.js?id=' + id;
    document.head.appendChild(script);
    window.ym(id, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: true });
  }
  function track(name, data = {}) {
    if (analyticsEnabled && typeof window.ym === 'function') window.ym(id, 'reachGoal', name, { language: root.lang, ...data });
  }
  document.addEventListener('click', e => {
    const target = e.target.closest('[data-track]');
    if (target) track(target.dataset.track, target.dataset.project ? { project: target.dataset.project } : {});
  });
  const project = location.pathname.match(/\/projects\/([^/]+)\//)?.[1];
  if (project) track('case_view', { project });
  const portrait = document.querySelector('.portrait-stage');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  if (portrait && matchMedia('(pointer: fine)').matches) {
    portrait.addEventListener('pointermove', event => {
      if (reduce.matches || root.dataset.motion === 'paused') return;
      const bounds = portrait.getBoundingClientRect();
      portrait.style.setProperty('--mx', ((event.clientX - bounds.left) / bounds.width - .5) * 10 + 'px');
      portrait.style.setProperty('--my', ((event.clientY - bounds.top) / bounds.height - .5) * 10 + 'px');
    });
    portrait.addEventListener('pointerleave', () => { portrait.style.setProperty('--mx','0px'); portrait.style.setProperty('--my','0px'); });
  }
  // Download the game only after the visitor opens the easter egg.
  const game = document.getElementById('game-details');
  let gameLoading = false;
  game?.addEventListener('toggle', () => {
    if (!game.open || gameLoading || window.__pmRunner) return;
    gameLoading = true;
    const script = document.createElement('script'); script.src = document.querySelector('script[data-game-src]').dataset.gameSrc;
    script.onerror = () => { gameLoading = false; notify(tr('Игра не загрузилась. Открой её ещё раз.', 'The game did not load. Please reopen it.')); };
    document.head.appendChild(script);
    track('game_open');
  });
  let progressQueued = false;
  function updateProgress() {
    const max = document.documentElement.scrollHeight - innerHeight;
    root.style.setProperty('--page-progress', max > 0 ? String(Math.min(1, scrollY / max)) : '0');
    progressQueued = false;
  }
  addEventListener('scroll', () => { if (!progressQueued) { progressQueued = true; requestAnimationFrame(updateProgress); } }, {passive:true});
  updateProgress();
  // The selected section is a visual aid; every link remains a normal anchor.
  if ('IntersectionObserver' in window) {
    const links = [...document.querySelectorAll('.desktop-nav a')];
    const observer = new IntersectionObserver(entries => {
      const entry = entries.find(item => item.isIntersecting);
      if (!entry) return;
      links.forEach(link => { if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current'); });
    }, {rootMargin:'-15% 0px -60% 0px'});
    links.forEach(link => { const section = document.getElementById(link.hash.slice(1)); if (section) observer.observe(section); });
  }
})();
