/* PM Runner — loaded only on demand; no animation while idle or off-screen. */
(() => {
  'use strict';
  const root = document.documentElement;
  const glang = root.lang;
  const en = glang === 'en';
  const tr = (ru, eng) => en ? eng : ru;
  const canvas = document.getElementById('g-canvas');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  const details = document.getElementById('game-details');
  const overlay = document.getElementById('g-overlay');
  const scoreEl = document.getElementById('g-score');
  const hiEl = document.getElementById('g-hi');
  const speedEl = document.getElementById('g-speed');
  const pauseBtn = document.getElementById('g-pause');
  const boardList = document.getElementById('lb-list');
  const statusEl = document.getElementById('g-status');
  const FB = 'https://mserdyuk-site-default-rtdb.europe-west1.firebasedatabase.app';
  let W=700, H=200, GROUND=156, state='idle', rafId=0, lastFrame=0, accumulator=0;
  let score=0, hi=0, speed=5.2, t=0, jumps=0, player, obstacles=[], coffees=[];
  let nextObstacle=70, nextCoffee=130, lastBoard=0, boardLoading=false;
  let palette;
  try { hi = Math.max(0, Number(localStorage.getItem('pmrunner-hi')) || 0); } catch (_) {}
  hiEl.textContent=String(hi);
  const OBSTACLES=[
    {ru:'БАГ',en:'BUG',w:32,h:28,kind:'bug'},
    {ru:'ДЕДЛАЙН',en:'DEADLINE',w:30,h:38,kind:'deadline'},
    {ru:'СТЕЙКХОЛДЕР',en:'STAKEHOLDER',w:26,h:46,kind:'stakeholder'}
  ];
  function colors() {
    const s=getComputedStyle(root);
    const value=(key,fallback)=>s.getPropertyValue(key).trim()||fallback;
    palette={ink:value('--ink','#eee'),accent:value('--accent','#ef916d'),bg:value('--sunken','#171815'),muted:value('--muted','#a9aaa1'),faint:value('--line','#363831')};
  }
  function fit() {
    const dpr=Math.min(window.devicePixelRatio||1,2);
    W=Math.max(240,Math.round(canvas.clientWidth)||700);
    canvas.width=Math.round(W*dpr); canvas.height=Math.round(H*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    if(player) player.x=Math.min(66,W*.18);
    colors();draw();
  }
  function reset() {
    score=0;speed=5.2;t=0;jumps=0;nextObstacle=70;nextCoffee=130;
    player={x:Math.min(66,W*.18),y:GROUND,vy:0};obstacles=[];coffees=[];
    scoreEl.textContent='0';speedEl.textContent=tr('Скорость: нормальная','Speed: normal');
  }
  function jump() {
    if(state!=='running'||jumps>=2)return;
    player.vy=jumps===0?-12.4:-10.6;jumps++;
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


  function overlaps(ax,ay,aw,ah,bx,by,bw,bh){return ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;}
  function draw() {
    if(!palette)return;
    ctx.clearRect(0,0,W,H);drawGround(palette.ink,palette.faint);
    obstacles.forEach(o=>drawObstacle(o,palette));coffees.forEach(c=>drawCoffee(c,palette));
    if(player)drawPlayer(palette.ink,palette.accent);
  }
  function update() {
    t++;score+=1/3;speed=5.2+Math.min(score/87,6.5);
    player.vy+=.66;player.y+=player.vy;
    if(player.y>=GROUND){player.y=GROUND;player.vy=0;jumps=0;}
    if(--nextObstacle<=0){
      const spec=OBSTACLES[Math.floor(Math.random()*OBSTACLES.length)];
      obstacles.push({...spec,x:W+20});nextObstacle=Math.ceil((260+Math.random()*160)/speed);
    }
    if(--nextCoffee<=0){coffees.push({x:W+20,y:GROUND-46-Math.random()*26});nextCoffee=110+Math.random()*150;}
    obstacles.forEach(o=>o.x-=speed);coffees.forEach(c=>c.x-=speed);
    obstacles=obstacles.filter(o=>o.x+o.w>-20);coffees=coffees.filter(c=>c.x>-30);
    const collision=obstacles.find(o=>overlaps(player.x-8,player.y-36,16,36,o.x+3,GROUND-o.h,o.w-6,o.h));
    if(collision){endGame(collision);return;}
    coffees=coffees.filter(c=>{if(overlaps(player.x-8,player.y-36,16,36,c.x,c.y-16,18,16)){score+=10;return false;}return true;});
    scoreEl.textContent=String(Math.floor(score));
    speedEl.textContent=speed>9?tr('Скорость: аврал','Speed: crunch'):tr('Скорость: нормальная','Speed: normal');
  }
  function loop(now) {
    if(state!=='running')return;
    if(!lastFrame)lastFrame=now;
    accumulator+=Math.min(now-lastFrame,80);lastFrame=now;
    while(accumulator>=1000/60&&state==='running'){update();accumulator-=1000/60;}
    draw();if(state==='running')rafId=requestAnimationFrame(loop);
  }
  function run(){lastFrame=0;accumulator=0;cancelAnimationFrame(rafId);rafId=requestAnimationFrame(loop);}
  function start(){fit();reset();state='running';overlay.hidden=true;pauseBtn.hidden=false;pauseBtn.textContent=tr('Пауза','Pause');statusEl.textContent='';canvas.focus({preventScroll:true});run();}
  function resume(){if(!details.open||document.hidden)return;state='running';overlay.hidden=true;pauseBtn.hidden=false;canvas.focus({preventScroll:true});run();}
  function button(text,fn,primary=true){const b=document.createElement('button');b.type='button';b.className='button'+(primary?' primary':'');b.textContent=text;b.addEventListener('click',fn);return b;}
  function pause(){
    if(state!=='running')return;
    state='paused';cancelAnimationFrame(rafId);pauseBtn.hidden=true;overlay.replaceChildren();
    const title=document.createElement('p');title.className='game__title';title.textContent=tr('Пауза','Paused');
    const resumeBtn=button(tr('Продолжить','Resume'),resume);
    overlay.append(title,resumeBtn);overlay.hidden=false;draw();
    if(details.open&&!document.hidden&&canvas.getBoundingClientRect().bottom>0)resumeBtn.focus({preventScroll:true});
  }
  function endGame(o){
    state='dead';cancelAnimationFrame(rafId);pauseBtn.hidden=true;
    const final=Math.floor(score);scoreEl.textContent=String(final);
    if(final>hi){hi=final;try{localStorage.setItem('pmrunner-hi',String(hi));}catch(_){}}
    hiEl.textContent=String(hi);overlay.replaceChildren();
    const title=document.createElement('p');title.className='game__title';title.textContent=tr('Спринт завершён','Sprint complete');
    const desc=document.createElement('p');desc.className='game__desc';desc.textContent=tr('Тебя снёс ','Taken out by ')+(en?o.en:o.ru)+' · '+tr('Очки: ','Score: ')+final;
    const row=document.createElement('div');row.className='game__row';
    const input=document.createElement('input');input.type='text';input.maxLength=20;input.autocomplete='nickname';input.placeholder=tr('Публичный ник','Public nickname');input.setAttribute('aria-label',tr('Публичный ник в рейтинге','Public nickname on the leaderboard'));
    const save=button(tr('В рейтинг','Post score'),async()=>{
      const name=input.value.trim().slice(0,20);if(!name){input.focus();return;}
      save.disabled=true;save.textContent=tr('Сохраняю…','Saving…');statusEl.textContent='';
      try{
        const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),8000);
        let response;
        try{response=await fetch(FB+'/leaderboard.json',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,score:final,ts:Date.now()}),signal:controller.signal});}finally{clearTimeout(timeout);}
        if(!response.ok)throw new Error('Save failed');
        save.textContent=tr('Сохранено','Saved');input.disabled=true;statusEl.textContent=tr('Результат опубликован в рейтинге.','Your score is now on the leaderboard.');loadBoard(true);
      }catch(_){save.disabled=false;save.textContent=tr('Повторить','Retry');statusEl.textContent=tr('Не удалось подтвердить сохранение. Проверь рейтинг перед повтором.','Could not confirm the save. Check the leaderboard before retrying.');}
    },false);
    input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();save.click();}});
    row.append(input,save);const again=button(tr('Новый спринт','New sprint'),start);
    overlay.append(title,desc,row,again);overlay.hidden=false;statusEl.textContent=tr('Спринт завершён. Очки: ','Sprint complete. Score: ')+final;again.focus({preventScroll:true});draw();
  }
  function renderBoard(entries){
    boardList.replaceChildren();
    if(!entries.length){const p=document.createElement('p');p.className='board__empty';p.textContent=tr('Пока пусто','No scores yet');boardList.append(p);return;}
    entries.forEach((entry,i)=>{
      const row=document.createElement('div');row.className='board__row'+(i<3?' top':'');
      [['board__rank',i+1],['board__name',entry.name],['board__score',entry.score]].forEach(([cls,text])=>{const el=document.createElement('span');el.className=cls;el.textContent=String(text);row.append(el);});boardList.append(row);
    });
  }
  async function loadBoard(force=false){
    if(boardLoading||(!force&&Date.now()-lastBoard<30000))return;
    boardLoading=true;lastBoard=Date.now();
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),8000);
    try{
      const r=await fetch(FB+'/leaderboard.json',{signal:controller.signal});if(!r.ok)throw new Error('Leaderboard unavailable');
      const data=await r.json();const best=new Map();
      if(data&&typeof data==='object')Object.values(data).forEach(e=>{
        if(!e||typeof e.name!=='string'||!Number.isSafeInteger(e.score)||e.score<0)return;
        const name=e.name.trim().slice(0,20),key=name.toLocaleLowerCase();
        if(name&&(!best.has(key)||best.get(key).score<e.score))best.set(key,{name,score:e.score});
      });
      renderBoard([...best.values()].sort((a,b)=>b.score-a.score).slice(0,10));
    }catch(_){boardList.replaceChildren();const p=document.createElement('p');p.className='board__empty';p.textContent=tr('Рейтинг недоступен. Игра работает без него.','Leaderboard unavailable. You can still play.');boardList.append(p);}
    finally{clearTimeout(timeout);boardLoading=false;}
  }
  document.getElementById('g-start').addEventListener('click',start);
  pauseBtn.addEventListener('click',pause);
  canvas.addEventListener('pointerdown',e=>{if(state==='running'){e.preventDefault();canvas.focus({preventScroll:true});jump();}});
  canvas.addEventListener('keydown',e=>{
    if(e.key==='Escape'){e.preventDefault();pause();return;}
    if((e.code==='Space'||e.code==='ArrowUp')&&state==='running'){e.preventDefault();if(!e.repeat)jump();}
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  details.addEventListener('toggle',()=>{if(!details.open)pause();else{fit();loadBoard();}});
  window.addEventListener('themechange',()=>{colors();if(state!=='running')draw();});
  let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(state==='running')pause();if(details.open)fit();},100);});
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)pause();},{threshold:0}).observe(canvas);
  window.__pmRunner=Object.freeze({pause});
  reset();fit();loadBoard();
})();
