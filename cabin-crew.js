(()=>{"use strict";
const valid=new Set(["es","en"]);
const requested=new URLSearchParams(location.search).get("lang");
function choose(next){
  if(!valid.has(next))return;
  document.documentElement.dataset.lang=next;
  document.documentElement.lang=next;
  document.title=next==="en"?"Cabin Crew · Gracián Baena":"Tripulante de Cabina · Gracián Baena";
  document.querySelector(".hero")?.setAttribute("aria-labelledby",next==="en"?"flight-heading-en":"flight-heading");
  document.querySelectorAll("[data-cabin-lang]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.cabinLang===next)));
}
choose(valid.has(requested)?requested:"es");
document.querySelectorAll("[data-cabin-lang]").forEach(button=>button.addEventListener("click",()=>{
  const next=button.dataset.cabinLang;
  choose(next);
  const url=new URL(location.href);url.searchParams.set("lang",next);
  history.replaceState(null,"",url.pathname+url.search+url.hash);
}));
})();
