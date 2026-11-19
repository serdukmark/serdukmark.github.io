(() => {
'use strict';
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const cards = [...document.querySelectorAll('.experience-card')];
const logos = [...document.querySelectorAll('.planet-logo')];
if (!cards.length) return;
const dialog = document.createElement('dialog');
dialog.className = 'case-portal';
dialog.setAttribute('aria-labelledby', 'portal-title');
dialog.innerHTML = `<canvas class="portal-dust" aria-hidden="true"></canvas><div class="portal-shell"><header class="portal-bar"><button class="portal-back">Close case</button><span>INSIDE THE PROJECT</span><button class="portal-theme" aria-label="Switch theme">◐</button></header><nav class="portal-companies" aria-label="Other projects"></nav><div class="portal-content"></div><footer class="portal-footer"><span>From challenge to outcome · my contribution</span><button class="portal-next">Next project</button></footer></div>`;
document.body.append(dialog);
let selected = 0, opener, frame, lensFrame = 0, closing = false;
const escape = text => text.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nav = dialog.querySelector('.portal-companies');
cards.forEach((card, i) => {
 const b = document.createElement('button'); b.textContent = card.querySelector('h3').textContent;
 b.addEventListener('click', () => render(i)); nav.append(b);
});
function render(i) {
 cancelAnimationFrame(lensFrame);lensFrame=0;
 selected = i; const c = cards[i];
 dialog.style.setProperty('--case-color', c.style.getPropertyValue('--company'));
 [...nav.children].forEach((b,n) => {b.setAttribute('aria-pressed',String(n===i));});
 const title = c.querySelector('h4').textContent;
 const summary = c.querySelector('.case-summary').textContent;
 const bullets = [...c.querySelectorAll('li')].map(x=>x.textContent);
 const metrics = c.querySelector('.case-metrics').innerHTML;
 const company = c.querySelector('h3').textContent;
 const stages = [['AI assistant','Training','Knowledge base'],['Value','Requirements','Economics'],['Impact assessment','Methodology','Initiatives'],['Interviews','Partner pipeline','Landing page'],['Field research','User journey','Proposals'],['Team','Experts','Presenting results']][i];
 dialog.querySelector('.portal-content').innerHTML = `<div class="portal-intro"><div class="portal-company">${c.querySelector('.company-icon').innerHTML}<span>${escape(company)}</span></div><h2 id="portal-title">${escape(title)}</h2><p>${escape(summary)}</p></div><div class="xray-toolbar"><div><span class="eyebrow">PROJECT X-RAY</span><p>Move the lens to explore the work behind the result.</p></div><button class="xray-toggle" aria-pressed="false">Look inside</button></div><div class="xray-stage" tabindex="0" aria-label="Project X-ray. Use the Look inside button to read the entire layer."><div class="xray-surface"><span class="surface-label">ON THE SURFACE</span><div class="result-object"><span class="object-orbit"></span><div class="result-emblem">${c.querySelector('.company-icon').innerHTML}</div></div><div class="xray-metrics">${metrics}</div><span class="surface-caption">${escape(company)} · ${escape(c.querySelector('.eyebrow').textContent)}</span></div><div class="xray-inside" aria-hidden="true"><span class="surface-label">BELOW THE SURFACE · MY WORK</span><div class="process-grid">${bullets.map((b,n)=>`<article><span class="process-node">${stages[n] || 'Develop'}</span><p>${escape(b)}</p></article>`).join('')}</div><span class="surface-caption">Illustrative diagram · not an internal system interface</span></div><div class="lens-ring" aria-hidden="true"><span>INSIDE</span></div></div><a class="portal-detail" href="${c.querySelector('.case-link').getAttribute('href')}">Read the full case</a>`;
 const stage = dialog.querySelector('.xray-stage'), inside = dialog.querySelector('.xray-inside'), toggle = dialog.querySelector('.xray-toggle');
 let pointerX=0,pointerY=0;
 const point = e => {
  pointerX=e.clientX;pointerY=e.clientY;
  if(lensFrame)return;
  lensFrame=requestAnimationFrame(()=>{
   lensFrame=0;
   const r=stage.getBoundingClientRect();
   stage.style.setProperty('--lx',`${pointerX-r.left-stage.clientLeft}px`);
   stage.style.setProperty('--ly',`${pointerY-r.top-stage.clientTop}px`);
   stage.classList.add('has-pointer');
  });
 };
 stage.addEventListener('pointermove',point);
 stage.addEventListener('pointerdown',point);
 stage.addEventListener('pointerleave',()=>{cancelAnimationFrame(lensFrame);lensFrame=0;stage.classList.remove('has-pointer');});
 toggle.addEventListener('click',()=>{const all=stage.classList.toggle('show-inside');toggle.setAttribute('aria-pressed',String(all));toggle.textContent=all?'Back to result':'Look inside';inside.setAttribute('aria-hidden',String(!all));});
 dialog.querySelector('.portal-content').animate([{opacity:.4,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:reduced.matches?0:350});
}
function particles(origin, reverse=false) {
 cancelAnimationFrame(frame);
 const canvas=dialog.querySelector('canvas'), ctx=canvas.getContext('2d'), w=innerWidth, h=innerHeight;
 const dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;ctx.scale(dpr,dpr);
 const r=origin || {x:w*.3,y:h*.5,r:180};
 const pts=Array.from({length:420},(_,i)=>{const y=1-2*(i+.5)/420,a=i*2.39996,rad=Math.sqrt(1-y*y);return {x:r.x+Math.cos(a)*rad*r.r,y:r.y+y*r.r,tx:(i%28)/27*w,ty:Math.floor(i/28)/14*h};});
 const start=performance.now();
 function draw(now){let p=Math.min(1,(now-start)/950);if(reverse)p=1-p;const ease=1-Math.pow(1-p,3);ctx.clearRect(0,0,w,h);ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--accent');ctx.globalAlpha=.5*(1-p)+.05;for(const v of pts){ctx.beginPath();ctx.arc(v.x+(v.tx-v.x)*ease,v.y+(v.ty-v.y)*ease,1.5,0,7);ctx.fill();}if(now-start<950)frame=requestAnimationFrame(draw);}
 if(!reduced.matches)frame=requestAnimationFrame(draw);
}
function open(i, source){
 if(dialog.open)return;opener=source;render(i);
 const r=source.getBoundingClientRect();const orb=document.querySelector('#orbit-canvas').getBoundingClientRect();
 dialog.showModal();document.body.classList.add('portal-open');
 dialog.style.setProperty('--origin-x',`${r.x+r.width/2}px`);dialog.style.setProperty('--origin-y',`${r.y+r.height/2}px`);
 dialog.animate([{clipPath:`circle(20px at ${r.x+r.width/2}px ${r.y+r.height/2}px)`},{clipPath:`circle(150vmax at ${r.x+r.width/2}px ${r.y+r.height/2}px)`}],{duration:reduced.matches?0:750,easing:'cubic-bezier(.22,1,.36,1)'});
 particles({x:orb.x+orb.width/2,y:orb.y+orb.height/2,r:orb.width*.337});
 dialog.querySelector('.portal-back').focus({preventScroll:true});
}
async function close(){if(closing)return;closing=true;cancelAnimationFrame(lensFrame);lensFrame=0;const r=opener?.getBoundingClientRect();if(!reduced.matches&&r){await dialog.animate([{clipPath:'circle(150vmax at 50% 50%)',opacity:1},{clipPath:`circle(20px at ${r.x+r.width/2}px ${r.y+r.height/2}px)`,opacity:.2}],{duration:380,easing:'ease-in',fill:'forwards'}).finished;}dialog.close();dialog.getAnimations().forEach(a=>a.cancel());document.body.classList.remove('portal-open');cancelAnimationFrame(frame);opener?.focus({preventScroll:true});closing=false;}
// Capture before the existing smooth-anchor navigation, preserving the globe's position.
document.addEventListener('click',e=>{const el=e.target.closest('.planet-logo, .company-tab');if(!el)return;e.preventDefault();e.stopImmediatePropagation();open(Number(el.dataset.orbit??el.dataset.company),el);},true);
dialog.querySelector('.portal-back').addEventListener('click',close);
dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
dialog.querySelector('.portal-next').addEventListener('click',()=>{render((selected+1)%cards.length);dialog.scrollTop=0;});
dialog.querySelector('.portal-theme').addEventListener('click',()=>document.querySelector('.theme-toggle').click());
document.querySelector('.orbit-hint').textContent='Select a company to explore the project';
cards.forEach((c,i)=>{const b=document.createElement('button');b.className='portal-entry';b.textContent='Explore inside';b.addEventListener('click',()=>open(i,b));c.querySelector('.case-link').before(b);});
// A real, soft-edged flashlight over the original results, not a duplicate text layer.
const band=document.querySelector('.impact-band');
const controls=document.createElement('div');controls.className='flash-controls wrap';controls.innerHTML='<span>Take a closer look at the results</span><button aria-pressed="false">Reveal all</button>';
band.prepend(controls);band.classList.add('flashlight-band');
const shade=document.createElement('div');shade.className='flash-shade';shade.setAttribute('aria-hidden','true');band.append(shade);
const hint=document.createElement('span');hint.className='flash-hint';hint.textContent='Move your cursor · explore the results';hint.setAttribute('aria-hidden','true');band.append(hint);
function flash(e){const r=band.getBoundingClientRect();band.style.setProperty('--fx',`${e.clientX-r.left}px`);band.style.setProperty('--fy',`${e.clientY-r.top}px`);band.classList.add('flash-active');}
band.addEventListener('pointermove',flash);band.addEventListener('pointerdown',flash);band.addEventListener('pointerleave',()=>band.classList.remove('flash-active'));
controls.querySelector('button').addEventListener('click',e=>{const all=band.classList.toggle('flash-all');e.currentTarget.setAttribute('aria-pressed',String(all));e.currentTarget.textContent=all?'Use flashlight':'Reveal all';});
})();
