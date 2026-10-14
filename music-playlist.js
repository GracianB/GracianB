/* One transport for the website, studio and playlist. Add future songs to bus.tracks. */
(()=>{"use strict";
const bus=window.YOGA_AUDIO_BUS;if(!bus)return;
const host=document.getElementById("focus-player");if(!host)return;
const panel=document.createElement("details");panel.className="music-playlist";
panel.innerHTML='<summary></summary><div class="music-controls"><button type="button" data-music="previous">←</button><button type="button" data-music="toggle"></button><button type="button" data-music="next">→</button><label><span></span><input type="range" min="0" max="1" step=".05" value=".45"></label></div><div class="music-tracks"></div><p class="music-status" role="status"></p>';
host.append(panel);
const list=panel.querySelector(".music-tracks");
bus.tracks.forEach((track,index)=>{const b=document.createElement("button");b.type="button";b.textContent=String(index+1).padStart(2,"0")+" · "+track.name;b.addEventListener("click",()=>void bus.selectTrack(index));list.append(b)});
const en=()=>document.documentElement.lang==="en";
function paint(){const playing=!bus.audio.paused;
panel.querySelector("summary").textContent="♫ "+bus.trackName;
panel.querySelector('[data-music="toggle"]').textContent=playing?(en()?"Pause":"Pausar"):(en()?"Play":"Escuchar");
panel.querySelector('[data-music="toggle"]').setAttribute("aria-pressed",String(playing));
panel.querySelector('[data-music="previous"]').setAttribute("aria-label",en()?"Previous song":"Canción anterior");
panel.querySelector('[data-music="next"]').setAttribute("aria-label",en()?"Next song":"Siguiente canción");
panel.querySelector("label span").textContent=en()?"Volume":"Volumen";
const volume=panel.querySelector("input");if(document.activeElement!==volume)volume.value=bus.audio.volume;
for(const [i,b] of [...list.children].entries())b.setAttribute("aria-pressed",String(!bus.localName&&bus.trackIndex===i));
for(const id of ["playlist-title","playlist-origin"]){const el=document.getElementById(id);if(el)el.textContent=bus.trackName;}
panel.querySelector(".music-status").textContent=en()?"One player · shared with Yoga · no autoplay":"Un reproductor · compartido con Yoga · sin inicio automático";
}
panel.addEventListener("click",event=>{const action=event.target.closest("[data-music]")?.dataset.music;if(action==="toggle")void bus.toggle("playlist");if(action==="next"||action==="previous")void bus.selectTrack((bus.trackIndex+(action==="next"?1:bus.tracks.length-1))%bus.tracks.length);});
panel.querySelector("input").addEventListener("input",event=>{bus.audio.volume=Number(event.target.value);bus.audio.muted=false;});
bus.audio.addEventListener("error",()=>{panel.querySelector(".music-status").textContent=en()?"Audio unavailable. Try the other song.":"Audio no disponible. Prueba la otra canción."});
window.addEventListener("yoga:audiochange",paint);
new MutationObserver(paint).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});paint();
})();
