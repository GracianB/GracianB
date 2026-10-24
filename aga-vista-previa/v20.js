// AGA V20. Public editorial simulation, not operational decision software.
(()=>{
'use strict';
const root=document.querySelector('#control-tower');
if(!root)return;
const source=root.querySelector('#tower-data');
let model;
try{model=JSON.parse(source.textContent)}catch(err){console.error('Invalid V20 scenario data',err);return}
if(!Array.isArray(model.actions)||model.actions.length!==3||!Array.isArray(model.steps)||model.steps.length!==3)return;
const cases=[...root.querySelectorAll('[data-tower-case]')];
const sliders=[...root.querySelectorAll('[data-tower-control]')];
const levels=root.querySelector('#towerStatus');
const response=root.querySelector('#towerResponse');
const parts=[...root.querySelectorAll('.tower-triage-bar i')];
const checkpoints=[...root.querySelectorAll('#towerSteps li')];
const params=new URLSearchParams(location.search);
const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number.isFinite(Number(v))?Number(v):min));
let scenario=clamp(Math.trunc(Number(params.get('case'))),0,2);
const allowed=new Set(['urgency','buffer','paper']);
for(const input of sliders){
 const k=input.dataset.towerControl;
 if(!allowed.has(k))continue;
 const pref=params.get(k[0]);if(pref!==null&&/^[0-4]$/.test(pref))input.value=pref;
}
function computeLevel(){
 const values=Object.fromEntries(sliders.map(input=>[input.dataset.towerControl,Number(input.value)]));
 const urgency=values.urgency,deficit=4-values.buffer,uncertainty=4-values.paper;
 const score=scenario===0?2*urgency+2*deficit+uncertainty:
             scenario===1?2*urgency+2*deficit+0.5*uncertainty:
             2*urgency+0.5*deficit+2*uncertainty;
 return score<=6?0:score<=13?1:2;
}
function update(){
 if(!cases.length||!sliders.length)return;
 const level=computeLevel();
 cases.forEach((button,i)=>{
  const selected=i===scenario;button.classList.toggle('is-on',selected);
  button.setAttribute('aria-pressed',String(selected));
 });
 const number=root.querySelector('.tower-number');
 if(number)number.textContent=String(scenario+1).padStart(2,'0')+' / 03';
 levels.textContent=model.labels[level];levels.dataset.level=String(level);
 response.textContent=model.actions[scenario][level];
 parts.forEach((p,i)=>p.classList.toggle('is-lit',i<=level));
 checkpoints.forEach((item,i)=>{
  const small=item.querySelector('small');
  const heading=item.querySelector('strong');
  if(small)small.textContent=model.steps[scenario][i];
  if(heading)heading.textContent=model.phases[i];
 });
 sliders.forEach(input=>{
  const value=Number(input.value),percent=value*25;
  input.style.background='linear-gradient(to right,var(--accent) '+percent+'%,var(--line) '+percent+'%)';
  const label=root.querySelector('#tower-scale-'+input.dataset.towerControl);
  if(label){const start=label.firstElementChild?.textContent||'';const end=label.lastElementChild?.textContent||'';
   input.setAttribute('aria-valuetext',value===0?start:value===4?end:(value+1)+' / 5');
  }
 });
}
function setScenario(index,alsoLegacy){
 scenario=index;update();
 if(alsoLegacy){const legacy=document.querySelector('.decision-choice[data-scenario="'+index+'"]');
  if(legacy)legacy.click();
 }
}
cases.forEach((button,i)=>{
 button.addEventListener('click',()=>setScenario(i,true));
 button.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
  e.preventDefault();
  const n=e.key==='Home'?0:e.key==='End'?cases.length-1:
    (i+(e.key==='ArrowRight'?1:cases.length-1))%cases.length;
  setScenario(n,true);cases[n].focus();
 });
});
document.querySelectorAll('.decision-choice[data-scenario]').forEach(b=>b.addEventListener('click',()=>{
 const i=Number(b.dataset.scenario);if(Number.isInteger(i)&&i>=0&&i<3){scenario=i;update()}
}));
sliders.forEach(input=>input.addEventListener('input',update));
root.querySelector('#towerReset')?.addEventListener('click',()=>{
 scenario=0;sliders.forEach(input=>input.value='2');setScenario(0,true);
});
const initial=document.querySelector('.decision-choice[data-scenario="'+scenario+'"]');
if(initial)initial.click();update();
// Cross-language continuity: when switching language, preserve the same demonstration settings.
document.querySelectorAll('a.locale[href]').forEach(link=>link.addEventListener('click',()=>{
 const href=link.getAttribute('href');
 if(!href||href.startsWith('#'))return;
 const url=new URL(href,location.href);
 url.searchParams.set('case',String(scenario));
 for(const input of sliders)url.searchParams.set(input.dataset.towerControl[0],input.value);
 if(location.hash&&document.querySelector(location.hash))url.hash=location.hash;
 link.href=url.href;
},{capture:true}));
const bar=document.createElement('div');
bar.className='tower-progress';bar.setAttribute('aria-hidden','true');
bar.innerHTML='<span></span>';document.body.prepend(bar);
let requested=false;
const mark=()=>{
 const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
 bar.firstElementChild.style.width=Math.max(0,Math.min(100,scrollY/max*100)).toFixed(2)+'%';
 requested=false;
};
addEventListener('scroll',()=>{if(!requested){requested=true;requestAnimationFrame(mark)}},{passive:true});
mark();
})();
