const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('assets/orbit.js', 'utf8');

function setup({width = 500, observers = true, context = true} = {}) {
  const callbacks = new Map(), pending = new Map();
  let next = 0, writes = 0, paints = 0, resize, intersect;
  const element = () => ({
    style: {getPropertyValue: () => '#ff654f'},
    classList: {toggle() {}},
    setAttribute(name, value) { this[name] = value; },
    removeAttribute(name) { delete this[name]; },
    addEventListener(name, fn) { callbacks.set(this.id + ':' + name, fn); }
  });
  const viewport = {...element(), clientWidth: width};
  const ctx = new Proxy({}, {get: (_, key) => key === 'createRadialGradient'
    ? () => ({addColorStop() {}})
    : () => { if (key === 'clearRect') paints++; }});
  const canvas = {...element(), id: 'canvas', parentElement: viewport, getContext: () => context ? ctx : null};
  for (const [key, initial] of [['width', 300], ['height', 150]]) {
    let value = initial;
    Object.defineProperty(canvas, key, {get: () => value, set: v => {value = v; writes++;}});
  }
  const cards = Array.from({length: 6}, (_, i) => ({...element(),
    getBoundingClientRect: () => ({top: 1000 + i * 800, height: 800}),
    querySelector: () => ({textContent: 'Company ' + i})
  }));
  const logos = cards.map(() => element()), tabs = cards.map(() => element());
  const root = {...element(), lang: 'ru', dataset: {theme: 'dark'}};
  const document = {
    documentElement: root, hidden: false,
    getElementById: id => ({'orbit-canvas': canvas, 'orbit-land': {textContent: fs.readFileSync('assets/data/land.json', 'utf8')}, 'motion-toggle': {...element(), id: 'motion'}, 'orbit-name': {}}[id]),
    querySelector: () => ({}),
    querySelectorAll: selector => ({'.experience-card': cards, '.planet-logo': logos, '.company-tab': tabs}[selector]),
    addEventListener: (name, fn) => callbacks.set('document:' + name, fn)
  };
  const env = {
    document, devicePixelRatio: 2, innerHeight: 900,
    matchMedia: () => ({matches: false, addEventListener() {}}),
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
    emit: (target, name) => callbacks.get(target + ':' + name)({preventDefault() {throw Error('Do not cancel Canvas 2D automatic recovery');}}),
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
