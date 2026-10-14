/* V36 · One soundtrack, one HTMLAudioElement and one explicit listener.
   The hero, studio and corner controls share transport and state.
   A remote Vortex iframe cannot be volume-controlled cross-origin; therefore
   it is mounted only on request and is unloaded if the soundtrack starts. */
(() => {
  "use strict";
  const audio = document.getElementById("focus-audio");
  const frameHost = document.querySelector(".vortex-frame-mount");
  let iframe = null;
  const vortexStart = document.getElementById("vortex-activate");
  const vortexStop = document.getElementById("vortex-stop");
  if (!audio) return;
  const originalSrc = "./audio/silence-between-notes.mp3";
  audio.setAttribute("src", originalSrc);
  const tracks = [
    {name:"Silence Between Notes",src:"./audio/silence-between-notes.mp3"},
    {name:"Sustained Focus",src:"./audio/sustained-focus.mp3"}
  ];
  let trackIndex=0;
  const channel=typeof BroadcastChannel==="function"?new BroadcastChannel("gracian-music"):null;
  channel?.addEventListener("message",()=>{audio.pause();window.speechSynthesis?.cancel();deactivateVortex();});
  let owner = null;
  let localUrl = null;
  let localName = "";
  let vortexActive = false;
  const language = () => document.documentElement.lang === "en" ? "en" : "es";
  const send = () => window.dispatchEvent(new CustomEvent("yoga:audiochange", {
    detail:{playing:!audio.paused, owner, name: localName || tracks[trackIndex].name, volume:audio.volume}
  }));
  function updateVortex() {
    if (vortexStart) {
      vortexStart.setAttribute("aria-pressed", String(vortexActive));
      vortexStart.textContent = language()==="en" ? "Enter Vortex" : "Entrar en Vortex";
      vortexStart.hidden=vortexActive;
    }
    if (vortexStop) {
      vortexStop.hidden=!vortexActive;
      vortexStop.textContent = language()==="en" ? "Exit Vortex" : "Salir de Vortex";
    }
    iframe?.parentElement?.classList.toggle("is-vortex-active",vortexActive);
  }
  const deactivateVortex=()=>{
    if (!vortexActive) return;
    vortexActive=false;
    if (iframe) {iframe.remove();iframe=null;} // unload remote audio and its document
    updateVortex();
  };
  const activateVortex=()=>{
    if (!frameHost || vortexActive) return;
    audio.pause(); // One audible source at a time; remote iframe is isolated
    owner=null;
    iframe=document.createElement("iframe");
    iframe.title="Vortex";
    iframe.loading="lazy";
    iframe.referrerPolicy="no-referrer";
    iframe.setAttribute("sandbox","allow-scripts allow-same-origin");
    iframe.src=frameHost.dataset.vortexSrc;
    frameHost.appendChild(iframe);
    vortexActive=true;
    updateVortex(); send();
  };
  const stop = () => {audio.pause();send();};
  const play = async (source) => {
    deactivateVortex();
    owner=source;
    try {window.speechSynthesis?.cancel();channel?.postMessage("claim");await audio.play();send();return true;}catch(_){send();return false;}
  };
  const toggle = async (source) => {
    if(!audio.paused){stop();return false;}
    return play(source);
  };
  const selectFile = (file) => {
    if(!file || !(file.type.startsWith("audio/") || /\.mp3$/i.test(file.name)))return false;
    if(file.size>20000000)return false;
    stop();
    const next=URL.createObjectURL(file);
    if(localUrl)URL.revokeObjectURL(localUrl);
    localUrl=next;localName=file.name;
    audio.src=localUrl;
    audio.load();
    owner=null;send();
    return true;
  };
  const resetTrack=()=>{
    stop(); if(localUrl)URL.revokeObjectURL(localUrl);
    localUrl=null;localName="";trackIndex=0;audio.src=originalSrc;audio.load();owner=null;send();
  };
  // One native player covers every public control. Refuse any surprise
  // playback by other media elements within this document.
  document.addEventListener("play",event=>{
    if(!(event.target instanceof HTMLMediaElement))return;
    if(event.target!==audio){
      audio.pause();
      for(const other of document.querySelectorAll("audio,video"))
        if(other!==event.target&&!other.paused)other.pause();
    }else{
      deactivateVortex();
      for(const other of document.querySelectorAll("audio,video"))
        if(other!==audio&&!other.paused)other.pause();
    }
    send();
  },true);
  audio.addEventListener("pause",send);
  audio.addEventListener("volumechange",send);
  audio.loop=false;
  const selectTrack=async(index,resume=!audio.paused)=>{
    if(!Number.isInteger(index)||!tracks[index])return false;
    stop();if(localUrl)URL.revokeObjectURL(localUrl);
    localUrl=null;localName="";trackIndex=index;
    audio.src=tracks[index].src;audio.load();send();
    return resume?play(owner||"playlist"):true;
  };
  audio.addEventListener("ended",()=>{void selectTrack((trackIndex+1)%tracks.length,true);});
  audio.addEventListener("play",()=>{channel?.postMessage("claim");window.speechSynthesis?.cancel();});
  vortexStart?.addEventListener("click",activateVortex);
  vortexStop?.addEventListener("click",deactivateVortex);
  document.addEventListener("visibilitychange",()=>{if(document.hidden&&vortexActive)deactivateVortex();});
  const languageObserver=new MutationObserver(updateVortex);
  languageObserver.observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
  window.addEventListener("pagehide",()=>{channel?.close();languageObserver.disconnect();audio.pause();deactivateVortex();if(localUrl)URL.revokeObjectURL(localUrl);});
  window.YOGA_AUDIO_BUS=Object.freeze({audio,toggle,play,stop,selectFile,resetTrack,selectTrack,tracks,
    get trackIndex(){return trackIndex;},get trackName(){return localName||tracks[trackIndex].name;},
    deactivateVortex,activateVortex,get owner(){return owner;},
    get localName(){return localName;},get vortexActive(){return vortexActive;}});
  // A native track needs an explicit click; no autoplay, including restore.
  updateVortex();send();
})();
