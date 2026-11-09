const $=id=>document.getElementById(id);
/* Paste your Google Apps Script Web App URL (ends with /exec) between the quotes to record logins and quiz scores. */
const SHEET_URL='';
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

let user=ld('user',null),seen=new Set(ld('seen',[])),recd=new Set(ld('recd',[])),rate=ld('rate',{}),best=ld('best',0),cur=null;
let admin=false;try{admin=sessionStorage.getItem('admin')==='1'}catch(e){}

/* audio */
let voice=null;
function pickVoice(){const v=speechSynthesis.getVoices();voice=v.find(x=>x.lang==='en-GB')||v.find(x=>x.lang.startsWith('en'))||null}
if(window.speechSynthesis){pickVoice();speechSynthesis.onvoiceschanged=pickVoice}
function say(w,r=.9){if(!window.speechSynthesis)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(w);u.lang='en-GB';if(voice)u.voice=voice;u.rate=r;speechSynthesis.speak(u)}

/* login + navigation */
$('lf').onsubmit=e=>{e.preventDefault();user={n:$('sn').value.trim(),no:$('sno').value};sv('user',user);enter();logEvent('login')};
const PAGES=[['home','Home'],['learn','Sounds'],['chart','Vowel Chart'],['pairs','Minimal Pairs'],['cards','Flashcards'],['quiz','Quiz'],['port','Portfolio']];
const R={home:renderPath,learn:()=>renderLearn(true),chart:renderChart,pairs:renderPairs,cards:renderCard,quiz:startQuiz,port:renderPort};
const GROUPS=[['Monophthong','Monophthongs'],['Diphthong','Diphthongs'],['Consonant','Consonants']];
const GATED=['chart','pairs','cards','quiz'];
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
function enter(){$('login').classList.add('hide');$('app').classList.remove('hide');$('wn').textContent=user.n;
 if(!$('nav').children.length)PAGES.forEach(([id,l])=>{const b=el('button',l);b.dataset.p=id;b.dataset.l=l;b.onclick=()=>go(id);$('nav').append(b)});
 grp=firstOpen();adminUI();prog();go('home')}
function navState(){document.querySelectorAll('#nav button').forEach(b=>{const lk=locked(b.dataset.p);b.disabled=lk;b.textContent=(lk?'🔒 ':'')+b.dataset.l;b.title=lk?'Record all 44 sounds to unlock':''})}
function go(id){if(locked(id)){toast('Record all 44 sounds, in order, to unlock this section.');return}
 document.querySelectorAll('.pg').forEach(p=>p.classList.toggle('on',p.id===id));
 document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.p===id));
 if(R[id])R[id]();window.scrollTo(0,0);const on=document.querySelector('#nav button.on');if(on&&on.scrollIntoView)on.scrollIntoView({inline:'center',block:'nearest'})}
function prog(){const n=recd.size,t=ALL.length;$('bar').style.width=n/t*100+'%';$('ptxt').textContent=`Recorded ${n} of ${t} sounds`;navState()}
function renderPath(){const p=$('path');p.innerHTML='<h3>Your learning path</h3>';
 GROUPS.forEach(([k,l],i)=>{const st=done(k)?'Complete':isOpen(k)?'In progress':'Locked';
  p.append(el('div',`<span><b>${i+1}. ${l}</b></span><span>${got(k)} of ${cnt(k)} recorded · ${st}</span>`,'step'))});
 p.append(el('div',`<span><b>4. Practice and quiz</b></span><span>${allDone()?'Unlocked':'Locked until all 44 sounds are recorded'}</span>`,'step'));
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
 seen.add(x.s);sv('seen',[...seen]);prog();$('dlg').showModal();say(x.w);beat()}
$('dlg').onclose=()=>{if(mr&&mr.state==='recording')mr.stop();if(jump){grp=jump;jump=null}if($('learn').classList.contains('on'))renderLearn()};
function markRate(){[...$('rt').children].forEach(b=>b.classList.toggle('on',rate[cur.s]===+b.dataset.v))}
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
   else m='Recorded ✓ All 44 sounds done! Vowel Chart, Minimal Pairs, Flashcards and Quiz are unlocked.'}
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

/* quiz */
let qs=[],qi=0,sc=0,wr=[];
function startQuiz(){qs=shuf(QB).slice(0,10);qi=0;sc=0;wr=[];$('qR').classList.add('hide');$('qBox').classList.remove('hide');showQ()}
function showQ(){const q=qs[qi];$('qn').textContent=`Question ${qi+1} of ${qs.length}`;$('qp').style.width=qi/qs.length*100+'%';
 $('qt').textContent=q.q;$('qf').textContent='';$('qx').classList.add('hide');$('qx').textContent=qi===qs.length-1?'See results':'Next question';
 $('qa').innerHTML='';if(q.say){const b=el('button','Play word','btn pri');b.onclick=()=>say(q.say,.8);$('qa').append(b);say(q.say,.8)}
 const o=$('qo');o.innerHTML='';
 shuf(q.o.map((t,j)=>({t,c:j===q.a}))).forEach((x,n)=>{const b=el('button','','opt');b.style.setProperty('--i',n);b.textContent=x.t;b.onclick=()=>{
  [...o.children].forEach(y=>y.disabled=true);
  if(x.c){sc++;b.classList.add('ok')}else{b.classList.add('no');wr.push(q);[...o.children].forEach(y=>{if(y.textContent===q.o[q.a])y.classList.add('ok')})}
  $('qf').textContent=(x.c?'Correct. ':'Not quite. ')+q.x;$('qx').classList.remove('hide')};o.append(b)})}
$('qx').onclick=()=>{qi++;qi<qs.length?showQ():finishQuiz()};
function finishQuiz(){$('qBox').classList.add('hide');$('qR').classList.remove('hide');best=Math.max(best,sc);sv('best',best);logEvent('quiz',{score:sc,total:qs.length,explored:recd.size});
 $('rn').textContent=`${user.n} (class number ${user.no})`;$('rs').textContent=`${sc} / ${qs.length}`;
 $('rm').textContent=sc>=9?'Excellent! Your ears are well tuned.':sc>=7?'Good work. Review the sounds you missed.':'Keep practising. Revisit the Sounds and Minimal Pairs sections.';
 $('rw').innerHTML=wr.length?'<h3>Review</h3>'+wr.map(q=>`<p><b>${q.q}</b><br>${q.x}</p>`).join(''):''}

/* portfolio */
function renderPort(){$('pi').textContent=`${user.n} · Class number ${user.no}`;
 const L=['','Need practice','Getting there','Confident'],c=[0,0,0,0];
 ALL.forEach(x=>c[rate[x.s]||0]++);
 $('ps').innerHTML=`<p><b>Recorded:</b> ${recd.size} of ${ALL.length} sounds · <b>Best quiz score:</b> ${best}/10</p><p>Confident: ${c[3]} · Getting there: ${c[2]} · Need practice: ${c[1]} · Not rated: ${c[0]}</p>`;
 const rated=ALL.filter(x=>rate[x.s]);
 $('pt').innerHTML=rated.length?'<tr><th>Sound</th><th>Example</th><th>Self-assessment</th></tr>'+rated.map(x=>`<tr><td>/${x.s}/</td><td>${x.w}</td><td>${L[rate[x.s]]}</td></tr>`).join(''):'<tr><td colspan="3" style="font-family:inherit;color:var(--mu);font-weight:400">Open a sound and rate your confidence to build your portfolio.</td></tr>'}

if(user)enter();