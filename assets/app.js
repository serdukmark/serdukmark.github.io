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
    if (color) color.content = light ? '#f4f1e9' : '#111210';
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
  const calculator = document.querySelector('.calculator');
  let calcTracked = false;
  const num = new Intl.NumberFormat(en ? 'en-US' : 'ru-RU', { maximumFractionDigits: 1 });
  if (calculator) {
    const fields = ['people', 'minutes', 'cost', 'adoption'].map(key => document.getElementById(key));
    let announceTimer;
    function calculate(immediate = false) {
      const [people, minutes, cost, adoption] = fields.map(field => Number(field.value));
      fields.forEach(field => { document.getElementById(field.id + '-value').textContent = num.format(Number(field.value)); });
      const hours = people * minutes / 60 * 240 * adoption / 100;
      const value = hours * cost;
      clearTimeout(announceTimer);
      const render = () => {
        const result = document.getElementById('calc-result');
        const millions = value >= 1000000;
        result.replaceChildren(document.createTextNode(num.format(value / (millions ? 1000000 : 1000)) + ' '));
        const unit = document.createElement('small'); unit.textContent = millions ? tr('млн ₽', 'M RUB') : tr('тыс. ₽', 'K RUB'); result.append(unit);
        document.getElementById('calc-hours').textContent = num.format(hours) + tr(' часов в год', ' hours per year');
      };
      if (immediate) render(); else announceTimer = setTimeout(render, 130);
    }
    fields.forEach(field => field.addEventListener('input', () => {
      calculate();
      if (!calcTracked) { track('calculator_use'); calcTracked = true; }
    }));
    calculate(true);
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
