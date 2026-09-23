const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const source=readFileSync(join(__dirname,'../assets/game.js'),'utf8');
function setup(){
  class Element {
    constructor(tag='div'){this.tagName=tag;this.children=[];this.textContent='';this.hidden=false;this.events={};this.value='';this.open=true;this.clientWidth=700;this.attrs={};}
    append(...children){this.children.push(...children);}
    replaceChildren(...children){this.children=children;this.textContent='';}
    setAttribute(k,v){this.attrs[k]=v;}
    addEventListener(type,fn){this.events[type]=fn;}
    focus(){}
    getBoundingClientRect(){return {bottom:200};}
    click(){return this.events.click?.({preventDefault(){}});}
  }
  const ids=Object.fromEntries(['g-canvas','game-details','g-overlay','g-score','g-hi','g-speed','g-pause','lb-list','g-status','g-start'].map(id=>[id,new Element()]));
  const ctx=new Proxy({}, {get:()=>()=>{},set:()=>true});ids['g-canvas'].getContext=()=>ctx;
  const events={},docEvents={},frames=new Map();let frameID=0,postOk=true;const posts=[];
  const document={documentElement:{lang:'en'},hidden:false,getElementById:id=>ids[id],createElement:tag=>new Element(tag),addEventListener:(k,f)=>docEvents[k]=f};
  const window={devicePixelRatio:1,addEventListener:(k,f)=>events[k]=f};
  const context={document,window,console,Map,Number,Math,Date,AbortController,setTimeout,clearTimeout,
    localStorage:{getItem:()=>null,setItem(){}},getComputedStyle:()=>({getPropertyValue:()=>''}),
    requestAnimationFrame:fn=>{frames.set(++frameID,fn);return frameID;},cancelAnimationFrame:id=>frames.delete(id),
    fetch:async(url,opts={})=>{if(opts.method==='POST'){posts.push(JSON.parse(opts.body));return {ok:postOk};}return {ok:true,json:async()=>({a:{name:'Test',score:100},b:{name:'test',score:120}})}}
  };
  vm.runInNewContext(source,context);
  function tick(now){const batch=[...frames.values()];frames.clear();batch.forEach(fn=>fn(now));}
  return {ids,frames,document,window,docEvents,tick,posts,failPost:()=>postOk=false,allowPost:()=>postOk=true};
}
(async()=>{
  const a=setup();assert.equal(a.frames.size,0,'Idle game must not animate');
  await a.ids['g-start'].click();assert.equal(a.frames.size,1);
  a.tick(100);a.tick(117);a.window.__pmRunner.pause();assert.equal(a.frames.size,0,'Pause must cancel animation');
  assert.equal(a.ids['g-overlay'].children[0].textContent,'Paused');
  await a.ids['g-overlay'].children[1].click();a.document.hidden=true;a.docEvents.visibilitychange();assert.equal(a.frames.size,0,'Hidden document must stop game');
  const scoreAt=(hz)=>{const s=setup();s.ids['g-start'].click();for(let n=0;n<=hz;n++)s.tick(100+n*1000/hz);return Number(s.ids['g-score'].textContent);};
  assert.ok(Math.abs(scoreAt(60)-scoreAt(120))<=1,'Refresh rate must not change game speed');
  const s=setup();s.ids['g-start'].click();for(let n=0;n<500&&s.frames.size;n++)s.tick(100+n*1000/60);
  assert.equal(s.frames.size,0,'Game over must stop animation');
  const row=s.ids['g-overlay'].children[2],input=row.children[0],save=row.children[1];
  input.value='Player';s.failPost();await save.click();
  assert.equal(save.disabled,false,'Failed save must allow retry');assert.equal(save.textContent,'Retry');
  assert.ok(s.ids['g-status'].textContent.includes('Could not confirm'));
  s.allowPost();await save.click();assert.equal(save.textContent,'Saved');assert.equal(input.disabled,true);
  assert.equal(s.posts.length,2);assert.equal(s.posts[1].name,'Player');assert.ok(Number.isSafeInteger(s.posts[1].score));
  await Promise.resolve();await Promise.resolve();
  console.log('PASS: idle/hidden/pause lifecycle, refresh-rate independence, failed-save retry and confirmed-save UI. No live writes.');
})().catch(err=>{console.error(err);process.exitCode=1;});
