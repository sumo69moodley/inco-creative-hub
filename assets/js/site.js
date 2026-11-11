(function(){
"use strict";
/* ===== CONFIG ===== Swap the YouTube background here (11-character video id). */
var YT_ID = "TSe4M-KJiYQ";
var YT_START = 0;
/* Header (Home) background: paint-film3 (assets/video/paint-film3-hd.mp4 = paint-film3.MP4 trimmed to 7.96s before its dark end frame, AI-upscaled to 1920x1080). */

var doc = document.documentElement;
doc.classList.add("js");
var $ = function(s,c){return (c||document).querySelector(s)};
var $$ = function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
var mobileMQ = window.matchMedia("(max-width: 760px)");
var store = {get:function(k){try{return sessionStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}};
var motionPaused = reduce.matches;
var home = $("#home");            // only the main page has the hero; the service pages share this script without it
var IS_HOME = !!home;
var H = { closeProject:function(){}, hideModal:function(){}, motion:function(){} };   // filled in by the main-page code
$("#yr").textContent = new Date().getFullYear();

/* ===== MAIN PAGE ONLY: hero film, work carousel + project pop-up, background videos, services booklet ===== */
if (IS_HOME) (function(){
/* ---------- PROJECTS (illustrative, from supplied footage) ---------- */
var P = [
 {img:"hub-01.jpg",title:"Vodcast Set",kind:"Still",pos:"54% 50%",desc:"The mural set framed up on the Osmo, ready to roll."},
 {img:"hub-02.jpg",title:"Guest Portrait",kind:"Still",pos:"58% 50%",desc:"A candid moment between takes in the lounge."},
 {img:"hub-03.jpg",title:"Coffee Bar",kind:"Still",pos:"65% 50%",desc:"The crew catching up at the Hub coffee bar."},
 {img:"hub-04.jpg",title:"Between Takes",kind:"Still",tall:1,desc:"Off-camera laughs over coffee."},
 {img:"hub-05.jpg",title:"Content Creator",kind:"Still",tall:1,desc:"Shooting social content on the studio floor."},
 {img:"hub-06.jpg",title:"The Africa Wall",kind:"Still",tall:1,desc:"The lit Africa map on our brick feature wall."},
 {img:"hub-07.jpg",title:"Boardroom",kind:"Still",tall:1,desc:"The meeting room, set for planning sessions."},
 {img:"hub-08.jpg",title:"Mural Wall",kind:"Still",tall:1,desc:"One of the Hub’s signature murals."},
 {img:"hub-09.jpg",title:"Lounge Corner",kind:"Still",tall:1,desc:"The hanging chair in the studio lounge."},
 {img:"hub-10.jpg",title:"Mobile Capture",kind:"Still",tall:1,desc:"Recording on phone with wireless mics."},
 {img:"hub-11.jpg",title:"The Paint Wall",kind:"Still",tall:1,desc:"A photographer at work in front of the paint wall."},
 {img:"hub-12.jpg",title:"Behind the Scenes",kind:"Still",tall:1,desc:"Gimbal set up and rolling on the studio floor."}
];
var N = P.length, STEP = 360/N;
var ring = $("#ring"), stage = $("#stage"), hint = $("#hint");
P.forEach(function(p,i){
  var b = document.createElement("button");
  b.type = "button"; b.className = "reel"; b.style.setProperty("--a",(i*STEP)+"deg");
  b.setAttribute("aria-label","Project "+(i+1)+" of "+N+": "+p.title+". Open project.");
  b.dataset.i = i;
  b.innerHTML = '<img class="reel__img" src="assets/img/'+p.img+'"'+(p.pos?' style="object-position:'+p.pos+'"':'')+' alt="" loading="'+(i<5||i>N-3?"eager":"lazy")+'" draggable="false">'+
    '<span class="reel__num">'+String(i+1).padStart(2,"0")+'</span>'+
    '<span class="reel__cap"><b>'+p.title+'</b><span>View this project</span></span>';
  ring.appendChild(b);
});
var reels = $$(".reel", ring);

/* ---------- RING ENGINE ---------- */
var ang = 0, speed = 0, BASE = 7; // deg per second
var target = null, hot = null, dragging = false, inView = false, modalOpen = false;
function sizeRing(){
  if (mobileMQ.matches) return;
  var cw = reels[0].offsetWidth || 180;                       // layout width (getBoundingClientRect is skewed by the 3D rotation)
  var base = (cw/2)/Math.tan(Math.PI/N) * 1.32;              // spacing that keeps neighbouring cards close
  var P = parseFloat(getComputedStyle(stage).perspective) || 1500;
  var X = Math.max(0, stage.clientWidth*0.46 - cw*0.35);     // spread the ring out to ~92% of the stage width
  var fill = X < P*0.9 ? X*P/(P - X) : base*1.5;
  var r = Math.round(Math.max(base, Math.min(fill, base*1.5)));
  ring.style.setProperty("--r", r+"px");
}
function frontIndex(){ var k = Math.round(ang/STEP) % N; return (k+N)%N; }
function setHot(el){
  if (hot === el) return;
  if (hot) hot.classList.remove("is-hot");
  hot = el;
  if (el){ el.classList.add("is-hot"); ring.classList.add("has-hot"); if(hint){ hint.textContent="SELECTED PROJECT / CLICK TO OPEN"; hint.classList.add("is-sel"); } }
  else { ring.classList.remove("has-hot"); if(hint){ hint.textContent="HOVER TO ROTATE / SELECT A PROJECT"; hint.classList.remove("is-sel"); } }
}
var last = performance.now();
function tick(now){
  var dt = Math.min(.05,(now-last)/1000); last = now;
  if (!mobileMQ.matches && inView){
    var want = (hot || dragging || modalOpen || motionPaused) ? 0 : BASE;
    speed += (want - speed) * Math.min(1, dt*3.2);          // ease to stop / start
    if (target !== null && !dragging){
      var d = target - ang; ang += d * Math.min(1, dt*6);
      if (Math.abs(d) < .05){ ang = target; target = null; }
    } else if (!dragging) ang += speed*dt;
    ring.style.transform = "translateZ(calc(var(--r) * -1)) rotateX(-7deg) rotateY("+(-ang)+"deg)";
    for (var i=0;i<N;i++){
      var rel = (i*STEP - ang) * Math.PI/180;
      var f = (Math.cos(rel)+1)/2;
      reels[i].style.setProperty("--f", f.toFixed(3));
    }
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
function goStep(dir){ var base = target!==null?target:Math.round(ang/STEP)*STEP; target = base + dir*STEP; setHot(null); }
reels.forEach(function(el){
  el.addEventListener("pointerenter",function(e){ if(e.pointerType==="mouse" && !dragging && !mobileMQ.matches) setHot(el); });
  el.addEventListener("pointerleave",function(e){ if(e.pointerType==="mouse") setHot(null); });
  el.addEventListener("focus",function(){
    if (mobileMQ.matches) return;
    var i = +el.dataset.i; var k = Math.round((ang - i*STEP)/360);
    target = i*STEP + k*360; setHot(el);
  });
  el.addEventListener("blur",function(){ if(hot===el) setHot(null); });
  el.addEventListener("click",function(e){ if (moved > 6){ e.preventDefault(); return; } openProject(+el.dataset.i, el); });
});
stage.addEventListener("keydown",function(e){
  if (mobileMQ.matches) return;
  if (e.key==="ArrowLeft"){ e.preventDefault(); goStep(-1); }
  else if (e.key==="ArrowRight"){ e.preventDefault(); goStep(1); }
  else if ((e.key==="Enter"||e.key===" ") && e.target===stage){ e.preventDefault(); var i=frontIndex(); openProject(i, reels[i]); }
});
/* drag / swipe to spin */
var px=0, moved=0, startAng=0, vel=0, lastX=0, lastT=0;
stage.addEventListener("pointerdown",function(e){
  if (mobileMQ.matches || e.button>0) return;
  dragging = true; moved = 0; px = lastX = e.clientX; lastT = performance.now(); startAng = ang; target = null; vel=0;
  stage.classList.add("is-drag");
});
window.addEventListener("pointermove",function(e){
  if (!dragging) return;
  var dx = e.clientX - px; moved = Math.max(moved, Math.abs(dx));
  if (moved > 6) setHot(null);
  ang = startAng - dx*0.22;
  var t = performance.now(); vel = (e.clientX-lastX)/Math.max(1,t-lastT); lastX=e.clientX; lastT=t;
});
window.addEventListener("pointerup",function(){
  if (!dragging) return; dragging=false; stage.classList.remove("is-drag");
  if (moved > 6){ var fling = -vel*120; target = Math.round((ang+fling)/STEP)*STEP; }
});
window.addEventListener("resize",sizeRing);
mobileMQ.addEventListener && mobileMQ.addEventListener("change",function(){ sizeRing(); ring.style.transform=""; });
sizeRing();

/* ---------- PROJECT MODAL (FLIP open from the card) ---------- */
var modal=$("#modal"), mBox=$("#mBox"), mMedia=$("#mMedia"), cur=0, opener=null;
function fill(i){
  cur = (i+N)%N; var p = P[cur];
  $("#mNum").textContent = "PROJECT "+String(cur+1).padStart(2,"0")+" / "+N;
  $("#mKind").textContent = p.kind.toUpperCase();
  $("#mTitle").textContent = p.title;
  $("#mDesc").textContent = p.desc;
  mMedia.innerHTML = p.video
    ? '<video poster="assets/img/'+p.img+'" muted playsinline controls autoplay loop><source src="assets/video/'+p.video+'" type="video/mp4"><source src="assets/video/'+p.video.replace('.mp4','.webm')+'" type="video/webm"></video>'
    : p.tall
      ? '<img class="m-bg" src="assets/img/'+p.img+'" alt="" aria-hidden="true"><img class="m-fit" src="assets/img/'+p.img+'" alt="'+p.title+'">'
      : '<img src="assets/img/'+p.img+'" alt="'+p.title+'"'+(p.pos?' style="object-position:'+p.pos+'"':'')+'>';
}
function openProject(i, fromEl){
  opener = fromEl || document.activeElement;
  fill(i); modal.hidden = false; modalOpen = true; setHot(null);
  document.body.style.overflow="hidden";
  requestAnimationFrame(function(){
    modal.classList.add("is-open");
    if (fromEl && !reduce.matches && mMedia.animate){
      // the card grows into the post: uniform scale + horizontal clip, so the image never distorts
      var a = fromEl.getBoundingClientRect(), b = mMedia.getBoundingClientRect();
      var s = a.height/b.height, inset = Math.max(0,(b.width - a.width/s)/2);
      var tx = (a.left+a.width/2)-(b.left+b.width/2), ty = (a.top+a.height/2)-(b.top+b.height/2);
      var ease = "cubic-bezier(.22,.8,.24,1)";
      mBox.classList.add("is-flip");
      var an = mMedia.animate([
        {transform:"translate("+tx+"px,"+ty+"px) scale("+s+")",clipPath:"inset(0 "+inset+"px 0 "+inset+"px round 3px)"},
        {transform:"none",clipPath:"inset(0 0 0 0 round 0px)"}
      ],{duration:760,easing:ease});
      mBox.animate([{backgroundColor:"rgba(16,25,29,0)",boxShadow:"0 0 0 0 rgba(29,141,137,0)"},{backgroundColor:"rgba(16,25,29,0)",offset:.35},{backgroundColor:"rgb(16,25,29)",boxShadow:"0 0 0 1px rgb(29,141,137)"}],{duration:760,easing:ease});
      an.onfinish = function(){ mBox.classList.remove("is-flip"); };
    }
    $(".modal__close").focus({preventScroll:true});
  });
}
function closeProject(){
  if (modal.hidden) return;
  modal.classList.remove("is-open");
  var anim = mBox.animate && !reduce.matches ? mBox.animate([{opacity:1,transform:"none"},{opacity:0,transform:"scale(.94)"}],{duration:280,easing:"ease-in"}) : null;
  var done = function(){ modal.hidden = true; mMedia.innerHTML=""; modalOpen=false; document.body.style.overflow=""; if(opener&&opener.focus) opener.focus({preventScroll:true}); };
  if (anim) anim.onfinish = done; else done();
}
$$("[data-close]",modal).forEach(function(b){b.addEventListener("click",closeProject)});
$("#mPrev").addEventListener("click",function(){fill(cur-1)});
$("#mNext").addEventListener("click",function(){fill(cur+1)});
document.addEventListener("click",function(e){ var o=e.target.closest("[data-open]"); if(o){ openProject(+o.dataset.open, o.closest("figure")||o); } });

/* ---------- YouTube background guard (header + Our Work) ----------
   Keeps YouTube's own UI out of sight: the video only shows once its start-up title/controls have faded,
   fades out whenever it pauses or ends (when YouTube shows related videos), and loops by seeking back
   just before the end so the end screen never appears. (YouTube still flashes its play button briefly on each loop.) */
function ytGuard(getFrame, cmd, startAt, onShow){
  var dur=0, ct=0, state=-1, looping=false, firstCt=null, ready=false;
  function vis(){ var f=getFrame(); if(!f) return; var show = state===1 && ready; f.classList.toggle("is-live",show); if(show && onShow) onShow(); }
  window.addEventListener("message",function(e){
    var f=getFrame(); if (!f || e.source!==f.contentWindow) return;
    var d; try{ d = typeof e.data==="string" ? JSON.parse(e.data) : e.data; }catch(x){ return; }
    if (!d || d.info===undefined || d.info===null) return;
    var info=d.info;
    if (typeof info==="object"){
      if (info.duration) dur=info.duration;
      if (typeof info.currentTime==="number"){
        ct=info.currentTime;
        if (state===1 && firstCt===null) firstCt=ct;
        if (!ready && firstCt!==null && ct-firstCt>=3.2) ready=true;     // start-up title/controls have faded
        if (dur && ct>dur-0.35 && !looping){ looping=true; cmd("seekTo",[startAt,true]); cmd("playVideo"); }
        else if (ct<dur-2) looping=false;
      }
    }
    var st = d.event==="onStateChange" ? info : (typeof info==="object" ? info.playerState : undefined);
    if (typeof st==="number"){
      state=st;
      if (st===0){ cmd("seekTo",[startAt,true]); cmd("playVideo"); }
    }
    vis();
  });
}
/* ---------- 01 HOME: muted looping paint film (assets/video) ---------- */
var film=$("#film"), heroInView=true;
function heroPlay(){ if (reduce.matches || motionPaused || !heroInView) return; var pp=film.play(); if(pp&&pp.catch) pp.catch(function(){}); }
new IntersectionObserver(function(es){
  es.forEach(function(en){ heroInView = en.isIntersecting; if (heroInView) heroPlay(); else film.pause(); });
}).observe(home);
heroPlay();

/* ---------- sticker: stays still; spins only while the mouse is over it, faster the closer the pointer is to its centre ---------- */
(function(){
  var st=$("#sticker"); if(!st) return;
  var angle=0, speed=0, target=0, last=0, raf=0;
  var MIN=40, MAX=900; // degrees per second at the rim / at the dead centre
  function frame(t){
    var dt=Math.min(0.05,(t-(last||t))/1000); last=t;
    speed += (target-speed)*Math.min(1,dt*(target>speed?6:3.5)); // quick to speed up, gentle to slow down
    angle=(angle+speed*dt)%360;
    st.style.setProperty("--spin",angle.toFixed(2)+"deg");
    if (target===0 && speed<1){ speed=0; raf=0; last=0; return; }
    raf=requestAnimationFrame(frame);
  }
  function kick(){ if(!raf){ last=0; raf=requestAnimationFrame(frame); } }
  st.addEventListener("pointermove",function(e){
    if (reduce.matches || motionPaused || e.pointerType==="touch") return;
    var r=st.getBoundingClientRect(), rad=st.offsetWidth/2;
    var d=Math.min(1,Math.hypot(e.clientX-(r.left+r.width/2),e.clientY-(r.top+r.height/2))/rad); // 0 centre → 1 rim
    var k=1-d; target=MIN+(MAX-MIN)*k*k;
    kick();
  });
  st.addEventListener("pointerleave",function(){ target=autoSpin(); kick(); });
  /* phones/tablets (no hover): turn slowly on its own while it's on screen */
  var noHover=window.matchMedia("(hover: none), (max-width: 760px)"), stIn=false, AUTO=50;
  function autoSpin(){ return (noHover.matches && stIn && !reduce.matches && !motionPaused) ? AUTO : 0; }
  function syncAuto(){ target=autoSpin(); if(target) kick(); }
  if ("IntersectionObserver" in window) new IntersectionObserver(function(es){ stIn=es[0].isIntersecting; syncAuto(); }).observe(st);
  window.__stickerSync=syncAuto;
})();

/* ---------- 02 background: walkthrough video + YouTube (loads when near) ---------- */
var walk=$("#walk"), bg=$(".work__bg"), yt=null, ytLive=false;
function ytCmd(func,args){ if(yt&&yt.contentWindow){ try{ yt.contentWindow.postMessage(JSON.stringify({event:"command",func:func,args:args||[]}),"*"); }catch(e){} } }
ytGuard(function(){ return yt; }, ytCmd, YT_START, function(){ if(!bg.classList.contains("yt-live")){ bg.classList.add("yt-live"); walk.pause(); } });
function startYT(){
  if (yt || !YT_ID || reduce.matches) return;
  var origin = /^https?:/.test(location.protocol) ? "&origin="+encodeURIComponent(location.origin) : "";
  yt = document.createElement("iframe");
  yt.className="work__yt"; yt.title="Background film"; yt.tabIndex=-1;
  yt.allow="autoplay; encrypted-media; picture-in-picture"; yt.setAttribute("referrerpolicy","strict-origin-when-cross-origin");
  yt.src="https://www.youtube-nocookie.com/embed/"+YT_ID+"?autoplay=1&mute=1&controls=0&disablekb=1&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&fs=0&start="+YT_START+"&enablejsapi=1"+origin;
  yt.addEventListener("load",function(){ try{ yt.contentWindow.postMessage(JSON.stringify({event:"listening",id:"incobg",channel:"widget"}),"*"); }catch(e){} });
  bg.appendChild(yt);
}
window.addEventListener("message",function(e){
  if (!yt || e.source!==yt.contentWindow) return;
  var d; try{ d = typeof e.data==="string" ? JSON.parse(e.data) : e.data; }catch(x){ return; }
  if (!d) return;
  var state = d.event==="onStateChange" ? d.info : (d.info && d.info.playerState);
  if (state===1 && !ytLive){ ytLive=true; ytCmd("mute"); if (motionPaused || !inView) ytCmd("pauseVideo"); }
});
var io = new IntersectionObserver(function(es){
  es.forEach(function(en){
    if (en.target.id==="work"){
      inView = en.isIntersecting;
      if (inView){
        if (!ytLive && !motionPaused && !reduce.matches){ walk.preload="auto"; var pp=walk.play(); if(pp&&pp.catch) pp.catch(function(){}); }
        startYT();
        if (ytLive && !motionPaused) ytCmd("playVideo");
      } else { walk.pause(); if (ytLive) ytCmd("pauseVideo"); }
    }
  });
},{rootMargin:"200px 0px"});
io.observe($("#work"));

/* ---------- 03 SERVICES BOOK (page turn) ---------- */
var spreads = $$("[data-spread]", $("#spreads").content).map(function(s){ return {name:s.dataset.name, l:s.children[0].outerHTML, r:s.children[1].outerHTML}; });
var halfL=$("#halfL"), halfR=$("#halfR"), pages=$("#pages"), pg=0, turning=false;
var bookMQ = window.matchMedia("(max-width: 900px)"); // single-page booklet below this width
var bPrev=$("#bPrev"), bNext=$("#bNext");
function pad(n){return String(n).padStart(2,"0")}
function paint(i){
  halfL.innerHTML=spreads[i].l; halfR.innerHTML=spreads[i].r;
  $("#pgno").textContent=pad(i+1)+" / "+pad(spreads.length);
  $("#book").dataset.tone = i%2 ? "b" : "a";
  // the booklet loops: Next on the last page goes back to the first, Previous on the first goes to the last
  var n=spreads.length;
  bPrev.innerHTML = "&lt;&nbsp; "+spreads[(i-1+n)%n].name;
  bNext.innerHTML = spreads[(i+1)%n].name+" &nbsp;&gt;";
}
function turn(to, dir){
  var n=spreads.length;
  if (dir) to=(to%n+n)%n;
  if (turning || to===pg || to<0 || to>=n) return;
  var fwd = dir ? dir>0 : to>pg, from=pg; pg=to;
  if (reduce.matches || bookMQ.matches || !pages.animate){
    paint(to);
    if (pages.animate && !reduce.matches) pages.animate([{opacity:0,transform:"translateX("+(fwd?24:-24)+"px)"},{opacity:1,transform:"none"}],{duration:450,easing:"cubic-bezier(.22,.8,.24,1)"});
    return;
  }
  turning=true;
  var leaf=document.createElement("div"); leaf.className="leaf";
  leaf.style[fwd?"left":"right"]="50%"; leaf.style.transformOrigin=fwd?"left center":"right center";
  leaf.innerHTML='<div class="leaf__face">'+(fwd?spreads[from].r:spreads[from].l)+'<div class="leaf__shade"></div></div>'+
                 '<div class="leaf__face leaf__face--back">'+(fwd?spreads[to].l:spreads[to].r)+'<div class="leaf__shade"></div></div>';
  // under the leaf: the side being uncovered shows the new page, the other keeps the old one until covered
  if (fwd){ halfR.innerHTML=spreads[to].r; } else { halfL.innerHTML=spreads[to].l; }
  pages.appendChild(leaf);
  var shades=$$(".leaf__shade",leaf);
  shades[0].style.background="linear-gradient("+(fwd?"90deg":"270deg")+",rgba(0,0,0,.0),rgba(0,0,0,.55))";
  shades[1].style.background="linear-gradient("+(fwd?"270deg":"90deg")+",rgba(0,0,0,.0),rgba(0,0,0,.45))";
  var dur=950, ease="cubic-bezier(.45,.05,.25,1)";
  leaf.animate([{transform:"rotateY(0deg)"},{transform:"rotateY("+(fwd?-180:180)+"deg)"}],{duration:dur,easing:ease,fill:"forwards"});
  shades.forEach(function(s,k){ s.animate([{opacity:k?0.9:0},{opacity:.6},{opacity:k?0:0.9}],{duration:dur,easing:ease}); });
  setTimeout(function(){ paint(to); leaf.remove(); turning=false; }, dur);
  $("#pgno").textContent=pad(to+1)+" / "+pad(spreads.length);
  $("#book").dataset.tone = to%2 ? "b" : "a";
}
paint(0);
bPrev.addEventListener("click",function(){turn(pg-1,-1)});
bNext.addEventListener("click",function(){turn(pg+1,1)});
$$(".curl").forEach(function(c){ c.addEventListener("click",function(){ var d=+c.dataset.turn; turn(pg+d,d); }); });
var book=$("#book");
book.addEventListener("keydown",function(e){ if(e.key==="ArrowRight"){e.preventDefault();turn(pg+1,1)} else if(e.key==="ArrowLeft"){e.preventDefault();turn(pg-1,-1)} });
var sx0=null, sy0=null;
pages.addEventListener("touchstart",function(e){ sx0=e.touches[0].clientX; sy0=e.touches[0].clientY; },{passive:true});
pages.addEventListener("touchend",function(e){ if(sx0===null) return; var dx=e.changedTouches[0].clientX-sx0, dy=e.changedTouches[0].clientY-sy0; if(Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy)*1.3) turn(pg+(dx<0?1:-1),dx<0?1:-1); sx0=null; });


/* hooks the shared code calls into */
H.closeProject = closeProject;
H.hideModal = function(){ if (!modal.hidden){ modal.hidden=true; modal.classList.remove("is-open"); mMedia.innerHTML=""; modalOpen=false; } };
H.motion = function(){
  if (!motionPaused) heroPlay();
  if (motionPaused){ walk.pause(); ytCmd("pauseVideo"); film.pause(); }
  else if (inView){ if (ytLive) ytCmd("playVideo"); else { var pp=walk.play(); if(pp&&pp.catch) pp.catch(function(){}); } startYT(); }
};
})();

/* ---------- ENQUIRY DRAWER ---------- */
var drawer=$("#drawer"), dOpener=null, formOpenedAt=0;
function openDrawer(topic){
  dOpener=document.activeElement;
  H.hideModal();
  var sel=$("#fTopic"); if(topic){ for(var i=0;i<sel.options.length;i++) if(sel.options[i].text===topic) sel.selectedIndex=i; }
  $("#dMsg").hidden=true; drawer.hidden=false; document.body.style.overflow="hidden"; formOpenedAt=Date.now();
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ drawer.classList.add("is-open"); $("#fName").focus({preventScroll:true}); }); });
}
function closeDrawer(){
  if (drawer.hidden) return;
  drawer.classList.remove("is-open");
  setTimeout(function(){ drawer.hidden=true; document.body.style.overflow=""; if(dOpener&&dOpener.focus) dOpener.focus({preventScroll:true}); }, reduce.matches?0:500);
}
document.addEventListener("click",function(e){ var b=e.target.closest("[data-enquire]"); if(b){ e.preventDefault(); openDrawer(b.dataset.enquire); } });
$$("[data-dclose]",drawer).forEach(function(b){b.addEventListener("click",closeDrawer)});
/* Enquiry delivery: FormSubmit (formsubmit.co) e-mails each enquiry to kovan@incocreative.com over HTTPS.
   Protection: hidden honeypot field, minimum fill time, length limits, consent tick, one send per minute,
   and a pre-filled e-mail fallback if the service can't be reached. */
var ENQ_TO="kovan@incocreative.com", ENQ_URL="https://formsubmit.co/ajax/"+ENQ_TO, sending=false;
function enqMsg(html, err){ var m=$("#dMsg"); m.hidden=false; m.classList.toggle("is-err",!!err); m.innerHTML=html; }
function esc(t){ return String(t).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];}); }
function mailtoFallback(d){
  var body="Name: "+d.name+"\nEmail: "+d.email+(d.phone?"\nPhone: "+d.phone:"")+"\nInterested in: "+d.topic+"\n\n"+d.message;
  return "mailto:"+ENQ_TO+"?subject="+encodeURIComponent("Website enquiry: "+d.topic)+"&body="+encodeURIComponent(body);
}
$("#enqForm").addEventListener("submit",function(e){
  e.preventDefault();
  if (sending) return;
  var n=$("#fName"), em=$("#fEmail"), ph=$("#fPhone"), msg=$("#fMsg"), ok=$("#fConsent"), hp=$("#fWeb");
  var d={ name:n.value.trim().slice(0,80), email:em.value.trim().slice(0,120), phone:ph.value.trim().slice(0,30),
          topic:$("#fTopic").value, message:msg.value.trim().slice(0,2000) };
  if (hp.value){ enqMsg("Thanks, your enquiry has been sent."); return; }            // bot: pretend success, send nothing
  if (!d.name){ enqMsg("Add your name so iNCO knows who to reply to.",1); n.focus(); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)){ enqMsg("Enter an email address like name@example.com.",1); em.focus(); return; }
  if (d.phone && !/^[+()\d\s-]{7,30}$/.test(d.phone)){ enqMsg("Check the phone number (digits, spaces, + and - only).",1); ph.focus(); return; }
  if (d.message.length<10){ enqMsg("Tell us a little about what you need (at least a sentence).",1); msg.focus(); return; }
  if (!ok.checked){ enqMsg("Please tick the box so iNCO may use your details to reply.",1); ok.focus(); return; }
  if (Date.now()-formOpenedAt < 3000){ enqMsg("That was quick! Please check your details and press send again.",1); return; }
  var last=0; try{ last=+sessionStorage.getItem("incoEnqSent")||0; }catch(x){}
  if (Date.now()-last < 60000){ enqMsg("Your enquiry is already on its way. Please wait a minute before sending another.",1); return; }
  sending=true; var btn=$("#fSend"); btn.disabled=true; btn.textContent="Sending…";
  var payload={ name:d.name, email:d.email, phone:d.phone||"Not given", interested_in:d.topic, message:d.message,
    _subject:"New website enquiry: "+d.topic+" ("+d.name+")", _template:"table", _captcha:"false", _honey:"" };
  var done=function(){ sending=false; btn.disabled=false; btn.textContent="Send enquiry"; };
  fetch(ENQ_URL,{ method:"POST", headers:{"Content-Type":"application/json","Accept":"application/json"}, body:JSON.stringify(payload) })
    .then(function(r){ return r.json().catch(function(){ return {success:r.ok?"true":"false"}; }); })
    .then(function(res){
      done();
      if (String(res.success)==="true"){
        try{ sessionStorage.setItem("incoEnqSent", String(Date.now())); }catch(x){}
        $("#enqForm").reset();
        enqMsg("Thanks, "+esc(d.name.split(" ")[0])+". Your enquiry has been sent to the iNCO team. We&rsquo;ll reply to "+esc(d.email)+" soon.");
      } else {
        enqMsg("Sorry, the enquiry couldn&rsquo;t be sent just now. <a href=\""+mailtoFallback(d)+"\">Email it to "+ENQ_TO+" instead</a> (your message is already filled in).",1);
      }
    })
    .catch(function(){ done(); enqMsg("Sorry, we couldn&rsquo;t reach the server. <a href=\""+mailtoFallback(d)+"\">Email it to "+ENQ_TO+" instead</a> (your message is already filled in).",1); });
});
document.addEventListener("keydown",function(e){ if(e.key==="Escape"){ H.closeProject(); closeDrawer(); setMenu(false); } });

/* ---------- NAV: solid after hero, scroll-spy, mobile menu ---------- */
var nav=$("#nav"), menuBtn=$("#menuBtn");
function setMenu(open){ nav.classList.toggle("menu-open",open); menuBtn.setAttribute("aria-expanded",open?"true":"false"); menuBtn.textContent=open?"CLOSE":"MENU"; }
menuBtn.addEventListener("click",function(){ setMenu(!nav.classList.contains("menu-open")); });
$$(".nav__links a").forEach(function(a){ a.addEventListener("click",function(){ setMenu(false); }); });
function onScroll(){
  var y = window.scrollY, h = home ? home.offsetHeight : 0;
  if (home && !reduce.matches) home.style.setProperty("--hx", Math.min(1, Math.max(0, y/h)).toFixed(3));
  nav.classList.toggle("is-solid", y > h*0.6);
  // nav grows from a pill into a full-width bar over the last half-screen before it reaches the top
  var nt=nav.getBoundingClientRect().top;
  nav.style.setProperty("--nx", (1 - Math.min(1, Math.max(0, nt/(window.innerHeight*0.5)))).toFixed(3));
  if (!home) return;   // service pages keep their own "current page" highlight
  var ids=["home","process","services","clients","spaces","faq","contact"], act=null, mid=y+window.innerHeight*0.45;
  ids.forEach(function(id){ var el=document.getElementById(id); if(el && el.offsetParent && el.getBoundingClientRect().top+y<=mid) act=id; });
  if (window.innerHeight + y >= document.documentElement.scrollHeight - 4) act="contact";
  $$(".nav__links a").forEach(function(a){ a.classList.toggle("is-active", a.dataset.spy===act); });
}
window.addEventListener("scroll",onScroll,{passive:true}); onScroll();

/* ---------- 04 directions note ---------- */


/* ---------- reveal on scroll (content stays visible without JS) ---------- */
if (!reduce.matches && "IntersectionObserver" in window){
  var rv = $$(".rv").filter(function(el){ return el.getBoundingClientRect().top > window.innerHeight; });
  rv.forEach(function(el){ el.classList.add("pre"); });
  var rio = new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ en.target.classList.remove("pre"); rio.unobserve(en.target); } }); },{rootMargin:"0px 0px -8% 0px"});
  rv.forEach(function(el){ rio.observe(el); });
}


/* ---------- RATES & PACKAGES tabs ---------- */
var ptabs=$$(".ptabs [role=tab]");
function selectTab(key, focus){
  ptabs.forEach(function(t){
    var on = t.id==="tab-"+key;
    t.setAttribute("aria-selected", on?"true":"false"); t.tabIndex = on?0:-1;
    var panel=document.getElementById(t.getAttribute("aria-controls")); if(panel) panel.hidden=!on;
    if(on && focus) t.focus();
  });
}
ptabs.forEach(function(t,i){
  t.addEventListener("click",function(){ selectTab(t.id.slice(4)); });
  t.addEventListener("keydown",function(e){
    var d = e.key==="ArrowRight"?1:e.key==="ArrowLeft"?-1:0; if(!d) return;
    e.preventDefault(); selectTab(ptabs[(i+d+ptabs.length)%ptabs.length].id.slice(4), true);
  });
});

/* ---------- EVENT BOOKING form (Events card) ----------
   Date / event type / pax are pickers; name, email and phone are typed; add-ons are Required | Supplying myself toggles.
   Book this checks the required fields (inline errors), POSTs one JSON booking to HUBS, then e-mails a copy to the
   bookings address (FormSubmit). Until HUBS_URL is filled in, the e-mail is the only delivery.
   Spam guards as on the enquiry form: honeypot, minimum fill time, one send per minute. */
(function(){
var bk=$("#bkForm"); if(!bk) return;
var MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"],
    DAYS=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
var dBtn=$("#bkDate"), dTxt=$("#bkDateTxt"), cal=$("#bkCal"), info=$("#bkInfo"), count=$("#bkCount");
function day0(d){ return new Date(d.getFullYear(),d.getMonth(),d.getDate()); }
var today=day0(new Date()), maxD=new Date(today.getFullYear(),today.getMonth()+19,0);   // bookable up to ~18 months ahead
function closed(d){ var m=d.getMonth(), x=d.getDate(); return (m===11&&x>=18)||(m===0&&x<=6); }   // studio closed 18 Dec – 6 Jan
function blocked(d){ return d<today || d>maxD || closed(d); }
function same(a,b){ return !!a && !!b && a.getTime()===b.getTime(); }
function longDate(d){ return DAYS[d.getDay()]+", "+d.getDate()+" "+MONTHS[d.getMonth()]+" "+d.getFullYear(); }
function shortDate(d){ return DAYS[d.getDay()].slice(0,3)+", "+d.getDate()+" "+MONTHS[d.getMonth()].slice(0,3)+" "+d.getFullYear(); }
var sel=null, view=new Date(today.getFullYear(),today.getMonth(),1), focusD=null;
var arrow=function(p){ return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="'+p+'"/></svg>'; };
function render(){
  var y=view.getFullYear(), m=view.getMonth(), first=new Date(y,m,1), n=new Date(y,m+1,0).getDate(), lead=(first.getDay()+6)%7;
  var h='<div class="bk__calhead"><button class="bk__nav" type="button" data-nav="-1" aria-label="Previous month"'+(y===today.getFullYear()&&m===today.getMonth()?" disabled":"")+'>'+arrow("M15 5l-7 7 7 7")+'</button>'
       +'<p class="bk__month" aria-live="polite">'+MONTHS[m]+' '+y+'</p>'
       +'<button class="bk__nav" type="button" data-nav="1" aria-label="Next month"'+(new Date(y,m+1,1)>maxD?" disabled":"")+'>'+arrow("M9 5l7 7-7 7")+'</button></div>'
       +'<div class="bk__wd" aria-hidden="true"><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span></div><div class="bk__days">';
  for (var i=0;i<lead;i++) h+='<span></span>';
  var tab=null;
  if (focusD && focusD.getMonth()===m && focusD.getFullYear()===y && !blocked(focusD)) tab=focusD;
  else if (sel && sel.getMonth()===m && sel.getFullYear()===y) tab=sel;
  for (var x=1;x<=n;x++){ var d=new Date(y,m,x); if(!tab && !blocked(d)) tab=d; }
  for (x=1;x<=n;x++){
    d=new Date(y,m,x); var off=blocked(d);
    h+='<button class="bk__day'+(same(d,today)?" is-today":"")+(closed(d)?" is-closed":"")+'" type="button" data-d="'+x+'"'
      +' aria-label="'+longDate(d)+(closed(d)?" (studio closed)":"")+'" aria-pressed="'+(same(d,sel)?"true":"false")+'"'
      +' tabindex="'+(same(d,tab)?0:-1)+'"'+(off?" disabled":"")+'>'+x+'</button>';
  }
  h+='</div><p class="bk__calnote">Studio closed 18 Dec – 6 Jan.</p>';
  cal.innerHTML=h;
}
function focusDay(){ var b=cal.querySelector('.bk__day[tabindex="0"]'); if(b) b.focus(); }
function openCal(){ if(sel) view=new Date(sel.getFullYear(),sel.getMonth(),1); focusD=null; render(); cal.hidden=false; dBtn.setAttribute("aria-expanded","true"); focusDay(); }
function closeCal(back){ if(cal.hidden) return; cal.hidden=true; dBtn.setAttribute("aria-expanded","false"); if(back) dBtn.focus(); }
function setErr(id,on){
  var f=$("#"+id+"F"), e=$("#"+id+"Err"), c=$("#"+id);
  f.classList.toggle("is-err",on); e.hidden=!on;
  if(on) c.setAttribute("aria-invalid","true"); else c.removeAttribute("aria-invalid");
}
function pick(d){ sel=d; dTxt.textContent=shortDate(d); dBtn.classList.add("has-val"); setErr("bkDate",false); closeCal(true); }
dBtn.addEventListener("click",function(){ if(cal.hidden) openCal(); else closeCal(true); });
cal.addEventListener("click",function(e){
  var nb=e.target.closest(".bk__nav"); if(nb){ view=new Date(view.getFullYear(),view.getMonth()+(+nb.dataset.nav),1); focusD=null; render(); var again=cal.querySelector('[data-nav="'+nb.dataset.nav+'"]'); (again&&!again.disabled?again:cal.querySelector('.bk__day[tabindex="0"]')||dBtn).focus(); return; }
  var b=e.target.closest(".bk__day"); if(b && !b.disabled) pick(new Date(view.getFullYear(),view.getMonth(),+b.dataset.d));
});
cal.addEventListener("keydown",function(e){
  if (e.key==="Escape"){ e.preventDefault(); e.stopPropagation(); closeCal(true); return; }
  var b=e.target.closest(".bk__day"); if(!b) return;
  var step={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7}[e.key]; if(!step) return;
  e.preventDefault();
  var d=new Date(view.getFullYear(),view.getMonth(),+b.dataset.d), s=step>0?1:-1;
  d.setDate(d.getDate()+step);
  for (var i=0;i<60 && d>=today && d<=maxD && blocked(d);i++) d.setDate(d.getDate()+s);   // skip the closed period
  if (blocked(d)) return;
  focusD=d; view=new Date(d.getFullYear(),d.getMonth(),1); render(); focusDay();
});
document.addEventListener("click",function(e){ if(!cal.hidden && e.target.isConnected && !e.target.closest(".bk__dwrap")) closeCal(false); });
["bkType","bkPax"].forEach(function(id){ $("#"+id).addEventListener("change",function(){ setErr(id,false); }); });
["bkName","bkEmail","bkPhone"].forEach(function(id){ $("#"+id).addEventListener("input",function(){ setErr(id,false); }); });
info.addEventListener("input",function(){ count.textContent=info.value.length+" / 500"; });
var HUBS_URL="";                          // HUBS booking endpoint: paste the URL here (it must accept cross-origin JSON POSTs)
var BOOKINGS_TO=ENQ_TO, BK_MAIL_URL="https://formsubmit.co/ajax/"+BOOKINGS_TO;   // bookings address for the e-mailed copy
var SITE=location.origin+location.pathname.replace(/[^\/]*$/,"");   // + "events" / "studio-hire" as the booking source
var ADDON_KEYS=["catering","seating_tables","videography_photography","security","sound","decor","entertainment","lighting"],
    ADDON_LABELS={required:"Required",self_supplied:"Supplying myself",not_needed:"Not needed"};
/* add-on toggles: tap to highlight, tap again to clear, one option per item; nothing selected = not needed */
$$(".seg").forEach(function(g){
  g.addEventListener("click",function(e){
    var b=e.target.closest(".seg__btn"); if(!b) return;
    var on=b.getAttribute("aria-pressed")!=="true";
    $$(".seg__btn",g).forEach(function(x){ x.setAttribute("aria-pressed", x===b&&on?"true":"false"); });
  });
});
function addOns(){
  var o={}; ADDON_KEYS.forEach(function(k){ var g=mode==="evt"&&$('.seg[data-addon="'+k+'"]'), a=g&&g.querySelector('[aria-pressed="true"]'); o[k]=a?a.dataset.val:"not_needed"; });
  return o;
}
/* one booking form, many homes: inline on the Event Package card (or tucked away on pages without one), or in a "Your booking" panel under the cards
   of whichever tab's Book this was pressed (Vodcasting, Videography, Photography, Studio Hire). Each tab has its own wording. */
var MODES={
  evt:{ label:"Book the event space", dateErr:"Choose a date for your event.", typeLbl:"Event type", typePh:"Select event type", typeErr:"Choose the type of event.",
        types:["Corporate function","Product launch","Conference / seminar","Workshop / training","Networking event","Brand activation","Private celebration","Other"],
        paxLbl:"Expected pax", paxPh:"Select guest count", paxErr:"Choose how many guests you expect.", help:"Maximum 100 guests",
        pax:["10–20","21–30","31–40","41–50","51–60","61–70","71–80","81–90","91–100"], source:"events" },
  std:{ label:"Book the studio", dateErr:"Choose a date for your shoot.", typeLbl:"Shoot type", typePh:"Select shoot type", typeErr:"Choose the type of shoot.",
        types:["Photography","Videography","Photo + video","Content creation","Other"],
        paxLbl:"People on set", paxPh:"Select number of people", paxErr:"Choose how many people will be on set.", help:"",
        pax:["1–5","6–10","11–15","16–20"], source:"studio-hire" },
  pod:{ label:"Book a vodcast session", dateErr:"Choose a date for your recording.", typeLbl:"Vodcast format", typePh:"Select vodcast format", typeErr:"Choose the vodcast format.",
        types:["Solo","Interview (1 guest)","Panel discussion","Live stream","Other"],
        paxLbl:"People on mic", paxPh:"Select number of people", paxErr:"Choose how many people will be on mic.", help:"",
        pax:["1","2","3","4"], source:"podcasting" },
  vid:{ label:"Book a video shoot", dateErr:"Choose a date for your shoot.", typeLbl:"Video type", typePh:"Select video type", typeErr:"Choose the type of video.",
        types:["Brand / corporate film","Interview","Social content","Event coverage","Music video","Other"],
        paxLbl:"People on camera", paxPh:"Select number of people", paxErr:"Choose how many people will be on camera.", help:"",
        pax:["1–2","3–5","6–10","11–20","20+"], source:"videography" },
  pho:{ label:"Book a photo shoot", dateErr:"Choose a date for your shoot.", typeLbl:"Shoot type", typePh:"Select shoot type", typeErr:"Choose the type of shoot.",
        types:["Headshots / portraits","Product","Team / corporate","Fashion / lifestyle","Content library","Other"],
        paxLbl:"People in the shoot", paxPh:"Select number of people", paxErr:"Choose how many people will be photographed.", help:"",
        pax:["None (product only)","1","2–5","6–10","11–20","20+"], source:"photography" } };
var BOOK_TRIGGER='.tier [data-book], .tier a[href^="mailto:"]';   // the card buttons (mailto links stay as the no-script fallback)
var mode="evt", doneMsg=null, evtHome=bk.parentNode,
    EVT={ name:bk.dataset.package, price:bk.dataset.priceZar, duration:bk.dataset.duration };
function fillSel(el,ph,list){ el.innerHTML='<option value="" disabled selected>'+ph+'</option>'+list.map(function(t){ return "<option>"+t+"</option>"; }).join(""); }
function setMode(m,pkg){
  var M=MODES[m];
  if (mode!==m){
    mode=m; fillSel($("#bkType"),M.typePh,M.types); fillSel($("#bkPax"),M.paxPh,M.pax);
    $('label[for="bkType"]').textContent=M.typeLbl; $('label[for="bkPax"]').textContent=M.paxLbl;
    var h=$("#bkPaxHelp"); h.textContent=M.help; h.hidden=!M.help;
    $("#bkDateErr").textContent=M.dateErr; $("#bkTypeErr").textContent=M.typeErr; $("#bkPaxErr").textContent=M.paxErr;
    setErr("bkType",false); setErr("bkPax",false);
    bk.setAttribute("aria-label",M.label);
    $("#bkAddons").hidden = m!=="evt";   // add-ons only apply to event bookings
  }
  bk.dataset.package=pkg.name; bk.dataset.priceZar=pkg.price; bk.dataset.duration=pkg.duration;
  $("#bkMsg").hidden=true;
}
function freshForm(){   // after a sent booking, moving the form brings back a clean copy
  if (!doneMsg) return;
  doneMsg.remove(); doneMsg=null; bk.reset(); bk.hidden=false;
  sel=null; dTxt.textContent="Choose a date"; dBtn.classList.remove("has-val"); count.textContent="0 / 500"; started=0;
}
function clearPicks(panel){   // a tab the form has left: no picked card, booking panel closed
  if (!panel) return;
  var sb=panel.querySelector(".sbook"); if (sb && !sb.contains(bk)) sb.hidden=true;
  $$(".tier",panel).forEach(function(t){ t.classList.remove("is-picked"); });
  $$(BOOK_TRIGGER,panel).forEach(function(x){ x.setAttribute("aria-expanded","false"); });
}
function goHome(){
  if (bk.parentNode===evtHome && mode==="evt") return;
  var from=bk.closest(".ppanel");
  closeCal(false); freshForm(); evtHome.appendChild(bk); setMode("evt",EVT); clearPicks(from);
}
function slotFor(panel,key){
  var sb=panel.querySelector(".sbook");
  if (!sb){
    sb=document.createElement("section"); sb.className="sbook"; sb.id="book-"+key; sb.hidden=true; sb.setAttribute("aria-labelledby","book-"+key+"-title");
    sb.innerHTML='<p class="eyebrow">Your booking</p><h3 class="sbook__title" id="book-'+key+'-title"></h3><div></div>';
    var t=panel.querySelector(".tiers"); t.parentNode.insertBefore(sb,t.nextSibling);
  }
  return sb;
}
document.addEventListener("click",function(e){
  if (!e.target.closest) return;
  var b=e.target.closest(BOOK_TRIGGER), panel=b&&b.closest(".ppanel"), key=panel&&panel.id.replace("panel-","");
  if (!b || !MODES[key] || key==="evt") return;
  e.preventDefault();
  var card=b.closest(".tier"), pr=card.querySelector(".tier__price"), sm=pr.querySelector("small"), priceTxt=pr.firstChild.textContent.trim(),
      dur=b.dataset.duration || (sm?sm.textContent.trim():"");
  dur=dur.charAt(0).toUpperCase()+dur.slice(1);
  var pkg={ name:b.dataset.book || card.querySelector("h3").textContent.trim().replace(/’/g,"'"),
            price:b.dataset.price || priceTxt.replace(/\D/g,""), duration:dur };
  var from=bk.closest(".ppanel");
  closeCal(false); freshForm();
  $$(".tier",panel).forEach(function(t){ t.classList.toggle("is-picked",t===card); });
  $$(BOOK_TRIGGER,panel).forEach(function(x){ x.setAttribute("aria-expanded",x===b?"true":"false"); });
  setMode(key,pkg);
  var sb=slotFor(panel,key), slot=sb.querySelector("div");
  sb.querySelector(".sbook__title").textContent=pkg.name+" – "+priceTxt+" · "+dur.toLowerCase();
  if (bk.parentNode!==slot) slot.appendChild(bk);
  if (from && from!==panel) clearPicks(from);
  sb.hidden=false;
  sb.scrollIntoView({ behavior:reduce.matches?"auto":"smooth", block:"start" });
  dBtn.focus({preventScroll:true});
});
var tabSelect=selectTab;
selectTab=function(k,f){ tabSelect(k,f); if(k==="evt") goHome(); else { var p=$("#panel-"+k); if(p && !p.contains(bk)) clearPicks(p); } };   // Events tab always shows its own form
var gear=$("#gearBtn");
if (gear) gear.addEventListener("click",function(e){   // until the gear app URL is in, ask through the enquiry form instead
  if (gear.getAttribute("href")!=="#gear-app") return;
  e.preventDefault(); openDrawer("General enquiry");
  $("#fMsg").value="I'd like to rent some gear for my studio session.";
});
var started=0, sendingBk=false, sendBtn=$("#bkSend"), bkMsgEl=$("#bkMsg");
bk.addEventListener("focusin",function(){ if(!started) started=Date.now(); });
function bkMsg(html,err){ bkMsgEl.hidden=false; bkMsgEl.classList.toggle("is-err",!!err); bkMsgEl.innerHTML=html; }
function isoDate(d){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function postJSON(url,body){
  var ctl=window.AbortController?new AbortController():null, t=ctl?setTimeout(function(){ ctl.abort(); },20000):0;
  return fetch(url,{ method:"POST", headers:{"Content-Type":"application/json","Accept":"application/json"}, body:JSON.stringify(body), signal:ctl?ctl.signal:undefined })
    .then(function(r){ clearTimeout(t); return r; },function(err){ clearTimeout(t); throw err; });
}
function emailCopy(p){
  var f={ _subject:"New booking: "+p.package+" on "+p.event_date+" ("+p.contact.name+")", _template:"table", _captcha:"false", _honey:"", _replyto:p.contact.email,
    package:p.package+" (R"+p.price_zar+", "+p.duration+")", event_date:p.event_date, event_type:p.event_type, expected_pax:p.expected_pax,
    name:p.contact.name, email:p.contact.email, phone:p.contact.phone||"Not given", other_info:p.other_info||"None" };
  ADDON_KEYS.forEach(function(k){ f["add_on_"+k]=ADDON_LABELS[p.add_ons[k]]; });
  f.source=p.source; f.submitted_at=p.submitted_at; f.payload_json=JSON.stringify(p);
  return postJSON(BK_MAIL_URL,f)
    .then(function(r){ return r.json().catch(function(){ return {success:r.ok?"true":"false"}; }); })
    .then(function(res){ if(String(res.success)!=="true") throw new Error("e-mail copy not sent"); });
}
bk.addEventListener("submit",function(e){
  e.preventDefault(); closeCal(false);
  if (sendingBk) return;
  var d={ type:$("#bkType").value, pax:$("#bkPax").value,
          name:$("#bkName").value.trim().slice(0,80), email:$("#bkEmail").value.trim().slice(0,120),
          phone:$("#bkPhone").value.trim().slice(0,30), other:info.value.trim().slice(0,500) };
  var checks=[["bkDate",!sel,dBtn],["bkType",!d.type],["bkPax",!d.pax],["bkName",!d.name],
              ["bkEmail",!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)],["bkPhone",!!d.phone && !/^[+()\d\s-]{7,30}$/.test(d.phone)]], first=null;
  checks.forEach(function(c){ setErr(c[0],c[1]); if(c[1] && !first) first=c[2]||$("#"+c[0]); });
  bkMsgEl.hidden=true;
  if (first){ first.focus(); return; }
  if ($("#bkWeb").value){ bkMsg("Thanks, your booking request has been sent."); return; }   // bot: pretend success, send nothing
  if (Date.now()-started < 3000){ bkMsg("That was quick! Please check your details and press Book this again.",1); return; }
  var last=0; try{ last=+sessionStorage.getItem("incoBkSent")||0; }catch(x){}
  if (Date.now()-last < 60000){ bkMsg("Your booking request is already on its way. Please wait a minute before sending another.",1); return; }
  var payload={ package:bk.dataset.package, price_zar:+bk.dataset.priceZar, duration:bk.dataset.duration,
    event_date:isoDate(sel), event_type:d.type, expected_pax:d.pax, other_info:d.other,
    contact:{ name:d.name, email:d.email, phone:d.phone },
    add_ons:addOns(), source:SITE+MODES[mode].source, submitted_at:new Date().toISOString() };
  sendingBk=true; bk.setAttribute("aria-busy","true"); sendBtn.disabled=true;
  sendBtn.innerHTML='<span class="bk__spin" aria-hidden="true"></span>Sending…';
  var done=function(){ sendingBk=false; bk.removeAttribute("aria-busy"); sendBtn.disabled=false; sendBtn.textContent="Book this"; };
  var send = HUBS_URL
    ? postJSON(HUBS_URL,payload).then(function(r){ if(!r.ok) throw new Error("HUBS "+r.status); emailCopy(payload).catch(function(){}); })
    : emailCopy(payload);
  send.then(function(){
      done();
      try{ sessionStorage.setItem("incoBkSent", String(Date.now())); }catch(x){}
      var ok=document.createElement("p"); ok.className="bk__msg bk__done"; ok.setAttribute("role","status"); ok.tabIndex=-1;
      ok.textContent="Booking request sent. The Hub team will be in touch to confirm availability.";
      bk.hidden=true; bk.parentNode.insertBefore(ok,bk.nextSibling); doneMsg=ok; ok.focus({preventScroll:true}); ok.scrollIntoView({block:"nearest"});
      $$(".seg__btn").forEach(function(x){ x.setAttribute("aria-pressed","false"); });
    })
    .catch(function(){
      done();
      bkMsg("Something went wrong &ndash; please try again or email <a href=\"mailto:"+BOOKINGS_TO+"?subject="+encodeURIComponent("Event booking: "+payload.event_date)+"\">"+BOOKINGS_TO+"</a>.",1);
    });
});
})();

/* ---------- motion: paused automatically when the visitor's device asks for reduced motion ---------- */
function applyMotion(){
  doc.classList.toggle("paused",motionPaused);
  if (window.__stickerSync) window.__stickerSync();
  H.motion();
}
applyMotion();

/* ---------- back to top: shows once you've scrolled past the header ---------- */
var toTop=$("#toTop");
function toTopState(){ var on = window.scrollY > Math.max(400, home ? home.offsetHeight*0.8 : 0); toTop.classList.toggle("is-on",on); toTop.tabIndex = on ? 0 : -1; }
window.addEventListener("scroll",toTopState,{passive:true}); toTopState();
toTop.addEventListener("click",function(){
  window.scrollTo({top:0, behavior: reduce.matches ? "auto" : "smooth"});
  var skip=$(".nav__logo")||$("#home"); if (skip && skip.focus) setTimeout(function(){ skip.focus({preventScroll:true}); }, reduce.matches?0:700);
});


/* ---------- old #vodcasting-style links now go to the real service pages ---------- */
var OLD={ "#vodcasting":"vodcasting.html", "#videography":"videography.html", "#photography":"photography.html", "#events":"events.html" };
if (OLD[location.hash]) location.replace(OLD[location.hash]);
})();
