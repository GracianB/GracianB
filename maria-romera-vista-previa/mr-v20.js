// Maria V20 · hypothetical sourcing comparisons. No live pricing, scoring of actual suppliers or personal performance claims.
(()=>{
'use strict';
const root=document.querySelector('#decision-lab');if(!root)return;
const locales={
 es:{
 nav:'Decisiones',kicker:'07 / LABORATORIO DE DECISIONES',
 title:'El mejor precio <em>no siempre es la mejor compra.</em>',
 intro:'Tres casos de abastecimiento ficticios. Ajusta las prioridades, compara alternativas y observa cómo cambia una recomendación. No son operaciones reales de María.',
 caseLabel:'SELECCIONA EL RETO',cases:['Selección de proveedor','Demanda imprevista','Comercio triangular'],
 priority:'DEFINE LAS PRIORIDADES',weightNote:'Pesos relativos · 1–5',
 cost:'Coste total',speed:'Plazo / continuidad',risk:'Fiabilidad / documentación',reset:'Restablecer simulación',
 ranking:'COMPARATIVA · ALTERNATIVAS FICTICIAS',titles:['Elegir implica equilibrar.','Una previsión cambia el plan.','Tres jurisdicciones, un flujo.'],
 descs:['La oferta más barata puede no ser la más fiable.','Un pico de demanda tensiona plazo, capacidad y presupuesto.','Importador, proveedor y destinatario requieren documentación coordinada.'],
 verdict:'PRIMERA ALTERNATIVA SEGÚN EL MODELO',reason:'Preferencia ilustrativa según los pesos indicados; no constituye una decisión comercial real.',
 checksTitle:'ANTES DE APROBAR',
 checks:[
 ['Verificar homologación y cumplimiento.','Confirmar términos contractuales.','Revisar capacidad y plazos.'],
 ['Revalidar la señal de demanda.','Comprobar existencias críticas.','Acordar contingencias de abastecimiento.'],
 ['Comprobar clasificación y documentos.','Confirmar responsabilidades fiscales y aduaneras.','Alinear el flujo comercial y físico.']
 ],
 tags:['Opción A','Opción B','Opción C'],profiles:['Apuesta por coste','Equilibrio de condiciones','Mayor resiliencia'],
 disclaimer:'Simulación editorial con ofertas y puntuaciones inventadas. No representa clientes, contratos, ahorros, proveedores ni decisiones que María haya gestionado.'
 },
 en:{
 nav:'Decisions',kicker:'07 / DECISION LAB',
 title:'The lowest price <em>is not always the best purchase.</em>',
 intro:'Three fictional procurement challenges. Adjust priorities, compare alternatives and see how the recommendation changes. These are not projects personally managed by María.',
 caseLabel:'SELECT THE CHALLENGE',cases:['Supplier selection','Unexpected demand','Triangular trade'],
 priority:'SET THE PRIORITIES',weightNote:'Relative weights · 1–5',
 cost:'Total cost',speed:'Lead time / continuity',risk:'Reliability / documentation',reset:'Reset the simulation',
 ranking:'COMPARISON · FICTIONAL ALTERNATIVES',titles:['Selection requires balance.','Forecasts change the plan.','Three jurisdictions, one flow.'],
 descs:['The cheapest offer may not be the most reliable.','A sudden demand increase tests capacity, lead times and budget.','Supplier, intermediary and recipient need aligned documentation.'],
 verdict:'TOP ALTERNATIVE IN THIS MODEL',reason:'Illustrative preference based on the selected weights, not a real commercial recommendation.',
 checksTitle:'BEFORE APPROVAL',
 checks:[
 ['Verify qualification and compliance.','Confirm contractual terms.','Check production capacity and lead time.'],
 ['Validate the demand signal.','Check critical stock.','Agree sourcing contingencies.'],
 ['Verify classification and documents.','Confirm tax and customs responsibilities.','Align commercial and physical flows.']
 ],
 tags:['Option A','Option B','Option C'],profiles:['Cost-led offer','Balanced conditions','Resilience-led offer'],
 disclaimer:'Editorial simulation with invented offers and scores. These are not customers, contracts, savings, suppliers or decisions personally managed by María.'
 }
};
const cases=[
 [[5,2,2],[3,4,4],[2,5,5]],
 [[5,1,3],[3,4,4],[1,5,5]],
 [[5,2,1],[3,4,5],[2,5,4]]
];
const $=sel=>root.querySelector(sel),$$=sel=>[...root.querySelectorAll(sel)];
const getLang=()=>document.documentElement.lang==='en'?'en':'es';
let selected=0,locale='';
const refs={
 nav:document.querySelector('#mrLabNav'),kicker:$('#mrLabKicker'),title:$('#mrLabTitle'),intro:$('#mrLabIntro'),
 caseLabel:$('#mrCaseLabel'),caseNames:[$('#mrCase0'),$('#mrCase1'),$('#mrCase2')],
 priority:$('#mrPriorityLabel'),weightNote:$('#mrWeightNote'),cost:$('#mrCostLabel'),speed:$('#mrSpeedLabel'),
 risk:$('#mrRiskLabel'),reset:$('#mrResetText'),ranking:$('#mrRankingLabel'),counter:$('#mrCaseCounter'),
 resultTitle:$('#mrResultTitle'),resultDesc:$('#mrResultDesc'),list:$('#mrCandidates'),
 verdict:$('#mrVerdictLabel'),verdictName:$('#mrVerdictName'),reason:$('#mrVerdictReason'),
 checksTitle:$('#mrChecksTitle'),checks:$('#mrChecks'),disclaimer:$('#mrLabDisclaimer')
};
const inputs={cost:$('#mrWeightCost'),speed:$('#mrWeightSpeed'),risk:$('#mrWeightRisk')};
function setText(node,value){if(node)node.textContent=value;}
function score(offer,weights){const keys=['cost','speed','risk'];let total=0,max=0;
 keys.forEach((k,i)=>{total+=offer[i]*weights[k];max+=5*weights[k]});return Math.round(total/max*500)/100;
}
function candidate(data,item,place){
 const article=document.createElement('div');article.className='mr-candidate';article.setAttribute('role','listitem');
 const rank=document.createElement('span');rank.className='mr-candidate-rank';rank.textContent=String(place+1).padStart(2,'0');
 const copy=document.createElement('div');copy.className='mr-candidate-copy';
 const name=document.createElement('strong');name.textContent=data.tags[item.index];
 const detail=document.createElement('small');detail.textContent=data.profiles[item.index]+' · '+item.score.toFixed(2)+'/5';
 const track=document.createElement('div');track.className='mr-bar-track';track.setAttribute('aria-hidden','true');
 const fill=document.createElement('span');fill.style.width=(item.score/5*100).toFixed(1)+'%';track.append(fill);
 copy.append(name,detail,track);
 const number=document.createElement('span');number.className='mr-candidate-score';number.textContent=item.score.toFixed(2);
 article.append(rank,copy,number);return article;
}
function render(){
 const lang=getLang(),d=locales[lang],w={};
 for(const [key,input] of Object.entries(inputs)){
  w[key]=Number(input.value);const out=root.querySelector('#mr'+key[0].toUpperCase()+key.slice(1)+'Value');setText(out,w[key]+'/5');
 }
 // The key is Speed, not speed? both normalized by element names.
 if(locale!==lang){
  locale=lang;
  setText(refs.nav,d.nav);setText(refs.kicker,d.kicker);refs.title.innerHTML=d.title;
  setText(refs.intro,d.intro);setText(refs.caseLabel,d.caseLabel);
  refs.caseNames.forEach((el,i)=>setText(el,d.cases[i]));
  setText(refs.priority,d.priority);setText(refs.weightNote,d.weightNote);setText(refs.cost,d.cost);
  setText(refs.speed,d.speed);setText(refs.risk,d.risk);setText(refs.reset,d.reset);
  setText(refs.ranking,d.ranking);setText(refs.verdict,d.verdict);setText(refs.checksTitle,d.checksTitle);
  setText(refs.disclaimer,d.disclaimer);
  refs.list.setAttribute('aria-label',d.ranking);
 }
 $$('.mr-case').forEach((el,i)=>{el.classList.toggle('is-selected',selected===i);el.setAttribute('aria-pressed',String(selected===i))});
 setText(refs.counter,String(selected+1).padStart(2,'0')+' / 03');setText(refs.resultTitle,d.titles[selected]);
 setText(refs.resultDesc,d.descs[selected]);
 const ranked=cases[selected].map((row,index)=>({index,score:score(row,w)}))
   .sort((a,b)=>b.score-a.score||a.index-b.index);
 refs.list.replaceChildren(...ranked.map((item,i)=>candidate(d,item,i)));
 setText(refs.verdictName,d.tags[ranked[0].index]);
 setText(refs.reason,d.reason);
 refs.checks.replaceChildren(...d.checks[selected].map(s=>{const li=document.createElement('li');li.textContent=s;return li}));
}
$$('.mr-case').forEach((el,i)=>{
 el.addEventListener('click',()=>{selected=i;render()});
 el.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
  e.preventDefault();
  selected=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:2))%3;
  render();$$('.mr-case')[selected].focus();
 });
});
Object.values(inputs).forEach(el=>el.addEventListener('input',render));
$('#mrLabReset')?.addEventListener('click',()=>{selected=0;Object.values(inputs).forEach(el=>el.value='3');render()});
new MutationObserver(()=>{if(locale!==getLang())render()}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
render();
})();
