(() => {
  'use strict';
  const SAVE_KEY = 'porcelain-inc-save-v1';
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const money = n => `$${Math.round(n)}`;
  const foods = [
    {id:'mystery-burrito', name:'Mystery burrito', emoji:'🌯', cost:7, line:'A gas-station classic.', effect:'Spice + mystery', spice:3, fiber:1, drain:0, stim:0, taste:2, risk:.15, control:-.7, volume:2.3, color:'Questionable orange', challenge:1.4},
    {id:'bran-flakes', name:'Bran of the brave', emoji:'🥣', cost:10, line:'Your gut’s new best friend.', effect:'Fiber · easy mode', spice:0, fiber:5, drain:0, stim:1, taste:2, risk:.015, control:1.5, volume:3.2, color:'Wholesome brown', challenge:1.2},
    {id:'triple-espresso', name:'Triple espresso', emoji:'☕', cost:9, line:'One cup. Three decisions.', effect:'Stimulant + bladder', spice:0, fiber:0, drain:4, stim:5, taste:3, risk:.02, control:-1.2, volume:1.4, color:'Dark roast', challenge:1.8},
    {id:'chili-dog', name:'Volcano chili dog', emoji:'🌭', cost:13, line:'A very loud lunch.', effect:'Maximum spice', spice:5, fiber:1, drain:1, stim:0, taste:4, risk:.075, control:-1.4, volume:2.8, color:'Sunset red', challenge:2.5},
    {id:'garden-salad', name:'Garden-party salad', emoji:'🥗', cost:18, line:'Leaves with a trust fund.', effect:'Fiber · low risk', spice:0, fiber:4, drain:0, stim:0, taste:4, risk:.01, control:1.2, volume:2.6, color:'Garden green', challenge:1.5},
    {id:'luxury-risotto', name:'Truffle risotto', emoji:'🍚', cost:34, line:'The porcelain is impressed.', effect:'Luxury · smooth sailing', spice:0, fiber:2, drain:0, stim:0, taste:5, risk:.008, control:1.1, volume:2.1, color:'Golden cream', challenge:2.1},
    {id:'mystery-noodles', name:'2 a.m. mystery noodles', emoji:'🍜', cost:5, line:'The flavor is classified.', effect:'Cheap · high risk', spice:2, fiber:0, drain:1, stim:1, taste:1, risk:.24, control:-1.3, volume:2.2, color:'Neon-ish (hmm)', challenge:2.7},
    {id:'milkshake', name:'Mega milkshake', emoji:'🥤', cost:11, line:'Milk. Ice cream. Poor timing.', effect:'Big volume', spice:0, fiber:0, drain:1, stim:0, taste:5, risk:.025, control:-.1, volume:4.2, color:'Vanilla beige', challenge:1.7},
    {id:'mushroom-tea', name:'Moonbeam mushroom tea', emoji:'🍄', cost:22, line:'The tiles start to breathe.', effect:'Psychedelic trip', spice:0, fiber:0, drain:1, stim:1, taste:3, risk:.055, control:-.6, volume:1.8, color:'Tie-dye (allegedly)', challenge:2.6, psychedelic:true},
    {id:'cigarette-break', name:'Cigarette break', emoji:'🚬', cost:6, line:'A very questionable combo.', effect:'Stimulant · diuretic', spice:0, fiber:0, drain:3, stim:3, taste:0, risk:.09, control:-1.0, volume:1.3, color:'Ashen tan', challenge:2.0}
  ];
  const achievements = [
    {id:'first-shift', icon:'🧻', name:'First Flush', desc:'Complete your first movement.', test:s=>s.totalMovements>=1},
    {id:'five-days', icon:'📆', name:'Clocking In', desc:'Complete 5 movements.', test:s=>s.totalMovements>=5},
    {id:'ten-days', icon:'🪠', name:'Porcelain Regular', desc:'Complete 10 movements.', test:s=>s.totalMovements>=10},
    {id:'precision', icon:'🎯', name:'Aim for the Stars', desc:'Score 90 or higher.', test:(s,r)=>r.score>=90},
    {id:'brave-gut', icon:'🌶️', name:'Brave Gut', desc:'Score 75+ after a risky meal.', test:(s,r)=>r.score>=75&&r.risk>=.18},
    {id:'fine-dining', icon:'🥂', name:'Gastro-nomical', desc:'Score 85+ on a luxury meal.', test:(s,r)=>r.score>=85&&r.difficulty>=4},
    {id:'clean-living', icon:'🍀', name:'Clean Getaway', desc:'3 movements without food poisoning.', test:s=>s.cleanStreak>=3},
    {id:'high-roller', icon:'💸', name:'The Big Flush', desc:'Have $250 in your wallet.', test:s=>s.cash>=250}
  ];
  const skinColors = ['#f5d2b5','#e7ad83','#c98962','#9a634c','#704b3e','#4b352e'];
  const hairColors = ['#493b35','#211e20','#875236','#d5a34e','#a74837','#e7e1d1','#6b7c88'];
  const quips = [
    'Life’s too short for a boring bathroom break.',
    'Believe in yourself. And maybe the fiber.',
    'Every legend starts with a questionable lunch.',
    'A watched needle never lands in the window. (It does.)',
    'You can’t spell “career” without “rear”.',
    'Today’s forecast: scattered plops, with a chance of glory.'
  ];
  const defaultState = () => ({version:1, day:1, phase:'shop', cash:100, health:100, totalMovements:0, successfulMovements:0, totalEarned:0, bestScore:0, cleanStreak:0, achievements:[], sound:false, avatar:{pronouns:'masc',skin:skinColors[1],hair:hairColors[0]}, cart:{}, daily:null});
  let state = loadState();
  let raf = 0, lastFrame = 0, needlePos = 7, needleDirection = 1, toastTimer = 0, audioCtx = null;

  const $ = sel => document.querySelector(sel);
  const cashValue=$('#cash-value'), healthValue=$('#health-value'), dayValue=$('#day-value'), careerCount=$('#career-count');
  const shopPanel=$('#shop-panel'), qtePanel=$('#qte-panel'), resultsPanel=$('#results-panel');
  const sceneWrap=$('#scene-wrap'), avatar=$('#avatar'), sceneQuote=$('#scene-quote'), sceneMood=$('#scene-mood'), sceneDay=$('#scene-day');
  const foodGrid=$('#food-grid'), basketItems=$('#basket-items'), startButton=$('#start-run'), targetZone=$('#target-zone'), needle=$('#needle');

  function loadState(){
    try {
      const saved=JSON.parse(localStorage.getItem(SAVE_KEY));
      if(!saved||saved.version!==1) return defaultState();
      const fresh=defaultState();
      const merged={...fresh,...saved,avatar:{...fresh.avatar,...saved.avatar},cart:saved.cart||{},achievements:Array.isArray(saved.achievements)?saved.achievements:[]};
      if(!['shop','toilet','results'].includes(merged.phase)) merged.phase='shop';
      merged.cash=Math.max(0,Number(merged.cash)||0); merged.health=clamp(Number(merged.health)||100,1,100);
      return merged;
    } catch { return defaultState(); }
  }
  function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state))}catch{showToast('Could not save — your browser storage may be full.')}}
  function totalItems(){return Object.values(state.cart).reduce((a,b)=>a+(Number(b)||0),0)}
  function meal(){return foods.filter(f=>(state.cart[f.id]||0)>0).map(f=>({...f,qty:state.cart[f.id]}))}
  function mealTotals(){
    const totals={spice:0,fiber:0,drain:0,stim:0,taste:0,risk:0,control:0,volume:0,cost:0,difficulty:0,psychedelic:false};
    for(const f of meal()){
      totals.spice+=f.spice*f.qty;totals.fiber+=f.fiber*f.qty;totals.drain+=f.drain*f.qty;totals.stim+=f.stim*f.qty;totals.taste+=f.taste*f.qty;totals.control+=f.control*f.qty;totals.volume+=f.volume*f.qty;totals.cost+=f.cost*f.qty;totals.difficulty+=f.challenge*f.qty+f.cost*.018*f.qty;totals.psychedelic ||= !!f.psychedelic;
      totals.risk=1-(1-totals.risk)*Math.pow(1-f.risk,f.qty);
    }
    return totals;
  }
  function render(){
    cashValue.textContent=money(state.cash);healthValue.innerHTML=`${state.health}<span class="health-unit">/100</span>`;
    dayValue.textContent=String(state.day).padStart(2,'0');careerCount.textContent=state.totalMovements;
    $('#basket-count').textContent=`${totalItems()} / 4`;$('#spent-value').textContent=money(mealTotals().cost);
    renderFoodGrid();renderBasket();renderPhase();renderScene();renderCustomization();
    $('#daily-quip').textContent=quips[(state.day-1)%quips.length];
    const highRisk=mealTotals().risk>.16;
    startButton.disabled=state.phase!=='shop'; // empty meals are allowed too
    $('#sound-toggle').classList.toggle('sound-on',state.sound);
    $('#sound-toggle').setAttribute('aria-label',state.sound?'Turn sound off':'Turn sound on');
    $('#skip-meal').hidden=state.phase!=='shop';
    $('#market-card').classList.toggle('locked',state.phase!=='shop');
    const title=$('#market-card .market-heading h2'),subtitle=$('#market-card .market-subtitle');
    if(state.phase==='shop'){title.innerHTML='Today’s menu<span>.</span>';subtitle.textContent='Buy food. Meet consequences. All prices are fictional.'}
    else {title.innerHTML='Today’s intake<span>.</span>';subtitle.textContent=state.phase==='toilet'?'The menu is closed. Your choices are now your problem.':'The menu that made history (or at least a smell).'}
    if(state.phase==='results'&&state.daily) showResult();
  }
  function renderFoodGrid(){
    const locked=state.phase!=='shop';
    foodGrid.innerHTML=foods.map(f=>{
      const qty=Number(state.cart[f.id]||0), riskLevel=Math.min(5,Math.round(f.risk*16));
      const attrs=[['SPICE',f.spice,'spicy'],['FIBER',f.fiber,'fiber'],['DIUR',f.drain,'drain'],['STIM',f.stim,'stimulant'],['TASTE',f.taste,'taste'],['RISK',riskLevel,'risk']];
      const stats=attrs.map(([name,val,kind])=>`<div class="food-stat ${kind}"><span>${name}</span><span class="stat-track"><i class="stat-fill" style="display:block;width:${val*20}%"></i></span></div>`).join('');
      let control=locked?`<span class="food-effect">${qty?`ON YOUR TRAY ×${qty}`:'NOT ORDERED'}</span>`:qty?`<span class="food-effect">${f.effect}</span><span class="quantity-controls"><button data-action="remove" data-id="${f.id}" aria-label="Remove one ${f.name}">−</button>${qty}<button data-action="add" data-id="${f.id}" aria-label="Add one ${f.name}" ${totalItems()>=4||state.cash<f.cost?'disabled':''}>+</button></span>`:`<span class="food-effect">${f.effect}</span><button class="add-food" data-action="add" data-id="${f.id}" aria-label="Buy ${f.name} for $${f.cost}" ${totalItems()>=4||state.cash<f.cost?'disabled':''}>+ ADD</button>`;
      return `<article class="food-card ${qty?'in-cart':''}"><div class="food-head"><span class="food-emoji" aria-hidden="true">${f.emoji}</span><div style="min-width:0"><div class="food-name">${f.name}</div><div class="food-tagline">${f.line}</div></div><span class="food-cost">$${f.cost}</span></div><div class="food-stats">${stats}</div><div class="food-actions">${control}</div></article>`;
    }).join('');
  }
  function renderBasket(){
    if(!totalItems()){basketItems.innerHTML='<span class="empty-basket">Your tray is empty. Be brave (or be sensible).</span>';return}
    basketItems.innerHTML=meal().map(f=>`<span class="basket-pill">${f.emoji} ${f.name} ×${f.qty}<button data-action="remove" data-id="${f.id}" aria-label="Remove one ${f.name}" ${state.phase!=='shop'?'disabled':''}>−</button></span>`).join('');
  }
  function renderPhase(){
    document.querySelectorAll('.phase-node').forEach(n=>{const step=n.dataset.step; n.classList.toggle('active',step===state.phase);n.classList.toggle('done',(state.phase==='toilet'&&step==='shop')||(state.phase==='results'&&(step==='shop'||step==='toilet')))});
    shopPanel.hidden=state.phase!=='shop';qtePanel.hidden=state.phase!=='toilet';resultsPanel.hidden=state.phase!=='results';
    $('#action-kicker').textContent=state.phase==='shop'?'PHASE 01 · STOCK UP':state.phase==='toilet'?'PHASE 02 · THE MAIN EVENT':'PHASE 03 · YOUR PAYDAY';
    $('#action-title').textContent=state.phase==='shop'?'Build your breakfast.':state.phase==='toilet'?'Find your moment.':'The numbers are in.';
    $('#action-description').textContent=state.phase==='shop'?'What goes in changes what comes out. Pick up to 4 items.':state.phase==='toilet'?'Three pushes. One moving needle. Timing is everything.': 'A long day’s work deserves a short, satisfying receipt.';
    $('#action-stamp').textContent=state.phase==='shop'?'01':state.phase==='toilet'?'02':'03';
    $('#scene-day').textContent=`DAY ${String(state.day).padStart(2,'0')} · ${state.phase==='shop'?'PRE-SERVICE':state.phase==='toilet'?'IN SESSION':'SHIFT COMPLETE'}`;
  }
  function renderScene(){
    const active=state.phase==='toilet',psych=active&&!!(state.daily&&state.daily.psychedelic);
    sceneWrap.classList.toggle('active-toilet',active);sceneWrap.classList.toggle('tripping',psych);
    avatar.classList.remove('avatar-idle','avatar-straining','avatar-tripping');avatar.classList.add(active?(psych?'avatar-tripping':'avatar-straining'):'avatar-idle');
    const d=state.daily||{}, foodName=(d.foodNames||[])[0];
    if(active){
      if(psych){sceneQuote.textContent='“The tiles are singing. The needle is a tiny orange comet.”';sceneMood.textContent='MOOD: COSMIC'}
      else if(d.poisoned){sceneQuote.textContent='“My stomach just filed a formal complaint.”';sceneMood.textContent='MOOD: QUESTIONABLE'}
      else if(d.stim>4){sceneQuote.textContent='“I can hear the espresso machine from here.”';sceneMood.textContent='MOOD: OVERCLOCKED'}
      else {sceneQuote.textContent='“Breathe in. Focus. This is what the training was for.”';sceneMood.textContent='MOOD: DETERMINED'}
    } else if(state.phase==='results'){sceneQuote.textContent=(d.score||0)>=85?'“I would like to thank fiber, focus, and the academy.”':'“We’ll simply never speak of that again.”';sceneMood.textContent=(d.score||0)>=85?'MOOD: TRIUMPHANT':'MOOD: REFLECTIVE'}
    else {sceneQuote.textContent=foodName?`“${foodName} is in. The porcelain awaits.”`:'“A fresh day. A fresh bowl. Let’s make it count.”';sceneMood.textContent='MOOD: OPTIMISTIC'}
    const trip=sceneWrap.querySelector('.trip-overlay');if(trip)trip.setAttribute('aria-hidden',psych?'false':'true');
  }
  function renderCustomization(){
    document.documentElement.style.setProperty('--skin',state.avatar.skin);document.documentElement.style.setProperty('--hair',state.avatar.hair);
    $('#hair-shape').style.display=state.avatar.pronouns==='masc'?'':'none';$('#hair-long').style.display=state.avatar.pronouns==='fem'?'':'none';
    const preview=$('.mini-avatar');if(preview){preview.innerHTML='<i class="mini-hair"></i><i class="mini-head"></i><i class="mini-body"></i>';preview.dataset.style=state.avatar.pronouns;preview.style.setProperty('--mini-skin',state.avatar.skin);preview.style.setProperty('--mini-hair',state.avatar.hair);}
    $('#pronouns').value=state.avatar.pronouns;
    $('#skin-swatches').innerHTML=skinColors.map(c=>`<button class="color-swatch ${c===state.avatar.skin?'selected':''}" style="background:${c}" data-color="${c}" data-type="skin" aria-label="Skin tone" aria-pressed="${c===state.avatar.skin}"></button>`).join('');
    $('#hair-swatches').innerHTML=hairColors.map(c=>`<button class="color-swatch ${c===state.avatar.hair?'selected':''}" style="background:${c}" data-color="${c}" data-type="hair" aria-label="Hair color" aria-pressed="${c===state.avatar.hair}"></button>`).join('');
  }
  function renderResult(){
    const r=state.daily||{};$('#score-value').textContent=r.score??0;$('#payout-value').textContent=`+${money(r.payout||0)}`;
    $('#difficulty-value').textContent=r.difficultyLabel||'GENTLE';$('#consistency-value').textContent=r.consistencyLabel||'—';$('#color-value').textContent=r.color||'Classic brown';$('#volume-value').textContent=r.volumeLabel||'—';
    const score=r.score||0;$('#result-grade').textContent=score>=95?'LEGENDARY FORM':score>=85?'PORCELAIN PRO':score>=70?'SOLID WORK':score>=50?'A VALIANT EFFORT':'THE FLOOR IS YOURS';
    $('#result-title').textContent=score>=85?'A textbook performance.':score>=50?'The deed is done.':'A humbling day at the office.';
    $('#result-description').textContent=r.poisoned?'Food poisoning! The clinic took $8, but you made it through.':score>=85?'The crowd goes mild. Your wallet goes up.':score>=50?'A respectable performance. You earned your keep.':'Not your cleanest run. There’s always tomorrow.';
    const achievement=r.newAchievement?achievements.find(a=>a.id===r.newAchievement):null;
    $('#achievement-toast').hidden=!achievement;if(achievement)$('#achievement-name').textContent=achievement.name;
  }
  function showResult(){renderResult()}
  function updateCart(action,id){
    if(state.phase!=='shop')return;
    const f=foods.find(x=>x.id===id);if(!f)return;
    if(action==='add'){
      if(totalItems()>=4){showToast('Four items max. Your tray has limits.');return}
      if(state.cash<f.cost){showToast('Not enough cash. The market does not do tabs.');return}
      state.cash-=f.cost;state.cart[id]=(state.cart[id]||0)+1;playSound('buy');
    }else if(action==='remove'&&(state.cart[id]||0)>0){state.cash+=f.cost;state.cart[id]--;if(!state.cart[id])delete state.cart[id];playSound('remove')}
    save();render();
  }
  function startDay(skip=false){
    if(state.phase!=='shop')return;
    if(skip&&totalItems()){showToast('Your tray is full of decisions. Remove them first to skip.');return}
    const t=mealTotals();
    const poisoned=Math.random()<t.risk;
    let clinicFee=0;
    if(poisoned){const damage=8+Math.floor(Math.random()*9);state.health=Math.max(1,state.health-damage);clinicFee=Math.min(state.cash,8);state.cash-=clinicFee;state.cleanStreak=0;showToast(`Food poisoning! −${damage} health. The clinic fee was $${clinicFee}.`);playSound('poison')}
    else state.cleanStreak++;
    state.daily={
      foodNames:meal().map(x=>x.name),foodIds:meal().map(x=>x.id),spent:t.cost,spice:t.spice,fiber:t.fiber,drain:t.drain,stim:t.stim,taste:t.taste,risk:t.risk,control:t.control,volume:t.volume,difficulty:t.difficulty,psychedelic:t.psychedelic,poisoned,clinicFee,
      targetWidth:clamp(28+t.fiber*1.15-t.spice*1.15-t.stim*.8-t.drain*.55-(poisoned?5:0),10,38),
      speed:clamp(69+t.stim*7+t.drain*3+t.spice*2,60,140),target:0,pushes:[],pushIndex:0,score:0,payout:0
    };
    state.daily.target=rollTarget();state.phase='toilet';needlePos=7;needleDirection=1;save();render();startNeedle();
  }
  function rollTarget(){return Math.round(20+Math.random()*60)}
  function startNeedle(){cancelAnimationFrame(raf);lastFrame=0;raf=requestAnimationFrame(tickNeedle)}
  function tickNeedle(time){
    if(state.phase!=='toilet')return;
    if(lastFrame){const dt=Math.min(40,time-lastFrame);needlePos+=needleDirection*(state.daily.speed*dt/1000);if(needlePos>96){needlePos=96;needleDirection=-1}else if(needlePos<4){needlePos=4;needleDirection=1}}
    lastFrame=time;needle.style.left=`${needlePos}%`;
    if(!state.daily._meterReady){
      const half=state.daily.targetWidth/2;targetZone.style.left=`${state.daily.target-half}%`;targetZone.style.width=`${state.daily.targetWidth}%`;state.daily._meterReady=true;
      const instruction=$('#qte-instruction');instruction.textContent=state.daily.psychedelic?'The window is doing its best. So are you.':'Stop the needle in the sweet spot.';
      $('#push-count').textContent=state.daily.pushIndex+1;
      $('#push-dots').innerHTML=Array.from({length:3},(_,i)=>`<i class="${i<state.daily.pushIndex?'done':i===state.daily.pushIndex?'current':''}"></i>`).join('');
    }
    raf=requestAnimationFrame(tickNeedle);
  }
  function push(){
    if(state.phase!=='toilet')return;
    const d=state.daily,half=d.targetWidth/2,distance=Math.abs(needlePos-d.target),excess=Math.max(0,distance-half);
    let grade=distance<=half?Math.round(100-(distance/half)*24):Math.round(clamp(67-excess*2.15,0,66));
    if(state.health<25)grade=Math.max(0,grade-8);
    d.pushes.push({pos:Math.round(needlePos),target:d.target,grade,hit:distance<=half});
    playSound(grade>=70?'hit':'miss');
    const meter=$('#meter-wrap');meter.classList.remove('hit-flash','miss-flash');void meter.offsetWidth;meter.classList.add(grade>=70?'hit-flash':'miss-flash');
    if(navigator.vibrate&&grade>=70)navigator.vibrate(14);
    d.pushIndex++;
    if(d.pushIndex>=3){finishDay();return}
    d.target=rollTarget();d._meterReady=false;needlePos=needleDirection>0?7:93;
    save();
    $('#push-count').textContent=d.pushIndex+1;
    $('#push-dots').innerHTML=Array.from({length:3},(_,i)=>`<i class="${i<d.pushIndex?'done':i===d.pushIndex?'current':''}"></i>`).join('');
    targetZone.style.left=`${d.target-d.targetWidth/2}%`;targetZone.style.width=`${d.targetWidth}%`;
    const instruction=$('#qte-instruction');instruction.textContent=grade>=85?'Beautiful timing! Keep that energy.':grade>=60?'A near-perfect push. Stay focused.':'Oof. Reset your focus for the next one.';
    $('#meter-wrap').setAttribute('aria-label',`Push ${d.pushIndex+1} of 3 timing meter`);
  }
  function finishDay(){
    cancelAnimationFrame(raf);
    const d=state.daily;d.score=Math.round(d.pushes.reduce((a,p)=>a+p.grade,0)/3);
    d.successes=d.pushes.filter(p=>p.grade>=55).length;
    d.consistency=clamp(Math.round(5+d.fiber*1.1-d.spice*.35-d.risk*7),1,10);
    d.consistencyLabel=d.consistency>=8?'REMARKABLY FIRM':d.consistency>=6?'RESPECTABLY SOLID':d.consistency>=4?'A LITTLE WOBBLY':'THE PLOT THICKENS';
    d.volumeLabel=d.volume===0?'DRY RUN':d.volume<2?'POLITE':d.volume<4?'RESPECTABLE':d.volume<7?'BIG PRODUCTION':'PORTS AUTHORITY CALLED';
    const chosen=meal();
    const colorFood=chosen.slice().sort((a,b)=>(b.qty*b.challenge)-(a.qty*a.challenge))[0];d.color=colorFood?colorFood.color:'Classic brown';
    d.difficultyLabel=d.difficulty>=7?'EXTREME':d.difficulty>=5?'SPICY':d.difficulty>=3?'MODERATE':'GENTLE';
    const completion=d.score>=45?1:.55;
    d.payout=Math.max(4,Math.round((10+d.difficulty*4+d.spent*.12+d.volume*1.1)*(0.45+d.score/100*.85)*completion));
    state.cash+=d.payout;state.totalEarned+=d.payout;state.totalMovements++;state.bestScore=Math.max(state.bestScore,d.score);
    if(d.score>=45)state.successfulMovements++;
    if(!d.poisoned&&d.fiber>=3)state.health=Math.min(100,state.health+Math.min(8,Math.floor(d.fiber)));
    state.phase='results';
    const newly=[];
    for(const a of achievements){if(!state.achievements.includes(a.id)&&a.test(state,d)){state.achievements.push(a.id);newly.push(a.id)}}
    d.newAchievement=newly[0]||null;
    save();render();playSound('result');
    if(d.newAchievement){const a=achievements.find(x=>x.id===d.newAchievement);if(a)setTimeout(()=>showToast(`Achievement unlocked: ${a.name}`),500)}
  }
  function nextDay(){if(state.phase!=='results')return;state.day++;state.phase='shop';state.cart={};state.daily=null;save();render();window.scrollTo({top:0,behavior:'smooth'})}
  function showToast(text){const el=$('#toast');el.textContent=text;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600)}
  function playSound(kind){
    if(!state.sound)return;
    try{
      audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();
      if(audioCtx.state==='suspended')audioCtx.resume();
      const now=audioCtx.currentTime,osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.connect(gain);gain.connect(audioCtx.destination);
      const notes={buy:[610,.07],remove:[300,.06],hit:[760,.11],miss:[180,.13],poison:[110,.32],result:[520,.2]};const [freq,dur]=notes[kind]||[440,.08];
      osc.type=kind==='poison'?'sawtooth':'sine';osc.frequency.setValueAtTime(freq,now);if(kind==='result')osc.frequency.exponentialRampToValueAtTime(freq*1.45,now+dur);
      gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.09,now+.012);gain.gain.exponentialRampToValueAtTime(.0001,now+dur);osc.start(now);osc.stop(now+dur+.02);
    }catch{}
  }
  function renderStats(){
    $('#career-stats').innerHTML=[['MOVEMENTS',state.totalMovements],['SUCCESSFUL',state.successfulMovements],['BEST SCORE',state.bestScore],['TOTAL EARNED',money(state.totalEarned)],['CURRENT WALLET',money(state.cash)],['HEALTH',`${state.health}/100`]].map(([label,val])=>`<div class="career-stat"><small>${label}</small><strong>${val}</strong></div>`).join('');
    $('#achievement-grid').innerHTML=achievements.map(a=>`<div class="achievement-item ${state.achievements.includes(a.id)?'unlocked':''}"><span class="achievement-icon">${a.icon}</span><span><b>${a.name}</b><small>${a.desc}</small></span></div>`).join('');
  }

  foodGrid.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b)updateCart(b.dataset.action,b.dataset.id)});
  basketItems.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b)updateCart(b.dataset.action,b.dataset.id)});
  $('#start-run').addEventListener('click',()=>startDay(false));$('#skip-meal').addEventListener('click',()=>startDay(true));$('#push-button').addEventListener('click',push);$('#next-day').addEventListener('click',nextDay);
  document.addEventListener('keydown',e=>{
    if(state.phase==='toilet'&&!e.repeat&&(e.code==='Space'||e.code==='Enter')&&!document.querySelector('dialog[open]')){e.preventDefault();push()}
  });
  $('#sound-toggle').addEventListener('click',()=>{state.sound=!state.sound;save();render();if(state.sound)playSound('buy')});
  const musicDock=$('#music-dock'),musicFrame=$('#music-frame'),musicToggle=$('#music-toggle');
  musicToggle.addEventListener('click',()=>{
    musicDock.hidden=false;musicToggle.classList.add('music-on');musicToggle.setAttribute('aria-label','Stop background music');
    if(!musicFrame.querySelector('iframe')){const frame=document.createElement('iframe');frame.title='Ghidorah — Toilet story 4 (YouTube music player)';frame.src='https://www.youtube-nocookie.com/embed/x83NjXTuRLk?autoplay=1&controls=1&rel=0&playsinline=1';frame.allow='autoplay; encrypted-media; picture-in-picture';frame.referrerPolicy='strict-origin-when-cross-origin';frame.allowFullscreen=true;musicFrame.appendChild(frame)}
  });
  $('#music-close').addEventListener('click',()=>{musicFrame.replaceChildren();musicDock.hidden=true;musicToggle.classList.remove('music-on');musicToggle.setAttribute('aria-label','Play background music')});
  $('#customize-open').addEventListener('click',()=>$('#customize-dialog').showModal());
  $('#customize-done').addEventListener('click',()=>$('#customize-dialog').close());
  $('#pronouns').addEventListener('change',e=>{state.avatar.pronouns=e.target.value;save();renderCustomization()});
  $('#skin-swatches').addEventListener('click',e=>{const b=e.target.closest('[data-color]');if(!b)return;state.avatar.skin=b.dataset.color;save();renderCustomization()});
  $('#hair-swatches').addEventListener('click',e=>{const b=e.target.closest('[data-color]');if(!b)return;state.avatar.hair=b.dataset.color;save();renderCustomization()});
  $('#stats-open').addEventListener('click',()=>{renderStats();$('#stats-dialog').showModal()});
  $('#reset-open').addEventListener('click',()=>$('#reset-dialog').showModal());$('#reset-cancel').addEventListener('click',()=>$('#reset-dialog').close());
  $('#reset-confirm').addEventListener('click',()=>{localStorage.removeItem(SAVE_KEY);state=defaultState();$('#reset-dialog').close();save();render();showToast('A fresh career. May your aim be true.')});
  document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)d.close()}));
  render();
  if(state.phase==='toilet'){
    const d=state.daily||{};state.daily={...d,target:d.target||rollTarget(),targetWidth:d.targetWidth||24,speed:d.speed||75,pushes:d.pushes||[],pushIndex:d.pushes?.length||0};
    if(state.daily.pushIndex>=3)state.daily.pushIndex=2;
    render();startNeedle();
  }
})();
