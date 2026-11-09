// ▼ Apps Script 웹앱 배포 URL을 여기에 붙여넣으세요
const API_URL = "https://script.google.com/macros/s/AKfycbxm4PivrM9A61MqHyY4QQiQqSWXMANxIFbZIx3KRzY3A0ChSUpp1wjoYyPzRDykzJpB/exec";

const SEC=20, $=id=>document.getElementById(id);
let n,i,score,right,deadline,raf,locked,user,sid;

// 정답 판정은 서버가 합니다. 화면에는 문제와 보기만 내려옵니다.
const api=b=>fetch(API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(b)}).then(r=>r.json()).then(d=>{if(!d.ok)throw 0;return d});

function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('on',s.id===id))}
function fmtPhone(v){v=v.replace(/\D/g,'').slice(0,11);return v.length>7?v.replace(/(\d{3})(\d{4})(\d+)/,'$1-$2-$3'):v.length>3?v.replace(/(\d{3})(\d+)/,'$1-$2'):v}
$('phone').addEventListener('input',e=>e.target.value=fmtPhone(e.target.value));

$('go').onclick=async()=>{
  const name=$('name').value.trim(), phone=$('phone').value.replace(/\D/g,'');
  if(!name) return $('err').textContent='이름을 입력해 주세요.';
  if(!/^01\d{8,9}$/.test(phone)) return $('err').textContent='연락처를 010으로 시작하는 번호로 입력해 주세요.';
  if(!$('agree').checked) return $('err').textContent='개인정보 수집에 동의해 주세요.';
  $('err').textContent=''; user={name,phone}; $('go').disabled=true;
  try{
    const d=await api({action:'start',name,phone});
    sid=d.sid;n=d.n;i=0;score=0;right=0;ask(d.question);
  }catch(e){$('err').textContent='서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.'}
  $('go').disabled=false;
};

function ask(q){
  locked=false;
  $('qn').textContent=`${i+1} / ${n}`; $('qt').textContent=q.q;
  $('opts').innerHTML='';
  q.o.forEach((t,k)=>{const b=document.createElement('button');b.className='opt';b.textContent=t;b.onclick=()=>pick(k);$('opts').append(b)});
  deadline=performance.now()+SEC*1000; show('s-q'); tick();
}
function tick(){
  const left=Math.max(0,deadline-performance.now());
  $('tm').textContent=Math.ceil(left/1000)+'초';
  $('bar').firstElementChild.style.transform=`scaleX(${left/(SEC*1000)})`;
  $('bar').classList.toggle('low',left<5000);
  if(left<=0) return pick(-1);
  raf=requestAnimationFrame(tick);
}
async function pick(k){
  if(locked) return; locked=true; cancelAnimationFrame(raf);
  $('tm').textContent='확인 중';
  try{
    const d=await api({action:'answer',sid,choice:k});
    score=d.score; right=d.right;
    $('an').textContent=`${i+1} / ${n}`; $('pt').textContent=`현재 ${score}점`;
    const v=$('vd'); v.className='verdict '+(d.correct?'ok':'no');
    v.textContent=d.correct?`정답! +${d.gain}점`:(k<0?'시간 초과':'아쉬워요');
    $('at').textContent='정답: '+d.answer; $('ex').textContent=d.explanation;
    $('next').textContent=i+1<n?'다음 문제':'결과 보기';
    show('s-a');
  }catch(e){alert('연결이 끊겼어요. 처음 화면으로 돌아갑니다.');show('s-start')}
}
$('next').onclick=async()=>{
  if(i+1>=n) return finish();
  $('next').disabled=true;
  try{const d=await api({action:'next',sid}); i++; ask(d.question)}
  catch(e){alert('연결이 끊겼어요. 처음 화면으로 돌아갑니다.');show('s-start')}
  $('next').disabled=false;
};

async function finish(){
  $('rwho').textContent=`${user.name}님의 점수`; $('rs').textContent=score+'점';
  $('rsub').textContent=`${n}문제 중 ${right}문제 정답`;
  $('board').innerHTML=''; $('rnote').textContent='기록을 저장하는 중...'; show('s-r');
  try{
    const d=await api({action:'finish',sid});
    d.top.forEach((x,k)=>{const l=document.createElement('li');if(x.me)l.className='me';
      l.innerHTML='<span class="n"></span><span class="nm"></span><span class="s"></span>';
      l.children[0].textContent=k+1;l.children[1].textContent=x.name;l.children[2].textContent=x.score+'점';$('board').append(l)});
    $('rnote').textContent=`이번 주 내 순위: ${d.rank}위 (내 최고 점수 기준, 참가자 ${d.total}명)`;
  }catch(e){$('rnote').textContent='기록 저장에 실패했어요. 담당자에게 문의해 주세요.'}
}
$('again').onclick=()=>{$('agree').checked=true;$('go').click()};Ï
