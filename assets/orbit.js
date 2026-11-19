/* Experience orbit. Local Canvas renderer; HTML case studies remain usable without it. */
(() => {
  'use strict';
  const canvas = document.getElementById('orbit-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const root = document.documentElement;
  const en = root.lang === 'en';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const cards = [...document.querySelectorAll('.experience-card')];
  const links = [...document.querySelectorAll('.planet-logo')];
  const tabs = [...document.querySelectorAll('.company-tab')];
  const motion = document.getElementById('motion-toggle');
  const TAU = Math.PI * 2;
  let land = [], size = 500, yaw = .65, target = .65, active = -1;
  let visible = true, paused = false, raf = 0, scrollDirty = true, previous = 0;
  let colors = {}, hovered = -1, dragging = false, dragX = 0, dragYaw = 0;
  function theme() {
    const style = getComputedStyle(root);
    colors = {ink: style.getPropertyValue('--ink').trim(), accent: style.getPropertyValue('--accent').trim(), muted: style.getPropertyValue('--muted').trim(), line: style.getPropertyValue('--line').trim(), bg: style.getPropertyValue('--bg').trim()};
    draw();
  }
  function fit() {
    size = canvas.clientWidth || 500;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = size * dpr; canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }
  function project(lon, lat, radius) {
    const a = lon + yaw, cl = Math.cos(lat);
    let x = Math.sin(a) * cl, z = Math.cos(a) * cl, y = -Math.sin(lat);
    const tilt = -.16;
    return {x: size / 2 + (x * Math.cos(tilt) - y * Math.sin(tilt)) * radius,
      y: size / 2 + (x * Math.sin(tilt) + y * Math.cos(tilt)) * radius, z};
  }
  function path(points, color, alpha, width=1) {
    ctx.beginPath(); let started = false;
    points.forEach(p => { if (p.z < -.05) { started = false; return; } if (!started) {ctx.moveTo(p.x,p.y); started = true;} else ctx.lineTo(p.x,p.y); });
    ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
  }
  function draw() {
    if (!colors.accent || !size) return;
    ctx.clearRect(0,0,size,size);
    const r = size * .337, cx=size/2, cy=size/2;
    // Quiet technical frame around a geographically recognisable point cloud.
    ctx.globalAlpha=.45; ctx.strokeStyle=colors.line;ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(cx,cy,r*1.26,0,TAU);ctx.stroke();
    ctx.setLineDash([2,8]);ctx.beginPath();ctx.arc(cx,cy,r*1.34,0,TAU);ctx.stroke();ctx.setLineDash([]);
    ctx.globalAlpha=.14;
    ctx.beginPath();ctx.moveTo(cx-r*1.5,cy);ctx.lineTo(cx+r*1.5,cy);ctx.moveTo(cx,cy-r*1.4);ctx.lineTo(cx,cy+r*1.4);ctx.stroke();
    const glow=ctx.createRadialGradient(cx-r*.35,cy-r*.4,r*.1,cx,cy,r);
    glow.addColorStop(0,root.dataset.theme==='light'?'#dce7c8':'#1b2b20');glow.addColorStop(1,colors.bg);
    ctx.globalAlpha=1;ctx.fillStyle=glow;ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.fill();
    for(let lat=-60;lat<=60;lat+=30){const points=[];for(let i=0;i<=96;i++)points.push(project(i/96*TAU,lat*Math.PI/180,r));path(points,colors.accent,.13);}
    for(let lon=0;lon<360;lon+=30){const points=[];for(let i=0;i<=48;i++)points.push(project(lon*Math.PI/180,-Math.PI/2+i/48*Math.PI,r));path(points,colors.accent,.13);}
    for(const [lon,lat] of land){const p=project(lon*Math.PI/180,lat*Math.PI/180,r);if(p.z<0)continue;ctx.globalAlpha=.22+p.z*.68;ctx.fillStyle=colors.accent;ctx.beginPath();ctx.arc(p.x,p.y,Math.max(.7,size/430)*(0.65+p.z*.55),0,TAU);ctx.fill();}
    ctx.globalAlpha=.5;ctx.strokeStyle=colors.accent;ctx.lineWidth=.65;ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.stroke();
    ctx.globalAlpha=.55;ctx.strokeStyle=colors.line;ctx.beginPath();ctx.ellipse(cx,cy,r*1.25,r*.49,-.25,0,TAU);ctx.stroke();
    links.forEach((el,i)=>{
      const a=i*TAU/links.length+yaw, rx=Math.sin(a)*r*1.24, ry=Math.cos(a)*r*.49;
      const x=cx+rx*Math.cos(-.25)-ry*Math.sin(-.25), y=cy+rx*Math.sin(-.25)+ry*Math.cos(-.25);
      const z=Math.cos(a), scale=.78+(z+1)*.13;
      el.style.transform=`translate(${x-cx}px,${y-cy}px) translate(-50%,-50%) scale(${scale})`;
      el.style.zIndex=String(Math.round((z+1)*10)+2);
      el.style.opacity=String(i===active||i===hovered?1:.5+(z+1)*.23);
      if(i===active){ctx.globalAlpha=.5;ctx.strokeStyle=el.style.getPropertyValue('--company');ctx.setLineDash([3,5]);ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;ctx.fillStyle=colors.accent;ctx.beginPath();ctx.arc(cx,cy,3,0,TAU);ctx.fill();}
    });ctx.globalAlpha=1;
  }
  function select(i) {
    if(i===active)return;
    active=i; links.forEach((el,n)=>{el.classList.toggle('active',n===i); if(n===i)el.setAttribute('aria-current','true');else el.removeAttribute('aria-current');});
    cards.forEach((el,n)=>el.classList.toggle('is-current',n===i));
    tabs.forEach((el,n)=>{el.classList.toggle('active',n===i);if(n===i)el.setAttribute('aria-current','true');else el.removeAttribute('aria-current');});
    document.getElementById('orbit-name').textContent=cards[i].querySelector('h3').textContent;
    document.querySelector('.orbit-index').textContent=`0${i+1} / 06`;
  }
  function scrollState() {
    let i=0;const threshold=innerHeight*.5;
    cards.forEach((el,n)=>{if(el.getBoundingClientRect().top<threshold)i=n;});
    select(i);
    const rect=cards[i].getBoundingClientRect();const progress=Math.max(0,Math.min(1,(threshold-rect.top)/Math.max(1,rect.height)));
    target=.65-(i+progress*.35)*TAU/links.length;
    if(reduced.matches||paused)yaw=target;
    scrollDirty=false;
  }
  function frame(now) {
    raf=0;if(document.hidden||!visible)return;
    if(scrollDirty && !dragging)scrollState();
    const dt=Math.min(50,now-(previous||now));previous=now;
    const delta=target-yaw;
    yaw+=delta*(1-Math.exp(-dt/180));
    draw();
    if(Math.abs(delta)>.001&&!reduced.matches&&!paused)raf=requestAnimationFrame(frame);
  }
  function wake(){if(!raf&&visible&&!document.hidden)raf=requestAnimationFrame(frame);}
  canvas.addEventListener('pointerdown', e => {
    if(e.pointerType !== 'mouse' || paused || reduced.matches) return;
    dragging = true; dragX = e.clientX; dragYaw = yaw;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', e => {
    if(!dragging)return;
    yaw = target = dragYaw + (e.clientX - dragX) / size * TAU;
    draw();
  });
  function release(e) {
    if(!dragging)return;
    dragging=false;
    if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
    const index=((Math.round((.65-yaw)/(TAU/links.length))%links.length)+links.length)%links.length;
    select(index);
    cards[index].scrollIntoView({behavior: reduced.matches ? 'instant' : 'smooth', block:'start'});
    scrollDirty=true;wake();
  }
  canvas.addEventListener('pointerup',release);
  canvas.addEventListener('pointercancel',e=>{dragging=false;scrollDirty=true;wake();});
  addEventListener('scroll',()=>{scrollDirty=true;wake();},{passive:true});
  addEventListener('resize',()=>{fit();scrollDirty=true;wake();},{passive:true});
  addEventListener('themechange',theme);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else{scrollDirty=true;previous=0;wake();}});
  motion.addEventListener('click',()=>{paused=!paused;root.dataset.motion=paused?'paused':'running';motion.setAttribute('aria-pressed',String(paused));motion.textContent=paused?(en?'Resume animation':'Включить анимацию'):(en?'Pause animation':'Приостановить анимацию');scrollDirty=true;wake();});
  reduced.addEventListener('change',()=>{scrollDirty=true;wake();});
  links.forEach((el,i)=>{el.addEventListener('mouseenter',()=>{hovered=i;wake();});el.addEventListener('mouseleave',()=>{hovered=-1;wake();});});
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){scrollDirty=true;previous=0;wake();}else{cancelAnimationFrame(raf);raf=0;}},{rootMargin:'100px'}).observe(canvas);
  new ResizeObserver(fit).observe(canvas);
  theme();fit();scrollState();wake();
  fetch('/assets/data/land.json').then(r=>{if(!r.ok)throw Error('land');return r.json();}).then(points=>{land=points;wake();}).catch(()=>{});
})();
