'use strict';

const FIREBASE_CONFIG = {
  apiKey:      'AIzaSyCc-w-9ETuDbi3LTI7g5zFGsdoOfR2Fbx8',                                       
  authDomain:  'snake-and-ladder-854d6.firebaseapp.com',
  databaseURL: 'https://snake-and-ladder-854d6-default-rtdb.asia-southeast1.firebasedatabase.app/', 
  projectId:   'snake-and-ladder-854d6',                                     
};

const NS='http://www.w3.org/2000/svg';
function mksvg(tag,a={}){const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(a))e.setAttribute(k,v);return e;}
function wait(ms){return new Promise(r=>setTimeout(r,ms));}
function vibrate(p){try{if(navigator.vibrate)navigator.vibrate(p);}catch(e){}}

const SHAPES=['●','▲','■','◆','★','✦'];

/* Inline SVG strings for floating reaction popups */
const REACT_SVG_MAP={
  burst:`<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="10" cy="10" r="2.5" fill="currentColor" stroke="none"/><line x1="10" y1="1.5" x2="10" y2="4.5"/><line x1="10" y1="15.5" x2="10" y2="18.5"/><line x1="1.5" y1="10" x2="4.5" y2="10"/><line x1="15.5" y1="10" x2="18.5" y2="10"/><line x1="3.7" y1="3.7" x2="5.8" y2="5.8"/><line x1="14.2" y1="14.2" x2="16.3" y2="16.3"/><line x1="16.3" y1="3.7" x2="14.2" y2="5.8"/><line x1="5.8" y1="14.2" x2="3.7" y2="16.3"/></svg>`,
  skull:`<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2.5C6.4 2.5 3.5 5.2 3.5 8.5c0 2.1 1.1 4 2.8 5.1V15h7.4v-1.4c1.7-1.1 2.8-3 2.8-5.1 0-3.3-2.9-6-6.5-6z"/><line x1="7.2" y1="15" x2="7.2" y2="17.5"/><line x1="10" y1="15" x2="10" y2="17.5"/><line x1="12.8" y1="15" x2="12.8" y2="17.5"/><circle cx="7.8" cy="8.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="12.2" cy="8.5" r="1.3" fill="currentColor" stroke="none"/></svg>`,
  snake:`<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M5 16 C2 16 2 12 5 12 C8 12 8 8 5 8 C2 8 2 4.5 5 4.5 C7 4.5 8.5 5.5 9 7" stroke-width="2.2" fill="none"/><ellipse cx="12" cy="6" rx="3" ry="2.2" fill="currentColor" stroke="none"/><circle cx="13.2" cy="5.3" r=".6" fill="#060606" stroke="none"/><line x1="14.9" y1="6" x2="17.8" y2="4.6" stroke-width="1" stroke="currentColor"/><line x1="14.9" y1="6" x2="17.8" y2="7.4" stroke-width="1" stroke="currentColor"/></svg>`,
  ladder:`<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="6.5" y1="2" x2="6.5" y2="18"/><line x1="13.5" y1="2" x2="13.5" y2="18"/><line x1="6.5" y1="5.5" x2="13.5" y2="5.5"/><line x1="6.5" y1="10" x2="13.5" y2="10"/><line x1="6.5" y1="14.5" x2="13.5" y2="14.5"/></svg>`,
  thumbsup:`<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9.5L9.2 3C10.2 3 11.2 3.7 11.2 5V8H15.5C16.2 8 16.8 8.6 16.6 9.3L15.3 15C15.1 15.7 14.4 16.5 13.6 16.5H7"/><rect x="3.5" y="9.5" width="3.5" height="7" rx="1" fill="currentColor" stroke="none" opacity=".65"/></svg>`,
  fire:`<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17.5C6.9 17.5 4 15 4 12C4 8.5 7 6.5 7 3.5C9 5 9 7.5 10 7.5C10.5 6 11.2 4.2 12.8 2.5C12.8 5.5 16 7.5 16 11.5C16 15 13.1 17.5 10 17.5Z" fill="currentColor" stroke="none" opacity=".2"/><path d="M10 17.5C6.9 17.5 4 15 4 12C4 8.5 7 6.5 7 3.5C9 5 9 7.5 10 7.5C10.5 6 11.2 4.2 12.8 2.5C12.8 5.5 16 7.5 16 11.5C16 15 13.1 17.5 10 17.5Z"/></svg>`
};

/* ── SOUND ──────────────────────────────────────────────────────────────── */
const Sound={
  ctx:null,muted:false,
  _ctx(){
    if(!this.ctx){try{this.ctx=new(window.AudioContext||window.webkitAudioContext)();}catch(e){return null;}}
    if(this.ctx&&this.ctx.state==='suspended')this.ctx.resume();
    return this.ctx;
  },
  toggle(){
    this.muted=!this.muted;
    const b=document.getElementById('muteBtn');
    b.textContent=this.muted?'♪̶':'♪';
    b.style.opacity=this.muted?'.45':'1';
  },
  roll(){if(this.muted)return;try{const c=this._ctx();if(!c)return;const b=c.createBuffer(1,c.sampleRate*.05,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/d.length*10);const s=c.createBufferSource(),g=c.createGain();g.gain.value=.12;s.buffer=b;s.connect(g);g.connect(c.destination);s.start();}catch(e){}},
  snake(){if(this.muted)return;try{const c=this._ctx();if(!c)return;const o=c.createOscillator(),g=c.createGain();o.type='sawtooth';o.frequency.setValueAtTime(320,c.currentTime);o.frequency.exponentialRampToValueAtTime(70,c.currentTime+.7);g.gain.setValueAtTime(.08,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.7);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.75);}catch(e){}},
  ladder(){if(this.muted)return;try{const c=this._ctx();if(!c)return;[0,.12,.24].forEach((t,i)=>{const o=c.createOscillator(),g=c.createGain();o.frequency.value=[370,494,587][i];g.gain.setValueAtTime(.07,c.currentTime+t);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+t+.22);o.connect(g);g.connect(c.destination);o.start(c.currentTime+t);o.stop(c.currentTime+t+.28);});}catch(e){}},
  win(){if(this.muted)return;try{const c=this._ctx();if(!c)return;[0,.1,.2,.35].forEach((t,i)=>{const o=c.createOscillator(),g=c.createGain();o.frequency.value=[440,550,660,880][i];g.gain.setValueAtTime(.1,c.currentTime+t);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+t+.45);o.connect(g);g.connect(c.destination);o.start(c.currentTime+t);o.stop(c.currentTime+t+.5);});}catch(e){}},
  chomp(){if(this.muted)return;try{const c=this._ctx();if(!c)return;
    [0,.04,.09].forEach((t,i)=>{const o=c.createOscillator(),g=c.createGain();o.type='sawtooth';
      o.frequency.setValueAtTime([180,120,90][i],c.currentTime+t);o.frequency.exponentialRampToValueAtTime([60,45,35][i],c.currentTime+t+.12);
      g.gain.setValueAtTime(.14,c.currentTime+t);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+t+.18);
      o.connect(g);g.connect(c.destination);o.start(c.currentTime+t);o.stop(c.currentTime+t+.22);});
    const buf=c.createBuffer(1,c.sampleRate*.08,c.sampleRate);const d=buf.getChannelData(0);
    for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/d.length*18);
    const s=c.createBufferSource(),gn=c.createGain();gn.gain.value=.18;s.buffer=buf;s.connect(gn);gn.connect(c.destination);s.start();
  }catch(e){}}
};

/* ── PLAYERS ─────────────────────────────────────────────────────────────── */
const ALL_PLAYERS=[
  {id:0,name:'Player 1',color:'#e8e8e8',text:'#060606',logClass:'p0'},
  {id:1,name:'Player 2',color:'#c8a84b',text:'#060606',logClass:'p1'},
  {id:2,name:'Player 3',color:'#5cf6b0',text:'#060606',logClass:'p2'},
  {id:3,name:'Player 4',color:'#e056aa',text:'#060606',logClass:'p3'},
  {id:4,name:'Player 5',color:'#5b9cf6',text:'#060606',logClass:'p4'},
  {id:5,name:'Player 6',color:'#f97316',text:'#060606',logClass:'p5'},
];

/* ── CONFIG ─────────────────────────────────────────────────────────────── */
const DEFAULT_SNAKES={98:78,95:56,88:24,62:18,48:26,36:6};
const DEFAULT_LADDERS={3:22,15:44,28:84,51:67,71:91};
const Config={
  SIZE:10,TILES:100,OFFSET:30,TW:60,TH:60,
  SNAKES:{...DEFAULT_SNAKES},
  LADDERS:{...DEFAULT_LADDERS},
  SNAKE_COLORS:[
    {stroke:'#d94f4f',glow:'rgba(217,79,79,.12)'},{stroke:'#e0843a',glow:'rgba(224,132,58,.12)'},
    {stroke:'#8b5cf6',glow:'rgba(139,92,246,.12)'},{stroke:'#2dd4a0',glow:'rgba(45,212,160,.12)'},
    {stroke:'#e8c94a',glow:'rgba(232,201,74,.12)'},{stroke:'#e056aa',glow:'rgba(224,86,170,.12)'},
  ],
  AI_MIN:600,AI_MAX:1100,
  exactWin:false,bonusRoll:true,bounceBack:false,
  aiPlayers:[false,true,true,true,true,true],
  boardPreset:'classic',
  get STEP_MS(){return State.fast?55:130;},
  get GLIDE_SNAKE(){return State.fast?350:1200;},
  get GLIDE_LADDER(){return State.fast?280:1000;},
  isAI(pi){if(MP&&MP.active)return false;if(State.mode==='1p')return pi>=1;if(State.mode==='4p'||State.mode==='6p')return Config.aiPlayers[pi];return false;}
};

/* ── STATE ───────────────────────────────────────────────────────────────── */
const State={
  mode:'1p',fast:false,numPlayers:2,
  players:ALL_PLAYERS.slice(0,2),
  pos:[1,1],cur:0,busy:false,over:false,turns:0,turnNum:1,stats:[],
  reset(){
    const n=this.numPlayers;
    this.players=ALL_PLAYERS.slice(0,n).map(p=>({...p}));
    this.pos=Array(n).fill(1);
    this.cur=0;this.busy=false;this.over=false;this.turns=0;this.turnNum=1;
    this.stats=Array.from({length:n},()=>({s:0,l:0,r:0}));
  }
};


/* ── BOARD PRESETS ───────────────────────────────────────────────────────── */
const BOARD_PRESETS={
  classic:{
    name:'Classic',desc:'The original balanced layout. A good mix of ups and downs.',
    snakes:{98:78,95:56,88:24,62:18,48:26,36:6},
    ladders:{3:22,15:44,28:84,51:67,71:91},
    tags:[{t:'6 snakes',c:'snakes'},{t:'5 ladders',c:'ladders'},{t:'Balanced',c:'difficulty'}]
  },
  chaos:{
    name:'Chaos',desc:'Eight vicious snakes and sparse ladders. Every step could be your last.',
    snakes:{99:4,95:13,90:45,85:22,78:11,68:30,54:8,42:17},
    ladders:{7:55,19:38,33:72,61:87},
    tags:[{t:'8 snakes',c:'snakes'},{t:'4 ladders',c:'ladders'},{t:'Brutal',c:'difficulty'}]
  },
  shortcut:{
    name:'Shortcut City',desc:'Ladders dominate — big leaps forward, gentle snakes that sting.',
    snakes:{97:82,76:58,53:31,29:14},
    ladders:{2:38,11:52,22:69,34:88,44:77,57:93,63:91,72:96},
    tags:[{t:'4 snakes',c:'snakes'},{t:'8 ladders',c:'ladders'},{t:'Fast',c:'difficulty'}]
  },
  gauntlet:{
    name:'Gauntlet',desc:'Long snakes lurk near the finish. Getting to 100 takes real luck.',
    snakes:{97:7,93:41,87:14,79:2,72:38,60:19,47:23,38:9},
    ladders:{4:26,13:46,24:64,35:82,49:68},
    tags:[{t:'8 snakes',c:'snakes'},{t:'5 ladders',c:'ladders'},{t:'Punishing',c:'difficulty'}]
  },
  mirror:{
    name:'Mirror',desc:'Perfect symmetry — every snake has a matching ladder of the same length.',
    snakes:{96:74,88:48,77:33,65:21,52:38,43:17},
    ladders:{6:28,12:44,23:67,37:79,48:72,74:96},
    tags:[{t:'6 snakes',c:'snakes'},{t:'6 ladders',c:'ladders'},{t:'Symmetric',c:'difficulty'}]
  }
};

function applyPreset(key){
  const p=BOARD_PRESETS[key];if(!p)return;
  Object.keys(Config.SNAKES).forEach(k=>delete Config.SNAKES[k]);
  Object.keys(Config.LADDERS).forEach(k=>delete Config.LADDERS[k]);
  Object.assign(Config.SNAKES,p.snakes);
  Object.assign(Config.LADDERS,p.ladders);
  Config.boardPreset=key;
}

/* ── SETTINGS ────────────────────────────────────────────────────────────── */
const Settings={
  _tab:'rules',
  open(){this._tab='rules';this._render();document.getElementById('settingsOverlay').style.display='flex';},
  close(){document.getElementById('settingsOverlay').style.display='none';},
  switchTab(t){
    this._tab=t;
    document.querySelectorAll('.stab').forEach(b=>b.classList.toggle('active',b.dataset.tab===t));
    this._renderBody();
  },
  _render(){
    document.querySelectorAll('.stab').forEach(b=>b.classList.toggle('active',b.dataset.tab===this._tab));
    this._renderBody();
  },
  _renderBody(){
    const body=document.getElementById('settingsBody');body.innerHTML='';
    if(this._tab==='rules')this._rulesTab(body);
    else if(this._tab==='players')this._playersTab(body);
    else if(this._tab==='presets')this._presetsTab(body);
    else if(this._tab==='board')this._boardTab(body);
    else if(this._tab==='display')this._displayTab(body);
  },
  _toggle(label,desc,checked,onChange){
    const row=document.createElement('div');row.className='settings-row';
    row.innerHTML=`<div class="settings-row-info"><div class="settings-row-label">${label}</div><div class="settings-row-desc">${desc}</div></div>`;
    const tog=document.createElement('label');tog.className='toggle';
    const inp=document.createElement('input');inp.type='checkbox';inp.checked=checked;
    inp.addEventListener('change',()=>onChange(inp.checked));
    tog.appendChild(inp);
    const track=document.createElement('div');track.className='toggle-track';
    const thumb=document.createElement('div');thumb.className='toggle-thumb';
    tog.appendChild(track);tog.appendChild(thumb);
    row.appendChild(tog);return row;
  },
  _rulesTab(body){
    const locked=MP.active&&!MP.isHost;
    const s=document.createElement('div');s.className='settings-section';
    if(locked){
      const note=document.createElement('div');note.style.cssText='font-size:.58rem;color:var(--gold);margin-bottom:10px;line-height:1.55;padding:7px 10px;border:1px solid rgba(200,168,75,.2);border-radius:4px;background:rgba(200,168,75,.06)';
      note.textContent='⚑ Only the host can change rules.';s.appendChild(note);
    }
    s.appendChild(Object.assign(document.createElement('div'),{className:'settings-section-title',textContent:'Winning'}));
    const t1=this._toggle('Exact landing required','Must roll the exact number to reach tile 100. Overshoot bounces back.',Config.exactWin,v=>{Config.exactWin=v;MP.pushSettings();});
    if(locked)t1.style.pointerEvents='none',t1.style.opacity='.45';
    s.appendChild(t1);
    s.appendChild(Object.assign(document.createElement('div'),{className:'settings-section-title',style:'margin-top:14px',textContent:'Turns'}));
    const t2=this._toggle('Bonus roll on 6','Rolling a 6 grants an extra turn.',Config.bonusRoll,v=>{Config.bonusRoll=v;MP.pushSettings();});
    if(locked)t2.style.pointerEvents='none',t2.style.opacity='.45';
    s.appendChild(t2);
    body.appendChild(s);
    const note=document.createElement('div');note.className='settings-note';
    note.textContent=locked?'Ask the host to change rules.':'Rule changes take effect immediately in online play.';body.appendChild(note);
  },
  _playersTab(body){
    const s=document.createElement('div');s.className='settings-section';
    s.appendChild(Object.assign(document.createElement('div'),{className:'settings-section-title',textContent:'Multiplayer Mode — Player Types'}));
    const note=document.createElement('div');
    note.style.cssText='font-size:.58rem;color:var(--muted);margin-bottom:12px;line-height:1.55';
    note.textContent='Controls which players are AI-controlled in 4P/6P mode. In vs AI mode, only Player 1 is human.';
    s.appendChild(note);
    ALL_PLAYERS.forEach((p,i)=>{
      const row=document.createElement('div');row.className='player-cfg-row';
      const dot=document.createElement('div');dot.className='player-cfg-dot';dot.style.background=p.color;
      const name=document.createElement('span');name.className='player-cfg-name';
      name.innerHTML=`${p.name}${i===0?' <span style="color:var(--muted);font-size:.55rem">(always human)</span>':''}`;
      row.appendChild(dot);row.appendChild(name);
      if(i>0){
        const seg=document.createElement('div');seg.className='player-cfg-seg';
        ['Human','AI'].forEach((type,ti)=>{
          const isAIType=(ti===1);
          const btn=document.createElement('button');btn.className='player-cfg-btn'+(Config.aiPlayers[i]===isAIType?' active':'');
          btn.textContent=type;
          btn.addEventListener('click',()=>{Config.aiPlayers[i]=isAIType;seg.querySelectorAll('.player-cfg-btn').forEach((b,bi)=>b.classList.toggle('active',bi===ti));});
          seg.appendChild(btn);
        });
        row.appendChild(seg);
      } else {
        const seg=document.createElement('div');seg.className='player-cfg-seg';
        seg.innerHTML=`<button class="player-cfg-btn active" style="cursor:default;opacity:.6">Human</button>`;row.appendChild(seg);
      }
      s.appendChild(row);
    });
    body.appendChild(s);
  },
  _presetsTab(body){
    const grid=document.createElement('div');grid.className='preset-grid';
    // SVG icon paths for each preset (no emoji)
    const icons={
      classic:`<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="3" width="14" height="14" rx="3"/><circle cx="7" cy="7" r="1" fill="currentColor" stroke="none"/><circle cx="13" cy="7" r="1" fill="currentColor" stroke="none"/><circle cx="10" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="7" cy="13" r="1" fill="currentColor" stroke="none"/><circle cx="13" cy="13" r="1" fill="currentColor" stroke="none"/></svg>`,
      chaos:`<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3 L12 8 L17 8 L13 11 L15 17 L10 14 L5 17 L7 11 L3 8 L8 8 Z" stroke-width="1.5"/></svg>`,
      shortcut:`<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16 L16 4"/><path d="M10 4 L16 4 L16 10"/></svg>`,
      gauntlet:`<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2 L10 18"/><path d="M4 7 L16 13"/><path d="M4 13 L16 7"/></svg>`,
      mirror:`<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="10" y1="2" x2="10" y2="18"/><path d="M4 6 Q7 10 4 14"/><path d="M16 6 Q13 10 16 14"/></svg>`
    };
    Object.entries(BOARD_PRESETS).forEach(([key,p])=>{
      const card=document.createElement('div');
      card.className='preset-card'+(Config.boardPreset===key?' active':'');
      card.innerHTML=`
        <div class="preset-card-mini">${icons[key]||icons.classic}</div>
        <div class="preset-card-body">
          <div class="preset-card-name">${p.name}</div>
          <div class="preset-card-desc">${p.desc}</div>
          <div class="preset-card-tags">${p.tags.map(t=>`<span class="preset-tag ${t.c}">${t.t}</span>`).join('')}</div>
        </div>`;
      card.addEventListener('click',()=>{
        applyPreset(key);
        grid.querySelectorAll('.preset-card').forEach(c=>c.classList.remove('active'));
        card.classList.add('active');
        if(!MP.active)Game._build();
      });
      grid.appendChild(card);
    });
    body.appendChild(grid);
    const note=document.createElement('div');note.className='settings-note';
    note.textContent='Select a preset to replace the current board layout. Takes effect immediately (restarts board render).';
    body.appendChild(note);
  },
  _boardTab(body){
    const renderList=(type)=>{
      const s=document.createElement('div');s.className='settings-section';
      const title=document.createElement('div');title.className='settings-section-title';title.textContent=type==='snake'?'Snakes':'Ladders';s.appendChild(title);
      const list=document.createElement('div');list.className='sl-list';s.appendChild(list);
      const refresh=()=>{
        list.innerHTML='';
        const src=type==='snake'?Config.SNAKES:Config.LADDERS;
        const entries=Object.entries(src).sort((a,b)=>+b[0]-+a[0]);
        if(!entries.length){list.innerHTML=`<div style="font-size:.6rem;color:var(--muted);padding:6px 2px">None configured.</div>`;return;}
        entries.forEach(([from,to])=>{
          const item=document.createElement('div');item.className='sl-item';
          const diff=Math.abs(+to-+from);
          item.innerHTML=`<span class="sl-item-icon">${type==='snake'?'<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2 Q10 4 9 7 Q8 10 11 12" stroke="#d94f4f" stroke-width="2" stroke-linecap="round" fill="none"/><circle cx="7" cy="2" r="2" fill="#d94f4f"/></svg>':'<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><line x1="4" y1="2" x2="4" y2="12" stroke="#c8a84b" stroke-width="1.8" stroke-linecap="round"/><line x1="10" y1="2" x2="10" y2="12" stroke="#c8a84b" stroke-width="1.8" stroke-linecap="round"/><line x1="3" y1="5" x2="11" y2="5" stroke="#e8b84b" stroke-width="1.5" stroke-linecap="round"/><line x1="3" y1="9" x2="11" y2="9" stroke="#e8b84b" stroke-width="1.5" stroke-linecap="round"/></svg>'}</span><span class="sl-item-text">${from} → ${to} <span style="color:var(--muted);font-size:.52rem">(${type==='snake'?'-':'+'}${diff})</span></span><button class="sl-del" data-f="${from}">×</button>`;
          item.querySelector('.sl-del').addEventListener('click',()=>{delete(type==='snake'?Config.SNAKES:Config.LADDERS)[from];refresh();});
          list.appendChild(item);
        });
      };
      refresh();
      const addRow=document.createElement('div');addRow.className='sl-add-row';
      const fInp=document.createElement('input');fInp.className='sl-input';fInp.placeholder='From';fInp.type='number';fInp.min=1;fInp.max=99;
      const arrow=document.createElement('span');arrow.style.cssText='font-size:.6rem;color:var(--muted);flex-shrink:0';arrow.textContent='→';
      const tInp=document.createElement('input');tInp.className='sl-input';tInp.placeholder='To';tInp.type='number';tInp.min=2;tInp.max=100;
      const addBtn=document.createElement('button');addBtn.className='sl-add-btn';addBtn.textContent='Add';
      addBtn.addEventListener('click',()=>{
        const f=+fInp.value,t=+tInp.value;
        if(!f||!t||f<1||t<1||f>99||t>100||f===t)return;
        if(type==='snake'&&f<=t){return;}
        if(type==='ladder'&&f>=t){return;}
        (type==='snake'?Config.SNAKES:Config.LADDERS)[f]=t;
        fInp.value='';tInp.value='';refresh();
      });
      addRow.appendChild(fInp);addRow.appendChild(arrow);addRow.appendChild(tInp);addRow.appendChild(addBtn);
      s.appendChild(addRow);
      const reset=document.createElement('button');reset.className='settings-reset';reset.textContent=`Reset ${type}s to default`;
      reset.addEventListener('click',()=>{
        const target=type==='snake'?Config.SNAKES:Config.LADDERS;
        const def=type==='snake'?DEFAULT_SNAKES:DEFAULT_LADDERS;
        Object.keys(target).forEach(k=>delete target[k]);Object.assign(target,{...def});refresh();
      });
      s.appendChild(reset);body.appendChild(s);
    };
    renderList('snake');renderList('ladder');
    const note=document.createElement('div');note.className='settings-note';note.textContent='Board changes apply on next restart.';body.appendChild(note);
  },
  _displayTab(body){
    const s=document.createElement('div');s.className='settings-section';
    s.appendChild(Object.assign(document.createElement('div'),{className:'settings-section-title',textContent:'Theme'}));
    s.appendChild(this._toggle('Light mode','Switch to a light/parchment colour scheme.',document.body.classList.contains('light'),v=>document.body.classList.toggle('light',v)));
    s.appendChild(Object.assign(document.createElement('div'),{className:'settings-section-title',style:'margin-top:14px',textContent:'Speed'}));
    s.appendChild(this._toggle('Fast mode','Reduce animations for quick games.',State.fast,v=>UI.setSpeed(v?'fast':'normal')));
    s.appendChild(Object.assign(document.createElement('div'),{className:'settings-section-title',style:'margin-top:14px',textContent:'About'}));
    const info=document.createElement('div');info.style.cssText='font-size:.6rem;color:var(--muted);line-height:1.7;padding:4px 0';
    info.innerHTML='<b style="color:var(--text)">Keyboard shortcuts</b><br>Space / Enter — Roll<br>R — Restart<br>M — Toggle sound<br>Esc — Close overlay';
    s.appendChild(info);
    body.appendChild(s);
  }
};

/* ── BOARD GEOMETRY ─────────────────────────────────────────────────────── */
const Board={
  grid(t){const i=t-1,row=Math.floor(i/Config.SIZE),raw=i%Config.SIZE;return{col:row%2===0?raw:Config.SIZE-1-raw,row:Config.SIZE-1-row};},
  xy(t){const{col,row}=this.grid(t);return{x:Config.OFFSET+col*Config.TW,y:Config.OFFSET+row*Config.TH};},
  center(t){const{x,y}=this.xy(t);return{x:x+30,y:y+30};},
  render(){
    const g=document.getElementById('boardTiles');g.innerHTML='';
    const SH=new Set(Object.keys(Config.SNAKES).map(Number));
    const LB=new Set(Object.keys(Config.LADDERS).map(Number));
    const O=Config.OFFSET;
    const el=document.getElementById('edgeLabels');el.innerHTML='';
    for(let c=0;c<10;c++){
      const lbl=mksvg('text',{x:O+c*60+30,y:O*10+O+14,'text-anchor':'middle','dominant-baseline':'auto',fill:'var(--edge-label)','font-size':'9','font-family':'DM Mono,monospace','pointer-events':'none'});
      lbl.textContent=c+1;el.appendChild(lbl);
    }
    for(let r=0;r<10;r++){
      const lbl=mksvg('text',{x:O*0.5,y:O+r*60+30,'text-anchor':'middle','dominant-baseline':'central',fill:'var(--edge-label)','font-size':'9','font-family':'DM Mono,monospace','pointer-events':'none'});
      lbl.textContent=10-r;el.appendChild(lbl);
    }
    for(let t=1;t<=100;t++){
      const{x,y}=this.xy(t),even=(Math.floor((t-1)/10)+(t-1))%2===0;
      const isSH=SH.has(t),isLB=LB.has(t);
      g.appendChild(mksvg('rect',{x,y,width:60,height:60,fill:even?'var(--tile-even)':'var(--tile-odd)',stroke:'var(--tile-border)','stroke-width':'0.8','data-tile':t}));
      if(t===100){
        const glow=mksvg('rect',{x,y,width:60,height:60,fill:'none',stroke:'rgba(200,168,75,.35)','stroke-width':'2','rx':'1','pointer-events':'none'});
        glow.style.animation='winGlow 2s ease-in-out infinite';g.appendChild(glow);
        const crown=mksvg('text',{x:x+55,y:y+14,'text-anchor':'end','dominant-baseline':'auto',fill:'rgba(200,168,75,.5)','font-size':'9','pointer-events':'none'});
        crown.textContent='★';g.appendChild(crown);
      }
      const lbl=mksvg('text',{x:x+5,y:y+15,'text-anchor':'start','dominant-baseline':'auto',fill:isSH?'#c05858':isLB?'#b89830':'var(--tile-num)','font-size':'11','font-family':'DM Mono,monospace','font-weight':'400','pointer-events':'none'});
      lbl.textContent=t;g.appendChild(lbl);
      if(isSH){const dl=mksvg('text',{x:x+55,y:y+56,'text-anchor':'end','dominant-baseline':'auto',fill:'rgba(180,60,60,.6)','font-size':'8','pointer-events':'none'});dl.textContent=`−${t-Config.SNAKES[t]}`;g.appendChild(dl);}
      if(isLB){const dl=mksvg('text',{x:x+55,y:y+56,'text-anchor':'end','dominant-baseline':'auto',fill:'rgba(160,130,40,.65)','font-size':'8','pointer-events':'none'});dl.textContent=`+${Config.LADDERS[t]-t}`;g.appendChild(dl);}
      const hit=mksvg('rect',{x,y,width:60,height:60,fill:'transparent','data-tile':t});
      this._attachTooltip(hit,t,isSH,isLB);g.appendChild(hit);
    }
    g.appendChild(mksvg('rect',{x:O+.5,y:O+.5,width:599,height:599,fill:'none',stroke:'var(--border2)','stroke-width':'1'}));
  },
  _tipTimer:null,
  _attachTooltip(el,t,isSH,isLB){
    const tip=document.getElementById('boardTooltip');
    el.addEventListener('mouseenter',()=>{
      clearTimeout(this._tipTimer);
      let txt=`Tile ${t}`;
      if(isSH)txt+=` · Snake → ${Config.SNAKES[t]}`;
      if(isLB)txt+=` · Ladder → ${Config.LADDERS[t]}`;
      const here=State.players.filter((_,i)=>State.pos[i]===t).map(p=>p.name);
      if(here.length)txt+=` · ${here.join(', ')}`;
      tip.textContent=txt;tip.style.opacity='1';
    });
    el.addEventListener('mousemove',(e)=>{
      const w=document.getElementById('boardWrap').getBoundingClientRect();
      tip.style.left=(e.clientX-w.left+10)+'px';tip.style.top=(e.clientY-w.top-32)+'px';
    });
    el.addEventListener('mouseleave',()=>{this._tipTimer=setTimeout(()=>{tip.style.opacity='0';},220);});
  },
  showTarget(tile,color){
    this.clearTarget();const{x,y}=this.xy(tile);
    const r=mksvg('rect',{x,y,width:60,height:60,fill:'none',stroke:color,'stroke-width':'2',rx:'1','pointer-events':'none',opacity:'.5'});
    r.id='targetHighlight';document.getElementById('uiGroup').appendChild(r);
    r.animate([{opacity:.15},{opacity:.55},{opacity:.15}],{duration:600,iterations:Infinity});
  },
  clearTarget(){const e=document.getElementById('targetHighlight');if(e)e.remove();},
  highlightActive(pi){
    document.querySelectorAll('.active-ring').forEach(e=>e.remove());
    if(State.over)return;
    const{x,y}=this.xy(State.pos[pi]);
    const ring=mksvg('rect',{x,y,width:60,height:60,fill:'none',stroke:State.players[pi].color,'stroke-width':'1.5',rx:'1','pointer-events':'none',opacity:'0.2'});
    ring.classList.add('active-ring');document.getElementById('uiGroup').appendChild(ring);
  }
};

/* ── GLOW FILTERS ───────────────────────────────────────────────────────── */
function buildFilters(){
  const g=document.getElementById('glowFilters');g.innerHTML='';
  ALL_PLAYERS.forEach((p,i)=>{
    const f=mksvg('filter',{id:`tok-glow-p${i}`,x:'-80%',y:'-80%',width:'260%',height:'260%'});
    f.appendChild(mksvg('feDropShadow',{dx:'0',dy:'0',stdDeviation:'5','flood-color':p.color,'flood-opacity':'.5'}));
    g.appendChild(f);
  });
}

/* ── SNAKES ──────────────────────────────────────────────────────────────── */
const SnakeRenderer={
  pathMap:{},
  headMap:{},  // fromTile → head <g>  (chomp lunge)
  bodyMap:{},  // fromTile → body <path> (bump redraw)
  segsMap:{},  // fromTile → bSegs array  (bump redraw)

  /* ── Catmull-Rom → cubic bezier (guarantees C1 continuity at all joints) ─ */
  _cr2b(p0,p1,p2,p3){
    return{p0:p1,
      p1:{x:p1.x+(p2.x-p0.x)/6, y:p1.y+(p2.y-p0.y)/6},
      p2:{x:p2.x-(p3.x-p1.x)/6, y:p2.y-(p3.y-p1.y)/6},
      p3:p2};
  },

  /* ── Build smooth S-curve segments via Catmull-Rom waypoints ────────────
     Short snakes: 1 gentle arc.
     Medium: 2-wave S-curve (3 bezier segments, perfectly smooth at joins).
     Long:   3-wave S-curve (4 bezier segments). */
  _segments(head,tail,idx){
    const dx=tail.x-head.x, dy=tail.y-head.y;
    const len=Math.sqrt(dx*dx+dy*dy);
    const px=-dy/len, py=dx/len;        // left-perp unit
    const sign=idx%2===0?1:-1;

    if(len<130){
      /* Single arc */
      const amp=Math.min(50,len*.34);
      return[{p0:head,
        p1:{x:head.x+dx*.28+px*amp*sign, y:head.y+dy*.28+py*amp*sign},
        p2:{x:head.x+dx*.72-px*amp*sign, y:head.y+dy*.72-py*amp*sign},
        p3:tail}];
    }

    /* Build waypoints: [ghost_before, head, peak…, tail, ghost_after]
       Peaks alternate sides to create S-curves.
       Ghost points control the entry/exit tangent so the snake flows
       naturally out of the head and into the tail. */
    const nWaves=len<270?2:3;
    const amp=Math.min(46, len*(nWaves===2?.20:.17));

    const wps=[];
    // Ghost before head — slightly behind in direction away from tail
    wps.push({x:head.x-dx*.15/nWaves, y:head.y-dy*.15/nWaves});
    wps.push(head);
    for(let w=0;w<nWaves;w++){
      const t=(w+0.5)/nWaves;
      const s=w%2===0?sign:-sign;
      wps.push({x:head.x+dx*t+px*amp*s, y:head.y+dy*t+py*amp*s});
    }
    wps.push(tail);
    // Ghost after tail — continues in same direction
    wps.push({x:tail.x+dx*.15/nWaves, y:tail.y+dy*.15/nWaves});

    /* Convert each interior Catmull-Rom segment to a bezier.
       Segments: wps[1]→wps[2], wps[2]→wps[3], …, wps[n-3]→wps[n-2] */
    const segs=[];
    for(let i=1;i<wps.length-2;i++)
      segs.push(this._cr2b(wps[i-1],wps[i],wps[i+1],wps[i+2]));
    return segs;
  },

  /* ── Compound "M…C…C…" path string from an array of bezier segments ───── */
  _pathStr(segs){
    let d=`M${segs[0].p0.x.toFixed(1)},${segs[0].p0.y.toFixed(1)}`;
    for(const{p1,p2,p3}of segs)
      d+=` C${p1.x.toFixed(1)},${p1.y.toFixed(1)},${p2.x.toFixed(1)},${p2.y.toFixed(1)},${p3.x.toFixed(1)},${p3.y.toFixed(1)}`;
    return d;
  },

  /* ── Point on one bezier segment ─────────────────────────────────────── */
  _ptSeg({p0,p1,p2,p3},t){
    const u=1-t;
    return{x:u*u*u*p0.x+3*u*u*t*p1.x+3*u*t*t*p2.x+t*t*t*p3.x,
           y:u*u*u*p0.y+3*u*u*t*p1.y+3*u*t*t*p2.y+t*t*t*p3.y};
  },

  /* ── Normalised tangent on one bezier segment ─────────────────────────── */
  _tanSeg({p0,p1,p2,p3},t){
    const u=1-t;
    const dx=3*(u*u*(p1.x-p0.x)+2*u*t*(p2.x-p1.x)+t*t*(p3.x-p2.x));
    const dy=3*(u*u*(p1.y-p0.y)+2*u*t*(p2.y-p1.y)+t*t*(p3.y-p2.y));
    const l=Math.sqrt(dx*dx+dy*dy)||1;
    return{x:dx/l,y:dy/l};
  },

  /* ── Uniformly sample N+1 {pt,tn} across ALL segments ─────────────────── */
  _sample(segs,N){
    const out=[];
    for(let i=0;i<=N;i++){
      const gt=i/N;
      const si=Math.min(Math.floor(gt*segs.length),segs.length-1);
      const lt=gt*segs.length-si;
      out.push({pt:this._ptSeg(segs[si],Math.min(lt,1)),
                tn:this._tanSeg(segs[si],Math.min(lt,.999))});
    }
    return out;
  },

  /* ── Tapered ribbon polygon across all segments ─────────────────────── */
  /* Tapered ribbon. Optional bump={t,amt,sigma} adds a Gaussian bulge
     at fractional position t (0=head,1=tail).                          */
  _ribbonPath(segs,wHead,wTail,bump=null){
    const N=56,s=this._sample(segs,N),L=[],R=[];
    s.forEach(({pt,tn},i)=>{
      const frac=i/N;
      const ease=1-Math.pow(frac,1.8);
      let w=wTail+(wHead-wTail)*ease;
      if(bump){const d=frac-bump.t;w+=bump.amt*Math.exp(-(d*d)/(2*bump.sigma*bump.sigma));}
      const nx=-tn.y,ny=tn.x;
      L.push({x:pt.x+nx*w,y:pt.y+ny*w});
      R.push({x:pt.x-nx*w,y:pt.y-ny*w});
    });
    let d=`M${L[0].x.toFixed(2)},${L[0].y.toFixed(2)}`;
    for(let i=1;i<=N;i++) d+=` L${L[i].x.toFixed(2)},${L[i].y.toFixed(2)}`;
    for(let i=N;i>=0;i--) d+=` L${R[i].x.toFixed(2)},${R[i].y.toFixed(2)}`;
    return d+' Z';
  },

  render(){
    const g=document.getElementById('snakesGroup');g.innerHTML='';this.pathMap={};this.headMap={};this.bodyMap={};this.segsMap={};
    let defs=document.getElementById('snakeDefs');
    if(!defs){defs=mksvg('defs',{id:'snakeDefs'});
      document.getElementById('gameBoard').insertBefore(defs,document.getElementById('gameBoard').firstChild);}
    defs.innerHTML='';

    /* Shared drop-shadow filter */
    const sf=mksvg('filter',{id:'snkShadow',x:'-25%',y:'-25%',width:'150%',height:'150%'});
    sf.appendChild(mksvg('feDropShadow',{dx:'0',dy:'1.5',stdDeviation:'2.2','flood-color':'#000','flood-opacity':'.6'}));
    defs.appendChild(sf);

    Object.entries(Config.SNAKES).forEach(([from,to],idx)=>{
      const pal=Config.SNAKE_COLORS[idx%Config.SNAKE_COLORS.length];
      const head=Board.center(+from), tail=Board.center(+to);
      const segs=this._segments(head,tail,idx);
      this.pathMap[+from]=this._pathStr(segs);

      /* Body gradient head → tail */
      const gid=`snkGrad${idx}`;
      const gr=mksvg('linearGradient',{id:gid,gradientUnits:'userSpaceOnUse',
        x1:head.x,y1:head.y,x2:tail.x,y2:tail.y});
      const gs1=mksvg('stop',{offset:'0%'});gs1.style.cssText=`stop-color:${pal.stroke};stop-opacity:1`;
      const gs2=mksvg('stop',{offset:'100%'});gs2.style.cssText=`stop-color:${pal.stroke};stop-opacity:0.3`;
      gr.appendChild(gs1);gr.appendChild(gs2);defs.appendChild(gr);

      /* Belly gradient */
      const bid=`snkBelly${idx}`;
      const bl=mksvg('linearGradient',{id:bid,gradientUnits:'userSpaceOnUse',
        x1:head.x,y1:head.y,x2:tail.x,y2:tail.y});
      const b1=mksvg('stop',{offset:'0%'});b1.style.cssText='stop-color:rgba(255,255,255,.38);stop-opacity:1';
      const b2=mksvg('stop',{offset:'100%'});b2.style.cssText='stop-color:rgba(255,255,255,.04);stop-opacity:1';
      bl.appendChild(b1);bl.appendChild(b2);defs.appendChild(bl);

      this._draw(g,head,tail,pal,idx,segs,gid,bid,+from);
    });
  },

  _draw(g,head,tail,pal,idx,segs,gid,bid,fromTile){
    const sg=mksvg('g',{'class':'snake-group'});
    const fullPath=this._pathStr(segs);

    /* Body starts just behind the hood so it doesn't poke through the head */
    const tang0=this._tanSeg(segs[0],0.02);
    const bs={x:head.x+tang0.x*8, y:head.y+tang0.y*8};
    const bSegs=[{p0:bs,
      p1:{x:segs[0].p1.x+(bs.x-segs[0].p0.x)*.5,
          y:segs[0].p1.y+(bs.y-segs[0].p0.y)*.5},
      p2:segs[0].p2,p3:segs[0].p3},
      ...segs.slice(1)];

    /* Glow halo */
    sg.appendChild(mksvg('path',{d:fullPath,fill:'none',
      stroke:pal.glow,'stroke-width':'18','stroke-linecap':'round',opacity:'.6'}));

    /* Main tapered body */
    const bodyEl=mksvg('path',{d:this._ribbonPath(bSegs,6.5,.4),
      fill:`url(#${gid})`,stroke:'none',filter:'url(#snkShadow)'});
    sg.appendChild(bodyEl);
    if(fromTile!=null){SnakeRenderer.bodyMap[fromTile]=bodyEl;SnakeRenderer.segsMap[fromTile]=bSegs;}

    /* Convex scale arcs across body width */
    const NS=24, samp=this._sample(bSegs,NS);
    for(let i=1;i<NS;i++){
      const{pt,tn}=samp[i];
      const ease=1-Math.pow(i/NS,1.8);
      const bw=(6.5*ease+.3)*.88;
      const nx=-tn.y, ny=tn.x;
      const L={x:pt.x+nx*bw,y:pt.y+ny*bw};
      const R={x:pt.x-nx*bw,y:pt.y-ny*bw};
      const mid={x:pt.x+tn.x*bw*.32,y:pt.y+tn.y*bw*.32};
      sg.appendChild(mksvg('path',{
        d:`M${L.x.toFixed(2)},${L.y.toFixed(2)} Q${mid.x.toFixed(2)},${mid.y.toFixed(2)} ${R.x.toFixed(2)},${R.y.toFixed(2)}`,
        fill:'none',stroke:`rgba(0,0,0,${(0.16+ease*.14).toFixed(2)})`,
        'stroke-width':'.8','stroke-linecap':'round'}));
    }

    /* Belly stripe */
    sg.appendChild(mksvg('path',{d:this._ribbonPath(bSegs,2.8,.14),
      fill:`url(#${bid})`,stroke:'none'}));

    /* Pointed tail tip */
    const ls=bSegs[bSegs.length-1];
    const tt=this._tanSeg(ls,.99);
    const tip={x:ls.p3.x+tt.x*6,y:ls.p3.y+tt.y*6};
    const tnx=-tt.y,tny=tt.x;
    sg.appendChild(mksvg('path',{
      d:`M${(ls.p3.x+tnx*.8).toFixed(2)},${(ls.p3.y+tny*.8).toFixed(2)} L${tip.x.toFixed(2)},${tip.y.toFixed(2)} L${(ls.p3.x-tnx*.8).toFixed(2)},${(ls.p3.y-tny*.8).toFixed(2)}`,
      fill:pal.stroke,opacity:'.65'}));

    /* ── Head ── */
    const angle=Math.atan2(tang0.y,tang0.x)*180/Math.PI+180;
    const hg=mksvg('g',{transform:`translate(${head.x},${head.y}) rotate(${angle})`});
    const hc=pal.stroke;

    /* ── Tongue — FIRST so it renders under hood/head ── */
    const tgPos=mksvg('g',{transform:'translate(13,0)'});
    const tgAnim=mksvg('g');
    tgAnim.appendChild(mksvg('line',{x1:'0',y1:'0',x2:'5',y2:'0',
      stroke:'#ff1533','stroke-width':'2.2','stroke-linecap':'round'}));
    tgAnim.appendChild(mksvg('line',{x1:'5',y1:'0',x2:'9',y2:'-2',
      stroke:'#ff1533','stroke-width':'1.8','stroke-linecap':'round'}));
    tgAnim.appendChild(mksvg('line',{x1:'5',y1:'0',x2:'9',y2:'2',
      stroke:'#ff1533','stroke-width':'1.8','stroke-linecap':'round'}));
    tgAnim.style.cssText=`transform-box:fill-box;transform-origin:left center;
      animation:snkTongue ${(1.9+idx*.42).toFixed(1)}s ease-in-out infinite;`;
    tgPos.appendChild(tgAnim);
    hg.appendChild(tgPos);

    /* Hood */
    hg.appendChild(mksvg('ellipse',{cx:'-2',cy:'0',rx:'9',ry:'13',fill:'rgba(0,0,0,.22)',opacity:'.5'}));
    hg.appendChild(mksvg('ellipse',{cx:'-2',cy:'0',rx:'9',ry:'12',fill:hc}));
    hg.appendChild(mksvg('ellipse',{cx:'-3',cy:'-5',rx:'4',ry:'3',fill:'rgba(0,0,0,.15)'}));
    hg.appendChild(mksvg('ellipse',{cx:'-3',cy:'5', rx:'4',ry:'3',fill:'rgba(0,0,0,.15)'}));
    hg.appendChild(mksvg('ellipse',{cx:'-1',cy:'0', rx:'4',ry:'7', fill:'rgba(255,255,255,.10)'}));

    /* Head + snout */
    hg.appendChild(mksvg('ellipse',{cx:'4', cy:'0', rx:'10',ry:'7', fill:hc}));
    hg.appendChild(mksvg('ellipse',{cx:'2', cy:'-2.5',rx:'6',ry:'3',fill:'rgba(255,255,255,.18)'}));
    hg.appendChild(mksvg('ellipse',{cx:'12',cy:'0', rx:'4',ry:'3.5',fill:hc}));

    /* Eyes */
    [[5,-6,.3],[5,6,-.3]].forEach(([ex,ey,py])=>{
      const eg=mksvg('g',{transform:`translate(${ex},${ey})`});
      eg.appendChild(mksvg('circle',{r:'3.2',fill:'#fff',opacity:'.95'}));
      eg.appendChild(mksvg('circle',{cx:'.6',cy:String(py),r:'2',fill:'#111'}));
      eg.appendChild(mksvg('circle',{cx:'1.1',cy:'-.65',r:'.7',fill:'rgba(255,255,255,.85)'}));
      hg.appendChild(eg);
    });

    /* Nostrils */
    hg.appendChild(mksvg('circle',{cx:'13',cy:'-1.8',r:'1',fill:'rgba(0,0,0,.28)'}));
    hg.appendChild(mksvg('circle',{cx:'13',cy:'1.8', r:'1',fill:'rgba(0,0,0,.28)'}));

    sg.appendChild(hg);
    if(fromTile!=null) SnakeRenderer.headMap[fromTile]={hg,xfBase:`translate(${head.x},${head.y}) rotate(${angle})`};
        sg.addEventListener('mouseenter',()=>{sg.style.filter='brightness(1.25)';});
    sg.addEventListener('mouseleave',()=>{sg.style.filter='';});
    g.appendChild(sg);
  }
};

if(!document.getElementById('snakeExtraStyles')){
  const st=document.createElement('style');st.id='snakeExtraStyles';
  /* scaleX collapses from right (tip) to left (root) then snaps back out */
  st.textContent=`
    @keyframes snkTongue{
      0%,25%      {transform:scaleX(1);   opacity:1}
      38%         {transform:scaleX(.06); opacity:.1}
      52%,100%    {transform:scaleX(1);   opacity:1}
    }
  `;
  document.head.appendChild(st);
}

/* ── LADDERS ────────────────────────────────────────────────────────────── */
const LadderRenderer={
  render(){
    const g=document.getElementById('laddersGroup');g.innerHTML='';
    Object.entries(Config.LADDERS).forEach(([from,to])=>this._draw(g,Board.center(+from),Board.center(+to)));
  },
  _draw(g,base,top){
    const dx=top.x-base.x,dy=top.y-base.y,len=Math.sqrt(dx*dx+dy*dy);
    const ux=dx/len,uy=dy/len;   // unit along ladder
    const nx=-uy,ny=ux;          // unit perpendicular
    const hw=8;                   // half-width between rails
    const lg=mksvg('g',{});

    // ── Soft glow behind whole ladder
    lg.appendChild(mksvg('line',{
      x1:base.x,y1:base.y,x2:top.x,y2:top.y,
      stroke:'rgba(200,168,75,0.07)','stroke-width':'20','stroke-linecap':'round'
    }));

    const railColor='#c8943a';
    const railHighlight='rgba(255,210,120,0.55)';
    const rungColor='#e8b84b';
    const rungHighlight='rgba(255,235,160,0.6)';

    // ── Two rails
    [-hw, hw].forEach(side=>{
      const x1=base.x+nx*side, y1=base.y+ny*side;
      const x2=top.x+nx*side,  y2=top.y+ny*side;
      // Rail shadow
      lg.appendChild(mksvg('line',{x1,y1,x2,y2,
        stroke:'rgba(0,0,0,0.18)','stroke-width':'4.5','stroke-linecap':'round'}));
      // Rail body
      lg.appendChild(mksvg('line',{x1,y1,x2,y2,
        stroke:railColor,'stroke-width':'3.2','stroke-linecap':'round'}));
      // Rail shine stripe
      lg.appendChild(mksvg('line',{x1:x1-ny*0.6,y1:y1+nx*0.6,x2:x2-ny*0.6,y2:y2+nx*0.6,
        stroke:railHighlight,'stroke-width':'1','stroke-linecap':'round'}));
    });

    // ── Rungs
    const n=Math.max(2,Math.floor(len/16));
    for(let i=1;i<n;i++){
      const t=i/n;
      const rx=base.x+dx*t, ry=base.y+dy*t;
      const x1=rx+nx*(hw+1), y1=ry+ny*(hw+1);
      const x2=rx-nx*(hw+1), y2=ry-ny*(hw+1);
      // Rung shadow
      lg.appendChild(mksvg('line',{x1,y1,x2,y2,
        stroke:'rgba(0,0,0,0.15)','stroke-width':'3.5','stroke-linecap':'round'}));
      // Rung body
      lg.appendChild(mksvg('line',{x1,y1,x2,y2,
        stroke:rungColor,'stroke-width':'2.5','stroke-linecap':'round'}));
      // Rung highlight
      lg.appendChild(mksvg('line',{
        x1:x1-ny*0.4,y1:y1+nx*0.4,x2:x2-ny*0.4,y2:y2+nx*0.4,
        stroke:rungHighlight,'stroke-width':'0.9','stroke-linecap':'round'}));
      // Little round knobs at rung ends where they meet the rails
      lg.appendChild(mksvg('circle',{cx:x1,cy:y1,r:'2',fill:rungColor}));
      lg.appendChild(mksvg('circle',{cx:x2,cy:y2,r:'2',fill:rungColor}));
    }

    g.appendChild(lg);
  }
};

/* ── DICE ───────────────────────────────────────────────────────────────── */
const Dice={
  dots:{1:[[40,40]],2:[[23,23],[57,57]],3:[[23,23],[40,40],[57,57]],4:[[23,23],[57,23],[23,57],[57,57]],5:[[23,23],[57,23],[40,40],[23,57],[57,57]],6:[[23,20],[57,20],[23,40],[57,40],[23,60],[57,60]]},
  render(v){
    const dots=(this.dots[v]||[]);
    ['diceDots','sheetDiceDots'].forEach(id=>{
      const g=document.getElementById(id);if(!g)return;
      g.innerHTML='';
      dots.forEach(([x,y])=>g.appendChild(mksvg('circle',{cx:x,cy:y,r:'5.5',fill:'#c8a84b'})));
    });
  },
  async roll(forcedValue=null){
    const el=document.getElementById('diceSVG');el.classList.add('dice-rolling');const sel=document.getElementById('sheetDiceSVG');if(sel)sel.classList.add('dice-rolling');
    const sched=State.fast?[60,70,80,90,100,120]:[150,165,185,215,255,305,370,450,530];
    for(const ms of sched){this.render(Math.ceil(Math.random()*6));await wait(ms);}
    el.classList.remove('dice-rolling');if(sel)sel.classList.remove('dice-rolling');
    const r=forcedValue??Math.ceil(Math.random()*6);this.render(r);
    el.animate([{transform:'scale(1.08)',filter:'brightness(1.3)'},{transform:'scale(.97)',filter:'brightness(1)'},{transform:'scale(1)',filter:'brightness(1)'}],{duration:280,easing:'cubic-bezier(0.25,0.46,0.45,0.94)'});
    return r;
  }
};

/* ── TOKENS ─────────────────────────────────────────────────────────────── */
const Tokens={
  els:[],pulseRings:[],bobAnims:[],
  init(){
    const g=document.getElementById('playersGroup');g.innerHTML='';
    this.els=[];this.pulseRings=[];this.bobAnims=[];
    State.players.forEach((p,i)=>{
      const grp=mksvg('g',{id:`token${i}`,filter:'url(#tok-shadow)'});
      const ring=mksvg('circle',{r:'13',fill:'none',stroke:p.color,'stroke-width':'1.2',opacity:'0'});
      grp.appendChild(ring);
      grp.appendChild(mksvg('circle',{r:'9',fill:p.color}));
      grp.appendChild(mksvg('ellipse',{cx:'-2',cy:'-2.5',rx:'3.5',ry:'2',fill:'rgba(255,255,255,.28)'}));
      const lbl=mksvg('text',{'text-anchor':'middle','dominant-baseline':'central',fill:p.text,'font-size':'7','font-family':'DM Mono,monospace','font-weight':'500','pointer-events':'none'});
      lbl.textContent=i+1;grp.appendChild(lbl);
      g.appendChild(grp);this.els.push(grp);this.pulseRings.push(ring);this.bobAnims.push(null);
    });
    this._placeAll();this._updateGlow();this._updateStackBadges();
  },
  _placeAll(){State.pos.forEach((_,i)=>this._snap(i,State.pos[i]));},
  _xy(pi,tile){
    const c=Board.center(tile);
    const onSame=State.pos.map((p,i)=>i).filter(i=>State.pos[i]===tile);
    const slot=onSame.indexOf(pi),n=onSame.length;
    if(n<=1)return{x:c.x,y:c.y};
    const offsets=[[-9,-6],[9,-6],[-9,6],[9,6]];
    const o=offsets[slot]||[0,0];return{x:c.x+o[0],y:c.y+o[1]};
  },
  _snap(pi,tile){const{x,y}=this._xy(pi,tile);this.els[pi].setAttribute('transform',`translate(${x},${y})`);},
  setRaw(pi,x,y){this.els[pi].style.transition='none';this.els[pi].setAttribute('transform',`translate(${x},${y})`);},
  pop(pi){const el=this.els[pi],cur=el.getAttribute('transform');el.animate([{transform:cur+' scale(1)'},{transform:cur+' scale(1.4)'},{transform:cur+' scale(1)'}],{duration:240,easing:'cubic-bezier(0.36,0.07,0.19,0.97)'});},
  _updateStackBadges(){
    document.querySelectorAll('.stack-badge').forEach(e=>e.remove());
    const counts={};State.pos.forEach(t=>{counts[t]=(counts[t]||0)+1;});
    Object.entries(counts).forEach(([t,n])=>{
      if(n<2)return;
      const{x,y}=Board.center(+t);
      const b=mksvg('text',{x:x+11,y:y-10,'text-anchor':'middle','dominant-baseline':'central',fill:'var(--gold)','font-size':'7.5','font-family':'DM Mono,monospace','font-weight':'500','pointer-events':'none'});
      b.textContent=`×${n}`;b.classList.add('stack-badge');document.getElementById('uiGroup').appendChild(b);
    });
  },
  _startBob(pi){
    this._stopBob(pi);const el=this.els[pi];const cur=el.getAttribute('transform')||'translate(0,0)';
    const anim=el.animate([{transform:cur+' translateY(0px)'},{transform:cur+' translateY(-4px)'},{transform:cur+' translateY(0px)'}],{duration:1600,iterations:Infinity,easing:'ease-in-out'});
    this.bobAnims[pi]=anim;
  },
  _stopBob(pi){if(this.bobAnims[pi]){this.bobAnims[pi].cancel();this.bobAnims[pi]=null;}},
  _updateGlow(){
    State.players.forEach((_,i)=>{
      const isActive=i===State.cur&&!State.over;
      const ring=this.pulseRings[i],grp=this.els[i];
      ring.setAttribute('opacity',isActive?'0.35':'0');
      if(isActive){ring.style.animation='tokenRing 1.6s ease-in-out infinite';grp.setAttribute('filter',`url(#tok-glow-p${i})`);this._startBob(i);}
      else{ring.style.animation='none';grp.setAttribute('filter','url(#tok-shadow)');this._stopBob(i);}
    });
  }
};

/* ── ANIMATIONS ─────────────────────────────────────────────────────────── */
const Anim={
  async steps(pi,from,to){
    const dir=to>from?1:-1;let cur=from;
    document.querySelectorAll('.active-ring').forEach(e=>e.remove());
    while(cur!==to){
      const prev=cur;cur+=dir;
      const p0=Tokens._xy(pi,prev),p1=Tokens._xy(pi,cur);
      const midX=(p0.x+p1.x)/2,midY=Math.min(p0.y,p1.y)-8;
      const el=Tokens.els[pi];Tokens._stopBob(pi);el.style.transition='none';
      await new Promise(res=>{
        el.animate([{transform:`translate(${p0.x}px,${p0.y}px)`},{transform:`translate(${midX}px,${midY}px)`},{transform:`translate(${p1.x}px,${p1.y}px)`}],
          {duration:Config.STEP_MS,easing:'cubic-bezier(0.4,0,0.2,1)'}).onfinish=()=>{el.setAttribute('transform',`translate(${p1.x},${p1.y})`);res();};
      });
      UI.posDisplay(pi,cur);
      // Keep highlight ring tracking the token
      document.querySelectorAll('.active-ring').forEach(e=>e.remove());
      const{x,y}=Board.xy(cur);
      const ring=mksvg('rect',{x,y,width:60,height:60,fill:'none',stroke:State.players[pi].color,'stroke-width':'1.5',rx:'1','pointer-events':'none',opacity:'0.2'});
      ring.classList.add('active-ring');document.getElementById('uiGroup').appendChild(ring);
    }Tokens.pop(pi);
  },
  _glidePath(pi,pathEl,ms){
    const total=pathEl.getTotalLength();
    return new Promise(res=>{
      const t0=performance.now();
      function frame(now){let p=(now-t0)/ms;if(p>=1)p=1;const e=p<.5?2*p*p:-1+(4-2*p)*p;const pt=pathEl.getPointAtLength(e*total);Tokens.setRaw(pi,pt.x,pt.y);p<1?requestAnimationFrame(frame):res();}
      requestAnimationFrame(frame);
    });
  },
  async snakeSlide(pi,from,to){
    const d=SnakeRenderer.pathMap[from];
    const path=mksvg('path',{d,fill:'none',visibility:'hidden'});
    document.getElementById('gameBoard').appendChild(path);
    this._flashBoard('rgba(217,79,79,.09)');
    document.querySelectorAll('.active-ring').forEach(e=>e.remove());
    // Chomp swallows the token; bump carries it invisibly to the tail
    await this._chomp(pi,from,path);
    path.remove();
    Tokens._snap(pi,to);
    Tokens.els[pi].style.opacity='1';
    Tokens.pop(pi);UI.posDisplay(pi,to);
    this._deltaPopup(to,`−${from-to}`,'#d94f4f');await wait(60);
  },

  /* ── LUNGE ─────────────────────────────────────────────────────────────
     rAF-based: moves head forward lungePx in its facing direction.
     0→35% strike, 35→52% hold, 52→100% snap back.                      */
  _lungeFwd(hg,xfBase,lungePx,scalePeak,durationMs){
    const mTr=xfBase.match(/translate\(([^,]+),([^)]+)\)/);
    const mRo=xfBase.match(/rotate\(([^)]+)\)/);
    const tx=mTr?+mTr[1]:0, ty=mTr?+mTr[2]:0;
    const angle=mRo?+mRo[1]:0;
    const rad=angle*Math.PI/180;
    const fx=Math.cos(rad), fy=Math.sin(rad);
    return new Promise(res=>{
      const t0=performance.now();
      function frame(now){
        const p=Math.min((now-t0)/durationMs,1);
        let lunge,sc;
        if(p<.35){const t=p/.35,e=t<.5?2*t*t:-1+(4-2*t)*t;lunge=lungePx*e;sc=1+(scalePeak-1)*e;}
        else if(p<.52){lunge=lungePx;sc=scalePeak;}
        else{const t=(p-.52)/.48,e=t<.5?2*t*t:-1+(4-2*t)*t;const ov=Math.sin(t*Math.PI)*.18;lunge=lungePx*(1-e)+lungePx*ov*(1-t);sc=scalePeak+(1-scalePeak)*e;}
        hg.setAttribute('transform',
          `translate(${(tx+fx*lunge).toFixed(2)},${(ty+fy*lunge).toFixed(2)}) rotate(${angle}) scale(${sc.toFixed(3)})`);
        if(p<1)requestAnimationFrame(frame);
        else{hg.setAttribute('transform',xfBase);res();}
      }
      requestAnimationFrame(frame);
    });
  },

  /* ── CHOMP sequence ─────────────────────────────────────────────────────
     Phase 1 — Lunge: head strikes while token visible
     Phase 2 — Token vanishes
     Phase 3 — Bump travels body, token rides inside                       */
  async _chomp(pi,fromTile,slidePath){
    if(State.fast){Tokens.els[pi].style.opacity='0';return;}
    const entry=SnakeRenderer.headMap[fromTile];
    const tokenEl=Tokens.els[pi];
    if(!entry||!tokenEl)return;
    const{hg,xfBase}=entry;

    Sound.chomp();vibrate([60,30,120,30,60]);
    this._flashBoard('rgba(217,30,30,.22)');
    await this._lungeFwd(hg,xfBase,16,1.18,520);

    const tkPos=tokenEl.getAttribute('transform')||'translate(0,0)';
    await new Promise(res=>{
      tokenEl.animate([
        {transform:tkPos},
        {transform:tkPos+' translate(-4px,-3px) scale(.88)',offset:.2},
        {transform:tkPos+' translate(4px,2px)  scale(.92)',offset:.4},
        {transform:tkPos+' translate(-3px,-2px) scale(.82)',offset:.6},
        {transform:tkPos+' translate(2px,3px)  scale(.88)',offset:.8},
        {transform:tkPos+' scale(0)',offset:1},
      ],{duration:300,easing:'ease-in',fill:'forwards'}).onfinish=res;
    });
    tokenEl.style.opacity='0';

    await this._animateBump(fromTile,slidePath,pi,1000);
    hg.setAttribute('transform',xfBase);
  },

    /* Redraws body ribbon each frame with a Gaussian bulge at position t.
     Simultaneously moves the hidden token along the slide path so it
     appears to sit inside the lump.                                    */
  _animateBump(fromTile,slidePath,pi,durationMs){
    const bodyEl=SnakeRenderer.bodyMap[fromTile];
    const bSegs=SnakeRenderer.segsMap[fromTile];
    const tokenEl=pi!=null?Tokens.els[pi]:null;
    const pathTotal=slidePath?slidePath.getTotalLength():0;
    if(!bodyEl||!bSegs)return Promise.resolve();
    return new Promise(res=>{
      const t0=performance.now();
      function frame(now){
        const p=Math.min((now-t0)/durationMs,1);
        const eased=p<.5?2*p*p:-1+(4-2*p)*p; // ease-in-out
        const bumpT=0.02+eased*0.96;
        const bumpAmt=3.5*(1-Math.pow(eased,.65)); // starts ~= head width, shrinks to tail
        bodyEl.setAttribute('d',SnakeRenderer._ribbonPath(bSegs,6.5,.4,
          {t:bumpT,amt:bumpAmt,sigma:0.09}));
        // Token follows the bump along the path
        if(tokenEl&&slidePath&&pathTotal>0){
          const pt=slidePath.getPointAtLength(eased*pathTotal);
          tokenEl.setAttribute('transform',`translate(${pt.x.toFixed(1)},${pt.y.toFixed(1)})`);
        }
        if(p<1){requestAnimationFrame(frame);}
        else{bodyEl.setAttribute('d',SnakeRenderer._ribbonPath(bSegs,6.5,.4));res();}
      }
      requestAnimationFrame(frame);
    });
  },
  async ladderClimb(pi,from,to){
    const b=Board.center(from),tp=Board.center(to);
    const path=mksvg('path',{d:`M${b.x},${b.y} L${tp.x},${tp.y}`,fill:'none',visibility:'hidden'});
    document.getElementById('gameBoard').appendChild(path);this._flashBoard('rgba(200,168,75,.07)');
    document.querySelectorAll('.active-ring').forEach(e=>e.remove());
    await wait(State.fast?60:220);Tokens._stopBob(pi);await this._glidePath(pi,path,Config.GLIDE_LADDER);
    path.remove();Tokens._snap(pi,to);Tokens.pop(pi);UI.posDisplay(pi,to);
    this._deltaPopup(to,`+${to-from}`,'#c8a84b');await wait(60);
  },
  _flashBoard(color){
    const el=document.getElementById('boardFlash');
    el.style.background=color;el.style.transition='none';el.style.opacity='1';
    setTimeout(()=>{el.style.transition='opacity .5s ease';el.style.opacity='0';},80);
  },
  rollFlash(){
    const el=document.getElementById('boardFlash');
    el.style.background='rgba(255,255,255,.04)';el.style.transition='none';el.style.opacity='1';
    setTimeout(()=>{el.style.transition='opacity .4s ease';el.style.opacity='0';},55);
  },
  _deltaPopup(tile,text,color){
    const{x,y}=Board.xy(tile);const svg=document.getElementById('gameBoard');
    const svgR=svg.getBoundingClientRect(),scale=svgR.width/630;
    const wrapR=document.getElementById('boardWrap').getBoundingClientRect();
    const px=(x+30)*scale+(svgR.left-wrapR.left),py=(y+30)*scale+(svgR.top-wrapR.top);
    const div=document.createElement('div');div.className='delta-popup';div.textContent=text;
    div.style.cssText=`left:${px}px;top:${py}px;color:${color}`;
    document.getElementById('boardWrap').appendChild(div);setTimeout(()=>div.remove(),1600);
  },
  celebrate(winnerPI){
    const colors=['#e8e8e8','#c8a84b','#d94f4f','#2dd4a0','#8b5cf6','#e056aa'];
    let ox=50,oy=20;
    try{
      const svg=document.getElementById('gameBoard'),svgR=svg.getBoundingClientRect(),scale=svgR.width/630;
      const{x,y}=Board.center(State.pos[winnerPI]);
      ox=((x*scale+svgR.left)/window.innerWidth)*100;oy=((y*scale+svgR.top)/window.innerHeight)*100;
    }catch(e){}
    for(let i=0;i<90;i++){
      setTimeout(()=>{
        const p=document.createElement('div');p.className='particle';
        const sz=3+Math.random()*7,vx=(Math.random()-.5)*40;
        p.style.cssText=`left:calc(${ox}vw + ${vx}vw);top:${oy}vh;width:${sz}px;height:${sz}px;background:${colors[Math.floor(Math.random()*colors.length)]};border-radius:${Math.random()>.5?'50%':'2px'};animation-duration:${1.5+Math.random()*2}s;`;
        document.body.appendChild(p);setTimeout(()=>p.remove(),4000);
      },i*18);
    }
  }
};

/* ── UI ─────────────────────────────────────────────────────────────────── */
const UI={
  buildTurnBar(){
    const pcards=document.getElementById('pcards');pcards.innerHTML='';
    State.players.forEach((p,i)=>{
      const card=document.createElement('div');
      card.className='pcard'+(i===State.cur?' active':'');card.id=`playerCard${i}`;
      const isAI=Config.isAI(i);
      const isMe=MP.active&&MP.myIndex===i;
      const canEdit=!isAI&&(!MP.active||isMe);
      card.innerHTML=`
        <div class="pcard-bar" style="background:${p.color}"></div>
        <div class="ptoken-shape" style="color:${p.color}">${SHAPES[i]}</div>
        ${MP.active?`<div class="online-dot" id="onlineDot${i}" title="Offline"></div>`:''}
        <div class="pcard-info">
          <span class="pname" id="pname${i}" title="${canEdit?'Click to rename':''}">${p.name}${isAI?' <span style="opacity:.5;font-size:.5rem">(AI)</span>':''}</span>
          <span class="ptile" id="pos${i}">Tile 1</span>
          ${MP.active?`<span class="win-stars" id="winStars${i}">${'★'.repeat(MP.wins[i]||0)}</span>`:''}
          <span class="pcard-stats" id="stats${i}">0 rolls</span>
          <div class="pcard-progress"><div class="pcard-progress-fill" id="prog${i}" style="background:${p.color};width:0%"></div></div>
        </div>`;
      pcards.appendChild(card);
      if(canEdit){
        const nameEl=card.querySelector('.pname');
        nameEl.addEventListener('click',()=>{
          nameEl.contentEditable='true';nameEl.innerText=p.name;nameEl.focus();
          const range=document.createRange();range.selectNodeContents(nameEl);const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range);
        });
        nameEl.addEventListener('blur',()=>{
          nameEl.contentEditable='false';const newName=nameEl.innerText.trim()||p.name;
          State.players[i].name=newName;nameEl.innerHTML=newName;
          if(MP.active&&MP.db&&MP.roomCode)
            firebase.database().ref(`rooms/${MP.roomCode}/players/${i}/name`).set(newName);
        });
        nameEl.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();nameEl.blur();}});
      }
    });
  },
  setStatus(m){
    document.getElementById('statusMsg').textContent=m;
    const lbl=`Roll dice — ${m}`;
    ['rollBtn','mobileRollBtn'].forEach(id=>{const b=document.getElementById(id);if(b)b.setAttribute('aria-label',lbl);});
    const ss=document.getElementById('sheetStatus');if(ss)ss.textContent=m;
  },
  setRoll(en){
    ['rollBtn','mobileRollBtn'].forEach(id=>{
      const b=document.getElementById(id);if(!b)return;
      if(MP.active){
        const isMyTurn=MP.myIndex===State.cur&&MP.myIndex>=0;
        b.style.display=MP.myIndex<0?'none':'block';
        b.disabled=!en||!isMyTurn;
        b.textContent=isMyTurn?'Roll':'Waiting…';
      }else{
        const isAI=Config.isAI(State.cur);
        b.style.display=isAI?'none':'block';
        b.disabled=!en;
        b.textContent='Roll';
      }
    });
    // sync sheet roll button
    const rb=document.getElementById('rollBtn');
    const sb=document.getElementById('sheetRollBtn');
    if(rb&&sb){sb.disabled=rb.disabled;sb.textContent=rb.textContent||'Roll';sb.style.display=rb.style.display||'';}
  },
  updateActive(){
    State.players.forEach((_,i)=>{const c=document.getElementById(`playerCard${i}`);if(c)c.classList.toggle('active',i===State.cur);});
    Tokens._updateGlow();Tokens._updateStackBadges();Board.highlightActive(State.cur);
    document.getElementById('turnCount').textContent=State.turnNum;
  },
  posDisplay(pi,t){
    const el=document.getElementById(`pos${pi}`);if(el)el.textContent=`Tile ${t}`;
    const prog=document.getElementById(`prog${pi}`);if(prog)prog.style.width=Math.max(1,((t-1)/99)*100)+'%';
  },
  updateStats(pi){const s=State.stats[pi],el=document.getElementById(`stats${pi}`);if(el)el.textContent=`${s.r}r · ${s.s}S · ${s.l}L`;},
  setAIThinking(on){document.getElementById('aiThinking').classList.toggle('visible',on);},
  addLog(m,type='event'){
    const log=document.getElementById('logList');
    const e=document.createElement('div');e.className=`log-entry ${type}`;e.textContent=m;
    log.prepend(e);while(log.children.length>50)log.lastChild.remove();log.scrollTop=0;
    if(typeof Sheet!=='undefined')Sheet.render();
  },
  clearLog(){document.getElementById('logList').innerHTML='';},
  showWin(pi){
    const p=State.players[pi],s=State.stats[pi];
    document.getElementById('winTitle').textContent=p.name;
    document.getElementById('winTitle').style.color=p.color;
    document.getElementById('winSub').textContent=`Reached tile 100 in ${State.turnNum} turn${State.turnNum===1?'':'s'}`;
    document.getElementById('winStats').innerHTML=`
      <div class="win-stat"><span class="win-stat-num">${s.r}</span><span class="win-stat-lbl">Rolls</span></div>
      <div class="win-stat"><span class="win-stat-num">${s.l}</span><span class="win-stat-lbl">Ladders</span></div>
      <div class="win-stat"><span class="win-stat-num">${s.s}</span><span class="win-stat-lbl">Snakes</span></div>
      <div class="win-stat"><span class="win-stat-num">${State.turnNum}</span><span class="win-stat-lbl">Turns</span></div>`;
    const allEl=document.getElementById('winAllStats');
    if(State.players.length>1){
      allEl.style.display='block';
      allEl.innerHTML=State.players.map((pl,i)=>{
        const st=State.stats[i],isWin=i===pi;
        return`<div class="win-player-row">
          <div class="win-player-shape" style="color:${pl.color}">${SHAPES[i]}</div>
          <span class="win-player-name" style="${isWin?'color:'+pl.color+';font-weight:500':''}">${pl.name}${isWin?' ★':''}</span>
          <span class="win-player-stats">T${State.pos[i]} · ${st.r}r · ${st.l}L · ${st.s}S</span>
        </div>`;
      }).join('');
    }
    document.getElementById('winOverlay').style.display='flex';
    const rb=document.getElementById('rematchBtn');
    if(rb)rb.style.display=MP.active&&MP.isHost?'inline-block':'none';
    const rpb=document.getElementById('replayBtn');
    if(rpb)rpb.style.display='none';// shown after win track
    Sound.win();vibrate([50,30,50,30,100]);Anim.celebrate(pi);
  },
  hideWin(){document.getElementById('winOverlay').style.display='none';},
  setMode(m){
    State.mode=m;State.numPlayers=m==='4p'?4:2;
    document.querySelectorAll('#modeToggle .seg-btn').forEach(b=>b.classList.toggle('active',b.dataset.mode===m));
  },
  setSpeed(s){
    State.fast=s==='fast';
    document.querySelectorAll('#speedToggle .seg-btn').forEach(b=>b.classList.toggle('active',b.dataset.speed===s));
  }
};

/* ── AI ─────────────────────────────────────────────────────────────────── */
const AI={
  async turn(){
    UI.setStatus(`${State.players[State.cur].name} (AI) is rolling...`);
    UI.setAIThinking(true);
    await wait(Config.AI_MIN+Math.random()*(Config.AI_MAX-Config.AI_MIN));
    UI.setAIThinking(false);await Game.exec();
  }
};

/* ── GAME ───────────────────────────────────────────────────────────────── */
const Game={
  _listenersSet:false,
  init(){
    if(!this._listenersSet){
      this._listenersSet=true;
      document.querySelectorAll('#modeToggle .seg-btn').forEach(b=>b.addEventListener('click',()=>{UI.setMode(b.dataset.mode);this.restart();}));
      document.querySelectorAll('#speedToggle .seg-btn').forEach(b=>b.addEventListener('click',()=>UI.setSpeed(b.dataset.speed)));
      document.addEventListener('keydown',e=>{
        if(e.repeat||e.target.isContentEditable||e.target.tagName==='INPUT')return;
        if(e.code==='Space'||e.code==='Enter'){e.preventDefault();this.handleRoll();}
        if(e.code==='KeyR'&&!MP.active){e.preventDefault();this.restart();}
        if(e.code==='KeyM'){e.preventDefault();Sound.toggle();}
        if(e.code==='Escape'){document.getElementById('winOverlay').style.display='none';Settings.close();}
      });
      let ty0=0;
      const bw=document.getElementById('boardWrap');
      bw.addEventListener('touchstart',e=>{ty0=e.touches[0].clientY;},{passive:true});
      bw.addEventListener('touchend',e=>{if(ty0-e.changedTouches[0].clientY>35)this.handleRoll();},{passive:true});
      document.getElementById('diceWrap').addEventListener('click',()=>this.handleRoll());
      document.getElementById('chatSend').addEventListener('click',()=>MP.sendChatInput());
      document.getElementById('chatInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();MP.sendChatInput();}});
    }
    State.reset();this._build();
    UI.setStatus('Roll to begin.');UI.setRoll(true);UI.updateActive();
  },
  _build(){
    buildFilters();Board.render();SnakeRenderer.render();LadderRenderer.render();
    Tokens.init();Dice.render(1);document.getElementById('uiGroup').innerHTML='';UI.buildTurnBar();
  },
  restart(){
    if(MP.active)return;
    State.reset();UI.hideWin();this._build();UI.clearLog();
    UI.setStatus('Roll to begin.');UI.setRoll(true);UI.updateActive();
    State.players.forEach((_,i)=>{UI.posDisplay(i,1);UI.updateStats(i);});
    UI.setAIThinking(false);document.getElementById('turnCount').textContent='1';
    Settings.close();
  },
  async handleRoll(){
    if(State.busy||State.over)return;
    if(MP.active){
      if(MP.myIndex!==State.cur||MP.myIndex<0)return;
      // In online mode: roll dice locally for instant feedback, then push event
      // All clients (including self) will animate the full move via playback
      Timer.stop();
      State.busy=true;UI.setRoll(false);
      const roll=await Dice.roll();
      Sound.roll();Anim.rollFlash();
      UI.setStatus(`Rolling…`);
      vibrate(18);
      // Build complete event with all outcomes pre-computed
      const pi=State.cur,from=State.pos[pi];
      const evt=this._buildEvent(pi,roll,from);
      MP.pushEvent(evt); // all clients (incl. self) will call playback()
      return;
    }
    if(Config.isAI(State.cur))return;
    await this.exec();
  },

  // Pre-compute all outcomes for an event so every client gets identical results
  _buildEvent(pi,roll,from){
    const p=State.players[pi];
    let target=from+roll;
    let finalPos=target;
    let bounce=false,snakeHit=null,ladderHit=null;
    let overshoot=false,noMove=false;
    if(target>100){
      if(Config.exactWin){bounce=true;finalPos=100-(target-100);target=finalPos;}
      else{noMove=true;finalPos=from;}
    } else {
      if(target in Config.SNAKES){snakeHit={from:target,to:Config.SNAKES[target]};finalPos=snakeHit.to;}
      else if(target in Config.LADDERS){ladderHit={from:target,to:Config.LADDERS[target]};finalPos=ladderHit.to;}
    }
    const won=finalPos===100;
    const bonus=Config.bonusRoll&&roll===6&&!won&&!noMove;
    // Near-miss: landed 1 tile before a snake head (only if no snake/ladder hit)
    const nearMissSnake=(!snakeHit&&!noMove&&!bounce)
      ? (Object.keys(Config.SNAKES).map(Number).find(s=>s===target+1)||null)
      : null;
    // Compute next player
    let nextPi=pi,nextTurnNum=State.turnNum;
    if(!bonus){
      nextPi=(pi+1)%State.players.length;
      if(nextPi===0)nextTurnNum=State.turnNum+1;
    }
    return{pi,roll,from,target,finalPos,bounce,noMove,
      snakeHit,ladderHit,won,bonus,nearMissSnake,nextPi,nextTurnNum,ts:Date.now()};
  },

  // Playback an event — runs full animation on every client
  async playback(evt){
    if(State.busy&&!MP.active&&!evt._fromExec)return; // local only guard
    State.busy=true;UI.setRoll(false);
    const{pi,roll,from,target,finalPos,bounce,noMove,snakeHit,ladderHit,won,bonus,nearMissSnake,nextPi,nextTurnNum}=evt;
    const p=State.players[pi];
    const isMyRoll=MP.active&&pi===MP.myIndex;

    // Dice animation: in MP, non-rollers animate; in local, exec already animated so skip
    if(!isMyRoll&&!evt._fromExec){await Dice.roll(roll);Sound.roll();Anim.rollFlash();}
    vibrate(18);
    State.stats[pi].r++;UI.updateStats(pi);
    UI.addLog(`${p.name} rolled ${roll}`,p.logClass);
    UI.setStatus(`${p.name} rolled ${roll}.`);

    if(noMove){
      UI.setStatus(`${p.name} needs ${100-from} — no move.`);
      UI.addLog(`${p.name} stays (overshoot)`,p.logClass);
      await wait(State.fast?200:700);
    } else if(bounce){
      UI.setStatus(`${p.name} overshoots — bounces to ${finalPos}!`);
      UI.addLog(`${p.name} bounces to ${finalPos}`,p.logClass);
      await wait(State.fast?200:500);
      await Anim.steps(pi,from,finalPos);
      State.pos[pi]=finalPos;UI.posDisplay(pi,finalPos);
    } else {
      Board.showTarget(target,p.color);await wait(State.fast?80:300);Board.clearTarget();
      await Anim.steps(pi,from,target);State.pos[pi]=target;
      // Near-miss: show CLOSE CALL board notification
      if(nearMissSnake&&!State.fast){
        BoardNotif.show('CLOSE CALL',{sub:`snake at ${nearMissSnake}`,color:'#ff6b6b',duration:1800});
        UI.addLog(`${p.name} narrowly avoided the snake at ${nearMissSnake}!`,'event');
      }
      if(snakeHit){
        UI.setStatus(`Snake! ${p.name}: ${snakeHit.from} → ${snakeHit.to}`);
        State.pos[pi]=snakeHit.to;Sound.snake();vibrate([80,40,80]);
        await Anim.snakeSlide(pi,snakeHit.from,snakeHit.to);
        State.stats[pi].s++;UI.updateStats(pi);
        UI.addLog(`Snake! ${p.name}: ${snakeHit.from}→${snakeHit.to}`,'event');
      } else if(ladderHit){
        UI.setStatus(`Ladder! ${p.name}: ${ladderHit.from} → ${ladderHit.to}`);
        State.pos[pi]=ladderHit.to;Sound.ladder();vibrate([30,20,60]);
        await Anim.ladderClimb(pi,ladderHit.from,ladderHit.to);
        State.stats[pi].l++;UI.updateStats(pi);
        UI.addLog(`Ladder! ${p.name}: ${ladderHit.from}→${ladderHit.to}`,'event');
      }
      State.pos[pi]=finalPos;UI.posDisplay(pi,finalPos);
    }

    State.turns++;

    if(won){
      State.over=true;State.busy=false;Tokens._updateGlow();Tokens._updateStackBadges();
      document.getElementById('uiGroup').innerHTML='';
      UI.setStatus(`${p.name} wins!`);UI.addLog(`${p.name} wins!`,'win');
      Timer.stop();
      if(MP.active&&!evt._replay)MP.pushWin(pi);
      await wait(400);UI.showWin(pi);
      if(MP.active){
        document.getElementById('replayBtn').style.display='inline-block';
        MP._renderWins();
      }
      return;
    }

    if(bonus){
      UI.addLog(`${p.name} rolled 6 — bonus`,p.logClass);UI.setStatus(`${p.name} rolled 6 — roll again!`);
      if(!State.fast) BoardNotif.show('EXTRA DICE',{sub:'roll again',color:'#c8a84b',duration:1700});
      State.busy=false;
      if(MP.active){const itm=MP.myIndex===pi;UI.setRoll(itm);if(!itm)UI.setStatus(`${p.name} rolled 6 — rolling again…`);}
      else if(Config.isAI(pi)){AI.turn();}
      else{UI.setRoll(true);}
      return;
    }

    State.cur=nextPi;State.turnNum=nextTurnNum;
    UI.updateActive();document.getElementById('turnCount').textContent=State.turnNum;
    State.busy=false;

    if(MP.active){
      const isMyTurn=MP.myIndex===State.cur&&MP.myIndex>=0;
      UI.setRoll(isMyTurn);
      UI.setStatus(isMyTurn?`Your turn — roll!`:`${State.players[State.cur].name}'s turn.`);
      if(!evt._replay){
        if(MP.turnTimerEnabled)Timer.start(30);
        if(isMyTurn)Notifications.fire('Your turn!',`It's your turn in SERPENTS & LADDERS!`);
      }
    } else if(Config.isAI(State.cur)){
      UI.setRoll(false);AI.turn();
    } else {
      UI.setRoll(true);UI.setStatus(`${State.players[State.cur].name}'s turn.`);
    }
  },

  // Local-only exec (no multiplayer)
  async exec(){
    State.busy=true;UI.setRoll(false);
    const pi=State.cur;
    const roll=await Dice.roll();Sound.roll();Anim.rollFlash();vibrate(18);
    const from=State.pos[pi];
    const evt=this._buildEvent(pi,roll,from);
    await this.playback({...evt,_fromExec:true});
  }
};

const GameController={handleRoll(){Game.handleRoll();},restart(){Game.restart();}};


/* ══════════════════════════════════════════════════════════════════════
   TURN TIMER
══════════════════════════════════════════════════════════════════════ */
const Timer={
  _interval:null,_duration:30,_startedAt:0,_active:false,
  start(seconds=30){
    this.stop();this._duration=seconds;this._startedAt=Date.now();this._active=true;
    this._render(seconds);
    document.getElementById('timerWrap').style.display='flex';
    this._interval=setInterval(()=>{
      const elapsed=(Date.now()-this._startedAt)/1000;
      const left=Math.max(0,this._duration-elapsed);
      this._render(left);
      if(left<=0){this.stop();this._onExpire();}
    },200);
  },
  stop(){
    clearInterval(this._interval);this._interval=null;this._active=false;
    document.getElementById('timerWrap').style.display='none';
    const arc=document.getElementById('timerArc');
    if(arc){arc.classList.remove('urgent');arc.style.strokeDashoffset='0';}
    const lbl=document.getElementById('timerLabel');
    if(lbl)lbl.classList.remove('urgent');
  },
  _render(left){
    const arc=document.getElementById('timerArc'),lbl=document.getElementById('timerLabel');
    if(!arc||!lbl)return;
    const frac=left/this._duration;
    const circ=2*Math.PI*12;
    arc.style.strokeDashoffset=String(circ*(1-frac));
    lbl.textContent=Math.ceil(left).toString();
    const urgent=left<=8;
    arc.classList.toggle('urgent',urgent);lbl.classList.toggle('urgent',urgent);
  },
  _onExpire(){
    // Only the current player pushes the skip
    if(!MP.active||MP.myIndex!==State.cur||State.busy||State.over)return;
    const pi=State.cur,from=State.pos[pi];
    // Push a skip event (roll of 0 = no move, advance turn)
    const evt={pi,roll:0,from,target:from,finalPos:from,bounce:false,noMove:true,
      snakeHit:null,ladderHit:null,won:false,bonus:false,
      nextPi:(pi+1)%State.players.length,
      nextTurnNum:State.cur+1===State.players.length?State.turnNum+1:State.turnNum,
      ts:Date.now(),timerExpired:true};
    MP.pushEvent(evt);
    UI.addLog(`⏱ ${State.players[pi].name} timed out`,'event');
  }
};

/* REACTIONS */
const Reactions={
  _ref:null,_joinTs:0,
  subscribe(code,joinTs){
    this._joinTs=joinTs;
    if(this._ref)this._ref.off();
    this._ref=firebase.database().ref(`rooms/${code}/reactions`);
    this._ref.orderByChild('ts').startAt(joinTs).on('child_added',snap=>{
      const d=snap.val();if(!d)return;
      this._show(d.emoji,d.color||'#fff');
    });
  },
  unsubscribe(){if(this._ref){this._ref.off();this._ref=null;}},
  _show(key,color){
    const svgStr=REACT_SVG_MAP[key]||REACT_SVG_MAP['burst'];
    const el=document.createElement('div');el.className='reaction-popup';
    el.dataset.reaction=key;
    el.style.color=color||'';
    el.innerHTML=svgStr;
    const bw=document.getElementById('boardWrap');
    if(!bw)return;
    const r=bw.getBoundingClientRect();
    el.style.left=(r.left+r.width/2-14+Math.random()*80-40)+'px';
    el.style.top=(r.top+r.height/2+Math.random()*60-30)+'px';
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),2200);
  }
};

/* BROWSER NOTIFICATIONS */
const Notifications={
  _enabled:false,
  async toggle(){
    if(!('Notification' in window))return;
    if(this._enabled){this._enabled=false;this._updateBtn();return;}
    if(Notification.permission==='granted'){this._enabled=true;this._updateBtn();return;}
    const p=await Notification.requestPermission();
    if(p==='granted'){this._enabled=true;}
    this._updateBtn();
  },
  _updateBtn(){
    const b=document.getElementById('notifBtn');
    if(b){b.classList.toggle('enabled',this._enabled);b.title=this._enabled?'Notifications on':'Turn notifications';}
  },
  fire(title,body){
    if(!this._enabled||!document.hidden||Notification.permission!=='granted')return;
    try{
      const n=new Notification(title,{body,icon:'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1 1%22/>',tag:'turn'});
      n.onclick=()=>{window.focus();n.close();};
      setTimeout(()=>n.close(),8000);
    }catch(e){}
  }
};

/* REPLAY*/
const Replay={
  _events:[],
  store(evt){this._events.push(evt);},
  clear(){this._events=[];},
  open(){
    const el=document.getElementById('replayOverlay');
    if(!el)return;
    el.style.display='flex';
    const list=document.getElementById('replayEvents');
    list.innerHTML='';
    if(!this._events.length){list.innerHTML='<div style="color:var(--muted);font-size:.6rem;padding:8px">No events recorded.</div>';return;}
    this._events.forEach((evt,i)=>{
      const p=State.players[evt.pi]||{name:`P${evt.pi+1}`,color:'#fff'};
      const div=document.createElement('div');
      let cls='replay-event';let txt='';
      if(evt.timerExpired){txt=`⏱ ${p.name} timed out`;cls+=' r-skip';}
      else if(evt.won){txt=`${p.name} wins!`;cls+=' r-win';}
      else if(evt.snakeHit){txt=`${p.name} rolled ${evt.roll}: ${evt.snakeHit.from}→${evt.snakeHit.to}`;cls+=' r-snake';}
      else if(evt.ladderHit){txt=`${p.name} rolled ${evt.roll}: ${evt.ladderHit.from}→${evt.ladderHit.to}`;cls+=' r-ladder';}
      else if(evt.noMove){txt=`${p.name} rolled ${evt.roll}: no move`;}
      else{txt=`${p.name} rolled ${evt.roll}: ${evt.from}→${evt.finalPos}`;}
      div.className=cls;
      div.innerHTML=`<span style="color:${p.color};font-size:.56rem">#${i+1}</span> ${txt}`;
      list.appendChild(div);
    });
    list.scrollTop=list.scrollHeight;
  },
  close(){
    const el=document.getElementById('replayOverlay');if(el)el.style.display='none';
  },
  async animate(){
    this.close();
    if(!this._events.length)return;
    // Save current state
    const savedPos=[...State.pos],savedCur=State.cur,savedOver=State.over,savedTurn=State.turnNum;
    const savedStats=State.stats.map(s=>({...s}));
    // Reset board visually
    State.pos=Array(State.numPlayers).fill(1);
    State.cur=0;State.over=false;State.turnNum=1;
    State.stats=Array.from({length:State.numPlayers},()=>({r:0,s:0,l:0}));
    Tokens._placeAll();UI.updateActive();
    State.players.forEach((_,i)=>{UI.posDisplay(i,1);UI.updateStats(i);});
    document.getElementById('turnCount').textContent='1';
    UI.setStatus('Replaying…');UI.setRoll(false);
    // Replay each event
    for(const evt of this._events){
      await new Promise(r=>setTimeout(r,600));
      await Game.playback({...evt,_replay:true});
    }
    // Restore
    await new Promise(r=>setTimeout(r,1200));
    State.pos=savedPos;State.cur=savedCur;State.over=savedOver;State.turnNum=savedTurn;
    State.stats=savedStats;
    Tokens._placeAll();UI.updateActive();
    State.players.forEach((_,i)=>{UI.posDisplay(i,State.pos[i]);UI.updateStats(i);});
    document.getElementById('turnCount').textContent=State.turnNum;
    if(State.over){const w=State.pos.indexOf(100);if(w>=0)UI.showWin(w);}
    else{const itm=MP.active&&MP.myIndex===State.cur;UI.setRoll(itm||!MP.active);UI.setStatus(itm?'Your turn — roll!':'Replay complete.');}
  }
};
/* MULTIPLAYER (MP */
const MP={
  db:null,roomCode:null,myIndex:-1,active:false,isHost:false,
  _rematchTs:0,_roomRef:null,_eventsRef:null,_chatRef:null,_typingRef:null,_winsRef:null,
  _joinTs:0,wins:{},turnTimerEnabled:true,

  isConfigured(){return FIREBASE_CONFIG.apiKey!=='YOUR_API_KEY'&&!!FIREBASE_CONFIG.databaseURL;},

  initFirebase(){
    if(!this.isConfigured())return false;
    try{if(!firebase.apps.length)firebase.initializeApp(FIREBASE_CONFIG);this.db=firebase.database();return true;}
    catch(e){console.warn('Firebase init failed:',e);return false;}
  },

  makeCode(){return Math.random().toString(36).substring(2,6).toUpperCase();},

  async createRoom(name,colorIndex,avatarIndex,playerCount,settings,isPublic,turnTimerEnabled){
    if(!this.db)return null;
    const code=this.makeCode();this.roomCode=code;this.myIndex=0;this.isHost=true;
    this.turnTimerEnabled=turnTimerEnabled;
    const roomSettings={exactWin:settings.exactWin,bonusRoll:settings.bonusRoll,turnTimer:turnTimerEnabled};
    const roomData={
      created:Date.now(),playerCount,settings:roomSettings,isPublic:!!isPublic,
      gameState:{positions:Array(playerCount).fill(1),currentPlayer:0,turnNum:1,
        stats:Array.from({length:playerCount},()=>({r:0,s:0,l:0})),over:false,winner:null,status:'waiting'},
      players:{0:{name,colorIndex,avatarIndex,connected:true,ready:false}},
      events:{},chat:{},wins:{}
    };
    await firebase.database().ref(`rooms/${code}`).set(roomData);
    firebase.database().ref(`rooms/${code}/players/0/connected`).onDisconnect().set(false);
    if(isPublic){
      firebase.database().ref(`publicRooms/${code}`).set({
        hostName:name,playerCount,current:1,created:Date.now()
      });
      firebase.database().ref(`publicRooms/${code}`).onDisconnect().remove();
    }
    return code;
  },

  async joinRoom(code,name,colorIndex,avatarIndex,asSpectator=false){
    if(!this.db)return{error:'Firebase not configured'};
    let snap;
    try{snap=await firebase.database().ref(`rooms/${code}`).get();}
    catch(e){return{error:'Could not reach Firebase. Check your connection.'};}
    if(!snap.exists())return{error:'Room not found. Check the code and try again.'};
    const data=snap.val();
    if(!asSpectator){
      const players=data.players||{};
      const taken=new Set(Object.keys(players).map(Number));
      let reconnSlot=-1;
      for(const[idx,pd] of Object.entries(players)){
        if(!pd.connected&&pd.name===name){reconnSlot=+idx;break;}
      }
      if(reconnSlot>=0){
        this.myIndex=reconnSlot;
      } else {
        let slot=-1;
        for(let i=0;i<(data.playerCount||2);i++){if(!taken.has(i)){slot=i;break;}}
        if(slot===-1)asSpectator=true;else this.myIndex=slot;
      }
    }
    if(asSpectator)this.myIndex=-1;
    this.roomCode=code;this.isHost=(!asSpectator&&this.myIndex===0);
    this.turnTimerEnabled=data.settings?.turnTimer!==false;
    if(!asSpectator){
      await firebase.database().ref(`rooms/${code}/players/${this.myIndex}`).update({name,colorIndex,avatarIndex,connected:true,kicked:false});
      firebase.database().ref(`rooms/${code}/players/${this.myIndex}/connected`).onDisconnect().set(false);
    }
    if(data.isPublic&&!asSpectator){
      firebase.database().ref(`publicRooms/${code}/current`).transaction(c=>(c||0)+1);
    }
    return{slot:this.myIndex,playerCount:data.playerCount,gameState:data.gameState,
      players:data.players,settings:data.settings,code,wins:data.wins||{}};
  },

  pushEvent(evt){
    if(!this.active||!this.db)return;
    firebase.database().ref(`rooms/${this.roomCode}/events`).push(evt);
  },

  pushSettings(){
    if(!this.active||!this.db||!this.isHost)return;
    firebase.database().ref(`rooms/${this.roomCode}/settings`).set({
      exactWin:Config.exactWin,bonusRoll:Config.bonusRoll,turnTimer:this.turnTimerEnabled
    });
  },

  pushTyping(isTyping){
    if(!this.active||!this.db||this.myIndex<0)return;
    const ref=firebase.database().ref(`rooms/${this.roomCode}/typing/${this.myIndex}`);
    if(isTyping)ref.set(Date.now());else ref.remove();
  },

  pushReaction(key){
    if(!this.active||!this.db)return;
    const p=this.myIndex>=0?State.players[this.myIndex]:null;
    firebase.database().ref(`rooms/${this.roomCode}/reactions`).push({
      emoji:key,color:p?p.color:'var(--text)',pi:this.myIndex,ts:Date.now()
    });
  },

  pushWin(pi){
    if(!this.active||!this.db)return;
    firebase.database().ref(`rooms/${this.roomCode}/wins/${pi}`).transaction(c=>(c||0)+1);
  },

  startVote(){
    if(!this.active||!this.db)return;
    const ts=Date.now();
    firebase.database().ref(`rooms/${this.roomCode}/vote`).set({ts,votes:{}});
    this._showVoteUI(true);
  },

  vote(choice){
    if(!this.active||!this.db||this.myIndex<0)return;
    firebase.database().ref(`rooms/${this.roomCode}/vote/votes/${this.myIndex}`).set(choice);
    document.getElementById('voteYesBtn').disabled=true;
    document.getElementById('voteNoBtn').disabled=true;
  },

  _showVoteUI(show){
    const sec=document.getElementById('voteSection');if(!sec)return;
    sec.style.display=show?'block':'none';
    if(show){
      document.getElementById('voteYesBtn').disabled=false;
      document.getElementById('voteNoBtn').disabled=false;
      document.getElementById('voteRow').innerHTML='';
    }
  },

  subscribe(code){
    if(!this.db)return;
    if(this._roomRef)this._roomRef.off();
    if(this._eventsRef)this._eventsRef.off();
    if(this._chatRef)this._chatRef.off();
    if(this._typingRef)this._typingRef.off();
    if(this._winsRef)this._winsRef.off();

    this._joinTs=Date.now();
    Replay.clear();

    // ── Room-level ───────────────────────────────────────────────
    this._roomRef=firebase.database().ref(`rooms/${code}`);
    this._roomRef.on('value',snap=>{
      if(!snap.exists())return;
      const data=snap.val();

      // Sync player data
      if(data.players){
        Object.entries(data.players).forEach(([idx,pd])=>{
          const i=+idx;
          // Check if we were kicked
          if(i===this.myIndex&&pd.kicked){
            this.leave();alert('You were removed by the host.');return;
          }
          if(i!==this.myIndex&&State.players[i])State.players[i].name=pd.name;
          const dot=document.getElementById(`onlineDot${i}`);
          if(dot){dot.classList.toggle('connected',!!pd.connected);dot.classList.toggle('disconnected',!pd.connected);dot.title=pd.connected?'Online':'Offline';}
        });
        State.players.forEach((p,i)=>{if(i!==this.myIndex){const el=document.getElementById(`pname${i}`);if(el)el.textContent=p.name;}});
      }

      // Settings sync
      if(data.settings&&!this.isHost){
        Config.exactWin=!!data.settings.exactWin;
        Config.bonusRoll=data.settings.bonusRoll!==false;
        this.turnTimerEnabled=data.settings.turnTimer!==false;
      }

      // Vote sync
      if(data.vote){
        const voteRow=document.getElementById('voteRow');
        if(voteRow){
          voteRow.innerHTML='';
          State.players.forEach((p,i)=>{
            const choice=data.vote.votes?.[i];
            const div=document.createElement('div');
            div.className='vote-player'+(choice==='yes'?' voted-yes':choice==='no'?' voted-no':'');
            div.innerHTML=`<span style="color:${p.color}">●</span> ${p.name}${choice==='yes'?'✓':choice==='no'?'✗':'…'}`;
            voteRow.appendChild(div);
          });
          // Check if majority voted yes
          const votes=Object.values(data.vote.votes||{});
          const yes=votes.filter(v=>v==='yes').length;
          const no=votes.filter(v=>v==='no').length;
          const n=State.numPlayers;
          if(yes>n/2||(n===2&&yes===2)){
            this._showVoteUI(false);
            const ts=Date.now();this._rematchTs=ts;
            this._applyRematch(n,null);
            firebase.database().ref(`rooms/${code}`).update({
              'gameState':{positions:Array(n).fill(1),currentPlayer:0,turnNum:1,
                stats:Array.from({length:n},()=>({r:0,s:0,l:0})),over:false,winner:null,status:'playing',lastUpdate:ts},
              'events':{},'rematch':{ts,playerCount:n},'vote':null
            });
          } else if(no>n/2){
            this._showVoteUI(false);
          }
        }
      }

      // Rematch signal
      if(data.rematch&&data.rematch.ts!==this._rematchTs){
        this._rematchTs=data.rematch.ts;
        this._applyRematch(data.rematch.playerCount||State.numPlayers,data.rematch.settings);
      }
    });

    // ── Events ───────────────────────────────────────────────────
    this._eventsRef=firebase.database().ref(`rooms/${code}/events`);
    this._eventsRef.orderByChild('ts').startAt(this._joinTs).on('child_added',snap=>{
      const evt=snap.val();if(!evt)return;
      Replay.store(evt);
      this._eventQueue.push(evt);
      this._drainQueue();
    });

    // ── Chat ─────────────────────────────────────────────────────
    this._chatRef=firebase.database().ref(`rooms/${code}/chat`);
    this._chatRef.on('value',snap=>{
      const msgs=Object.values(snap.val()||{}).sort((a,b)=>a.ts-b.ts);
      const list=document.getElementById('chatMessages');if(!list)return;
      list.innerHTML='';
      msgs.slice(-80).forEach(msg=>{
        const div=document.createElement('div');div.className='chat-msg';
        const av='';
        div.innerHTML=`<span class="chat-name" style="color:${msg.color}">${msg.name}</span><span class="chat-text">${msg.text}</span>`;
        list.appendChild(div);
      });
      list.scrollTop=list.scrollHeight;
    });

    // ── Typing ───────────────────────────────────────────────────
    this._typingRef=firebase.database().ref(`rooms/${code}/typing`);
    this._typingRef.on('value',snap=>{
      const data=snap.val()||{};
      const now=Date.now();
      const typers=Object.entries(data)
        .filter(([idx,ts])=>+idx!==this.myIndex&&now-ts<5000&&State.players[+idx])
        .map(([idx])=>State.players[+idx].name);
      const el=document.getElementById('typingIndicator');if(!el)return;
      if(typers.length){
        el.innerHTML=`${typers.join(', ')} ${typers.length===1?'is':'are'} typing<span class="typing-dots"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></span>`;
      }else{el.innerHTML='';}
    });

    // ── Wins ─────────────────────────────────────────────────────
    this._winsRef=firebase.database().ref(`rooms/${code}/wins`);
    this._winsRef.on('value',snap=>{
      this.wins=snap.val()||{};
      this._renderWins();
    });

    // ── Reactions ────────────────────────────────────────────────
    Reactions.subscribe(code,this._joinTs);
  },

  _renderWins(){
    const badge=document.getElementById('roundsBadge');if(!badge)return;
    const hasWins=Object.values(this.wins).some(v=>v>0);
    if(!hasWins){badge.style.display='none';return;}
    badge.style.display='inline-flex';
    badge.innerHTML=State.players.map((p,i)=>{
      const w=this.wins[i]||0;if(!w)return '';
      return `<span style="color:${p.color}">★${w}</span>`;
    }).filter(Boolean).join(' ');
    // Update turn bar win stars
    State.players.forEach((_,i)=>{
      const el=document.getElementById(`winStars${i}`);
      if(el)el.textContent='★'.repeat(this.wins[i]||0);
    });
  },

  // Serialize event processing
  _eventQueue:[],
  _processingEvent:false,
  async _drainQueue(){
    if(this._processingEvent||this._eventQueue.length===0)return;
    this._processingEvent=true;
    const evt=this._eventQueue.shift();
    await Game.playback(evt);
    this._processingEvent=false;
    this._drainQueue();
  },

  sendChatInput(){
    const inp=document.getElementById('chatInput');const text=inp.value.trim();
    if(!text||!this.active||!this.db)return;
    inp.value='';
    this.pushTyping(false);
    const p=this.myIndex>=0?State.players[this.myIndex]:null;
    firebase.database().ref(`rooms/${this.roomCode}/chat`).push({
      name:p?p.name:'Spectator',color:p?p.color:'#666',
      avatarIndex:p?p.avatarIndex||0:0,
      text:text.replace(/</g,'&lt;'),ts:Date.now(),pi:this.myIndex
    });
  },

  requestRematch(){if(this.active)this.startVote();},

  _applyRematch(playerCount,settings){
    State.numPlayers=playerCount||State.numPlayers;
    if(settings){Config.exactWin=!!settings.exactWin;Config.bonusRoll=settings.bonusRoll!==false;}
    const savedNames=State.players.map(p=>p.name);
    const savedColors=State.players.map(p=>({color:p.color,text:p.text,avatarIndex:p.avatarIndex}));
    State.reset();
    State.players.forEach((p,i)=>{if(savedNames[i])p.name=savedNames[i];if(savedColors[i])Object.assign(p,savedColors[i]);});
    this._eventQueue=[];this._processingEvent=false;Replay.clear();
    this._showVoteUI(false);Timer.stop();
    if(this.db&&this.roomCode){
      if(this._eventsRef)this._eventsRef.off();
      this._joinTs=Date.now();
      this._eventsRef=firebase.database().ref(`rooms/${this.roomCode}/events`);
      this._eventsRef.orderByChild('ts').startAt(this._joinTs).on('child_added',snap=>{
        const evt=snap.val();if(!evt)return;
        Replay.store(evt);this._eventQueue.push(evt);this._drainQueue();
      });
    }
    UI.hideWin();Game._build();UI.clearLog();
    document.getElementById('turnCount').textContent='1';
    const isMyTurn=this.myIndex===0;
    UI.setStatus(isMyTurn?'Your turn — roll!':`${State.players[State.cur].name}'s turn.`);
    UI.setRoll(isMyTurn);
    if(isMyTurn&&this.turnTimerEnabled)Timer.start(30);
  },

  _startTurnTimer(){
    if(!this.active||!this.turnTimerEnabled)return;
    if(this.myIndex===State.cur&&this.myIndex>=0){
      Timer.start(30);
    } else {
      Timer.start(30);// show for all so they see the countdown
    }
  },

  leave(){
    if(this.db&&this.roomCode&&this.myIndex>=0){
      firebase.database().ref(`rooms/${this.roomCode}/players/${this.myIndex}/connected`).set(false);
      this.pushTyping(false);
    }
    if(this._roomRef)this._roomRef.off();
    if(this._eventsRef)this._eventsRef.off();
    if(this._chatRef)this._chatRef.off();
    if(this._typingRef)this._typingRef.off();
    if(this._winsRef)this._winsRef.off();
    Reactions.unsubscribe();Timer.stop();
    this.active=false;this.myIndex=-1;this.roomCode=null;this.isHost=false;
    this._eventQueue=[];this._processingEvent=false;this.wins={};
    document.getElementById('modeToggle').style.display='';
    document.getElementById('localLeaveBtn').style.display='none';
    document.getElementById('onlineBadge').style.display='none';
    document.getElementById('roomCodePill').style.display='none';
    document.getElementById('leaveBtn').style.display='none';
    document.getElementById('chatPanel').style.display='none';
    document.getElementById('reactionsBar').classList.remove('visible');
    document.getElementById('notifBtn').style.display='none';
    document.getElementById('roundsBadge').style.display='none';
    document.getElementById('appRoot').style.display='none';
    Lobby.show();
  }
};
/* LOBBY */
const AVATARS=null;// removed — using color dots

const Lobby={
  _selectedColor:0,_selectedCount:2,_waitRef:null,_pubRef:null,_statusRef:null,_pendingResult:null,_joinedName:null,_joinedColor:0,

  init(){
    // Colour swatches
    const row=document.getElementById('colorSwatches');
    ALL_PLAYERS.forEach((p,i)=>{
      const sw=document.createElement('div');sw.className='color-swatch'+(i===0?' selected':'');
      sw.style.background=p.color;sw.title=p.name;
      sw.addEventListener('click',()=>this.selectColor(i));row.appendChild(sw);
    });
    // Preset toggle
    document.querySelectorAll('#lobbyPresetSeg .lobby-seg-btn').forEach(b=>{
      b.addEventListener('click',()=>{
        document.querySelectorAll('#lobbyPresetSeg .lobby-seg-btn').forEach(x=>x.classList.toggle('active',x===b));
      });
    });
    // Player count toggle
    document.querySelectorAll('#playerCountSeg .lobby-seg-btn').forEach(b=>{
      b.addEventListener('click',()=>{
        this._selectedCount=+b.dataset.count;
        document.querySelectorAll('#playerCountSeg .lobby-seg-btn').forEach(x=>x.classList.toggle('active',x===b));
      });
    });
    // Invite link from URL — show banner, focus name, pre-fill code
    const urlCode=new URLSearchParams(window.location.search).get('room');
    if(urlCode&&MP.isConfigured()){
      const code=urlCode.toUpperCase();
      // Pre-fill join code
      const inp=document.getElementById('joinCodeInput');
      if(inp)inp.value=code;
      // Show invite banner
      const banner=document.getElementById('inviteBanner');
      if(banner){banner.classList.add('visible');document.getElementById('inviteBannerCode').textContent=code;}
      // Focus name input after a short delay
      setTimeout(()=>{
        const nameInp=document.getElementById('lobbyName');
        if(nameInp){nameInp.focus();nameInp.placeholder='Enter your name to join';}
        // Scroll join section into view on mobile
        const js=document.getElementById('joinSection');
        if(js)js.scrollIntoView({behavior:'smooth',block:'nearest'});
      },300);
    }
    if(!MP.isConfigured()){
      document.getElementById('noFirebaseNote').style.display='block';
      document.getElementById('onlineSection').style.opacity='.4';
      document.getElementById('onlineSection').style.pointerEvents='none';
    } else {
      this._loadPublicRooms();
    }
    this.show();
  },

  show(){
    document.getElementById('lobbyOverlay').style.display='flex';
    document.getElementById('appRoot').style.display='none';
    document.getElementById('waitingRoom').style.display='none';
    document.getElementById('createSection').style.display='block';
    document.getElementById('joinSection').style.display='block';
    document.getElementById('lobbyError').style.display='none';
    const b1=document.getElementById('createRoomBtn');if(b1){b1.textContent='Create Room';b1.disabled=false;}
    const b2=document.getElementById('joinRoomBtn');if(b2){b2.textContent='Join';b2.disabled=false;}
    const b3=document.getElementById('spectateBtn');if(b3){b3.textContent='Spectate';b3.disabled=false;}
    // Restore start game btn in case joiner was waiting
    const sb=document.getElementById('startGameBtn');if(sb)sb.style.display='';
    const jf=document.getElementById('joinerWaitFooter');if(jf)jf.style.display='none';
    if(this._waitRef){this._waitRef.off();this._waitRef=null;}
    if(this._statusRef){this._statusRef.off();this._statusRef=null;}
    this._pendingResult=null;
  },

  selectColor(idx){
    this._selectedColor=idx;
    document.querySelectorAll('.color-swatch').forEach((s,i)=>s.classList.toggle('selected',i===idx));
  },

  _form(){
    const raw=document.getElementById('lobbyName').value.trim();
    return{name:raw||`Player ${this._selectedColor+1}`,colorIndex:this._selectedColor};
  },

  copyCode(){
    const code=MP.roomCode;if(!code)return;
    navigator.clipboard?.writeText(code).catch(()=>{});
    const pill=document.getElementById('roomCodePill');
    if(pill){pill.textContent='Copied!';setTimeout(()=>{pill.textContent=code;},1400);}
    const btn=document.querySelector('.copy-btn');
    if(btn){btn.textContent='Copied!';setTimeout(()=>{btn.textContent='Copy Code';},1400);}
  },

  copyInviteLink(){
    const code=MP.roomCode;if(!code)return;
    const url=`${location.origin}${location.pathname}?room=${code}`;
    navigator.clipboard?.writeText(url).catch(()=>{});
    const btn=document.querySelector('.invite-btn');
    if(btn){btn.textContent='Copied!';setTimeout(()=>{btn.textContent='Copy Invite Link';},1600);}
  },

  _setError(msg){const el=document.getElementById('lobbyError');if(el){el.textContent=msg;el.style.display=msg?'block':'none';}},

  _loadPublicRooms(){
    if(this._pubRef)this._pubRef.off();
    if(!MP.db)return;
    this._pubRef=firebase.database().ref('publicRooms');
    this._pubRef.on('value',snap=>{
      const rooms=snap.val()||{};
      const list=document.getElementById('pubRoomsList');const cnt=document.getElementById('pubRoomsCount');
      if(!list)return;
      const entries=Object.entries(rooms).filter(([,r])=>r.current<r.playerCount);
      if(cnt)cnt.textContent=entries.length?`(${entries.length})`:'';
      if(!entries.length){list.innerHTML='<div class="pub-rooms-empty">No public rooms open</div>';return;}
      list.innerHTML='';
      entries.forEach(([code,r])=>{
        const row=document.createElement('div');row.className='pub-room-row';
        row.innerHTML=`<div><div class="pub-room-name">${r.hostName||'Room'}</div><div class="pub-room-meta">${r.current||'?'}/${r.playerCount} players · CODE: <b>${code}</b></div></div><button class="pub-room-join" onclick="Lobby._joinPublic('${code}')">Join</button>`;
        list.appendChild(row);
      });
    });
  },

  _joinPublic(code){
    const inp=document.getElementById('joinCodeInput');if(inp)inp.value=code;
    this.joinRoom(false);
  },

  async createRoom(){
    if(!MP.isConfigured())return;
    const{name,colorIndex}=this._form();
    const settings={
      exactWin:document.getElementById('lobbyExactWin').checked,
      bonusRoll:document.getElementById('lobbyBonusRoll').checked
    };
    const activePre=document.querySelector('#lobbyPresetSeg .lobby-seg-btn.active');
    const presetKey=activePre?activePre.dataset.preset:'classic';
    applyPreset(presetKey);
    const isPublic=document.getElementById('lobbyIsPublic').checked;
    const turnTimerEnabled=document.getElementById('lobbyTurnTimer')?.checked!==false;
    this._joinedName=name;this._joinedColor=colorIndex;
    const btn=document.getElementById('createRoomBtn');btn.textContent='Creating…';btn.disabled=true;
    const code=await MP.createRoom(name,colorIndex,0,this._selectedCount,{...settings,preset:presetKey},isPublic,turnTimerEnabled);
    if(!code){btn.textContent='Create Room';btn.disabled=false;this._setError('Failed to create room. Check your Firebase config.');return;}
    Config.exactWin=settings.exactWin;Config.bonusRoll=settings.bonusRoll;
    document.getElementById('createSection').style.display='none';
    document.getElementById('joinSection').style.display='none';
    document.getElementById('roomCodeText').textContent=code;
    document.getElementById('waitingRoom').style.display='block';
    document.getElementById('startGameBtn').disabled=true;
    this._waitRef=firebase.database().ref(`rooms/${code}/players`);
    this._waitRef.on('value',snap=>{
      const players=snap.val()||{};
      const wl=document.getElementById('waitingList');if(!wl)return;
      wl.innerHTML='';
      Object.entries(players).forEach(([idx,p])=>{
        const i=+idx,isHost=(i===0),isMe=(i===MP.myIndex);
        const row=document.createElement('div');row.className='waiting-player';
        row.innerHTML=`<span class="waiting-dot" style="background:${ALL_PLAYERS[p.colorIndex||0].color}"></span>
          <span style="flex:1">${p.name}${isHost?'<span class="waiting-host-tag">host</span>':''}</span>
          ${isMe?`<button class="ready-btn ${p.ready?'is-ready':'not-ready'}" onclick="Lobby._toggleReady(${i})"><span class="ready-icon">${p.ready?'✓':'○'}</span> ${p.ready?'Ready':'Ready?'}</button>`:''}
          ${!isMe&&!isHost&&MP.isHost?`<button class="kick-btn" onclick="Lobby._kick(${i})" title="Kick player">×</button>`:''}
          ${!isMe&&p.ready?'<span style="font-size:.6rem;color:#5cf6b0;margin-left:4px">✓</span>':''}`;
        wl.appendChild(row);
      });
      const count=Object.keys(players).length;
      const allReady=Object.values(players).every(p=>p.ready||Object.keys(players).indexOf(String(Object.keys(players).find(k=>players[k]===p)))===0);
      const sb=document.getElementById('startGameBtn');
      if(count<2){sb.disabled=true;sb.textContent='Waiting for players…';}
      else{sb.disabled=false;sb.textContent=`Start Game (${count} players)`;}
    });
  },

  _toggleReady(idx){
    if(!MP.db||!MP.roomCode)return;
    const ref=firebase.database().ref(`rooms/${MP.roomCode}/players/${idx}/ready`);
    ref.transaction(r=>!r);
  },

  _kick(idx){
    if(!MP.db||!MP.roomCode||!MP.isHost)return;
    if(!confirm('Kick this player?'))return;
    firebase.database().ref(`rooms/${MP.roomCode}/players/${idx}`).update({kicked:true,connected:false});
    setTimeout(()=>firebase.database().ref(`rooms/${MP.roomCode}/players/${idx}`).remove(),2000);
  },

  cancelWaiting(){
    if(MP.db&&MP.roomCode)firebase.database().ref(`rooms/${MP.roomCode}`).remove().catch(()=>{});
    if(MP.roomCode)firebase.database().ref(`publicRooms/${MP.roomCode}`).remove().catch(()=>{});
    MP.roomCode=null;MP.myIndex=-1;
    if(this._waitRef){this._waitRef.off();this._waitRef=null;}
    if(this._statusRef){this._statusRef.off();this._statusRef=null;}
    this.show();
  },

  startGame(){
    if(this._waitRef){this._waitRef.off();this._waitRef=null;}
    firebase.database().ref(`rooms/${MP.roomCode}`).get().then(snap=>{
      const data=snap.val()||{};
      firebase.database().ref(`rooms/${MP.roomCode}/gameState/status`).set('playing');
      if(data.isPublic)firebase.database().ref(`publicRooms/${MP.roomCode}`).remove();
      this._enterGame({slot:0,playerCount:data.playerCount||2,gameState:data.gameState,players:data.players,settings:data.settings,wins:data.wins||{}});
    });
  },

  async joinRoom(asSpectator=false){
    if(!MP.isConfigured())return;
    const{name,colorIndex}=this._form();const avatarIndex=0;
    const code=document.getElementById('joinCodeInput').value.trim().toUpperCase();
    if(!code||code.length!==4){this._setError('Enter a valid 4-letter room code.');return;}
    this._setError('');
    // Store name & color so _enterGame can use them even if form changes
    this._joinedName=name;this._joinedColor=colorIndex;
    const btn=asSpectator?document.getElementById('spectateBtn'):document.getElementById('joinRoomBtn');
    btn.textContent='Joining…';btn.disabled=true;
    const result=await MP.joinRoom(code,name,colorIndex,0,asSpectator);
    if(result.error){this._setError(result.error);btn.textContent=asSpectator?'Spectate':'Join';btn.disabled=false;return;}

    // If room is still in waiting state, show waiting room instead of jumping into game
    const status=result.gameState?.status;
    if(status==='waiting'||!status){
      this._showJoinerWaiting(result);
    } else {
      this._enterGame(result);
    }
  },

  // Show the waiting room UI for a non-host who joined a room not yet started
  _showJoinerWaiting({slot,playerCount,gameState,players,settings,wins,code}){
    // Store result for later use when game starts
    this._pendingResult={slot,playerCount,gameState,players,settings,wins,code};

    // Show waiting room overlay (same one host uses)
    document.getElementById('createSection').style.display='none';
    document.getElementById('joinSection').style.display='none';
    document.getElementById('lobbyError').style.display='none';
    document.getElementById('roomCodeText').textContent=MP.roomCode;
    document.getElementById('waitingRoom').style.display='block';

    // Non-host: replace Start Game button with a "Waiting for host…" label
    const sb=document.getElementById('startGameBtn');
    sb.style.display='none';

    // Show a "waiting for host" message and leave button
    let joinerFooter=document.getElementById('joinerWaitFooter');
    if(!joinerFooter){
      joinerFooter=document.createElement('div');
      joinerFooter.id='joinerWaitFooter';
      joinerFooter.style.cssText='display:flex;flex-direction:column;gap:6px;margin-top:8px';
      joinerFooter.innerHTML=`
        <div style="font-size:.62rem;color:var(--muted);text-align:center;letter-spacing:.06em;padding:6px 0">
          Waiting for host to start the game…
        </div>
        <button class="lobby-btn outline" onclick="Lobby._leaveWaiting()">Leave Room</button>`;
      sb.parentNode.insertBefore(joinerFooter,sb.nextSibling);
    } else {
      joinerFooter.style.display='flex';
    }

    // Subscribe to live player list
    if(this._waitRef){this._waitRef.off();this._waitRef=null;}
    this._waitRef=firebase.database().ref(`rooms/${MP.roomCode}/players`);
    this._waitRef.on('value',snap=>{
      const allPlayers=snap.val()||{};
      const wl=document.getElementById('waitingList');if(!wl)return;
      wl.innerHTML='';
      Object.entries(allPlayers).forEach(([idx,p])=>{
        const i=+idx,isHost=(i===0),isMe=(i===MP.myIndex);
        // Check if we got kicked
        if(isMe&&p.kicked){this._leaveWaiting();return;}
        const row=document.createElement('div');row.className='waiting-player';
        row.innerHTML=`<span class="waiting-dot" style="background:${ALL_PLAYERS[p.colorIndex||0].color}"></span>
          <span style="flex:1">${p.name}${isHost?'<span class="waiting-host-tag">host</span>':''}</span>
          ${isMe?`<button class="ready-btn ${p.ready?'is-ready':'not-ready'}" onclick="Lobby._toggleReady(${i})"><span class="ready-icon">${p.ready?'✓':'○'}</span> ${p.ready?'Ready':'Ready?'}</button>`:''}
          ${!isMe&&p.ready?'<span style="font-size:.6rem;color:#5cf6b0;margin-left:4px">✓</span>':''}`;
        wl.appendChild(row);
      });
    });

    // Watch for host to start the game — or room being deleted
    if(this._statusRef){this._statusRef.off();this._statusRef=null;}
    this._statusRef=firebase.database().ref(`rooms/${MP.roomCode}`);
    this._statusRef.on('value',snap=>{
      if(!snap.exists()){
        // Host cancelled the room
        if(this._statusRef){this._statusRef.off();this._statusRef=null;}
        if(this._waitRef){this._waitRef.off();this._waitRef=null;}
        MP.roomCode=null;MP.myIndex=-1;MP.isHost=false;
        const jf=document.getElementById('joinerWaitFooter');if(jf)jf.style.display='none';
        document.getElementById('startGameBtn').style.display='';
        this._setError('The host cancelled the room.');
        this.show();
        return;
      }
      const status=snap.val()?.gameState?.status;
      if(status==='playing'){
        // Game started — clean up and enter
        if(this._statusRef){this._statusRef.off();this._statusRef=null;}
        if(this._waitRef){this._waitRef.off();this._waitRef=null;}
        // Fetch full fresh room data before entering
        firebase.database().ref(`rooms/${MP.roomCode}`).get().then(roomSnap=>{
          if(!roomSnap.exists())return;
          const d=roomSnap.val();
          this._enterGame({
            slot:MP.myIndex,
            playerCount:d.playerCount,
            gameState:d.gameState,
            players:d.players,
            settings:d.settings,
            wins:d.wins||{}
          });
        });
      }
    });
  },

  // Joiner leaves the waiting room before game starts
  _leaveWaiting(){
    if(this._statusRef){this._statusRef.off();this._statusRef=null;}
    if(this._waitRef){this._waitRef.off();this._waitRef=null;}
    if(MP.db&&MP.roomCode&&MP.myIndex>=0){
      firebase.database().ref(`rooms/${MP.roomCode}/players/${MP.myIndex}`).remove().catch(()=>{});
    }
    MP.roomCode=null;MP.myIndex=-1;MP.isHost=false;
    // Restore joiner footer for reuse
    const jf=document.getElementById('joinerWaitFooter');if(jf)jf.style.display='none';
    document.getElementById('startGameBtn').style.display='';
    this.show();
  },

  _enterGame({slot,playerCount,gameState,players,settings,wins}){
    MP.active=true;
    State.numPlayers=playerCount||2;
    if(settings&&!MP.isHost){
      Config.exactWin=!!settings.exactWin;
      Config.bonusRoll=settings.bonusRoll!==false;
      MP.turnTimerEnabled=settings.turnTimer!==false;
      if(settings.preset)applyPreset(settings.preset);
    } else if(settings&&MP.isHost&&settings.preset){
      applyPreset(settings.preset);
    }
    MP.wins=wins||{};
    State.reset();
    if(players){
      Object.entries(players).forEach(([idx,pd])=>{
        const i=+idx;if(!State.players[i])return;
        State.players[i].name=pd.name;
        const base=ALL_PLAYERS[pd.colorIndex||i]||ALL_PLAYERS[i];
        State.players[i].color=base.color;State.players[i].text=base.text;
      });
    }
    if(slot>=0&&State.players[slot]){
      // Use stored join name (reliable) or fall back to form
      const name=this._joinedName||this._form().name;
      const colorIndex=this._joinedColor??this._form().colorIndex;
      State.players[slot].name=name;
      const base=ALL_PLAYERS[colorIndex]||ALL_PLAYERS[slot];
      State.players[slot].color=base.color;State.players[slot].text=base.text;
      // Make sure Firebase also has the final name
      if(MP.active&&MP.db&&MP.roomCode&&slot>=0){
        firebase.database().ref(`rooms/${MP.roomCode}/players/${slot}/name`).set(name);
        firebase.database().ref(`rooms/${MP.roomCode}/players/${slot}/colorIndex`).set(colorIndex);
      }
    }
    if(gameState&&gameState.status==='playing'){
      if(gameState.positions)State.pos=[...gameState.positions];
      State.cur=gameState.currentPlayer||0;State.turnNum=gameState.turnNum||1;
      if(gameState.stats)State.stats=gameState.stats.map(s=>({...s}));
      State.over=gameState.over||false;
    }
    // Update UI chrome
    document.getElementById('modeToggle').style.display='none';
    document.getElementById('localLeaveBtn').style.display='none';
    document.getElementById('onlineBadge').style.display='inline-flex';
    document.getElementById('roomCodePill').style.display='inline-flex';
    document.getElementById('roomCodePill').textContent=MP.roomCode;
    document.getElementById('leaveBtn').style.display='inline-flex';
    document.getElementById('chatPanel').style.display='flex';
    document.getElementById('spectatorNotice').style.display=slot<0?'block':'none';
    document.getElementById('reactionsBar').classList.toggle('visible',slot>=0);
    document.getElementById('notifBtn').style.display='inline-flex';
    const sct=document.getElementById('sheetChatTab');if(sct)sct.style.display='';
    // Show game
    document.getElementById('lobbyOverlay').style.display='none';
    document.getElementById('appRoot').style.display='block';
    requestAnimationFrame(()=>{ _syncBoardHeight(); requestAnimationFrame(_syncBoardHeight); });
    if(!Game._listenersSet)Game.init();else Game._build();
    UI.clearLog();
    document.getElementById('turnCount').textContent=State.turnNum;
    if(gameState&&gameState.status==='playing'){
      Tokens._placeAll();
      State.players.forEach((_,i)=>{UI.posDisplay(i,State.pos[i]);UI.updateStats(i);});
      UI.updateActive();
    }
    MP.subscribe(MP.roomCode);
    MP._renderWins();
    const isMyTurn=slot===State.cur&&slot>=0;
    if(slot<0){UI.setStatus('Spectating…');UI.setRoll(false);}
    else if(isMyTurn){
      UI.setStatus('Your turn — roll!');UI.setRoll(true);
      if(MP.turnTimerEnabled)Timer.start(30);
    } else {
      UI.setStatus(`${State.players[State.cur].name}'s turn.`);UI.setRoll(false);
      if(MP.turnTimerEnabled)Timer.start(30);
    }
  },

  exitToMenu(){
    // Return to lobby from local play
    document.getElementById('appRoot').style.display='none';
    document.getElementById('localLeaveBtn').style.display='none';
    document.getElementById('modeToggle').style.display='';
    Timer.stop();
    Lobby.show();
  },

  playLocal(){
    MP.active=false;
    document.getElementById('modeToggle').style.display='';
    document.getElementById('onlineBadge').style.display='none';
    document.getElementById('roomCodePill').style.display='none';
    document.getElementById('leaveBtn').style.display='none';
    document.getElementById('localLeaveBtn').style.display='inline-flex';
    document.getElementById('chatPanel').style.display='none';
    document.getElementById('reactionsBar').classList.remove('visible');
    document.getElementById('notifBtn').style.display='none';
    document.getElementById('lobbyOverlay').style.display='none';
    document.getElementById('appRoot').style.display='block';
    requestAnimationFrame(()=>{ _syncBoardHeight(); requestAnimationFrame(_syncBoardHeight); });
    Game.init();
  }
};
/* ── MOBILE SHEET ───────────────────────────────────────────────────────── */
const Sheet={
  _tab:'log',
  isMobile(){return window.innerWidth<=720},
  sync(){
    if(!this.isMobile())return;
    // Sync status
    const sm=document.getElementById('statusMsg');
    const ss=document.getElementById('sheetStatus');
    if(sm&&ss)ss.textContent=sm.textContent;
    // Sync roll button state
    const rb=document.getElementById('rollBtn');
    const sb=document.getElementById('sheetRollBtn');
    if(rb&&sb){sb.disabled=rb.disabled;sb.textContent=rb.textContent||'Roll';}
    this.render();
  },
  show(tab){
    this._tab=tab;
    document.querySelectorAll('.sheet-tab').forEach(b=>b.classList.toggle('active',b.textContent.toLowerCase()===tab||(tab==='log'&&b.textContent==='Log')||(tab==='stats'&&b.textContent==='Players')||(tab==='chat'&&b.textContent==='Chat')));
    this.render();
  },
  render(){
    if(!this.isMobile())return;
    const body=document.getElementById('sheetBody');
    if(!body)return;
    body.innerHTML='';
    if(this._tab==='log'){
      const src=document.getElementById('logList');
      if(src){const clone=src.cloneNode(true);clone.style.maxHeight='none';body.appendChild(clone);}
    } else if(this._tab==='stats'){
      State.players.slice(0,State.numPlayers).forEach((p,i)=>{
        const row=document.createElement('div');
        row.style.cssText='display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border)';
        const active=i===State.cur;
        row.innerHTML=`<div style="width:3px;height:28px;border-radius:2px;background:${p.color};flex-shrink:0"></div>`+
          `<div style="flex:1;min-width:0"><div style="font-size:.68rem;color:${active?'var(--text)':'var(--muted)'};text-transform:uppercase;letter-spacing:.08em">${p.name}</div>`+
          `<div style="font-size:.62rem;color:var(--muted);margin-top:2px">Tile ${State.pos[i]} · ${State.stats[i]?.rolls||0} rolls</div></div>`+
          `${active?'<div style="font-size:.52rem;color:var(--gold);letter-spacing:.1em;text-transform:uppercase">Your turn</div>':''}`;
        body.appendChild(row);
      });
    } else if(this._tab==='chat'){
      const src=document.getElementById('chatMessages');
      if(src){const clone=src.cloneNode(true);clone.style.maxHeight='none';body.appendChild(clone);}
      const inputRow=document.createElement('div');
      inputRow.style.cssText='display:flex;gap:6px;margin-top:8px';
      inputRow.innerHTML=`<input class="chat-input" id="sheetChatInput" placeholder="Message…" maxlength="120" autocomplete="off" style="flex:1"/>`+
        `<button class="chat-send" onclick="MP.sendChat(document.getElementById('sheetChatInput').value);document.getElementById('sheetChatInput').value=''">↑</button>`;
      body.appendChild(inputRow);
    }
  }
};


/* ── BOARD NOTIFICATION ─────────────────────────────────────────────────── */
const BoardNotif={
  _current:null,
  _timer:null,
  show(title,{sub='',color='#e8e8e8',duration=1900}={}){
    this.clear();
    const bw=document.getElementById('boardWrap');
    if(!bw)return;
    const wrap=document.createElement('div');
    wrap.className='bnotif';
    wrap.style.animationDuration=(duration/1000)+'s';
    const inner=document.createElement('div');
    inner.className='bnotif-inner';
    const t=document.createElement('div');
    t.className='bnotif-title';
    t.style.color=color;
    t.textContent=title;
    inner.appendChild(t);
    if(sub){
      const s=document.createElement('div');
      s.className='bnotif-sub';
      s.style.color=color;
      s.textContent=sub;
      inner.appendChild(s);
    }
    wrap.appendChild(inner);
    bw.appendChild(wrap);
    this._current=wrap;
    this._timer=setTimeout(()=>this.clear(),duration+80);
  },
  clear(){
    clearTimeout(this._timer);
    if(this._current){this._current.remove();this._current=null;}
  }
};

/* ── MOBILE BOARD HEIGHT ────────────────────────────────────────────────── */
function _syncBoardHeight(){
  if(window.innerWidth>720)return;
  const root=document.documentElement;
  const dvh=window.innerHeight;

  // Measure fixed bottom sheet height (it doesn't participate in flex layout)
  const sheet=document.getElementById('bottomSheet');
  const sheetH=sheet?sheet.getBoundingClientRect().height:72;
  root.style.setProperty('--sheet-h', sheetH+'px');

  // Measure chrome that IS in the flex layout
  const header=document.querySelector('#appRoot header');
  const turnBar=document.getElementById('turnBar');
  let used=sheetH+8; // sheet + .app top padding
  if(header)used+=header.getBoundingClientRect().height;
  if(turnBar)used+=turnBar.getBoundingClientRect().height;
  used+=16; // margins/gaps

  const avail=Math.max(80, dvh-used);
  root.style.setProperty('--bh', avail+'px');
}

/* ── BOOT ───────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded',()=>{
  // Dismiss splash screen after loading bar completes (~2.2s)
  const splash=document.getElementById('splashScreen');
  if(splash){setTimeout(()=>splash.classList.add('done'),2200);}

  // Mobile board sizing — run after first paint so measurements are accurate
  requestAnimationFrame(()=>{ _syncBoardHeight(); requestAnimationFrame(_syncBoardHeight); });
  window.addEventListener('resize',_syncBoardHeight);
  window.addEventListener('orientationchange',()=>setTimeout(_syncBoardHeight,120));
  MP.initFirebase();
  Lobby.init();
  // Typing indicator wiring
  const ci=document.getElementById('chatInput');
  if(ci){
    let _tt=null;
    ci.addEventListener('input',()=>{
      if(MP.active){MP.pushTyping(true);clearTimeout(_tt);_tt=setTimeout(()=>MP.pushTyping(false),4000);}
    });
    ci.addEventListener('blur',()=>{clearTimeout(_tt);if(MP.active)MP.pushTyping(false);});
  }
  // Keyboard shortcut: Escape closes replay too
  document.addEventListener('keydown',e=>{
    if(e.code==='Escape'){
      const ro=document.getElementById('replayOverlay');if(ro&&ro.style.display!=='none')Replay.close();
    }
  });
});

