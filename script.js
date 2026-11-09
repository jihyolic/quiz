// ▼ Apps Script 웹앱 배포 URL을 여기에 붙여넣으세요
const API_URL = "https://script.google.com/macros/s/AKfycbxm4PivrM9A61MqHyY4QQiQqSWXMANxIFbZIx3KRzY3A0ChSUpp1wjoYyPzRDykzJpB/exec";

const BANK = [
 {q:"혈액검사(공복 혈당·콜레스테롤)를 위해 검진 전 최소 몇 시간 금식해야 할까요?",o:["2시간","4시간","8시간","12시간 이상"],a:2,e:"정확한 혈당과 지질 수치를 위해 최소 8시간 이상 공복을 유지하세요. 물은 소량 마셔도 괜찮습니다."},
 {q:"정상 혈압의 수축기(최고) 혈압 기준은?",o:["100mmHg 미만","120mmHg 미만","140mmHg 미만","160mmHg 미만"],a:1,e:"정상 혈압은 수축기 120mmHg 미만이면서 이완기 80mmHg 미만입니다. 140/90 이상이면 고혈압입니다."},
 {q:"국가 위암검진은 만 몇 세 이상부터 2년마다 받을 수 있을까요?",o:["30세","40세","50세","60세"],a:1,e:"위암검진(위내시경 또는 위장조영검사)은 만 40세 이상이면 2년마다 대상입니다."},
 {q:"국가 대장암검진(분변잠혈검사)은 만 몇 세 이상부터 시작할까요?",o:["30세","40세","50세","60세"],a:2,e:"대장암검진은 만 50세 이상이 대상이며, 분변잠혈검사를 1년마다 받고 양성이면 대장내시경을 합니다."},
 {q:"공복혈당이 몇 mg/dL 이상이면 당뇨병을 의심할까요?",o:["100","110","126","200"],a:2,e:"공복혈당 126mg/dL 이상이면 당뇨병 의심입니다. 100~125는 공복혈당장애(당뇨병 전단계)예요."},
 {q:"한국 기준 비만(BMI) 판정 기준은?",o:["18.5 이상","23 이상","25 이상","30 이상"],a:2,e:"대한비만학회 기준 BMI 25 이상이 비만이며, 23~24.9는 과체중(비만 전단계)입니다."},
 {q:"한국 남성의 복부비만 허리둘레 기준은?",o:["80cm 이상","85cm 이상","90cm 이상","100cm 이상"],a:2,e:"남성 90cm, 여성 85cm 이상이면 복부비만입니다. 대사증후군 진단 기준 중 하나예요."},
 {q:"WHO가 권고하는 하루 소금 섭취량은?",o:["3g 미만","5g 미만","10g 미만","15g 미만"],a:1,e:"WHO는 하루 소금 5g(나트륨 2,000mg) 미만을 권고합니다. 라면 한 그릇만 먹어도 이를 넘기기 쉬워요."},
 {q:"성인에게 권장되는 일주일 중강도 유산소 운동 시간은 최소 얼마일까요?",o:["30분","90분","150분","300분"],a:2,e:"WHO는 주 150분 이상 중강도 유산소 운동을 권장합니다. 하루 30분씩 5일이면 채울 수 있어요."},
 {q:"성인의 하루 권장 수면 시간은?",o:["4~5시간","5~6시간","7~9시간","10~12시간"],a:2,e:"성인은 하루 7~9시간 수면이 권장됩니다. 수면이 부족하면 혈압·혈당 관리에도 불리해요."}
];
const SEC=20, $=id=>document.getElementById(id);
let qs,i,score,right,deadline,raf,locked,user;

function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('on',s.id===id))}
function shuffle(a){a=a.slice();for(let k=a.length-1;k>0;k--){const j=Math.random()*(k+1)|0;[a[k],a[j]]=[a[j],a[k]]}return a}
function fmtPhone(v){v=v.replace(/\D/g,'').slice(0,11);return v.length>7?v.replace(/(\d{3})(\d{4})(\d+)/,'$1-$2-$3'):v.length>3?v.replace(/(\d{3})(\d+)/,'$1-$2'):v}
$('phone').addEventListener('input',e=>e.target.value=fmtPhone(e.target.value));

$('go').onclick=()=>{
  const name=$('name').value.trim(), phone=$('phone').value.replace(/\D/g,'');
  if(!name) return $('err').textContent='이름을 입력해 주세요.';
  if(!/^01\d{8,9}$/.test(phone)) return $('err').textContent='연락처를 010으로 시작하는 번호로 입력해 주세요.';
  if(!$('agree').checked) return $('err').textContent='개인정보 수집에 동의해 주세요.';
  $('err').textContent=''; user={name,phone};
  qs=shuffle(BANK).map(x=>{const c=x.o[x.a];const o=shuffle(x.o);return{q:x.q,o,a:o.indexOf(c),e:x.e}});
  i=0;score=0;right=0;ask();
};

function ask(){
  const q=qs[i]; locked=false;
  $('qn').textContent=`${i+1} / ${qs.length}`; $('qt').textContent=q.q;
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
function pick(k){
  if(locked) return; locked=true; cancelAnimationFrame(raf);
  const q=qs[i], left=Math.max(0,deadline-performance.now()), ok=k===q.a;
  let gain=0; if(ok){gain=100+Math.ceil(left/1000)*5; score+=gain; right++}
  $('an').textContent=`${i+1} / ${qs.length}`; $('pt').textContent=`현재 ${score}점`;
  const v=$('vd'); v.className='verdict '+(ok?'ok':'no');
  v.textContent=ok?`정답! +${gain}점`:(k<0?'시간 초과':'아쉬워요');
  $('at').textContent='정답: '+q.o[q.a]; $('ex').textContent=q.e;
  $('next').textContent=i+1<qs.length?'다음 문제':'결과 보기';
  show('s-a');
}
$('next').onclick=()=>{ if(++i<qs.length) ask(); else finish(); };

async function finish(){
  $('rwho').textContent=`${user.name}님의 점수`; $('rs').textContent=score+'점';
  $('rsub').textContent=`${qs.length}문제 중 ${right}문제 정답`;
  $('board').innerHTML=''; $('rnote').textContent='기록을 저장하는 중...'; show('s-r');
  if(!API_URL){$('rnote').textContent='테스트 모드: 점수 서버(API_URL)가 연결되지 않았어요.';return}
  try{
    const r=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({name:user.name,phone:user.phone,score,right})});
    const d=await r.json(); if(!d.ok) throw 0;
    d.top.forEach((x,n)=>{const l=document.createElement('li');if(x.me)l.className='me';
      l.innerHTML='<span class="n"></span><span class="nm"></span><span class="s"></span>';
      l.children[0].textContent=n+1;l.children[1].textContent=x.name;l.children[2].textContent=x.score+'점';$('board').append(l)});
    $('rnote').textContent=`이번 주 내 순위: ${d.rank}위 (내 최고 점수 기준, 참가자 ${d.total}명)`;
  }catch(e){$('rnote').textContent='기록 저장에 실패했어요. 담당자에게 문의해 주세요.'}
}
$('again').onclick=()=>{$('agree').checked=true;$('go').click()};
