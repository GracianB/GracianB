// AGA V21. Public editorial simulation, not operational decision software.
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
function computePressure(){
 const v=Object.fromEntries(sliders.map(input=>[input.dataset.towerControl,Number(input.value)]));
 const raw=[v.urgency,4-v.buffer,4-v.paper];
 const weights=scenario===0?[2,2,1]:scenario===1?[2,2,.5]:[2,.5,2];
 const points=raw.map((x,i)=>x*weights[i]);
 const maximum=weights.reduce((s,x)=>s+x*4,0);
 const total=points.reduce((a,b)=>a+b,0);
 const level=total<=6?0:total<=13?1:2;
 return {level,points,maximum,weights,normalized:Math.round(total/maximum*20)};
}
function update(){
 if(!cases.length||!sliders.length)return;
 const pressure=computePressure(),level=pressure.level;
 cases.forEach((button,i)=>{
  const selected=i===scenario;button.classList.toggle('is-on',selected);
  button.setAttribute('aria-pressed',String(selected));
 });
 const number=root.querySelector('.tower-number');
 if(number)number.textContent=String(scenario+1).padStart(2,'0')+' / 03';
 levels.textContent=model.labels[level];levels.dataset.level=String(level);
 response.textContent=model.actions[scenario][level];
 parts.forEach((p,i)=>p.classList.toggle('is-lit',i<=level));
 const audit=root.querySelector('#towerIndex');
 if(audit)audit.textContent=String(pressure.normalized);
 pressure.points.forEach((score,index)=>{
  const value=root.querySelector('#towerFactor'+index);
  const meter=root.querySelector('#towerFactorBar'+index);
  const max=pressure.weights[index]*4;
  if(value)value.textContent=Number(score.toFixed(1))+' / '+Number(max.toFixed(1));
  if(meter)meter.style.width=(max?Math.round(100*score/max):0)+'%';
 });

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
// Only fictional, bounded slider state goes into the URL: never contact or career data.
const scriptText={
 en:{title:'Aga · Fictional operations brief',scenario:'Scenario',priority:'Response priority',inputs:'Illustrative conditions',pressure:'Simulated pressure',action:'Suggested response',steps:'Checkpoints',fiction:'Illustrative rules only. Not a case personally managed by Agnieszka.',copied:'Copied ✓',failed:'Clipboard unavailable. Copy the URL from your address bar.'},
 pl:{title:'Aga · Fikcyjna analiza operacyjna',scenario:'Scenariusz',priority:'Priorytet',inputs:'Przykładowe warunki',pressure:'Symulowany indeks',action:'Przykładowa reakcja',steps:'Kolejne działania',fiction:'Wyłącznie symulacja. Nie jest to potwierdzony projekt Agnieszki.',copied:'Skopiowano ✓',failed:'Kopiowanie niedostępne. Skopiuj adres z przeglądarki.'},
 es:{title:'Aga · Informe operativo ficticio',scenario:'Escenario',priority:'Prioridad',inputs:'Condiciones simuladas',pressure:'Índice simulado',action:'Respuesta orientativa',steps:'Puntos de control',fiction:'Ejercicio ilustrativo, no un proyecto acreditado de Agnieszka.',copied:'Copiado ✓',failed:'No se pudo copiar. Copia el enlace desde el navegador.'}
};
const copyLocale=scriptText[document.documentElement.lang]||scriptText.en;
const auditStatus=root.querySelector('#towerCopyStatus');
function scenarioUrl(){
 const target=new URL(location.href);
 target.searchParams.set('case',String(scenario));
 for(const input of sliders)target.searchParams.set(input.dataset.towerControl[0],input.value);
 target.hash='control-tower';
 return target;
}
function persistScenario(){
 const target=scenarioUrl();
 try{history.replaceState(history.state,'',target.pathname+target.search+location.hash)}catch(_){}
}
function buildBrief(){
 const press=computePressure(),caseName=cases[scenario]?.querySelector('strong')?.textContent||'';
 const labels=sliders.map(el=>el.closest('.tower-lever')?.querySelector('label')?.textContent+': '+el.value+'/4');
 const steps=checkpoints.map(el=>el.textContent.replace(/\s+/g,' ').trim());
 return [copyLocale.title,
  copyLocale.scenario+': '+caseName,copyLocale.priority+': '+levels.textContent,
  copyLocale.inputs+': '+labels.join('; '),
  copyLocale.pressure+': '+press.normalized+'/20',
  copyLocale.action+': '+response.textContent,
  copyLocale.steps+':\n'+steps.map((line,i)=>(i+1)+'. '+line).join('\n'),
  copyLocale.fiction,'',scenarioUrl().href].join('\n');
}
async function copyText(textValue){
 try{
  if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
  await navigator.clipboard.writeText(textValue);
  if(auditStatus)auditStatus.textContent=copyLocale.copied;
 }catch(_){
  if(auditStatus)auditStatus.textContent=copyLocale.failed;
 }
}
root.querySelector('#towerCopyBrief')?.addEventListener('click',()=>copyText(buildBrief()));
root.querySelector('#towerCopyLink')?.addEventListener('click',()=>copyText(scenarioUrl().href));

function setScenario(index,alsoLegacy){
 scenario=index;update();persistScenario();
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
 const i=Number(b.dataset.scenario);if(Number.isInteger(i)&&i>=0&&i<3){scenario=i;update();persistScenario()}
}));
sliders.forEach(input=>input.addEventListener('input',()=>{update();persistScenario()}));
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
