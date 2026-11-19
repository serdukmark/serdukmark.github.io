const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('assets/orbit.js', 'utf8');

function setup({width = 500, observers = true, context = true, mobile = false} = {}) {
  const callbacks = new Map(), pending = new Map();
  let next = 0, writes = 0, paints = 0, resize, intersect, scrolled = -1;
  const classes = new Set();
  const layoutRect = {top: 100, bottom: 5000};
  const element = () => ({
    style: {getPropertyValue: () => '#ff654f'},
    classList: {toggle(name, on) {if(on)classes.add(name);else classes.delete(name);}, remove(name) {classes.delete(name);}},
    setAttribute(name, value) { this[name] = value; },
    removeAttribute(name) { delete this[name]; },
    addEventListener(name, fn) { callbacks.set(this.id + ':' + name, fn); }
  });
  const viewport = {...element(), clientWidth: width};
  const ctx = new Proxy({}, {get: (_, key) => key === 'createRadialGradient'
    ? () => ({addColorStop() {}})
    : () => { if (key === 'clearRect') paints++; }});
  const canvas = {...element(), id: 'canvas', parentElement: viewport, getContext: () => context ? ctx : null};
  canvas.setPointerCapture = () => {};
  canvas.hasPointerCapture = () => false;
  for (const [key, initial] of [['width', 300], ['height', 150]]) {
    let value = initial;
    Object.defineProperty(canvas, key, {get: () => value, set: v => {value = v; writes++;}});
  }
  const cards = Array.from({length: 6}, (_, i) => ({...element(),
    getBoundingClientRect: () => ({top: 1000 + i * 800, height: 800}),
    scrollIntoView: () => {scrolled = i;},
    querySelector: () => ({textContent: 'Company ' + i})
  }));
  const logos = cards.map(() => element()), tabs = cards.map(() => element());
  const root = {...element(), lang: 'ru', dataset: {theme: 'dark'}};
  const steps = [-1, 1].map(n => ({...element(), id: 'step' + n, dataset: {orbitStep: String(n)}}));
  const document = {
    documentElement: root, hidden: false,
    getElementById: id => ({'orbit-canvas': canvas, 'orbit-land': {textContent: fs.readFileSync('assets/data/land.json', 'utf8')}, 'motion-toggle': {...element(), id: 'motion'}, 'orbit-name': {}}[id]),
    querySelector: selector => selector === '.experience-layout' ? {getBoundingClientRect: () => layoutRect} : selector === '.orbit-sticky' ? {getBoundingClientRect: () => ({height: 201})} : {},
    querySelectorAll: selector => ({'.experience-card': cards, '.planet-logo': logos, '.company-tab': tabs, '[data-orbit-step]': steps}[selector]),
    addEventListener: (name, fn) => callbacks.set('document:' + name, fn)
  };
  const env = {
    document, devicePixelRatio: 2, innerHeight: 900,
    matchMedia: query => ({matches: mobile && query.includes('max-width'), addEventListener() {}}),
    getComputedStyle: () => ({getPropertyValue: () => ''}), // delayed stylesheet
    requestAnimationFrame: fn => {pending.set(++next, fn); return next;},
    cancelAnimationFrame: id => pending.delete(id),
    addEventListener: (name, fn) => callbacks.set('window:' + name, fn)
  };
  env.window = env;
  if (observers) {
    env.ResizeObserver = class {constructor(fn) {resize = fn;} observe() {}};
    env.IntersectionObserver = class {constructor(fn) {intersect = fn;} observe() {}};
  }
  vm.runInNewContext(source, env);
  return {canvas, viewport, document, logos,
    ready: () => Object.hasOwn(viewport, 'data-orbit-ready'),
    writes: () => writes, paints: () => paints,
    emit: (target, name, event = {}) => callbacks.get(target + ':' + name)({preventDefault() {throw Error('Do not cancel Canvas 2D automatic recovery');}, ...event}),
    flush: () => {const work=[...pending];pending.clear();for(const [, fn] of work)fn(16);},
    classes, layoutRect, scrolled: () => scrolled,
    resize: () => resize(), intersect: value => intersect([{isIntersecting: value}])
  };
}

const cold = setup({observers: false});
assert(cold.ready(), 'cold start paints without observers or preloaded CSS');
assert(cold.paints() > 0);
assert.equal(new Set(cold.logos.map(x => x.style.transform)).size, 6);
const normal = setup();
const writes = normal.writes();
normal.resize(); normal.resize();
assert.equal(normal.writes(), writes, 'same-size observer callbacks must not clear Canvas');
normal.emit('canvas', 'contextlost');
assert.equal(normal.ready(), false, 'fallback is restored when Canvas is lost');
const paints = normal.paints();
normal.resize();
assert.equal(normal.paints(), paints, 'no painting into a lost context');
normal.emit('canvas', 'contextrestored');
assert(normal.ready());
assert(normal.paints() > paints);
const beforeRestore = normal.paints();
normal.emit('window', 'pageshow');
normal.intersect(false); normal.intersect(true);
assert(normal.paints() > beforeRestore, 'page restore and viewport entry repaint');
const hidden = setup({width: 0});
assert.equal(hidden.ready(), false);
hidden.viewport.clientWidth = 360;
hidden.resize();
assert(hidden.ready(), 'initially hidden globe initializes when measurable');
assert.equal(hidden.canvas.width, 720);
assert.equal(setup({context: false}).ready(), false, 'unavailable Canvas leaves SVG visible');
console.log('PASS: cold start, delayed CSS, missing observers, unchanged size, hidden layout, context loss/restore and page restore.');
const phone = setup({mobile: true});
assert(phone.classes.has('orbit-mobile'));
assert(phone.classes.has('orbit-dock-active'));
phone.emit('step1', 'click');
assert.equal(phone.scrolled(), 1, 'Next moves the description to the next case');
phone.emit('canvas', 'pointerdown', {pointerType:'touch', clientX:100, clientY:200, pointerId:1});
phone.emit('canvas', 'pointermove', {clientX:180, clientY:202});
phone.emit('canvas', 'pointerup', {pointerId:1});
assert.equal(phone.scrolled(), 5, 'horizontal touch rotation selects a company');
phone.emit('canvas', 'pointerdown', {pointerType:'touch', clientX:100, clientY:200, pointerId:1});
phone.emit('canvas', 'pointermove', {clientX:102, clientY:280});
phone.emit('canvas', 'pointerup', {pointerId:1});
assert.equal(phone.scrolled(), 5, 'vertical movement must not navigate cases');
phone.layoutRect.bottom = 60;
phone.emit('window', 'scroll');phone.flush();
assert(!phone.classes.has('orbit-dock-active'), 'dock disappears beyond experience');
console.log('PASS: mobile dock boundary, case navigation, horizontal touch rotation and vertical scrolling.');
