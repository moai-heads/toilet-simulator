(() => {
  'use strict';
  const KEY='porcelain-inc-save-v1';
  const canvas=document.getElementById('game'),ctx=canvas.getContext('2d',{alpha:false});
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const money=n=>`$${Math.round(n)}`;
  const foods=[
    {id:'mystery-burrito',name:'Mystery burrito',emoji:'🌯',cost:7,line:'A gas-station classic.',effect:'SPICE + MYSTERY',spice:3,fiber:1,drain:0,stim:0,taste:2,risk:.15,control:-.7,volume:2.3,color:'Questionable orange',challenge:1.4},
    {id:'bran-flakes',name:'Bran of the brave',emoji:'🥣',cost:10,line:'Your gut’s new best friend.',effect:'FIBER · EASY MODE',spice:0,fiber:5,drain:0,stim:1,taste:2,risk:.015,control:1.5,volume:3.2,color:'Wholesome brown',challenge:1.2},
    {id:'triple-espresso',name:'Triple espresso',emoji:'☕',cost:9,line:'One cup. Three decisions.',effect:'STIMULANT + BLADDER',spice:0,fiber:0,drain:4,stim:5,taste:3,risk:.02,control:-1.2,volume:1.4,color:'Dark roast',challenge:1.8},
    {id:'chili-dog',name:'Volcano chili dog',emoji:'🌭',cost:13,line:'A very loud lunch.',effect:'MAXIMUM SPICE',spice:5,fiber:1,drain:1,stim:0,taste:4,risk:.075,control:-1.4,volume:2.8,color:'Sunset red',challenge:2.5},
    {id:'garden-salad',name:'Garden-party salad',emoji:'🥗',cost:18,line:'Leaves with a trust fund.',effect:'FIBER · LOW RISK',spice:0,fiber:4,drain:0,stim:0,taste:4,risk:.01,control:1.2,volume:2.6,color:'Garden green',challenge:1.5},
    {id:'luxury-risotto',name:'Truffle risotto',emoji:'🍚',cost:34,line:'The porcelain is impressed.',effect:'LUXURY · SMOOTH SAILING',spice:0,fiber:2,drain:0,stim:0,taste:5,risk:.008,control:1.1,volume:2.1,color:'Golden cream',challenge:2.1},
    {id:'mystery-noodles',name:'2 a.m. mystery noodles',emoji:'🍜',cost:5,line:'The flavor is classified.',effect:'CHEAP · HIGH RISK',spice:2,fiber:0,drain:1,stim:1,taste:1,risk:.24,control:-1.3,volume:2.2,color:'Neon-ish (hmm)',challenge:2.7},
    {id:'milkshake',name:'Mega milkshake',emoji:'🥤',cost:11,line:'Milk. Ice cream. Poor timing.',effect:'BIG VOLUME',spice:0,fiber:0,drain:1,stim:0,taste:5,risk:.025,control:-.1,volume:4.2,color:'Vanilla beige',challenge:1.7},
    {id:'mushroom-tea',name:'Moonbeam mushroom tea',emoji:'🍄',cost:22,line:'The tiles start to breathe.',effect:'PSYCHEDELIC TRIP',spice:0,fiber:0,drain:1,stim:1,taste:3,risk:.055,control:-.6,volume:1.8,color:'Tie-dye (allegedly)',challenge:2.6,psychedelic:true},
    {id:'cigarette-break',name:'Cigarette break',emoji:'🚬',cost:6,line:'A very questionable combo.',effect:'STIMULANT · DIURETIC',spice:0,fiber:0,drain:3,stim:3,taste:0,risk:.09,control:-1,volume:1.3,color:'Ashen tan',challenge:2}
  ];
  const skinColors=['#f5d2b5','#e7ad83','#c98962','#9a634c','#704b3e','#4b352e'];
  const hairColors=['#493b35','#211e20','#875236','#d5a34e','#a74837','#e7e1d1','#6b7c88'];
  const achievements=[
    {id:'first-shift',icon:'🧻',name:'First Flush',desc:'Complete your first movement.',test:s=>s.totalMovements>=1},
    {id:'five-days',icon:'📆',name:'Clocking In',desc:'Complete 5 movements.',test:s=>s.totalMovements>=5},
    {id:'ten-days',icon:'🪠',name:'Porcelain Regular',desc:'Complete 10 movements.',test:s=>s.totalMovements>=10},
    {id:'precision',icon:'🎯',name:'Aim for the Stars',desc:'Score 90 or higher.',test:(s,r)=>r.score>=90},
    {id:'brave-gut',icon:'🌶️',name:'Brave Gut',desc:'Score 75+ after a risky meal.',test:(s,r)=>r.score>=75&&r.risk>=.18},
    {id:'fine-dining',icon:'🥂',name:'Gastro-nomical',desc:'Score 85+ on a luxury meal.',test:(s,r)=>r.score>=85&&r.difficulty>=4},
    {id:'clean-living',icon:'🍀',name:'Clean Getaway',desc:'3 movements without food poisoning.',test:s=>s.cleanStreak>=3},
    {id:'high-roller',icon:'💸',name:'The Big Flush',desc:'Have $250 in your wallet.',test:s=>s.cash>=250}
  ];
  const quips=['Life’s too short for a boring bathroom break.','Believe in yourself. And maybe the fiber.','Every legend starts with a questionable lunch.','A watched needle never lands in the window. (It does.)','You can’t spell “career” without “rear”.','Today’s forecast: scattered plops, with a chance of glory.'];
  const fresh=()=>({version:2,day:1,phase:'shop',cash:100,health:100,totalMovements:0,successfulMovements:0,totalEarned:0,bestScore:0,cleanStreak:0,achievements:[],sound:true,avatar:{pronouns:'masc',skin:skinColors[1],hair:hairColors[0]},cart:{},daily:null});
  function load(){try{const a=JSON.parse(localStorage.getItem(KEY));if(!a||![1,2].includes(a.version))return fresh();const b={...fresh(),...a,avatar:{...fresh().avatar,...a.avatar},cart:a.cart||{},achievements:Array.isArray(a.achievements)?a.achievements:[]};if(a.version===1)b.sound=true;b.version=2;if(!['shop','toilet','results'].includes(b.phase))b.phase='shop';b.cash=Math.max(0,Number(b.cash)||0);b.health=clamp(Number(b.health)||100,1,100);return b}catch{return fresh()}}
  let state=load(),W=innerWidth,H=innerHeight,DPR=1,mobile=false,layout={},hits=[],hitClip=null,pointer={x:-1,y:-1},drag=null,menuScroll=0,toast='',toastAt=0,lastTime=0,needle=7,needleDir=1,audio=null,musicOn=false,modal=null,modalScroll=0,reducedMotion=!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const C={ink:'#193c32',deep:'#123b32',green:'#4f876a',green2:'#74a07b',mint:'#e7efe3',mint2:'#d9e7d7',paper:'#fffdf7',cream:'#f7f4ec',coral:'#df7a5b',coralDark:'#b95c45',gold:'#e7ad55',line:'#e9e2d5',muted:'#858d80',gray:'#a5a99d',red:'#bc5546'};
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{toastMsg('Could not save in this browser.')}}
  function items(){return Object.values(state.cart).reduce((a,b)=>a+(Number(b)||0),0)}
  function selected(){return foods.filter(f=>(state.cart[f.id]||0)>0).map(f=>({...f,qty:state.cart[f.id]}))}
  function totals(){const t={spice:0,fiber:0,drain:0,stim:0,taste:0,risk:0,control:0,volume:0,cost:0,difficulty:0,psychedelic:false};for(const f of selected()){t.spice+=f.spice*f.qty;t.fiber+=f.fiber*f.qty;t.drain+=f.drain*f.qty;t.stim+=f.stim*f.qty;t.taste+=f.taste*f.qty;t.control+=f.control*f.qty;t.volume+=f.volume*f.qty;t.cost+=f.cost*f.qty;t.difficulty+=f.challenge*f.qty+f.cost*.018*f.qty;t.risk=1-(1-t.risk)*Math.pow(1-f.risk,f.qty);t.psychedelic||=!!f.psychedelic}return t}
  function resize(){W=innerWidth;H=innerHeight;DPR=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);canvas.style.width=`${W}px`;canvas.style.height=`${H}px`;ctx.setTransform(DPR,0,0,DPR,0,0);mobile=W<760;layout=makeLayout();draw()}
  function makeLayout(){
    if(mobile){const head=52,stripY=57,sceneY=104,sceneH=clamp(H*.225,150,198),scene={x:11,y:sceneY,w:W-22,h:sceneH};const after=sceneY+sceneH+10;
      if(state.phase==='shop')return{mobile:true,head,strip:{x:11,y:stripY,w:W-22,h:38},scene,market:{x:11,y:after,w:W-22,h:H-after-75},list:{x:11,y:after+67,w:W-22,h:H-after-145},footerY:H-63};
      return{mobile:true,head,strip:{x:11,y:stripY,w:W-22,h:38},scene,action:{x:11,y:after,w:W-22,h:Math.max(190,H-after-74)},footerY:H-63};
    }
    const maxW=Math.min(1320,W-42),x=(W-maxW)/2,head=64,heroY=76,stripY=132,mainY=173,mainH=H-mainY-20,gap=15,leftW=(maxW-gap)*.53,rightX=x+leftW+gap,rightW=maxW-leftW-gap,sceneH=clamp(mainH*.44,190,330);
    return{mobile:false,x,w:maxW,head,heroY,strip:{x,y:stripY,w:maxW,h:30},mainY,mainH,left:{x,y:mainY,w:leftW,h:mainH},scene:{x,y:mainY,w:leftW,h:sceneH},action:{x,y:mainY+sceneH+13,w:leftW,h:mainH-sceneH-13},market:{x:rightX,y:mainY,w:rightW,h:mainH}};
  }
  function round(x,y,w,h,r,fill,stroke=null,lw=1){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
  function txt(s,x,y,size=12,color=C.ink,weight=500,align='left',family='DM Sans',max){ctx.font=`${weight} ${size}px "${family}",system-ui,sans-serif`;ctx.textAlign=align;ctx.textBaseline='top';ctx.fillStyle=color;if(Number.isFinite(max))ctx.fillText(String(s),x,y,max);else ctx.fillText(String(s),x,y)}
  function mono(s,x,y,size=9,color=C.muted,align='left'){txt(s,x,y,size,color,500,align,'DM Mono')}
  function line(x1,y1,x2,y2,color=C.line,width=1){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}
  function pill(x,y,w,h,label,fill,color,fs=9,border=null){round(x,y,w,h,h/2,fill,border);txt(label,x+w/2,y+(h-fs)/2-1,fs,color,700,'center','DM Mono')}
  function addHit(x,y,w,h,fn,disabled=false){if(disabled)return;if(hitClip){const x1=Math.max(x,hitClip.x),y1=Math.max(y,hitClip.y),x2=Math.min(x+w,hitClip.x+hitClip.w),y2=Math.min(y+h,hitClip.y+hitClip.h);if(x2<=x1||y2<=y1)return;hits.push({x:x1,y:y1,w:x2-x1,h:y2-y1,fn})}else hits.push({x,y,w,h,fn})}
  function button(x,y,w,h,label,fn,opt={}){const hover=pointer.x>=x&&pointer.x<=x+w&&pointer.y>=y&&pointer.y<=y+h,fill=opt.disabled?'#e7e5dd':hover?(opt.secondary?'#d9e8d8':'#245b47'):(opt.secondary?'#eaf0e5':C.deep),color=opt.disabled?'#a9aa9e':opt.secondary?'#4d7456':'#fffdf7';round(x,y,w,h,opt.r||10,fill,hover&&!opt.disabled?'#7eae84':null);if(opt.icon)txt(opt.icon,x+12,y+(h-(opt.fs||10))/2-1,opt.fs||10,opt.disabled?'#a9aa9e':opt.secondary?C.green:'#f0c575',800,'left','Nunito');txt(label,x+(opt.icon?28:w/2),y+(h-(opt.fs||10))/2-1,opt.fs||10,color,800,opt.icon?'left':'center','DM Mono',w-(opt.icon?37:12));addHit(x,y,w,h,fn,opt.disabled)}
  function panel(x,y,w,h,accent=false){round(x,y,w,h,16,C.paper,C.line);if(accent){round(x,y,5,h,3,C.green)}}
  function toastMsg(s){toast=s;toastAt=performance.now()}
  function update(dt,now){
    if(state.phase==='toilet'&&state.daily&&!state.daily.animating){needle+=needleDir*(state.daily.speed||72)*dt/1000;if(needle>97){needle=97;needleDir=-1}else if(needle<3){needle=3;needleDir=1}}
    if(state.phase==='toilet'&&state.daily?.animating&&now>=state.daily.outcomeUntil){
      const d=state.daily;d.animating=false;d.outcome=null;
      if(d.pushIndex>=3){finishDay();return}
      d.target=rollTarget();needle=needleDir>0?4:96;d._meterReady=false;save();
    }
  }
  function draw(){
    if(!ctx)return;layout=makeLayout();ctx.setTransform(DPR,0,0,DPR,0,0);hits=[];
    ctx.fillStyle=C.cream;ctx.fillRect(0,0,W,H);
    drawBackdrop();drawHeader();drawHero();drawPhaseStrip();
    if(mobile){drawSceneCard(layout.scene);if(state.phase==='shop'){drawMobileShop()}else drawAction(layout.action)}
    else{drawSceneCard(layout.scene);drawAction(layout.action);drawMarket(layout.market,true)}
    if(modal){hits=[];drawModal()}drawToast();
    canvas.setAttribute('aria-label',ariaSummary());
  }
  function drawBackdrop(){
    const g=ctx.createRadialGradient(W*.82,0,10,W*.82,0,Math.max(W,H)*.7);g.addColorStop(0,'#e6eee2');g.addColorStop(1,C.cream);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.globalAlpha=.12;for(let i=0;i<11;i++){ctx.fillStyle=i%2?'#d2e1d1':'#ecd9b9';ctx.beginPath();ctx.arc((i*173+53)%W,(i*97+41)%H,3+(i%3)*2,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;
  }
  function drawHeader(){
    const h=layout.head;ctx.fillStyle=C.deep;ctx.fillRect(0,0,W,h);ctx.fillStyle='#19483b';ctx.fillRect(0,h-2,W,2);
    const mobileMode=layout.mobile;
    round(12,h/2-16,32,32,10,'#e4eddf');txt('🚽',28,h/2-12,17,C.ink,700,'center');
    if(mobileMode){txt(W<360?'TOILET':'TOILET SIM',51,h/2-7,W<360?10:12,'#fffdf7',900,'left','Nunito');}
    else {mono('PORCELAIN INC.',54,h/2-6,10,'#f6f1e5');txt('A VERY SERIOUS BUSINESS',54,h/2+9,7,'#a9c2ac',500,'left','DM Mono');}
    const y=h/2-14;let x=W-13;
    const badge=(label,value,w,color,fn)=>{x-=w;round(x,y,w,28,9,'#1a493c','#2a5c4b');mono(label,x+7,y+4,6,'#a9c2ac');txt(value,x+w-7,y+11,11,color,900,'right','Nunito');return x};
    if(!mobileMode){badge('HEALTH',`${state.health}`,70,'#f2a692');badge('WALLET',money(state.cash),83,'#f0c575')}
    else {badge('♥',`${state.health}`,W<350?42:48,'#f2a692');badge('$',money(state.cash),W<350?50:59,'#f0c575')}
    const iconW=mobileMode?28:32,gap=mobileMode?5:7;
    const drawIcon=(symbol,title,fn)=>{x-=iconW;round(x,y,iconW,28,8,pointer.x>=x&&pointer.x<=x+iconW&&pointer.y>=y&&pointer.y<=y+28?'#35644f':'#214d40');txt(symbol,x+iconW/2,y+5,mobileMode?14:15,'#fff7e8',800,'center','Nunito');addHit(x,y,iconW,28,fn);};
    drawIcon(state.sound?'◖))':'◖×','Sound',()=>{state.sound=!state.sound;save();if(state.sound)playTone(620,.06)});
    drawIcon(musicOn?'♫':'♪','Music',toggleMusic);
    drawIcon('☺','Customize',()=>{modal='customize'});
    drawIcon('✦','Achievements',()=>{modal='stats';modalScroll=0});
    if(!mobileMode){mono('AUTO-SAVED',W-13,h-13,7,'#8daa93','right')}
  }
  function drawPhaseStrip(){
    const r=layout.strip;if(layout.mobile){
      pill(r.x,r.y+6,66,25,`DAY ${String(state.day).padStart(2,'0')}`, '#e4ece0','#54745a',8);
      const labels=['MARKET','THRONE','PAYDAY'],steps=['shop','toilet','results'],start=r.x+77,avail=r.w-78,seg=avail/3;
      steps.forEach((s,i)=>{const active=state.phase===s,done=(state.phase==='toilet'&&i===0)||(state.phase==='results'&&i<2),cx=start+seg*i+seg/2;ctx.beginPath();ctx.arc(cx,r.y+12,8,0,Math.PI*2);ctx.fillStyle=active?C.green:done?'#f1e0d1':'#eeece4';ctx.fill();txt(done?'✓':String(i+1),cx,r.y+7,8,active?'white':done?'#c47d59':'#9c9e92',700,'center','DM Mono');txt(labels[i],cx,r.y+23,6,active?C.green:'#8b9286',700,'center','DM Mono');if(i<2)line(cx+12,r.y+12,cx+seg-12,r.y+12,'#d8d9cd',1)});
    }else{
      mono(`DAY ${String(state.day).padStart(2,'0')}`,r.x,r.y+8,9,'#69816d');txt(`${state.totalMovements} movements completed`,r.x+70,r.y+7,10,C.muted,600);
      const labels=['01  THE MARKET','02  THE THRONE','03  PAYDAY'],steps=['shop','toilet','results'],w=125,total=labels.length*w+40,start=r.x+r.w-total;
      steps.forEach((s,i)=>{const active=state.phase===s,done=(state.phase==='toilet'&&i===0)||(state.phase==='results'&&i<2),cx=start+i*(w+20);pill(cx,r.y+2,w,25,labels[i],active?C.green:done?'#f4e8dc':'#f0eee6',active?'white':done?'#bd7955':'#9b9d91',8);if(i<2)line(cx+w+3,r.y+14,cx+w+17,r.y+14,'#d6d7cb',1)});
    }
  }
  function drawSceneCard(r){
    panel(r.x,r.y,r.w,r.h);const pad=10,mobileMode=layout.mobile;
    const labelY=r.y+10;mono('THE PORCELAIN SUITE',r.x+pad,labelY,8,'#718176');
    const mood=state.phase==='shop'?'PRE-SERVICE':state.phase==='toilet'?'IN SESSION':'SHIFT COMPLETE';mono(`DAY ${String(state.day).padStart(2,'0')}  ·  ${mood}`,r.x+r.w-pad,labelY,7,'#9b9b8f','right');
    const image={x:r.x+pad,y:r.y+27,w:r.w-pad*2,h:r.h-38};drawBathroom(image,performance.now());
    if(!mobileMode){mono('✳  NO TWO DAYS ARE THE SAME',r.x+pad,r.y+r.h-10,7,'#969687');mono(`${state.phase==='toilet'?'WATCH THE REACTION':'MOOD: '+sceneMood()}`,r.x+r.w-pad,r.y+r.h-10,7,state.phase==='toilet'?'#c07852':'#a47e5a','right')}
  }
  function sceneMood(){const d=state.daily||{};if(state.phase==='results')return d.score>=85?'TRIUMPHANT':'REFLECTIVE';if(d.poisoned)return'QUESTIONABLE';if(d.psychedelic)return'COSMIC';return'OPTIMISTIC'}
  function drawBathroom(r,now){
    const scale=Math.min(r.w/760,r.h/405),w=760*scale,h=405*scale,x=r.x+(r.w-w)/2,y=r.y+(r.h-h)/2;ctx.save();round(r.x,r.y,r.w,r.h,11,'#dfe9db');ctx.beginPath();ctx.roundRect(r.x,r.y,r.w,r.h,11);ctx.clip();ctx.translate(x,y);ctx.scale(scale,scale);
    const psych=state.daily?.psychedelic&&state.phase==='toilet',active=state.phase==='toilet',out=active?state.daily?.outcome:null;const t=reducedMotion?0:now/1000;
    ctx.fillStyle=psych?`hsl(${(125+Math.sin(t)*27+360)%360} 26% 87%)`:'#e4eddf';ctx.fillRect(0,0,760,405);
    if(psych){ctx.fillStyle='#d9d0eb55';ctx.fillRect(0,0,760,337)}
    ctx.strokeStyle=psych?'#9fb9ae':'#c7d7c8';ctx.lineWidth=2;for(let xx=0;xx<=760;xx+=75){ctx.beginPath();ctx.moveTo(xx,0);ctx.lineTo(xx,337);ctx.stroke()}for(let yy=0;yy<337;yy+=58){ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(760,yy);ctx.stroke()}
    ctx.fillStyle='#bda88a';ctx.fillRect(0,337,760,68);ctx.strokeStyle='#a89170';ctx.lineWidth=2;for(let yy=337;yy<=405;yy+=34){ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(760,yy);ctx.stroke()}for(let xx=0;xx<=760;xx+=90){ctx.beginPath();ctx.moveTo(xx,337);ctx.lineTo(xx,405);ctx.stroke()}
    // Tiny motivational print
    ctx.save();ctx.translate(80,65);ctx.rotate(-.035);round(0,0,105,100,4,'#e4a34e');round(7,7,91,86,2,'#fff8e9');ctx.strokeStyle='#6d9b7d';ctx.lineWidth=8;ctx.lineCap='round';ctx.beginPath();ctx.arc(52,63,21,Math.PI,0);ctx.stroke();ctx.fillStyle='#edb75e';ctx.beginPath();ctx.arc(52,42,14,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#d77656';ctx.lineWidth=6;ctx.beginPath();ctx.arc(52,38,18,Math.PI*1.08,Math.PI*1.92);ctx.stroke();txt('YOU GOT THIS',52,81,7,'#53645a',900,'center','DM Sans');ctx.restore();
    // plant
    ctx.fillStyle='#d98a59';ctx.beginPath();ctx.moveTo(625,300);ctx.lineTo(685,300);ctx.lineTo(678,350);ctx.lineTo(632,350);ctx.closePath();ctx.fill();ctx.strokeStyle='#619174';ctx.lineWidth=9;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(655,302);ctx.quadraticCurveTo(652,260,632,253);ctx.moveTo(656,300);ctx.quadraticCurveTo(661,251,685,245);ctx.moveTo(654,295);ctx.quadraticCurveTo(635,275,644,258);ctx.stroke();
    // stool and paper
    round(220,258,88,14,6,'#dcaa5d');ctx.strokeStyle='#927b57';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(232,269);ctx.lineTo(232,330);ctx.moveTo(294,269);ctx.lineTo(294,330);ctx.stroke();round(247,220,39,38,4,'#fff9e8','#e2d4b9');line(253,230,279,230,'#bfad91',2);line(253,238,276,238,'#bfad91',2);line(253,246,279,246,'#bfad91',2);
    // soft ground shadow
    ctx.fillStyle='#58604f24';ctx.beginPath();ctx.ellipse(399,355,185,13,0,0,Math.PI*2);ctx.fill();
    // toilet tank
    round(458,145,104,114,12,'#fffaf0','#d4d9cc',4);round(471,157,78,9,4,'#eef0e6');ctx.fillStyle='#bbc9bd';ctx.beginPath();ctx.arc(536,183,4,0,Math.PI*2);ctx.fill();round(430,243,128,17,7,'#fffaf0','#d4d9cc',3);
    // bowl silhouette
    ctx.fillStyle='#fffaf0';ctx.strokeStyle='#d4d9cc';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(413,258);ctx.lineTo(566,258);ctx.bezierCurveTo(567,298,549,332,510,341);ctx.lineTo(460,341);ctx.bezierCurveTo(429,331,413,300,413,258);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#e2ebe3';ctx.strokeStyle='#d4d9cc';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(489,263,77,17,0,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.fillStyle='#b9dce0';ctx.beginPath();ctx.ellipse(490,266,42,7,0,0,Math.PI*2);ctx.fill();
    // impact theatre for each beat
    if(out){const p=clamp(1-(state.daily.outcomeUntil-now)/1150,0,1),ease=Math.sin(p*Math.PI);ctx.save();if(out.kind==='perfect'){ctx.globalAlpha=1-p;ctx.strokeStyle='#71b1bd';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(490,264,15+ease*48,3+ease*14,0,0,Math.PI*2);ctx.stroke();star(449,250,10*(1-p)+2,'#e8b45b');star(531,247,8*(1-p)+2,'#e8b45b');star(490,237,7*(1-p)+2,'#f4cf76')}
      else if(out.kind==='clean'||out.kind==='near'){ctx.globalAlpha=1-p;ctx.strokeStyle='#70b8c1';ctx.lineWidth=4;ctx.lineCap='round';const a=8+ease*14;for(const dx of [-34,-12,14,36]){ctx.beginPath();ctx.moveTo(490+dx,262);ctx.quadraticCurveTo(490+dx*1.2,262-a,490+dx*1.4,258-a);ctx.stroke()}ctx.beginPath();ctx.ellipse(490,264,18+ease*44,4+ease*12,0,0,Math.PI*2);ctx.stroke()}
      else{ctx.globalAlpha=1-p;ctx.fillStyle='#df7a5b';txt('✕',490,239,28,'#df7a5b',900,'center','Nunito');ctx.strokeStyle='#d98a59';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(455,260);ctx.quadraticCurveTo(490,247,520,264);ctx.stroke()}ctx.restore()}
    // toilet foot
    ctx.fillStyle='#d4d9cc';ctx.beginPath();ctx.moveTo(456,340);ctx.lineTo(536,340);ctx.lineTo(542,352);ctx.lineTo(450,352);ctx.closePath();ctx.fill();round(448,346,92,8,4,'#f6f0e5');
    // roll holder
    round(570,289,50,39,6,'#789780');ctx.fillStyle='#fff7e7';ctx.beginPath();ctx.arc(600,312,16,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d4c6ad';ctx.beginPath();ctx.arc(600,312,5,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff7e7';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(600,328);ctx.lineTo(600,347);ctx.quadraticCurveTo(600,355,611,355);ctx.stroke();
    // seated avatar, animated reactions
    let bob=reducedMotion?0:Math.sin(t*2.2)*1.4,shake=0,tilt=0;if(active&&!out)bob=reducedMotion?0:Math.sin(t*17)*2.4;if(out){const p=reducedMotion?1:clamp(1-(state.daily.outcomeUntil-now)/1150,0,1),env=reducedMotion?0:Math.sin(p*Math.PI);if(out.kind==='perfect'){bob=-10*env;tilt=-.025*env}else if(out.kind==='clean'){bob=-5*env}else if(out.kind==='near'){shake=Math.sin(t*55)*3*env;tilt=Math.sin(t*48)*.025*env}else{bob=4*env;shake=Math.sin(t*35)*2*env;tilt=.035*env}}
    ctx.save();ctx.translate(shake, bob);ctx.translate(350,280);ctx.rotate(tilt);ctx.translate(-350,-280);
    // bent legs and shoes
    ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=state.avatar.skin;ctx.lineWidth=22;ctx.beginPath();ctx.moveTo(348,214);ctx.quadraticCurveTo(321,222,301,245);ctx.lineTo(270,267);ctx.stroke();ctx.fillStyle='#f3f0e5';ctx.beginPath();ctx.ellipse(270,272,22,10,-.1,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#d6d7ca';ctx.lineWidth=2;ctx.stroke();
    ctx.strokeStyle='#db815b';ctx.lineWidth=25;ctx.beginPath();ctx.moveTo(367,214);ctx.quadraticCurveTo(363,238,341,256);ctx.lineTo(326,278);ctx.stroke();ctx.fillStyle='#f3f0e5';ctx.beginPath();ctx.ellipse(324,286,21,10,-.15,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#d6d7ca';ctx.lineWidth=2;ctx.stroke();
    // body and shirt
    round(338,151,75,83,25,state.avatar.pronouns==='fem'?'#bd7180':'#609477','#46755d',3);ctx.strokeStyle='#b8d2bd';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(350,164);ctx.quadraticCurveTo(369,178,393,171);ctx.stroke();
    // neck/head side profile
    ctx.fillStyle=state.avatar.skin;round(357,139,30,28,9,state.avatar.skin);ctx.beginPath();ctx.ellipse(373,118,36,41,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(400,124,8,11,0,0,Math.PI*2);ctx.fill();
    // arm, folded newspaper
    ctx.strokeStyle=state.avatar.skin;ctx.lineWidth=14;ctx.beginPath();ctx.moveTo(382,174);ctx.quadraticCurveTo(399,181,401,200);ctx.stroke();ctx.fillStyle='#fff9e8';ctx.strokeStyle='#d9cdb7';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(390,179);ctx.lineTo(456,190);ctx.lineTo(447,260);ctx.lineTo(382,250);ctx.closePath();ctx.fill();ctx.stroke();line(400,195,443,202,'#9ba28f',2);line(398,207,440,214,'#9ba28f',2);line(396,219,437,226,'#9ba28f',2);txt('THE DAILY PLOP',420,232,8,'#cc6b50',900,'center','DM Sans');
    // face, hair
    ctx.fillStyle='#293d32';ctx.beginPath();ctx.arc(358,108,3,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#a45245';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(353,137,9,.1,1.2);ctx.stroke();ctx.fillStyle=state.avatar.hair;ctx.beginPath();if(state.avatar.pronouns==='fem'){ctx.moveTo(339,116);ctx.bezierCurveTo(329,75,357,65,382,69);ctx.bezierCurveTo(411,72,420,99,411,149);ctx.quadraticCurveTo(402,160,397,145);ctx.lineTo(397,120);ctx.quadraticCurveTo(369,100,339,116)}else{ctx.moveTo(339,116);ctx.bezierCurveTo(329,78,349,69,369,72);ctx.bezierCurveTo(390,67,405,82,408,101);ctx.quadraticCurveTo(383,86,370,91);ctx.quadraticCurveTo(352,92,339,116)}ctx.closePath();ctx.fill();
    if(active&&!out){ctx.fillStyle='#78bfd0';for(const [sx,sy] of [[310,139],[429,118]]){ctx.beginPath();ctx.moveTo(sx,sy-8);ctx.quadraticCurveTo(sx-9,sy+5,sx,sy+10);ctx.quadraticCurveTo(sx+9,sy+5,sx,sy-8);ctx.fill()}}
    ctx.restore();
    // active stink curls and tiny flies, cartoon only
    if(active){ctx.strokeStyle='#a69a55';ctx.lineWidth=4;ctx.lineCap='round';for(let i=0;i<3;i++){const bx=478+i*26,by=138+Math.sin(t*3+i)*4;ctx.beginPath();ctx.moveTo(bx,by);ctx.bezierCurveTo(bx-12,by-11,bx+12,by-20,bx,by-32);ctx.stroke()}ctx.fillStyle='#554d3e';for(let i=0;i<3;i++){const fx=246+Math.sin(t*3+i*2)*7,fy=166+Math.cos(t*4+i*2)*7;ctx.beginPath();ctx.arc(fx,fy,2.5,0,Math.PI*2);ctx.fill()}}
    if(psych){for(let i=0;i<5;i++){const sx=90+i*137+Math.sin(t*1.3+i)*8,sy=76+((i*61+t*22)%215);star(sx,sy,6+Math.sin(t*3+i)*2,['#b27ac4','#75aeb1','#e1b257'][i%3])}}
    // scene speech bubble, fully drawn in the game canvas
    const quote=active?(out?out.detail:psych?'“The tiles are singing. The needle is a tiny comet.”':state.daily?.poisoned?'“My stomach just filed a formal complaint.”':state.daily?.stim>4?'“I can hear the espresso machine from here.”':'“Breathe in. Focus. Training was for this.”'):state.phase==='results'?((state.daily?.score||0)>=85?'“I’d like to thank fiber and the academy.”':'“We’ll simply never speak of that again.”'):selected().length?`“${selected()[0].name} is in. The porcelain awaits.”`:'“A fresh day. A fresh bowl. Let’s make it count.”';
    round(15,357,Math.min(435,quote.length*6.5+40),34,10,'#fffaf0ed','#f7efdc');txt('💭',27,365,14,C.gold,800);txt(quote,49,367,10,'#536354',700,'left','DM Sans',405);
    if(out){drawOutcomeBadge(out,now)}
    ctx.restore();
  }
  function star(x,y,r,color){ctx.save();ctx.translate(x,y);ctx.fillStyle=color;ctx.beginPath();for(let i=0;i<10;i++){const rr=i%2?r*.42:r,a=-Math.PI/2+i*Math.PI/5;if(i===0)ctx.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);else ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}ctx.closePath();ctx.fill();ctx.restore()}
  function drawOutcomeBadge(out,now){const p=clamp(1-(state.daily.outcomeUntil-now)/1150,0,1),scale=.85+.15*Math.sin(p*Math.PI/2),x=760-18-232,y=17;ctx.save();ctx.globalAlpha=Math.min(1,p*7);ctx.translate(x+116,y+28);ctx.scale(scale,scale);round(-116,-28,232,56,13,'#fffaf0ed','#f0d8a7');txt(out.icon, -96,-16,20,C.gold,800,'center');txt(out.title,-77,-17,10,out.kind==='miss'?C.red:out.kind==='near'?'#b46b4b':'#3d6448',900,'left','Nunito',150);txt(out.detail,-77,1,8,'#7b8575',500,'left','DM Sans',153);txt(`+${out.grade}`,102,-10,14,out.kind==='miss'?C.red:C.green,900,'center','Nunito');txt('PTS',102,9,6,C.muted,700,'center','DM Mono');ctx.restore()}
  function sceneMood(){if(state.daily?.poisoned)return'QUESTIONABLE';if(state.daily?.psychedelic)return'COSMIC';if(state.daily?.stim>4)return'OVERCLOCKED';return state.phase==='results'?(state.daily?.score>=85?'TRIUMPHANT':'REFLECTIVE'):'OPTIMISTIC'}
  function drawAction(r){
    panel(r.x,r.y,r.w,r.h,true);const x=r.x+20,y=r.y+17,w=r.w-40;
    const kicker=state.phase==='shop'?'PHASE 01 · STOCK UP':state.phase==='toilet'?'PHASE 02 · THE MAIN EVENT':'PHASE 03 · PAYDAY';mono(kicker,x,y,8,'#c07852');
    const title=state.phase==='shop'?'Build your breakfast.':state.phase==='toilet'?'Find your moment.':'The numbers are in.';txt(title,x,y+15,21,C.ink,900,'left','Nunito');
    const desc=state.phase==='shop'?'What goes in changes what comes out. Pick up to four items.':state.phase==='toilet'?'Three pushes. One moving needle. Timing is everything.':'A long day’s work deserves a short, satisfying receipt.';txt(desc,x,y+44,9,C.muted,500,'left','DM Sans',w);
    if(state.phase==='shop')drawShopAction(r,x,y,w);
    else if(state.phase==='toilet')drawQte(r,x,y,w);
    else drawResult(r,x,y,w);
  }
  function drawShopAction(r,x,y,w){
    const by=y+69;line(x,by,x+w,by,C.line,1);mono(`YOUR TRAY  ${items()} / 4`,x,by+11,8,'#788579');mono(`SPENT  ${money(totals().cost)}`,x+w,by+11,8,C.ink,'right');
    const tray=selected(),show=tray.slice(0,3);let tx=x;const ty=by+30;
    if(!show.length)txt('Your tray is empty. Be brave (or sensible).',x,ty,9,'#a3a395',500);
    show.forEach(f=>{const label=`${f.emoji} ${f.name} ×${f.qty}`,ww=Math.min(155,ctx.measureText(label).width+20);round(tx,ty,ww,21,11,'#f1eee5','#e9e2d5');txt(label,tx+9,ty+5,8,'#647064',700,'left','DM Sans',ww-14);tx+=ww+6});
    if(tray.length>3)txt(`+${tray.length-3} more`,tx,ty+5,8,C.muted,600);
    const buttonY=r.y+r.h-54,btnW=Math.min(166,w*.46);button(x+w-btnW,buttonY,btnW,38,'TAKE A SEAT  →',()=>startDay(false),{fs:9,disabled:state.phase!=='shop'});
    button(x,buttonY,93,34,'SKIP MEAL',()=>startDay(true),{secondary:true,fs:8,disabled:items()>0});
    txt('Fiber steadies the needle. Spice makes it spicy. Literally.',x,buttonY-20,8,'#92978b',500,'left','DM Sans',w-btnW-8);
  }
  function drawQte(r,x,y,w){
    const d=state.daily,compact=r.h<270,progressY=compact?r.y+72:y+73;
    mono('THE PUSH-OFF',x,progressY,8,'#758176');mono(`${Math.min(d.pushIndex+(d.animating?0:1),3)} / 3`,x+w,progressY,8,C.ink,'right');
    for(let i=0;i<3;i++)round(x+i*25,progressY+15,19,5,3,i<d.pushIndex?C.green:i===d.pushIndex?C.gold:'#e9e7dd');
    if(compact){
      txt(d.animating?d.outcome.detail:d.psychedelic?'The window is doing its best. So are you.':'Stop the needle in the sweet spot.',x+w/2,r.y+101,8,C.ink,700,'center');
      const bx=x+1,bw=w-2,trackY=r.y+128;mono('EARLY',bx,trackY-12,6,'#a1a396');mono('SWEET SPOT',x+w/2,trackY-12,6,'#669072','center');mono('LATE',bx+bw,trackY-12,6,'#a1a396','right');
      round(bx,trackY,bw,18,6,'#efece2','#e2ded3');const zw=bw*d.targetWidth/100,zx=bx+bw*(d.target-d.targetWidth/2)/100;round(zx,trackY,zw,18,4,'#a8cba4','#66946c');const nx=bx+bw*needle/100;round(nx-2,trackY-4,4,26,2,C.coral);
      const by=r.y+r.h-45;button(x+(w-Math.min(290,w))/2,by,Math.min(290,w),35,d.animating?'✦  WATCH YOUR RESULT':'⬇  HIT IT!  ·  SPACE / TAP',push,{fs:10,disabled:d.animating});
      return;
    }
    const barY=progressY+44,trackX=x+1,trackW=w-2;txt(d.animating?d.outcome.detail:d.psychedelic?'The window is doing its best. So are you.':'Stop the needle in the sweet spot.',x+w/2,barY-18,9,C.ink,700,'center');
    mono('TOO SOON',trackX,barY-1,6,'#a1a396');mono('JUST RIGHT',x+w/2,barY-1,6,'#669072','center');mono('TOO LATE',trackX+trackW,barY-1,6,'#a1a396','right');
    round(trackX,barY+14,trackW,22,7,'#efece2','#e2ded3');const zw=trackW*d.targetWidth/100,zx=trackX+trackW*(d.target-d.targetWidth/2)/100;round(zx,barY+14,zw,22,5,'#a8cba4','#66946c');const nx=trackX+trackW*needle/100;round(nx-2,barY+10,4,30,2,C.coral);ctx.beginPath();ctx.arc(nx,barY+10,4,0,Math.PI*2);ctx.fillStyle=C.coral;ctx.fill();mono('0',trackX,barY+40,6,'#aeb0a5');mono('100',trackX+trackW,barY+40,6,'#aeb0a5','right');
    const buttonY=Math.min(r.y+r.h-69,barY+62),bh=48,bw=Math.min(290,w);button(x+(w-bw)/2,buttonY,bw,bh,d.animating?'✦  OUTCOME!  ·  WATCH THE REACTION':'⬇  HIT IT!     SPACE / TAP',push,{fs:12,disabled:d.animating});txt('Every push gets its own bathroom reaction. Watch the scene!',x+w/2,buttonY+bh+8,7,'#92978b',500,'center');
  }
  function drawResult(r,x,y,w){
    const d=state.daily||{},score=d.score||0;
    if(r.h<310){
      const cx=x+31,cy=r.y+104;ctx.beginPath();ctx.arc(cx,cy,27,0,Math.PI*2);ctx.fillStyle='#e7efe1';ctx.fill();ctx.strokeStyle='#bad1b6';ctx.lineWidth=3;ctx.stroke();txt(score,cx,cy-11,18,'#39654a',900,'center','Nunito');mono('PTS',cx,cy+8,5,'#588061','center');
      mono(score>=90?'LEGENDARY':score>=70?'SOLID WORK':score>=45?'A VALIANT EFFORT':'ROUGH SHIFT',x+68,r.y+82,7,'#c17a56');txt(`${score>=85?'Textbook.':score>=50?'The deed is done.':'The toilet wins today.'}  +${money(d.payout||0)}`,x+68,r.y+96,10,C.ink,900,'left','Nunito',w-72);
      const vals=[['PAY',money(d.payout||0)],['DIFF',d.difficultyLabel||'GENTLE'],['CONS',d.consistencyLabel||'—'],['COLOR',d.color||'Classic'],['VOL',d.volumeLabel||'—']],cell=w/5,my=r.y+r.h-77;
      vals.forEach((v,i)=>{const xx=x+i*cell;mono(v[0],xx,my,5,'#969b90');txt(v[1],xx,my+10,6,i===0?C.green:C.ink,800,'left','Nunito',cell-3)});
      button(x,r.y+r.h-43,w,32,'COLLECT & CALL IT A DAY  →',nextDay,{fs:8});return;
    }const sealX=x+49,sealY=y+114;ctx.beginPath();ctx.arc(sealX,sealY,38,0,Math.PI*2);ctx.fillStyle='#e7efe1';ctx.fill();ctx.strokeStyle='#bad1b6';ctx.lineWidth=4;ctx.stroke();txt(score,sealX,sealY-14,25,'#39654a',900,'center','Nunito');mono('SCORE',sealX,sealY+13,7,'#588061','center');
    const rx=x+103;mono(score>=90?'LEGENDARY FORM':score>=80?'PORCELAIN PRO':score>=65?'SOLID WORK':score>=45?'A VALIANT EFFORT':'THE FLOOR IS YOURS',rx,y+79,8,'#c17a56');txt(score>=85?'Textbook performance.':score>=50?'The deed is done.':'A humbling day at the office.',rx,y+94,15,C.ink,900,'left','Nunito',w-110);txt(d.poisoned?'Food poisoning! The clinic took $8. You made it through.':score>=85?'The crowd goes mild. Your wallet goes up.':'A respectable performance. You earned your keep.',rx,y+117,8,C.muted,500,'left','DM Sans',w-114);
    const baseY=y+166,cellW=(w-12)/2,metrics=[['TAKE-HOME PAY',`+${money(d.payout||0)}`,C.green],['MEAL DIFFICULTY',d.difficultyLabel||'GENTLE',C.ink],['CONSISTENCY',d.consistencyLabel||'—',C.ink],['COLOR REPORT',d.color||'Classic brown',C.ink],['VOLUME',d.volumeLabel||'—',C.ink]];
    metrics.forEach((m,i)=>{const col=i%2,row=Math.floor(i/2),xx=x+col*(cellW+12),yy=baseY+row*39;mono(m[0],xx,yy,6,'#9ba094');txt(m[1],xx,yy+11,9,m[2],800,'left','Nunito',cellW-4)});
    const badge=d.newAchievement?achievements.find(a=>a.id===d.newAchievement):null;
    if(badge){const by=Math.min(r.y+r.h-99,baseY+120);round(x,by,w,27,8,'#fff4dc','#f1dba6');txt(`${badge.icon}  BADGE UNLOCKED · ${badge.name}`,x+9,by+8,8,'#8b6835',800,'left','DM Sans',w-18)}
    const collectY=r.y+r.h-48;button(x,collectY,w,35,'COLLECT & CALL IT A DAY  →',nextDay,{fs:8});
  }
  function drawMobileShop(){
    const r=layout.market;mono('THE DAILY SPECIALS',r.x+3,r.y+1,8,'#c07852');txt('Today’s menu.',r.x+3,r.y+14,19,C.ink,900,'left','Nunito');
    const summaryY=r.y+41;round(r.x,summaryY,r.w,22,8,'#f0eee6');mono(`TRAY ${items()}/4`,r.x+9,summaryY+7,7,'#68776a');mono(`SPENT ${money(totals().cost)}`,r.x+r.w-9,summaryY+7,7,C.ink,'right');
    const list=layout.list;ctx.save();ctx.beginPath();ctx.rect(list.x,list.y,list.w,list.h);ctx.clip();hitClip=list;const rowH=73,rowGap=7,totalH=foods.length*(rowH+rowGap)-rowGap;menuScroll=clamp(menuScroll,0,Math.max(0,totalH-list.h));
    foods.forEach((f,i)=>drawFoodCard({x:list.x,y:list.y+i*(rowH+rowGap)-menuScroll,w:list.w,h:rowH},f,false));hitClip=null;ctx.restore();
    if(totalH>list.h){const trackX=list.x+list.w-3,thumbH=Math.max(25,list.h*list.h/totalH),thumbY=list.y+(list.h-thumbH)*(menuScroll/Math.max(1,totalH-list.h));round(trackX, list.y,2,list.h,1,'#e9e5d9');round(trackX,thumbY,3,thumbH,2,'#a7b8a3')}
    const fy=layout.footerY;ctx.fillStyle='#fffdf7f5';ctx.fillRect(0,fy,W,H-fy);line(0,fy,W,fy,'#e5dfd2',1);const skipW=64,footerGap=8,bw=W-22-skipW-footerGap;button(11,fy+10,bw,43,'TAKE A SEAT  →',()=>startDay(false),{fs:10});button(11+bw+footerGap,fy+10,skipW,43,'SKIP',()=>startDay(true),{secondary:true,fs:8,disabled:items()>0});
  }
  function drawMarket(r,desktop){
    panel(r.x,r.y,r.w,r.h);const x=r.x+15,y=r.y+13,w=r.w-30;
    const open=state.phase==='shop';mono(open?'THE DAILY SPECIALS':'TODAY’S INTAKE',x,y,7,'#c07852');txt(open?'Today’s menu.':'Today’s intake.',x,y+12,18,C.ink,900,'left','Nunito');pill(r.x+r.w-65,r.y+14,49,19,open?'OPEN':'CLOSED',open?'#eaf2e7':'#f2eee5',open?'#67806a':'#9a896c',7);
    txt(open?'Buy food. Meet consequences.':state.phase==='toilet'?'Your choices are now your problem.':'The menu that made history.',x,y+35,8,C.muted,500,'left','DM Sans',w);
    round(x,y+51,w,22,7,'#f1eee6');mono(`TRAY  ${items()} / 4`,x+8,y+58,7,'#788579');mono(`SPENT  ${money(totals().cost)}`,x+w-8,y+58,7,C.ink,'right');
    const list={x,y:y+81,w,h:r.h-(y-r.y)-107};layout.marketList=list;ctx.save();ctx.beginPath();ctx.rect(list.x,list.y,list.w,list.h);ctx.clip();hitClip=list;
    const gap=7,cols=2,cw=(list.w-gap)/2,rowH=clamp((list.h-4*gap)/5,72,111),totalH=5*(rowH+gap)-gap;menuScroll=clamp(menuScroll,0,Math.max(0,totalH-list.h));
    foods.forEach((f,i)=>{const row=Math.floor(i/2),col=i%2;drawFoodCard({x:list.x+col*(cw+gap),y:list.y+row*(rowH+gap)-menuScroll,w:cw,h:rowH},f,true)});
    hitClip=null;ctx.restore();
    if(totalH>list.h){const tx=r.x+r.w-5,th=Math.max(23,list.h*list.h/totalH),ty=list.y+(list.h-th)*(menuScroll/Math.max(1,totalH-list.h));round(tx,list.y,2,list.h,1,'#e9e5d9');round(tx,ty,3,th,2,'#a7b8a3')}
    const noteY=r.y+r.h-17;mono('ⓘ  FIBER STEADIES · SPICE & STIMULANTS SHAKE THINGS UP',r.x+15,noteY,6,'#9a9687');
  }
  function drawFoodCard(r,f,desktop){
    if(r.y+r.h<0||r.y>H)return;
    const qty=state.cart[f.id]||0,locked=state.phase!=='shop';const fill=qty?'#f7fbf4':C.paper,stroke=qty?'#8aad8e':'#ece7dc';round(r.x,r.y,r.w,r.h,10,fill,stroke,qty?1.3:1);
    if(desktop){
      txt(f.emoji,r.x+10,r.y+8,20,C.ink,700);txt(f.name,r.x+37,r.y+9,10,C.ink,900,'left','Nunito',r.w-89);txt(money(f.cost),r.x+r.w-10,r.y+10,9,'#4f795b',700,'right','DM Mono');txt(f.line,r.x+38,r.y+23,7,'#92988c',500,'left','DM Sans',r.w-48);
      const stats=[['SPC',f.spice,'#dd9871'],['FIB',f.fiber,'#8db18e'],['DIU',f.drain,'#79afbd'],['STM',f.stim,'#dd9871'],['TST',f.taste,'#e5ba68'],['RISK',Math.min(5,Math.round(f.risk*16)),'#dd9871']];const colW=(r.w-18)/3;
      stats.forEach((s,i)=>{const row=Math.floor(i/3),col=i%3,sx=r.x+9+col*colW,sy=r.y+41+row*14;mono(s[0],sx,sy,6,'#90978b');for(let j=0;j<5;j++)round(sx+24+j*5.2,sy+1,3.8,5,1.5,j<s[1]?s[2]:'#e9e7de')});
      const ey=r.y+r.h-18;txt(f.effect,sxClamp(r.x+9),ey,6,'#998c76',500,'left','DM Sans',r.w-84);
      if(locked){txt(qty?`TRAY ×${qty}`:'—',r.x+r.w-8,ey,7,qty?C.green:'#b5b5a9',700,'right','DM Mono')}
      else if(qty){const bx=r.x+r.w-65;smallStepButtons(bx,ey-4,qty,f,r.w)}else{button(r.x+r.w-57,ey-5,48,16,'+ ADD',()=>addFood(f),{secondary:true,fs:6,r:5,disabled:items()>=4||state.cash<f.cost})}
    }else{
      txt(f.emoji,r.x+8,r.y+8,20,C.ink,700);txt(f.name,r.x+35,r.y+8,10,C.ink,900,'left','Nunito',r.w-120);txt(money(f.cost),r.x+r.w-44,r.y+10,9,'#4f795b',700,'right','DM Mono');txt(f.line,r.x+36,r.y+24,7,'#92988c',500,'left','DM Sans',r.w-92);
      const attrs=`SPC ${f.spice}  FIB ${f.fiber}  DIU ${f.drain}  STM ${f.stim}  TST ${f.taste}  RISK ${Math.round(f.risk*100)}%`;mono(attrs,r.x+9,r.y+46,6,'#858d82');
      if(locked){mono(qty?`ON TRAY ×${qty}`:'NOT ORDERED',r.x+9,r.y+r.h-15,6,qty?C.green:'#a7a699')}
      else if(qty)smallStepButtons(r.x+r.w-63,r.y+r.h-30,qty,f,r.w);
      else button(r.x+r.w-39,r.y+8,30,28,'+',()=>addFood(f),{secondary:true,fs:15,r:8,disabled:items()>=4||state.cash<f.cost});
    }
  }
  function sxClamp(x){return x}
  function smallStepButtons(x,y,qty,f,cardW){
    round(x,y,20,18,5,'#e8efe5');txt('−',x+10,y+2,12,'#507557',900,'center','Nunito');addHit(x,y,20,18,()=>removeFood(f));
    txt(qty,x+30,y+4,8,'#55725c',800,'center','DM Mono');round(x+40,y,20,18,5,'#e8efe5');txt('+',x+50,y+2,11,'#507557',900,'center','Nunito');addHit(x+40,y,20,18,()=>addFood(f),state.cash<f.cost||items()>=4);
  }
  function addFood(f){if(state.phase!=='shop')return;if(items()>=4){toastMsg('Four items max. Your tray has limits.');return}if(state.cash<f.cost){toastMsg('Not enough cash. The market does not do tabs.');return}state.cash-=f.cost;state.cart[f.id]=(state.cart[f.id]||0)+1;playTone(580,.07);save();draw()}
  function removeFood(f){if(state.phase!=='shop'||!state.cart[f.id])return;state.cash+=f.cost;state.cart[f.id]--;if(!state.cart[f.id])delete state.cart[f.id];playTone(300,.06);save();draw()}
  function startDay(skip=false){if(state.phase!=='shop')return;if(skip&&items()){toastMsg('Your tray is full of decisions. Remove them first to skip.');return}const t=totals(),poisoned=Math.random()<t.risk;let clinicFee=0;if(poisoned){const damage=8+Math.floor(Math.random()*9);state.health=Math.max(1,state.health-damage);clinicFee=Math.min(state.cash,8);state.cash-=clinicFee;state.cleanStreak=0;toastMsg(`FOOD POISONING! −${damage} HEALTH · CLINIC −${money(clinicFee)}`);playTone(100,.33,'sawtooth')}else state.cleanStreak++;
    state.daily={foodNames:selected().map(f=>f.name),foodIds:selected().map(f=>f.id),spent:t.cost,spice:t.spice,fiber:t.fiber,drain:t.drain,stim:t.stim,taste:t.taste,risk:t.risk,control:t.control,volume:t.volume,difficulty:t.difficulty,psychedelic:t.psychedelic,poisoned,clinicFee,targetWidth:clamp(28+t.fiber*1.15-t.spice*1.15-t.stim*.8-t.drain*.55-(poisoned?5:0),10,38),speed:clamp(69+t.stim*7+t.drain*3+t.spice*2,60,140),target:rollTarget(),pushes:[],pushIndex:0,score:0,payout:0,animating:false,outcome:null};state.phase='toilet';needle=5;needleDir=1;menuScroll=0;save();draw();}
  function rollTarget(){return Math.round(20+Math.random()*60)}
  function push(){if(state.phase!=='toilet'||!state.daily||state.daily.animating)return;const d=state.daily,half=d.targetWidth/2,distance=Math.abs(needle-d.target),excess=Math.max(0,distance-half);let grade=distance<=half?Math.round(100-(distance/half)*24):Math.round(clamp(67-excess*2.15,0,66));if(state.health<25)grade=Math.max(0,grade-8);const type=grade>=92?'perfect':grade>=70?'clean':grade>=45?'near':'miss';const names={perfect:['BULLSEYE!','Center hit. The porcelain applauds.','✨'],clean:['A CLEAN HIT!','Right in the green. Tidy work.','💦'],near:['CLOSE SHAVE!','The bowl wobbled. So did you.','😅'],miss:['WAY OFF!','The toilet wins this round.','🫠']};const message=names[type];d.pushes.push({pos:Math.round(needle),target:d.target,grade,hit:distance<=half});d.pushIndex++;d.outcome={kind:type,grade,title:message[0],detail:message[1],icon:message[2]};d.animating=true;d.outcomeUntil=performance.now()+1150;playOutcomeSound(type);if(navigator.vibrate)navigator.vibrate(type==='perfect'?[18,35,25]:type==='miss'?80:22);draw()}
  function finishDay(){const d=state.daily;d.animating=false;d.outcome=null;d.score=Math.round(d.pushes.reduce((a,p)=>a+p.grade,0)/3);d.successes=d.pushes.filter(p=>p.grade>=55).length;d.consistency=clamp(Math.round(5+d.fiber*1.1-d.spice*.35-d.risk*7),1,10);d.consistencyLabel=d.consistency>=8?'REMARKABLY FIRM':d.consistency>=6?'RESPECTABLY SOLID':d.consistency>=4?'A LITTLE WOBBLY':'THE PLOT THICKENS';d.volumeLabel=d.volume===0?'DRY RUN':d.volume<2?'POLITE':d.volume<4?'RESPECTABLE':d.volume<7?'BIG PRODUCTION':'PORTS AUTHORITY CALLED';const f=selected().sort((a,b)=>b.qty*b.challenge-a.qty*a.challenge)[0];d.color=f?f.color:'Classic brown';d.difficultyLabel=d.difficulty>=7?'EXTREME':d.difficulty>=5?'SPICY':d.difficulty>=3?'MODERATE':'GENTLE';const factor=d.score>=45?1:.55;d.payout=Math.max(4,Math.round((10+d.difficulty*4+d.spent*.12+d.volume*1.1)*(.45+d.score/100*.85)*factor));state.cash+=d.payout;state.totalEarned+=d.payout;state.totalMovements++;state.bestScore=Math.max(state.bestScore,d.score);if(d.score>=45)state.successfulMovements++;if(!d.poisoned&&d.fiber>=3)state.health=Math.min(100,state.health+Math.min(8,Math.floor(d.fiber)));state.phase='results';const unlocked=[];for(const a of achievements){if(!state.achievements.includes(a.id)&&a.test(state,d)){state.achievements.push(a.id);unlocked.push(a.id)}}d.newAchievement=unlocked[0]||null;save();playTone(540,.2);if(d.newAchievement)toastMsg(`BADGE UNLOCKED · ${achievements.find(a=>a.id===d.newAchievement).name}`);draw()}
  function nextDay(){if(state.phase!=='results')return;state.day++;state.phase='shop';state.cart={};state.daily=null;menuScroll=0;save();draw()}
  function playTone(freq,duration,wave='sine'){if(!state.sound)return;try{audio||=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const o=audio.createOscillator(),g=audio.createGain(),now=audio.currentTime;o.type=wave;o.frequency.setValueAtTime(freq,now);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.07,now+.012);g.gain.exponentialRampToValueAtTime(.0001,now+duration);o.connect(g);g.connect(audio.destination);o.start(now);o.stop(now+duration+.02)}catch{}}
  function playOutcomeSound(kind){if(!state.sound)return;try{audio||=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const now=audio.currentTime;const tone=(a,b,d,w='sine',vol=.085,delay=0)=>{const o=audio.createOscillator(),g=audio.createGain();o.type=w;o.frequency.setValueAtTime(a,now+delay);if(a!==b)o.frequency.exponentialRampToValueAtTime(Math.max(1,b),now+delay+d);g.gain.setValueAtTime(.0001,now+delay);g.gain.exponentialRampToValueAtTime(vol,now+delay+.012);g.gain.exponentialRampToValueAtTime(.0001,now+delay+d);o.connect(g);g.connect(audio.destination);o.start(now+delay);o.stop(now+delay+d+.02)};const splash=(d=.1,v=.04,delay=0,cutoff=1000)=>{const n=Math.ceil(audio.sampleRate*d),buf=audio.createBuffer(1,n,audio.sampleRate),data=buf.getChannelData(0);for(let i=0;i<n;i++)data[i]=(Math.random()*2-1)*(1-i/n);const src=audio.createBufferSource(),f=audio.createBiquadFilter(),g=audio.createGain();src.buffer=buf;f.type='lowpass';f.frequency.value=cutoff;g.gain.setValueAtTime(v,now+delay);g.gain.exponentialRampToValueAtTime(.0001,now+delay+d);src.connect(f);f.connect(g);g.connect(audio.destination);src.start(now+delay)};if(kind==='perfect'){tone(205,62,.18,'sine',.12);splash(.13,.055,.015,850);tone(650,1040,.16,'sine',.055,.13);tone(920,920,.11,'sine',.035,.28)}else if(kind==='clean'){tone(360,155,.15,'sine',.1);splash(.11,.05,.025,1300);tone(690,510,.12,'sine',.035,.12)}else if(kind==='near'){tone(330,205,.22,'triangle',.085);splash(.08,.025,.035,650);tone(250,220,.12,'sine',.025,.2)}else{tone(205,92,.34,'triangle',.1);tone(147,103,.28,'sawtooth',.025,.06)}}catch{}}
  function drawHero(){if(layout.mobile)return;const x=layout.x;txt('Toilet',x,layout.heroY,34,C.ink,1000,'left','Nunito');txt('Simulator',x+105,layout.heroY,34,C.coral,1000,'left','Nunito');txt('✳',x+286,layout.heroY-1,18,C.gold,900,'left','Nunito');txt('Eat boldly. Sit like a professional. Get paid like… it’s complicated.',x,layout.heroY+39,9,'#718176',500);mono('THE WORLD’S LEAST PRESTIGIOUS CAREER',layout.x+layout.w,layout.heroY+15,8,'#919688','right')}
  function drawToast(){if(!toast)return;const age=performance.now()-toastAt;if(age>2600){toast='';return}const alpha=age<220?age/220:age>2300?(2600-age)/300:1;ctx.save();ctx.globalAlpha=alpha;const w=Math.min(W-24,Math.max(205,toast.length*6.5+38)),x=(W-w)/2,y=H-(mobile?78:25)-31;round(x,y,w,34,11,C.deep);txt(toast,x+w/2,y+10,9,'#fffaf0',700,'center','DM Sans',w-20);ctx.restore()}
  function drawModal(){
    ctx.fillStyle='#142b23aa';ctx.fillRect(0,0,W,H);
    const mw=Math.min(W-24,510),mh=modal==='customize'?Math.min(H-30,470):modal==='stats'?Math.min(H-30,590):Math.min(H-30,290),mx=(W-mw)/2,my=(H-mh)/2;
    round(mx,my,mw,mh,19,C.paper,C.line);round(mx+mw-43,my+12,30,30,15,'#f0eee6');txt('×',mx+mw-28,my+15,21,'#687369',500,'center');addHit(mx+mw-43,my+12,30,30,()=>{modal=null});
    if(modal==='customize')drawCustomize(mx,my,mw,mh);else if(modal==='stats')drawStats(mx,my,mw,mh);else drawReset(mx,my,mw,mh);
  }
  function drawCustomize(x,y,w,h){
    mono('YOUR BATHROOM PERSONA',x+22,y+23,8,'#788579');txt('Make yourself at home.',x+22,y+42,22,C.ink,900,'left','Nunito');txt('It’s your throne. Pick your look.',x+22,y+72,9,C.muted,500);
    const genderY=y+104,btnW=(w-54)/2;button(x+22,genderY,btnW,32,'HE / HIM',()=>{state.avatar.pronouns='masc';save();draw()},{secondary:state.avatar.pronouns!=='masc',fs:8});button(x+32+btnW,genderY,btnW,32,'SHE / HER',()=>{state.avatar.pronouns='fem';save();draw()},{secondary:state.avatar.pronouns!=='fem',fs:8});
    const previewX=x+22,previewY=y+159,previewW=Math.min(104,w*.28),optX=previewX+previewW+14,optW=x+w-22-optX;round(previewX,previewY,previewW,165,14,'#eaf0e7');drawMiniAvatar(previewX+previewW/2,previewY+80);mono('READY FOR DUTY',previewX+previewW/2,previewY+142,6,'#758174','center');
    mono('SKIN TONE',optX,y+157,8,'#7d8779');
    skinColors.forEach((c,i)=>{const sx=optX+10+i*Math.min(28,Math.max(20,(optW-20)/5)),sy=y+185;ctx.beginPath();ctx.arc(sx,sy,9,0,Math.PI*2);ctx.fillStyle=c;ctx.fill();if(c===state.avatar.skin){ctx.strokeStyle=C.green;ctx.lineWidth=2;ctx.beginPath();ctx.arc(sx,sy,12,0,Math.PI*2);ctx.stroke()}addHit(sx-13,sy-13,26,26,()=>{state.avatar.skin=c;save();draw()})});
    mono('HAIR COLOR',optX,y+221,8,'#7d8779');hairColors.forEach((c,i)=>{const sx=optX+10+(i%5)*Math.min(30,Math.max(20,(optW-20)/4)),sy=y+249+Math.floor(i/5)*31;ctx.beginPath();ctx.arc(sx,sy,9,0,Math.PI*2);ctx.fillStyle=c;ctx.fill();if(c===state.avatar.hair){ctx.strokeStyle=C.green;ctx.lineWidth=2;ctx.beginPath();ctx.arc(sx,sy,12,0,Math.PI*2);ctx.stroke()}addHit(sx-13,sy-13,26,26,()=>{state.avatar.hair=c;save();draw()})});
    button(x+22,y+h-55,w-44,37,'LOOKING GOOD  ✓',()=>{modal=null},{fs:9});
  }
  function drawMiniAvatar(cx,cy){ctx.save();ctx.fillStyle=state.avatar.skin;ctx.beginPath();ctx.ellipse(cx,cy-26,20,23,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=state.avatar.hair;ctx.beginPath();if(state.avatar.pronouns==='fem'){ctx.ellipse(cx,cy-32,22,28,0,Math.PI,Math.PI*2);ctx.lineTo(cx+21,cy+3);ctx.lineTo(cx+13,cy-13);ctx.lineTo(cx-18,cy-13);ctx.lineTo(cx-20,cy+3)}else{ctx.ellipse(cx,cy-38,21,14,0,Math.PI,Math.PI*2)}ctx.fill();round(cx-27,cy-5,54,51,16,state.avatar.pronouns==='fem'?'#bd7180':'#609477');ctx.restore()}
  function drawStats(x,y,w,h){
    mono('YOUR CAREER SO FAR',x+22,y+22,8,'#788579');txt('Bathroom legend.',x+22,y+41,22,C.ink,900,'left','Nunito');txt('Every great career starts somewhere. Usually here.',x+22,y+70,8,C.muted,500);
    const stats=[['MOVEMENTS',state.totalMovements],['SUCCESSFUL',state.successfulMovements],['BEST SCORE',state.bestScore],['TOTAL EARNED',money(state.totalEarned)],['WALLET',money(state.cash)],['HEALTH',`${state.health}/100`]],gap=8,cols=3,cellW=(w-44-gap*2)/3;
    stats.forEach((a,i)=>{const xx=x+22+(i%cols)*(cellW+gap),yy=y+94+Math.floor(i/cols)*52;round(xx,yy,cellW,44,9,'#f3f0e8');mono(a[0],xx+8,yy+7,6,'#8d9489');txt(a[1],xx+8,yy+19,13,C.ink,900,'left','Nunito')});
    mono('BADGES OF HONOR',x+22,y+207,8,'#8a8f82');
    const rows=4,cols2=2,badgeW=(w-52)/2,badgeH=54;
    achievements.forEach((a,i)=>{const xx=x+22+(i%cols2)*(badgeW+8),yy=y+229+Math.floor(i/cols2)*60,earned=state.achievements.includes(a.id);round(xx,yy,badgeW,badgeH,9,earned?'#fffaf0':'#f3f1ea',earned?'#eddfbf':'#eee9de');txt(a.icon,xx+12,yy+16,18,earned?C.ink:'#a4a397');txt(a.name,xx+37,yy+10,9,earned?C.ink:'#85887f',900,'left','Nunito',badgeW-45);txt(earned?'UNLOCKED':a.desc,xx+37,yy+26,6,earned?'#8c815e':'#a3a397',500,'left','DM Sans',badgeW-43)})
    button(x+22,y+h-42,(w-52)/2,27,'NEW CAREER',()=>{modal='reset'},{secondary:true,fs:7});button(x+30+(w-52)/2,y+h-42,(w-52)/2,27,'BACK TO WORK',()=>{modal=null},{secondary:true,fs:7});
  }
  function drawReset(x,y,w,h){mono('START OVER?',x+22,y+25,8,'#c07852');txt('Flush your career?',x+22,y+47,23,C.ink,900,'left','Nunito');txt('This clears your wallet, stats, badges and character. No refunds from the porcelain gods.',x+22,y+83,9,C.muted,500,'left','DM Sans',w-44);button(x+22,y+h-59,(w-52)/2,37,'KEEP MY SAVE',()=>{modal=null},{secondary:true,fs:8});button(x+30+(w-52)/2,y+h-59,(w-52)/2,37,'FLUSH IT ALL',()=>{state=fresh();menuScroll=0;modal=null;save();toastMsg('A fresh career. May your aim be true.')},{fs:8});}
  function toggleMusic(){musicOn=!musicOn;const player=document.getElementById('music-player'),frame=document.getElementById('music-frame');if(musicOn){player.hidden=false;if(!frame.querySelector('iframe')){const f=document.createElement('iframe');f.title='Ghidorah — Toilet story 4 (YouTube player)';f.src='https://www.youtube-nocookie.com/embed/x83NjXTuRLk?autoplay=1&controls=1&rel=0&playsinline=1';f.allow='autoplay; encrypted-media; picture-in-picture';f.referrerPolicy='strict-origin-when-cross-origin';f.allowFullscreen=true;frame.appendChild(f)}}else{frame.replaceChildren();player.hidden=true}}
  function ariaSummary(){return `Toilet Simulator. Day ${state.day}. ${money(state.cash)}. Health ${state.health}. Phase ${state.phase}. ${state.phase==='shop'?'Choose up to four foods from the market.':state.phase==='toilet'?'Stop the needle in the green zone three times. Press Space or Enter.':'Your daily results are ready.'}`}
  function clipContains(r,x,y){return !!r&&x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h}
  function activate(x,y){for(let i=hits.length-1;i>=0;i--){const h=hits[i];if(x>=h.x&&x<=h.x+h.w&&y>=h.y&&y<=h.y+h.h){h.fn();draw();return}}}
  canvas.addEventListener('pointerdown',e=>{canvas.focus();const rect=canvas.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;pointer.x=x;pointer.y=y;drag={x,y,lastY:y,moved:false,scrolling:!modal&&clipContains(layout.mobile?layout.list:layout.marketList,x,y)};canvas.setPointerCapture?.(e.pointerId);e.preventDefault()},{passive:false});
  canvas.addEventListener('pointermove',e=>{const rect=canvas.getBoundingClientRect();pointer.x=e.clientX-rect.left;pointer.y=e.clientY-rect.top;if(drag&&drag.scrolling){const dy=pointer.y-drag.lastY;if(Math.abs(pointer.y-drag.y)>4)drag.moved=true;if(drag.moved){const z=layout.mobile?layout.list:layout.marketList,rowH=layout.mobile?73:clamp((z.h-28)/5,72,111),total=layout.mobile?foods.length*80:5*(rowH+7)-7;menuScroll=clamp(menuScroll-dy,0,Math.max(0,total-z.h));draw()}drag.lastY=pointer.y}},{passive:true});
  canvas.addEventListener('pointerup',e=>{if(!drag)return;const rect=canvas.getBoundingClientRect();pointer.x=e.clientX-rect.left;pointer.y=e.clientY-rect.top;const moved=drag.moved,x=pointer.x,y=pointer.y;drag=null;if(!moved)activate(x,y);},{passive:true});
  canvas.addEventListener('pointercancel',()=>{drag=null});
  canvas.addEventListener('wheel',e=>{const rect=canvas.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top,zone=layout.mobile?layout.list:layout.marketList;if(state.phase==='shop'&&!modal&&clipContains(zone,x,y)){const rowH=layout.mobile?73:clamp((zone.h-28)/5,72,111),total=layout.mobile?foods.length*80:5*(rowH+7)-7;menuScroll=clamp(menuScroll+e.deltaY,0,Math.max(0,total-zone.h));draw();e.preventDefault()}},{passive:false});
  window.addEventListener('resize',resize);
  window.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&modal){modal=null;draw();return}
    if(modal)return;
    if(state.phase==='toilet'&&(e.code==='Space'||e.code==='Enter')){e.preventDefault();push();return}
    if(e.key.toLowerCase()==='m'){state.sound=!state.sound;save();if(state.sound)playTone(620,.06);draw()}
    if(e.key.toLowerCase()==='c'){modal='customize';draw()}
    if(e.key.toLowerCase()==='a'){modal='stats';draw()}
  });
  document.getElementById('music-close').addEventListener('click',()=>{musicOn=false;document.getElementById('music-frame').replaceChildren();document.getElementById('music-player').hidden=true;draw()});
  function loop(now){const dt=lastTime?Math.min(40,now-lastTime):16;lastTime=now;update(dt,now);draw();requestAnimationFrame(loop)}
  resize();
  if(state.phase==='toilet'&&state.daily){const d=state.daily;d.pushes=d.pushes||[];d.pushIndex=d.pushes.length;d.target=d.target||rollTarget();d.targetWidth=d.targetWidth||24;d.speed=d.speed||75;d.animating=false;d.outcome=null;needle=6;needleDir=1;save()}
  requestAnimationFrame(loop);
})();
