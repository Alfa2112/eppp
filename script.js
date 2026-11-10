const $=id=>document.getElementById(id);
/* Paste your Google Apps Script Web App URL (ends with /exec) between the quotes to record logins and quiz scores. */
const SHEET_URL='https://script.google.com/macros/s/AKfycbwB7xUxGcw8-XjiSX579V04csNUNszDXpAsj2GzdwPpTuvCbzmcgji9BfL3h62NuuY3Qw/exec';
const ADMIN_HASH='8d008f8b98c07ba5072c02dc108351f872260bb6af85a016253f2e084909eba5'; /* SHA-256 of the admin password */
/* true = students must record every sound in order to unlock the next step. Set to false to open every section. */
const REQUIRE_RECORDING=true;
function logEvent(type,extra){if(!SHEET_URL||!user)return;try{fetch(SHEET_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:JSON.stringify(Object.assign({type,name:user.n,no:user.no},extra||{}))}).catch(()=>{})}catch(e){}}
const el=(t,h='',c='')=>{const e=document.createElement(t);e.innerHTML=h;if(c)e.className=c;return e};
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const shuf=a=>[...a].sort(()=>Math.random()-.5);
const ld=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}};
const sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const P=(s,k)=>s.trim().split('\n').map(l=>{const[a,b,c,d]=l.split('|');return{s:a,w:b,t:c,tip:d,k}});

const MONO=P(`iː|sheep|ʃiːp|Long. Lips spread, tongue high and forward.
ɪ|ship|ʃɪp|Short. Relaxed lips, tongue a little lower than /iː/.
ʊ|good|gʊd|Short. Lips slightly rounded, tongue high at the back.
uː|shoot|ʃuːt|Long. Lips rounded, tongue high at the back.
e|bed|bed|Short. Mouth half open, tongue forward.
ə|teacher|ˈtiːtʃə|Schwa. Weak, relaxed and very short.
ɜː|bird|bɜːd|Long. Lips neutral, tongue in the centre.
ɔː|door|dɔː|Long. Lips rounded, tongue back and mid-low.
æ|cat|kæt|Short. Mouth wide open, tongue low and forward.
ʌ|up|ʌp|Short. Mouth relaxed and open, tongue central.
ɑː|far|fɑː|Long. Mouth wide open, tongue low and back.
ɒ|on|ɒn|Short. Lips slightly rounded, tongue low and back.`,'Monophthong');
const DIPH=P(`ɪə|here|hɪə|Glide from /ɪ/ to /ə/.
eɪ|wait|weɪt|Glide from /e/ up to /ɪ/.
ʊə|tourist|ˈtʊərɪst|Glide from /ʊ/ to /ə/.
ɔɪ|coin|kɔɪn|Glide from /ɔː/ up to /ɪ/.
əʊ|show|ʃəʊ|Glide from /ə/ to /ʊ/.
eə|hair|heə|Glide from /e/ to /ə/.
aɪ|my|maɪ|Glide from /a/ up to /ɪ/.
aʊ|cow|kaʊ|Glide from /a/ up to /ʊ/.`,'Diphthong');
const CONS=P(`p|pen|pen|Voiceless plosive.
b|bad|bæd|Voiced plosive.
t|tea|tiː|Voiceless plosive.
d|did|dɪd|Voiced plosive.
k|cat|kæt|Voiceless plosive.
g|get|get|Voiced plosive.
f|fall|fɔːl|Voiceless fricative. Upper teeth on lower lip.
v|van|væn|Voiced fricative. Upper teeth on lower lip.
θ|thin|θɪn|Voiceless fricative. Tongue between the teeth.
ð|this|ðɪs|Voiced fricative. Tongue between the teeth.
s|see|siː|Voiceless fricative.
z|zoo|zuː|Voiced fricative.
ʃ|shoe|ʃuː|Voiceless fricative. Lips slightly rounded.
ʒ|vision|ˈvɪʒn|Voiced fricative.
h|hat|hæt|Voiceless. A breath of air from the throat.
m|man|mæn|Voiced nasal. Lips closed.
n|now|naʊ|Voiced nasal. Tongue tip on the ridge behind the teeth.
ŋ|sing|sɪŋ|Voiced nasal. Back of the tongue touches the soft palate.
l|leg|leg|Voiced lateral. Air flows around the tongue.
r|red|red|Voiced approximant. Tongue curls back without touching.
j|yes|jes|Voiced glide, like a quick /iː/.
w|wet|wet|Voiced glide. Lips rounded, like a quick /uː/.
tʃ|chain|tʃeɪn|Voiceless affricate: /t/ then /ʃ/.
dʒ|jam|dʒæm|Voiced affricate: /d/ then /ʒ/.`,'Consonant');
const ALL=[...MONO,...DIPH,...CONS];

const POS={'iː':[12,9],'uː':[90,9],'ɪ':[30,25],'ʊ':[72,25],'e':[32,50],'ə':[54,38],'ɜː':[50,58],'ɔː':[84,55],'æ':[44,80],'ʌ':[66,72],'ɒ':[64,90],'ɑː':[88,92]};
const PAIRS=`iː|ɪ|sheep|ship
ɪ|e|bit|bet
e|æ|bed|bad
æ|ʌ|cat|cut
ɑː|ʌ|heart|hut
ʊ|uː|full|fool
ɒ|ɔː|cot|caught
eɪ|aɪ|late|light
əʊ|ɔː|boat|bought
θ|s|think|sink
ð|d|then|den
ʃ|tʃ|ship|chip
v|w|vine|wine
l|r|light|right`.split('\n').map(l=>{const[a,b,x,y]=l.split('|');return{a,b,x,y}});

const QB=`Which word contains the vowel sound /æ/?|Cat|Car|Cup|Cot|0|“cat” is /kæt/. “Car” has /ɑː/, “cup” has /ʌ/, “cot” has /ɒ/.|
Which word contains the diphthong /aɪ/?|Boy|Wait|My|Cow|2|“my” is /maɪ/. “Boy” has /ɔɪ/, “wait” has /eɪ/, “cow” has /aʊ/.|
What is the first sound in “shoe”?|/s/|/ʃ/|/tʃ/|/ʒ/|1|“shoe” is /ʃuː/, a voiceless fricative.|
The symbol /θ/ appears in which word?|This|Thin|Tin|Then|1|“thin” is /θɪn/. “This” and “then” start with the voiced /ð/.|
The weak, relaxed vowel /ə/ is called…|Schwa|Diphthong|Plosive|Fricative|0|/ə/ is the schwa, the most common vowel sound in English.|
How many monophthongs are in standard British English?|8|12|20|24|1|There are 12 monophthongs, 8 diphthongs and 24 consonants.|
Which of these is a long vowel?|/ɪ/|/iː/|/ʊ/|/e/|1|The mark ː shows length, so /iː/ is long.|
Listen and choose the word you hear.|sheep|ship|chip|sip|1|The word was “ship” /ʃɪp/, with the short vowel /ɪ/.|ship
Which word contains the diphthong /eɪ/?|Wait|Hair|Here|Coin|0|“wait” is /weɪt/. “Hair” has /eə/, “here” has /ɪə/, “coin” has /ɔɪ/.|
Which pair is a minimal pair?|ship – sheep|cat – dog|bed – table|my – cow|0|Minimal pairs differ by one sound only: /ʃɪp/ and /ʃiːp/.|
Which word contains the consonant /ŋ/?|Sing|Sin|Sit|Six|0|“sing” is /sɪŋ/, with the nasal /ŋ/ at the end.|
Which diphthong is in “coin”?|/ɔɪ/|/aɪ/|/eɪ/|/ʊə/|0|“coin” is /kɔɪn/.|`.split('\n').map(l=>{const a=l.split('|');return{q:a[0],o:a.slice(1,5),a:+a[5],x:a[6],say:a[7]}});

let user=ld('user',null),seen=new Set(ld('seen',[])),recd=new Set(ld('recd',[])),rate=ld('rate',{}),best=ld('best',0),escDone=ld('escDone',false),cur=null;
let admin=false;try{admin=sessionStorage.getItem('admin')==='1'}catch(e){}

/* audio */
let voice=null;
function pickVoice(){const v=speechSynthesis.getVoices();voice=v.find(x=>x.lang==='en-GB')||v.find(x=>x.lang.startsWith('en'))||null}
if(window.speechSynthesis){pickVoice();speechSynthesis.onvoiceschanged=pickVoice}
function say(w,r=.9){if(!window.speechSynthesis)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(w);u.lang='en-GB';if(voice)u.voice=voice;u.rate=r;speechSynthesis.speak(u)}

/* login + navigation */
$('lf').onsubmit=e=>{e.preventDefault();user={n:$('sn').value.trim(),no:$('sno').value};sv('user',user);enter();logEvent('login')};
function logout(){if(confirm('Are you sure you want to log out? This will clear your progress on this device.')){
 ['user','seen','recd','rate','best','escDone','qAtt'].forEach(k=>localStorage.removeItem(k));
 location.reload()
}}
const PAGES=[['home','Home'],['learn','Sounds'],['chart','Vowel Chart'],['pairs','Minimal Pairs'],['cards','Flashcards'],['quiz','Quiz'],['escape','Escape Room'],['port','Portfolio']];
const R={home:renderPath,learn:()=>renderLearn(true),chart:renderChart,pairs:renderPairs,cards:renderCard,quiz:startQuiz,escape:renderEscape,port:renderPort};
const GROUPS=[['Monophthong','Monophthongs'],['Diphthong','Diphthongs'],['Consonant','Consonants']];
const GATED=['chart','pairs','cards','quiz','escape'];
const cnt=k=>ALL.filter(x=>x.k===k).length,got=k=>ALL.filter(x=>x.k===k&&recd.has(x.s)).length,done=k=>got(k)===cnt(k);
const allDone=()=>GROUPS.every(g=>done(g[0]));
const gi=k=>GROUPS.findIndex(g=>g[0]===k);
const isOpen=k=>!REQUIRE_RECORDING||admin||gi(k)===0||done(GROUPS[gi(k)-1][0]);
const locked=id=>REQUIRE_RECORDING&&!admin&&GATED.includes(id)&&!allDone();
const firstOpen=()=>{const g=GROUPS.find(g=>!done(g[0]));return g?g[0]:GROUPS[GROUPS.length-1][0]};
function toast(m){const t=$('toast');t.textContent=m;t.classList.remove('hide');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.add('hide'),3000)}
function burst(){if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const c=el('div','','burst');($('dlg').open?$('dlg'):document.body).append(c);
 for(let i=0;i<30;i++){const p=el('i');p.style.cssText=`left:${45+Math.random()*10}%;--x:${(Math.random()-.5)*90}vw;--y:${-(18+Math.random()*34)}vh;--r:${Math.random()*720-360}deg;background:${['#14B8A6','#2DD4BF','#F8FAFC','#fde68a'][i%4]};animation-delay:${Math.random()*.12}s`;c.append(p)}
 setTimeout(()=>c.remove(),1900)}
function enter(){
 $('login').classList.add('hide');$('app').classList.remove('hide');$('wn').textContent=user.n;
 if(!$('nav').children.length){
  const groups = [
   { l: '', p: [['home','Home']] },
   { l: '📚 Materials', p: [['learn','Sounds'],['chart','Vowel Chart'],['pairs','Minimal Pairs']] },
   { l: '🎮 Games', p: [['cards','Flashcards'],['quiz','Quiz'],['escape','Escape Room']] },
   { l: '📈 Report', p: [['port','Portfolio']] }
  ];
  groups.forEach(g => {
   const wrap = el('div', '', 'nav-grp');
   if(g.l) wrap.append(el('span', g.l, 'nav-lbl'));
   g.p.forEach(([id,l]) => {
    const b = el('button', l); b.dataset.p = id; b.dataset.l = l; b.onclick = () => go(id);
    wrap.append(b);
   });
   $('nav').append(wrap);
  });
 }
 grp=firstOpen();adminUI();prog();go('home');
}
function navState(){document.querySelectorAll('#nav button').forEach(b=>{const lk=locked(b.dataset.p);b.disabled=lk;b.textContent=(lk?'🔒 ':'')+b.dataset.l;b.title=lk?'Record all 44 sounds to unlock':''})}
function go(id){if(locked(id)){toast('Record all 44 sounds, in order, to unlock this section.');return}
 document.querySelectorAll('.pg').forEach(p=>p.classList.toggle('on',p.id===id));
 document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.p===id));
 if(R[id])R[id]();window.scrollTo(0,0);const on=document.querySelector('#nav button.on');if(on&&on.scrollIntoView)on.scrollIntoView({inline:'center',block:'nearest'})}
function prog(){const n=recd.size,t=ALL.length;$('bar').style.width=n/t*100+'%';$('ptxt').textContent=`Recorded ${n} of ${t} sounds`;navState()}
function renderPath(){const p=$('path');p.innerHTML='<h3>Your learning path</h3>';
 GROUPS.forEach(([k,l],i)=>{const st=done(k)?'Complete':isOpen(k)?'In progress':'Locked';
  p.append(el('div',`<span><b>${i+1}. ${l}</b></span><span>${got(k)} of ${cnt(k)} recorded · ${st}</span>`,'step'))});
 p.append(el('div',`<span><b>4. Practice and games</b></span><span>${allDone()?'Unlocked':'Locked until all 44 sounds are recorded'}</span>`,'step'));
 const b=el('button',allDone()?'Go to the quiz':'Continue learning','btn pri');b.style.marginTop='14px';b.onclick=()=>go(allDone()?'quiz':'learn');p.append(b)}

/* sounds */
let grp='Monophthong',jump=null,lastRec=null,lastUnlock=null;
function renderLearn(anim){if(!isOpen(grp))grp=firstOpen();const s=$('seg');s.innerHTML='';
 GROUPS.forEach(([k,l])=>{const lk=!isOpen(k);const b=el('button',`${lk?'🔒 ':''}${l} (${got(k)}/${cnt(k)})`,(k===grp?'on':'')+(k===lastUnlock?' unl':''));
  b.disabled=lk;b.title=lk?'Record every sound in the previous group first':'';b.onclick=()=>{grp=k;renderLearn(true)};s.append(b)});
 const i=gi(grp),L=GROUPS[i][1].toLowerCase(),nx=GROUPS[i+1];
 $('lm').textContent=done(grp)?(nx?`All ${L} recorded. ${nx[1]} is unlocked.`:'All 44 sounds recorded. Vowel Chart, Minimal Pairs, Flashcards and Quiz are unlocked.')
  :`Tap a card, listen, then press Record yourself. Record all ${cnt(grp)} ${L} (${got(grp)} done) to unlock ${nx?nx[1]:'the quiz and practice sections'}.`;
 const g=$('grid');g.innerHTML='';g.classList.toggle('anim',!!anim);
 ALL.filter(x=>x.k===grp).forEach((x,n)=>{const r=recd.has(x.s);const b=el('button',`<b>/${x.s}/</b><span>${x.w}</span>${r?'<small>✓ recorded</small>':''}`,'card'+(r?' seen':'')+(x.s===lastRec?' just':''));b.style.setProperty('--i',n);b.onclick=()=>openD(x);g.append(b)});
 lastRec=null;lastUnlock=null}
function beat(){const d=$('dS');d.classList.remove('sp');void d.offsetWidth;d.classList.add('sp')}
function setSpeed(r){$('bN').classList.toggle('pri',r!==.5);$('bS').classList.toggle('pri',r===.5)}
function playD(r){setSpeed(r);say(cur.w,r);beat()}
function openD(x){cur=x;$('dK').textContent=x.k;$('dS').textContent='/'+x.s+'/';$('dW').textContent=x.w;$('dT').textContent='/'+x.t+'/';$('dTip').textContent=x.tip;
 $('ra').classList.add('hide');$('rd').classList.add('hide');$('rm2').textContent=recd.has(x.s)?'Recorded ✓':'';$('rb').textContent=recd.has(x.s)?'Record again':'Record yourself';setSpeed(.9);markRate();
 $('dlgRateHint').textContent = rate[cur.s] ? 'Your self-assessment:' : '💡 Rate your confidence to add this to your Portfolio!';
 seen.add(x.s);sv('seen',[...seen]);prog();$('dlg').showModal();say(x.w);beat()}
$('dlg').onclose=()=>{if(mr&&mr.state==='recording')mr.stop();if(jump){grp=jump;jump=null}if($('learn').classList.contains('on'))renderLearn()};
function markRate(){
 [...$('rt').children].forEach(b=>b.classList.toggle('on',rate[cur.s]===+b.dataset.v));
 if(rate[cur.s]) $('dlgRateHint').textContent = 'Your self-assessment:';
}
[...$('rt').children].forEach(b=>b.onclick=()=>{rate[cur.s]=+b.dataset.v;sv('rate',rate);markRate()});
let mr=null,ch=[];
async function rec(b){const x=cur;try{
 if(mr&&mr.state==='recording'){mr.stop();return}
 const st=await navigator.mediaDevices.getUserMedia({audio:true});mr=new MediaRecorder(st);ch=[];
 mr.ondataavailable=e=>ch.push(e.data);
 mr.onstop=()=>{b.classList.remove('recing');st.getTracks().forEach(t=>t.stop());const mt=mr.mimeType||'audio/webm',bl=new Blob(ch,{type:mt}),u=URL.createObjectURL(bl);
  if(bl.size<800){b.textContent=recd.has(x.s)?'Record again':'Record yourself';$('rm2').textContent='No sound was captured. Check your microphone and try again.';return}
  $('ra').src=u;$('ra').classList.remove('hide');const d=$('rd');d.href=u;d.download=`${user?user.no+'-'+user.n.replace(/\W+/g,'-'):'student'}-${x.w}.${mt.includes('mp4')?'m4a':'webm'}`;d.classList.remove('hide');b.textContent='Record again';
  const was=done(x.k);recd.add(x.s);lastRec=x.s;sv('recd',[...recd]);prog();
  let m='Recorded ✓ Compare your recording with the model audio.';
  if(!was&&done(x.k)){const i=gi(x.k),nx=GROUPS[i+1];logEvent('done-'+x.k,{explored:recd.size});burst();lastUnlock=nx?nx[0]:null;
   if(nx){jump=nx[0];m=`Recorded ✓ All ${GROUPS[i][1].toLowerCase()} done! ${nx[1]} is unlocked. Close this panel to continue.`}
   else m='Recorded ✓ All 44 sounds done! Vowel Chart, Minimal Pairs, Flashcards, Escape Room and Quiz are unlocked.'}
  $('rm2').textContent=m;
  if(!$('dlg').open&&$('learn').classList.contains('on')){if(jump){grp=jump;jump=null}renderLearn()}};
 mr.start();b.classList.add('recing');b.textContent='Stop recording'
}catch(e){$('rm2').textContent='Microphone is not available here. Allow microphone access or open the page in its own tab.'}}

/* admin override */
async function sha(t){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function adminUI(){const b=$('adm');b.textContent=admin?'Admin on · Log out':'Admin';b.classList.toggle('on',admin)}
function adminBtn(){if(admin){admin=false;try{sessionStorage.removeItem('admin')}catch(e){}adminUI();navState();go('home');toast('Admin mode off.');return}
 $('apw').value='';$('amsg').textContent='';$('adlg').showModal();$('apw').focus()}
$('af').onsubmit=async e=>{e.preventDefault();
 try{if(!window.crypto||!crypto.subtle)throw 0;
  if(await sha($('apw').value.trim().toLowerCase())===ADMIN_HASH){admin=true;try{sessionStorage.setItem('admin','1')}catch(x){}$('adlg').close();adminUI();navState();go('home');toast('Admin mode on. Every section is unlocked.')}
  else $('amsg').textContent='Wrong password.'
 }catch(x){$('amsg').textContent='Admin login needs https or localhost.'}};

/* vowel chart */
function renderChart(){const c=$('vc');if(!c.querySelector('.dot'))MONO.forEach((m,n)=>{const b=el('button','/'+m.s+'/','dot');b.style.setProperty('--i',n);b.style.left=POS[m.s][0]+'%';b.style.top=POS[m.s][1]+'%';b.onclick=()=>openD(m);c.append(b)});
 const d=$('dc');if(!d.children.length)DIPH.forEach(x=>{const b=el('button',`<b>/${x.s}/</b><small>${x.w}: ${x.tip}</small>`);b.onclick=()=>openD(x);d.append(b)})}

/* minimal pairs */
let PA=0,PW=[],pc=null,ok=0,tot=0,stk=0;
function renderPairs(){const l=$('pl');if(!l.children.length)PAIRS.forEach(p=>{const r=el('div','','pr');
  const a=el('button','Listen: '+p.x,'btn'),b=el('button','Listen: '+p.y,'btn');a.onclick=()=>say(p.x);b.onclick=()=>say(p.y);
  r.append(a,el('span',`/${p.a}/ vs /${p.b}/`),b);l.append(r)});nextPair()}
function nextPair(){pc=rnd(PAIRS);PW=[pc.x,pc.y];PA=Math.random()<.5?0:1;const o=$('pgo');o.innerHTML='';
 PW.forEach((w,i)=>{const b=el('button',`${w}<small>/${i?pc.b:pc.a}/</small>`,'opt');b.onclick=()=>{
   tot++;const good=i===PA;if(good){ok++;stk++}else stk=0;
   [...o.children].forEach((x,j)=>{x.disabled=true;if(j===PA)x.classList.add('ok');else if(j===i)x.classList.add('no')});
   $('pgm').textContent=good?'Correct!':`Not quite. You heard “${PW[PA]}”.`;$('pgs').textContent=`Score ${ok}/${tot}. Streak ${stk}.`};o.append(b)});
 $('pgm').textContent='Listen, then choose the word you hear.';say(PW[PA],.8)}

/* flashcards */
let deck=shuf(ALL),di=0,fl=0;
function renderCard(){const x=deck[di];$('fc').classList.toggle('flip',!!fl);$('fF').textContent='/'+x.s+'/';
 $('fB').innerHTML=`<b style="font-family:inherit;font-size:1.8rem">${x.w}</b><span class="ipa">/${x.t}/</span><small>${x.tip}</small>`;$('fn').textContent=`Card ${di+1} of ${deck.length}`}
function flipC(){fl=fl?0:1;$('fc').classList.toggle('flip',!!fl);if(fl)say(deck[di].w)}
function moveC(n){di=(di+n+deck.length)%deck.length;fl=0;renderCard()}

/* per-student question sets: seeded by the class number (absen) */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const seedOf=salt=>((parseInt(user&&user.no)||0)*2654435761+salt*40503+977)>>>0;
const sRnd=(r,a)=>a[Math.floor(r()*a.length)];
const sShuf=(r,a)=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const pickN=(r,a,n)=>sShuf(r,a).slice(0,n);
const uniq=(a,f)=>{const s=new Set();return a.filter(x=>{const k=f(x);if(s.has(k))return false;s.add(k);return true})};
const slash=s=>'/'+s+'/';
const KL={Monophthong:'vowel',Diphthong:'diphthong',Consonant:'consonant'};
const NOFIRST=['ʒ','ŋ'],COMP={'tʃ':['t','ʃ'],'dʒ':['d','ʒ']};
const ESC_D=ALL.filter(x=>!x.t.includes('ˈ'));
let qAtt=ld('qAtt',0);
const QG={
 word(r){const x=sRnd(r,ALL),d=pickN(r,uniq(ALL.filter(y=>y.w!==x.w&&!y.t.includes(x.s)),y=>y.w),3);
  return{q:`Which word contains the ${KL[x.k]} sound /${x.s}/?`,o:[x.w,...d.map(y=>y.w)],a:0,x:`“${x.w}” is /${x.t}/.`}},
 first(r){const L=CONS.filter(x=>!NOFIRST.includes(x.s)),x=sRnd(r,L),d=pickN(r,L.filter(y=>y!==x&&!(COMP[x.s]||[]).includes(y.s)),3);
  return{q:`Which symbol represents the first sound in “${x.w}”?`,o:[x.s,...d.map(y=>y.s)].map(slash),a:0,x:`“${x.w}” is /${x.t}/, so it starts with /${x.s}/.`}},
 vowel(r){const L=MONO.filter(x=>x.s!=='ə'),x=sRnd(r,L),d=pickN(r,L.filter(y=>y!==x),3);
  return{q:`Which symbol is the vowel sound in “${x.w}”?`,o:[x.s,...d.map(y=>y.s)].map(slash),a:0,x:`“${x.w}” is /${x.t}/.`}},
 diph(r){const L=DIPH.filter(x=>x.s!=='ʊə'),x=sRnd(r,L),d=pickN(r,DIPH.filter(y=>y!==x),3);
  return{q:`Which diphthong is in “${x.w}”?`,o:[x.s,...d.map(y=>y.s)].map(slash),a:0,x:`“${x.w}” is /${x.t}/.`}},
 type(r){const x=sRnd(r,ALL),O=['Monophthong','Diphthong','Consonant'];
  return{q:`What type of sound is /${x.s}/?`,o:O,a:O.indexOf(x.k),x:`/${x.s}/ is a ${x.k.toLowerCase()}, as in “${x.w}”.`}},
 voice(r){const x=sRnd(r,CONS);
  return{q:`Is the consonant /${x.s}/ voiced or voiceless?`,o:['Voiced','Voiceless'],a:x.tip.startsWith('Voiceless')?1:0,x:`/${x.s}/ in “${x.w}”: ${x.tip}`}},
 len(r){const x=sRnd(r,MONO.filter(x=>x.s!=='ə'));
  return{q:`Is the vowel /${x.s}/ long or short?`,o:['Long','Short'],a:x.tip.startsWith('Long')?0:1,x:`/${x.s}/ in “${x.w}”: ${x.tip}`}},
 listen(r){const p=sRnd(r,PAIRS),w=r()<.5?p.x:p.y,o=w===p.x?p.y:p.x,d=pickN(r,uniq(PAIRS.flatMap(z=>[z.x,z.y]).filter(z=>z!==p.x&&z!==p.y),z=>z),2);
  return{q:'Listen and choose the word you hear.',o:[w,o,...d],a:0,say:w,x:`The word was “${w}”.`}},
 intr(r){const x=sRnd(r,ALL),d=pickN(r,uniq(ALL.filter(y=>y.w!==x.w),y=>y.w),3);
  return{q:`Which word is written /${x.t}/ in IPA?`,o:[x.w,...d.map(y=>y.w)],a:0,x:`/${x.t}/ is “${x.w}”.`}},
 tr(r){const x=sRnd(r,ALL),d=pickN(r,uniq(ALL.filter(y=>y.t!==x.t),y=>y.t),3);
  return{q:`Which is the correct transcription of “${x.w}”?`,o:[x.t,...d.map(y=>y.t)].map(slash),a:0,x:`“${x.w}” is /${x.t}/.`}},
 tip(r){const L=ALL.filter(x=>ALL.filter(y=>y.tip===x.tip).length===1&&!x.tip.includes('/'+x.s+'/')),x=sRnd(r,L),d=pickN(r,ALL.filter(y=>y.k===x.k&&y!==x),3);
  return{q:`Which sound matches this description? “${x.tip}”`,o:[x.s,...d.map(y=>y.s)].map(slash),a:0,x:`/${x.s}/ as in “${x.w}”: ${x.tip}`}}
};
/* 10 questions per student: listening + 7 random question types + 2 from the general bank. Each attempt is a new set. */
function quizFor(){const r=mulberry32(seedOf(qAtt*97+1));
 const keys=[...sShuf(r,Object.keys(QG).filter(k=>k!=='listen')).slice(0,7),'listen'];
 return sShuf(r,[...keys.map(k=>QG[k](r)),...pickN(r,QB.filter(q=>!q.say),2)])}

/* quiz */
let qs=[],qi=0,sc=0,wr=[];
function startQuiz(){qs=quizFor();qi=0;sc=0;wr=[];$('qR').classList.add('hide');$('qBox').classList.remove('hide');showQ()}
function showQ(){const q=qs[qi];$('qn').textContent=`Question ${qi+1} of ${qs.length} · Set for class number ${user.no}`;$('qp').style.width=qi/qs.length*100+'%';
 $('qt').textContent=q.q;$('qf').textContent='';$('qx').classList.add('hide');$('qx').textContent=qi===qs.length-1?'See results':'Next question';
 $('qa').innerHTML='';if(q.say){const b=el('button','Play word','btn pri');b.onclick=()=>say(q.say,.8);$('qa').append(b);say(q.say,.8)}
 const o=$('qo');o.innerHTML='';
 shuf(q.o.map((t,j)=>({t,c:j===q.a}))).forEach((x,n)=>{const b=el('button','','opt');b.style.setProperty('--i',n);b.textContent=x.t;b.onclick=()=>{
  [...o.children].forEach(y=>y.disabled=true);
  if(x.c){sc++;b.classList.add('ok')}else{b.classList.add('no');wr.push(q);[...o.children].forEach(y=>{if(y.textContent===q.o[q.a])y.classList.add('ok')})}
  $('qf').textContent=(x.c?'Correct. ':'Not quite. ')+q.x;$('qx').classList.remove('hide')};o.append(b)})}
$('qx').onclick=()=>{qi++;qi<qs.length?showQ():finishQuiz()};
function finishQuiz(){$('qBox').classList.add('hide');$('qR').classList.remove('hide');best=Math.max(best,sc);sv('best',best);qAtt++;sv('qAtt',qAtt);logEvent('quiz',{score:sc,total:qs.length,explored:recd.size});
 $('rn').textContent=`${user.n} (class number ${user.no})`;$('rs').textContent=`${sc} / ${qs.length}`;
 $('rm').textContent=sc>=9?'Excellent! Your ears are well tuned.':sc>=7?'Good work. Review the sounds you missed.':'Keep practising. Revisit the Sounds and Minimal Pairs sections.';
 $('rw').innerHTML=wr.length?'<h3>Review</h3>'+wr.map(q=>`<p><b>${q.q}</b><br>${q.x}</p>`).join(''):''}

/* escape room: every class number gets its own puzzles and PIN */
let escS={pc:0,safe:0,radio:0,poster:0},EP=null;
function escPuz(){const r=mulberry32(seedOf(7777));
 const dg=[0,0,0,0].map(()=>Math.floor(r()*10));
 const L=CONS.filter(x=>!NOFIRST.includes(x.s)),fc=sRnd(r,L);
 const po=sShuf(r,[fc.s,...pickN(r,L.filter(y=>y!==fc&&!(COMP[fc.s]||[]).includes(y.s)),2).map(y=>y.s)]);
 const sf=sRnd(r,ESC_D),pr=sRnd(r,PAIRS),rw=r()<.5?pr.x:pr.y;
 const ro=sShuf(r,[pr.x,pr.y,sRnd(r,PAIRS.flatMap(z=>[z.x,z.y]).filter(z=>z!==pr.x&&z!==pr.y))]);
 const T=[['Monophthongs minus Diphthongs',4],['Consonants minus Diphthongs',16],['Consonants minus Monophthongs',12],['Monophthongs plus Diphthongs',20],['Consonants divided by Diphthongs',3],['Consonants divided by Monophthongs',2]];
 const t=sRnd(r,T),n=1+Math.floor(r()*9),pa=t[1]+n;
 const pop=sShuf(r,[pa,...pickN(r,[-3,-2,-1,1,2,3].map(d=>pa+d).filter(v=>v>0),2)]).map(String);
 return{dg,fc,po,sf,rw,ro,pq:`${t[0]}, then add ${n}`,pa:String(pa),pop}}
function renderEscape(){
 $('escIntro').classList.remove('hide');
 $('escGame').classList.add('hide');
 $('escDialog').classList.add('hide');
}
function escTap(id){const P=EP||(EP=escPuz()),d=$('escDialog');d.classList.remove('hide');let h='';
 const inp='style="padding:10px;margin:12px 0;border-radius:8px;border:1px solid var(--bd);background:var(--bg);color:var(--tx)"';
 if(id==='door'){
  h=`<h3>🚪 Main Door</h3><p>The door is locked with a digital keypad. Collect the 4 digits from the computer, safe, radio and poster, in that order.</p>
   <input id="escPin" type="text" inputmode="numeric" maxlength="4" placeholder="4-digit PIN" style="padding:10px;margin:12px 0;width:100%;max-width:220px;border-radius:8px;border:1px solid var(--bd);background:var(--bg);color:var(--tx);font-size:1.2rem;letter-spacing:4px">
   <br><button class="btn pri" onclick="escCheckPin()">Unlock Door</button> <p class="msg" id="escPinMsg" style="margin-top:10px"></p>`;
 }else if(id==='pc'){
  h=escS.pc?`<h3>💻 Computer</h3><p>Screen unlocked. <b>First digit: ${P.dg[0]}</b></p>`
   :`<h3>💻 Computer</h3><p>Password hint: Which symbol represents the first sound in “${P.fc.w}”?</p>
   <div class="opts">${P.po.map((s,i)=>`<button class="opt" onclick="escCheck('pc',${i})">/${s}/</button>`).join('')}</div>`;
 }else if(id==='safe'){
  h=escS.safe?`<h3>🗄️ Safe</h3><p>Safe opened. <b>Second digit: ${P.dg[1]}</b></p>`
   :`<h3>🗄️ Safe</h3><p>Type the English word for the transcription <b>/${P.sf.t}/</b></p>
   <input id="escSafeAns" type="text" placeholder="Word" ${inp} style="text-transform:lowercase"><br><button class="btn" onclick="escCheck('safe',$('escSafeAns').value.trim().toLowerCase())">Open Safe</button>`;
 }else if(id==='radio'){
  h=escS.radio?`<h3>📻 Radio</h3><p>Tuned in. <b>Third digit: ${P.dg[2]}</b></p>`
   :`<h3>📻 Radio</h3><p>Listen to the static broadcast and identify the word.</p>
   <button class="btn" onclick="say('${P.rw}',0.8)">Play Audio</button>
   <div class="opts" style="margin-top:16px">${P.ro.map((w,i)=>`<button class="opt" onclick="escCheck('radio',${i})">${w}</button>`).join('')}</div>`;
 }else if(id==='poster'){
  h=escS.poster?`<h3>📜 Poster</h3><p>Puzzle solved. <b>Fourth digit: ${P.dg[3]}</b></p>`
   :`<h3>📜 Poster</h3><p>A torn chart reads: Monophthongs = 12, Diphthongs = 8, Consonants = 24. <i>${P.pq}.</i></p>
   <div class="opts">${P.pop.map((v,i)=>`<button class="opt" onclick="escCheck('poster',${i})">${v}</button>`).join('')}</div>`;
 }
 d.innerHTML=h}
function escCheck(id,a){const P=EP;let ok=0;
 if(id==='pc'&&P.po[a]===P.fc.s){escS.pc=ok=1;toast('Correct! You found a clue.')}
 else if(id==='safe'&&a===P.sf.w){escS.safe=ok=1;toast('Safe unlocked!')}
 else if(id==='radio'&&P.ro[a]===P.rw){escS.radio=ok=1;toast('Correct word!')}
 else if(id==='poster'&&P.pop[a]===P.pa){escS.poster=ok=1;toast('Math correct!')}
 if(ok)escTap(id);else toast('Incorrect. Try again!')}
function escCheckPin(){const P=EP||(EP=escPuz());
 if($('escPin').value.trim()===P.dg.join('')){
  escDone=true;sv('escDone',true);
  $('escDialog').innerHTML=`<h3>🎉 You Escaped!</h3><p class="lead">Congratulations ${user.n}! You have successfully used your phonetics knowledge to escape the lab.</p><button class="btn pri" style="margin-top:10px" onclick="go('home')">Return Home</button>`;
  logEvent('escape_room');burst();
 }else{$('escPinMsg').textContent='Wrong PIN. The door remains locked.'}}

/* portfolio */
function renderPort(){
 $('pi').textContent=`${user.n} · Class number ${user.no}`;
 const L=['','Need practice','Getting there','Confident'],c=[0,0,0,0];
 ALL.forEach(x=>c[rate[x.s]||0]++);
 $('ps').innerHTML=`
  <div class="port-grid">
   <div class="port-card"><h3>🎙️ Sounds Recorded</h3><p class="big">${recd.size} <span style="font-size:1.1rem;color:var(--mu)">/ ${ALL.length}</span></p><p class="msg">Confident: ${c[3]} | Practice: ${c[1]}</p></div>
   <div class="port-card"><h3>📝 Quiz Score</h3><p class="big">${best} <span style="font-size:1.1rem;color:var(--mu)">/ 10</span></p><p class="msg">Your best attempt</p></div>
   <div class="port-card"><h3>🚪 Escape Room</h3><p class="big" style="font-size:${escDone?'1.4rem':'1.2rem'}; padding-top:10px; color:${escDone?'var(--ok)':'var(--no)'}">${escDone ? '🔓 Unlocked' : '🔒 Locked'}</p><p class="msg">${escDone ? 'Escaped the lab!' : 'Solve puzzles to escape'}</p></div>
  </div>
 `;
 const rated=ALL.filter(x=>rate[x.s]);
 $('pt').innerHTML=rated.length
  ? '<tr><th>Sound</th><th>Example</th><th>Self-assessment</th></tr>'+rated.map(x=>`<tr><td>/${x.s}/</td><td>${x.w}</td><td>${L[rate[x.s]]}</td></tr>`).join('')
  : `<tr><td colspan="3" style="text-align:center; padding:40px 20px; background:var(--hl); border-radius:12px; border:2px dashed var(--p); border-bottom: none;">
      <b style="font-size:1.3rem; color:var(--p2)">⚠️ Your Portfolio is Empty!</b><br><br>
      <span style="color:var(--tx); line-height:1.6">You haven't evaluated your pronunciation yet.<br>To build your portfolio and track your progress:</span><br><br>
      <span style="color:var(--mu); font-size:0.95rem">1. Go to the <b>📚 Sounds</b> section.<br>2. Tap on any sound card and listen.<br>3. Rate yourself using <b>Need practice</b>, <b>Getting there</b>, or <b>Confident</b>.</span>
     </td></tr>`;
}

if(user)enter();
