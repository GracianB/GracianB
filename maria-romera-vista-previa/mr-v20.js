// Maria V22 · hypothetical sourcing comparisons. No live pricing, scoring of actual suppliers or personal performance claims.
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
const explainLocales={"es":{"insightEyebrow":"08 / POR QUÉ GANA ESTA ALTERNATIVA","insightTitle":"Entender <em>el criterio.</em>","insightDesc":"Puntuación ponderada de una simulación ficticia: sin datos de proveedores reales.","gap":"Ventaja sobre la segunda opción","tie":"Empate técnico. Ambas alternativas merecen revisión.","copySummary":"Copiar informe ↗","copyLink":"Copiar enlace ↗","copySuccess":"Copiado ✓","copyFail":"Portapapeles no disponible. Copia el enlace desde tu navegador.","briefTitle":"María Romera · Simulación de compras","fiction":"Ofertas y puntuaciones ficticias. No son operaciones ni resultados profesionales acreditados.","brief":"Selección simulada","weights":"Pesos elegidos","breakdown":"Desglose de criterio","checkpoints":"Antes de aprobar"},"en":{"insightEyebrow":"08 / WHY THIS OPTION RANKS FIRST","insightTitle":"Understand <em>the trade-off.</em>","insightDesc":"Weighted score from a fictional model, never actual supplier-performance data.","gap":"Lead over the second option","tie":"Technical tie. Both options require closer review.","copySummary":"Copy decision brief ↗","copyLink":"Copy scenario link ↗","copySuccess":"Copied ✓","copyFail":"Clipboard unavailable. Copy the URL from your browser.","briefTitle":"María Romera · Fictional procurement brief","fiction":"Fictional offers and scores. Not verified contracts or personal professional outcomes.","brief":"Illustrative selection","weights":"Chosen weights","breakdown":"Criterion breakdown","checkpoints":"Before approval"}};

const guardCopy={"es":{"title":"FILTROS DE ADMISIBILIDAD · DEMOSTRACIÓN","desc":"Establece requisitos mínimos ficticios. Una opción que los incumple no debe recomendarse.","speed":"Plazo mínimo aceptable","risk":"Fiabilidad mínima","eligible":"alternativas admisibles","excluded":"No admisible","none":"Ninguna oferta supera los mínimos. Revisa las condiciones o busca otras alternativas.","noneTitle":"Sin opciones admisibles","noneReason":"Ninguna oferta debería recomendarse si incumple los requisitos establecidos.","limits":"Umbrales mínimos","noRank":"Sin recomendación"},"en":{"title":"QUALIFICATION THRESHOLDS · DEMONSTRATION","desc":"Set fictional minimum standards. Offers that fail them should not be recommended.","speed":"Minimum acceptable delivery","risk":"Minimum reliability","eligible":"eligible alternatives","excluded":"Not eligible","none":"No offer meets both thresholds. Review your criteria or seek alternatives.","noneTitle":"No eligible options","noneReason":"An offer should not be recommended while it fails the selected minimum standards.","limits":"Minimum thresholds","noRank":"No recommendation"}};
const guard={speed:$('#mrMinSpeed'),risk:$('#mrMinRisk')};
const query=new URLSearchParams(location.search);
const safeInt=(x,min,max,fallback)=>/^\d+$/.test(x||'')&&Number(x)>=min&&Number(x)<=max?Number(x):fallback;
selected=safeInt(query.get('scenario'),0,2,0);
guard.speed.value=String(safeInt(query.get('gs'),1,5,1));
guard.risk.value=String(safeInt(query.get('gr'),1,5,1));
for(const [key,input] of Object.entries(inputs)){
 input.value=String(safeInt(query.get('w'+key[0]),1,5,3));
}
const insight={
 title:$('#mrInsightTitle'),eyebrow:$('#mrInsightEyebrow'),desc:$('#mrInsightDesc'),
 factors:$('#mrInsightFactors'),gap:$('#mrInsightGap'),summary:$('#mrCopySummary'),
 share:$('#mrCopyLink'),status:$('#mrCopyStatus')
};
function shareUrl(){
 const next=new URL(location.href);
 next.searchParams.set('lang',getLang());
 next.searchParams.set('scenario',String(selected));
 for(const [key,input] of Object.entries(inputs))next.searchParams.set('w'+key[0],input.value);
 next.searchParams.set('gs',guard.speed.value);
 next.searchParams.set('gr',guard.risk.value);
 next.hash='decision-lab';
 return next;
}
function keepUrl(){
 const next=shareUrl();
 try{history.replaceState(history.state,'',next.pathname+next.search+location.hash)}catch(_){}
}
function explain(top,second,weights,data){
 const dict=explainLocales[getLang()];
 setText(insight.eyebrow,dict.insightEyebrow);
 insight.title.innerHTML=dict.insightTitle;
 setText(insight.desc,dict.insightDesc);
 setText(insight.summary,dict.copySummary);setText(insight.share,dict.copyLink);
 const labels=[data.cost,data.speed,data.risk];
 const keys=['cost','speed','risk'];const sum=keys.reduce((acc,k)=>acc+weights[k],0);
 insight.factors.replaceChildren(...keys.map((key,i)=>{
  const row=document.createElement('div');row.className='mr-insight-factor';row.setAttribute('role','listitem');
  const title=document.createElement('strong');title.textContent=labels[i];
  const value=document.createElement('span');value.textContent=cases[selected][top.index][i]+'/5 × '+weights[key];
  const bar=document.createElement('div');bar.className='mr-insight-track';bar.setAttribute('aria-hidden','true');
  const fill=document.createElement('i');fill.style.width=(cases[selected][top.index][i]/5*100)+'%';bar.append(fill);
  const points=document.createElement('small');
  points.textContent='+'+(cases[selected][top.index][i]*weights[key]/sum).toFixed(2)+'/5';
  row.append(title,value,bar,points);return row;
 }));
 const margin=Math.max(0,top.score-second.score);
 const copy=guardCopy[getLang()];
 setText(insight.gap,!top.eligible?copy.none:
  !second.eligible?copy.eligible+': 1 / 3 · '+dict.gap+': qualification overrides raw scores.':
  margin<.01?dict.tie:dict.gap+': '+margin.toFixed(2)+'/5');
}
function buildBrief(){
 const lang=getLang(),d=locales[lang],labels=explainLocales[lang];
 const weights=Object.fromEntries(Object.entries(inputs).map(([key,input])=>[key,Number(input.value)]));
 const ranked=rankOffers(weights);
 return [
 labels.briefTitle,
 d.cases[selected],guardCopy[lang].limits+': '+guard.speed.value+'/5 · '+guard.risk.value+'/5',
 labels.brief+': '+(ranked.some(x=>x.eligible)?d.tags[ranked[0].index]:guardCopy[lang].noRank),
 labels.weights+': '+d.cost+' '+weights.cost+'/5 · '+d.speed+' '+weights.speed+'/5 · '+d.risk+' '+weights.risk+'/5',
 labels.breakdown+': '+ranked.map(x=>d.tags[x.index]+' '+x.score.toFixed(2)+'/5').join(' | '),
 labels.checkpoints+':\n'+d.checks[selected].map((x,i)=>(i+1)+'. '+x).join('\n'),
 labels.fiction,shareUrl().href
 ].join('\n\n');
}
async function copyBrief(textValue){
 const d=explainLocales[getLang()];
 try{
  if(!navigator.clipboard?.writeText)throw Error('Clipboard');
  await navigator.clipboard.writeText(textValue);
  setText(insight.status,d.copySuccess);
 }catch(_){setText(insight.status,d.copyFail)}
}
insight.summary?.addEventListener('click',()=>copyBrief(buildBrief()));
insight.share?.addEventListener('click',()=>copyBrief(shareUrl().href));

function setText(node,value){if(node)node.textContent=value;}
function score(offer,weights){const keys=['cost','speed','risk'];let total=0,max=0;
 keys.forEach((k,i)=>{total+=offer[i]*weights[k];max+=5*weights[k]});return Math.round(total/max*500)/100;
}
function rankOffers(weights){
 const speed=Number(guard.speed.value),risk=Number(guard.risk.value);
 return cases[selected].map((row,index)=>({index,score:score(row,weights),eligible:row[1]>=speed&&row[2]>=risk}))
  .sort((a,b)=>Number(b.eligible)-Number(a.eligible)||b.score-a.score||a.index-b.index);
}
function candidate(data,item,place){
 const article=document.createElement('div');article.className='mr-candidate'+(item.eligible?'':' is-ineligible');article.setAttribute('role','listitem');
 const rank=document.createElement('span');rank.className='mr-candidate-rank';rank.textContent=String(place+1).padStart(2,'0');
 const copy=document.createElement('div');copy.className='mr-candidate-copy';
 const name=document.createElement('strong');name.textContent=data.tags[item.index];
 const detail=document.createElement('small');detail.textContent=data.profiles[item.index]+' · '+item.score.toFixed(2)+'/5'+(item.eligible?'':' · '+guardCopy[getLang()].excluded);
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
 const ranked=rankOffers(w);
 const eligibleCount=ranked.filter(x=>x.eligible).length,words=guardCopy[lang];
 setText($('#mrGuardTitle'),words.title);setText($('#mrGuardDescription'),words.desc);
 setText($('#mrMinSpeedLabel'),words.speed);setText($('#mrMinRiskLabel'),words.risk);
 setText($('#mrMinSpeedValue'),guard.speed.value+'/5');setText($('#mrMinRiskValue'),guard.risk.value+'/5');
 setText($('#mrEligibility'),eligibleCount?eligibleCount+' / 3 '+words.eligible:words.none);
 $('#mrEligibility').dataset.empty=String(eligibleCount===0);
 explain(ranked[0],ranked[1],w,d);
 refs.list.replaceChildren(...ranked.map((item,i)=>candidate(d,item,i)));
 setText(refs.verdict,eligibleCount?d.verdict:words.noneTitle);
 setText(refs.verdictName,eligibleCount?d.tags[ranked[0].index]:words.noRank);
 setText(refs.reason,eligibleCount?d.reason:words.noneReason);
 if(!eligibleCount)setText(insight.gap,words.none);
 refs.checks.replaceChildren(...d.checks[selected].map(s=>{const li=document.createElement('li');li.textContent=s;return li}));
}
$$('.mr-case').forEach((el,i)=>{
 el.addEventListener('click',()=>{selected=i;render();keepUrl()});
 el.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
  e.preventDefault();
  selected=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:2))%3;
  render();keepUrl();$$('.mr-case')[selected].focus();
 });
});
Object.values(inputs).forEach(el=>el.addEventListener('input',()=>{render();keepUrl()}));
Object.values(guard).forEach(el=>el.addEventListener('input',()=>{render();keepUrl()}));
$('#mrLabReset')?.addEventListener('click',()=>{selected=0;Object.values(inputs).forEach(el=>el.value='3');Object.values(guard).forEach(el=>el.value='1');render();keepUrl()});
new MutationObserver(()=>{if(locale!==getLang()){render();keepUrl()}}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
render();
})();
