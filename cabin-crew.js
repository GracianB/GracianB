(()=>{"use strict";
const valid=new Set(["es","en"]);
const cities=[
 {id:"murcia",es:{place:"Murcia.",type:"BASE · ESPAÑA",text:"Mi punto de partida y mi base actual. Aquí confluyen la Diplomatura en Turismo, atención al cliente y proyectos.",context:"BASE · ESTUDIOS Y TRABAJO"},en:{place:"Murcia.",type:"HOME · SPAIN",text:"My starting point and current base. Tourism studies, customer care and projects come together here.",context:"BASE · EDUCATION AND WORK"}},
 {id:"canarias",es:{place:"Gran Canaria.",type:"CONEXIÓN · ESPAÑA",text:"Una referencia personal de mi recorrido y de mis vínculos con distintos lugares. No le atribuyo un empleo ni una titulación que no figuren documentados.",context:"CONEXIÓN PERSONAL · SIN EMPLEO ATRIBUIDO"},en:{place:"Gran Canaria.",type:"CONNECTION · SPAIN",text:"A personal reference in my wider journey. I do not attribute an undocumented job or degree to this location.",context:"PERSONAL CONNECTION · NO EMPLOYMENT CLAIM"}},
 {id:"madrid",es:{place:"Madrid.",type:"SERVICIO · ESPAÑA",text:"Trabajé en retail, operaciones y coordinación de equipos. También obtuve formación y certificación como instructor de yoga en 2019.",context:"TRABAJO · FORMACIÓN"},en:{place:"Madrid.",type:"SERVICE · SPAIN",text:"I worked in retail, operations and team coordination. I also completed yoga instructor training and certification in 2019.",context:"WORK · TRAINING"}},
 {id:"lisboa",es:{place:"Lisboa.",type:"ETAPA INTERNACIONAL · PORTUGAL",text:"Viví y trabajé en Portugal. En Majorel, dentro de un proyecto del entorno Google/YouTube, reforcé mi adaptación a equipos y culturas diferentes.",context:"RESIDENCIA Y TRABAJO · 2020–2021"},en:{place:"Lisbon.",type:"INTERNATIONAL CHAPTER · PORTUGAL",text:"I lived and worked in Portugal. At Majorel, in the Google/YouTube environment, I strengthened my ability to work with people from different cultures.",context:"LIVED AND WORKED · 2020–2021"}},
 {id:"bergamo",es:{place:"Bérgamo.",type:"ERASMUS · ITALIA",text:"Estudié Turismo durante mi intercambio Erasmus y viví una etapa de inmersión italiana. Idioma, cultura y trato directo con personas en un contexto nuevo.",context:"ESTUDIOS ERASMUS · EXPERIENCIA INTERNACIONAL"},en:{place:"Bergamo.",type:"ERASMUS · ITALY",text:"I studied Tourism as part of my Erasmus exchange and immersed myself in Italian daily life. A new language, culture and customer-facing context.",context:"ERASMUS STUDIES · INTERNATIONAL EXPERIENCE"}},
 {id:"varsovia",es:{place:"Varsovia.",type:"CONEXIÓN · POLONIA",text:"Un punto de conexión internacional recogido en mi atlas profesional. Es parte de la red de lugares de mi historia, no una afirmación de trabajo allí.",context:"CONEXIÓN EUROPEA · SIN EMPLEO ATRIBUIDO"},en:{place:"Warsaw.",type:"CONNECTION · POLAND",text:"An international point of connection in my professional atlas. Part of my wider network, not a claim that I held a job here.",context:"EUROPEAN CONNECTION · NO EMPLOYMENT CLAIM"}}
];
const requested=new URLSearchParams(location.search).get("lang");
let currentLanguage=valid.has(requested)?requested:"es",cityIndex=0,trainingFilter="all";
const $=id=>document.getElementById(id);
function renderAtlas(){
 const entry=cities[cityIndex][currentLanguage];
 $("atlasCounter").textContent=String(cityIndex+1).padStart(2,"0")+" / 06";
 $("atlasType").textContent=entry.type;
 $("atlasCity").textContent=entry.place;
 $("atlasDetail").textContent=entry.text;
 $("atlasContext").textContent=entry.context;
 $("atlasBar").style.width=(100*(cityIndex+1)/cities.length)+"%";
 document.querySelectorAll("[data-city]").forEach(button=>{
   const i=cities.findIndex(city=>city.id===button.dataset.city),isCurrent=i===cityIndex;
   button.setAttribute("aria-pressed",String(isCurrent));
   button.setAttribute("aria-label",cities[i][currentLanguage].place+" · "+
     (currentLanguage==="es"?"Mostrar historia":"Show story"));
 });
 $("atlasPrev").setAttribute("aria-label",currentLanguage==="es"?"Ciudad anterior":"Previous city");
 $("atlasNext").setAttribute("aria-label",currentLanguage==="es"?"Ciudad siguiente":"Next city");
}
function choose(next){
 if(!valid.has(next))return;
 currentLanguage=next;
 document.documentElement.dataset.lang=next;
 document.documentElement.lang=next;
 document.title=next==="en"?"Cabin Crew · Gracián Baena":"Tripulante de Cabina · Gracián Baena";
 document.querySelector(".hero")?.setAttribute("aria-labelledby",next==="en"?"flight-heading-en":"flight-heading");
 $("historia")?.setAttribute("aria-labelledby",next==="en"?"story-title-en":"story-title");
 $("trayectoria")?.setAttribute("aria-labelledby",next==="en"?"strengths-title-en":"strengths-title");
 $("formacion")?.setAttribute("aria-labelledby",next==="en"?"training-title-en":"training-title");
 $("atlas")?.setAttribute("aria-labelledby",next==="en"?"atlas-title-en":"atlas-title");
 $("idiomas")?.setAttribute("aria-labelledby",next==="en"?"languages-title-en":"languages-title");
 $("documentos")?.setAttribute("aria-labelledby",next==="en"?"docs-title-en":"docs-title");
 document.querySelectorAll("[data-cabin-lang]").forEach(button=>
   button.setAttribute("aria-pressed",String(button.dataset.cabinLang===next)));
 renderAtlas();
}
function renderTraining(){
 document.querySelectorAll("[data-training-filter]").forEach(button=>
   button.setAttribute("aria-pressed",String(button.dataset.trainingFilter===trainingFilter)));
 document.querySelectorAll("[data-credential-kind]").forEach(card=>{
   card.hidden=trainingFilter!=="all"&&card.dataset.credentialKind!==trainingFilter;
 });
}
choose(currentLanguage);renderTraining();
document.querySelectorAll("[data-cabin-lang]").forEach(button=>button.addEventListener("click",()=>{
 const next=button.dataset.cabinLang;choose(next);
 const url=new URL(location.href);url.searchParams.set("lang",next);
 history.replaceState(null,"",url.pathname+url.search+url.hash);
}));
document.querySelectorAll("[data-city]").forEach(button=>button.addEventListener("click",()=>{
 const index=cities.findIndex(city=>city.id===button.dataset.city);
 if(index<0)return;cityIndex=index;renderAtlas();
}));
$("atlasPrev").addEventListener("click",()=>{
 cityIndex=(cityIndex+cities.length-1)%cities.length;renderAtlas();
});
$("atlasNext").addEventListener("click",()=>{
 cityIndex=(cityIndex+1)%cities.length;renderAtlas();
});
document.querySelectorAll("[data-training-filter]").forEach(button=>button.addEventListener("click",()=>{
 trainingFilter=button.dataset.trainingFilter;renderTraining();
}));
})();
