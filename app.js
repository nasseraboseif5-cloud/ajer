const pageContent=document.getElementById('pageContent');
const contentPanel=document.getElementById('contentPanel');
const sections=document.getElementById('sections');
const pages={
 audio:['استماع القرآن','واجهة مشغل التلاوات جاهزة للتطوير. لم نضف روابط صوتية قبل التحقق من مصدرها وعملها.'],
 hadith:['الأحاديث النبوية','سيُضاف مكتبة أحاديث مع نص الحديث والمصدر ورقم الحديث ودرجة الصحة بعد مراجعة البيانات. لا توجد أحاديث تجريبية منسوبة للنبي ﷺ في هذه النسخة.'],
 dua:['الأدعية','سيتم تنظيم الأدعية بحسب مصدرها: أدعية قرآنية، وأدعية نبوية موثقة، وأدعية عامة دون نسبتها إلى السنة.'],
 adhkar:['الأذكار','سيتم إدراج أذكار الصباح والمساء وبعد الصلاة والنوم مع عدد التكرار والمصدر بعد المراجعة.'],
 qibla:['اتجاه القبلة','ميزة تحديد القبلة تحتاج إذن الموقع ودعم البوصلة في الجهاز. لم يتم تفعيل حساب الاتجاه في هذه النسخة.'],
 saved:['المحفوظات','يمكنك حفظ العناصر بعد تفعيل مكتبات المحتوى الموثقة في النسخة التالية.']
};
document.querySelectorAll('[data-page]').forEach(btn=>btn.addEventListener('click',()=>openPage(btn.dataset.page)));
function openPage(key){
 contentPanel.hidden=false; sections.hidden=true;
 if(key==='tasbeeh'){renderTasbeeh();return}
 if(key==='quran'){renderQuran();return}
 const p=pages[key]||pages.saved;
 pageContent.innerHTML=`<div class="page-card"><h2>${p[0]}</h2><p>${p[1]}</p><div class="notice">هذه نسخة تأسيسية للواجهة. لن نعرض محتوى دينيًا غير موثق أو ندّعي اكتمال ميزة لم يتم تنفيذها.</div></div>`;
 contentPanel.scrollIntoView({behavior:'smooth'});
}
document.getElementById('backBtn').addEventListener('click',()=>{contentPanel.hidden=true;sections.hidden=false;sections.scrollIntoView({behavior:'smooth'})});
function renderTasbeeh(){
 const saved=Number(localStorage.getItem('tasbeehCount')||0);
 pageContent.innerHTML=`<div class="page-card"><h2>السبحة الإلكترونية</h2><p>اختر الذكر وابدأ العدّ، وسيُحفظ العدد على هذا الجهاز.</p><select class="select-input" id="dhikr"><option>سبحان الله</option><option>الحمد لله</option><option>الله أكبر</option><option>أستغفر الله</option><option>لا إله إلا الله</option></select><div class="tasbeeh-count" id="count">${saved}</div><div class="tasbeeh-actions"><button class="action-btn" id="plus">تسبيحة +</button><button class="action-btn secondary" id="reset">تصفير العداد</button></div></div>`;
 let n=saved;document.getElementById('plus').onclick=()=>{n++;document.getElementById('count').textContent=n;localStorage.setItem('tasbeehCount',n)};
 document.getElementById('reset').onclick=()=>{n=0;document.getElementById('count').textContent=n;localStorage.setItem('tasbeehCount',n)};
 contentPanel.scrollIntoView({behavior:'smooth'});
}
async function renderQuran(){
 pageContent.innerHTML=`<div class="page-card"><h2>القرآن الكريم</h2><p>اختر سورة لعرض نصها بالرسم العثماني عند توفر الإنترنت.</p><select class="select-input" id="surahSelect"><option>جارٍ تحميل فهرس السور...</option></select><div id="quranText"></div><p class="notice">تنبيه: هذه النسخة لا تتضمن بعد تقسيم المصحف إلى صفحات المدينة الـ604 أو بيانات الأجزاء والأحزاب أو التفسير. يجب مراجعة مطابقة النص ومصدره قبل الاعتماد.</p></div>`;
 contentPanel.scrollIntoView({behavior:'smooth'});
 const select=document.getElementById('surahSelect');
 try{
  const res=await fetch('https://api.alquran.cloud/v1/surah');
  if(!res.ok) throw new Error('network');
  const json=await res.json();
  select.innerHTML=json.data.map(s=>`<option value="${s.number}">${s.number}. ${s.name}</option>`).join('');
  select.onchange=()=>loadSurah(select.value);
  const last=localStorage.getItem('lastSurah')||'1';select.value=last;await loadSurah(last);
 }catch(e){select.innerHTML='<option>تعذر تحميل الفهرس — تحقق من الاتصال</option>'}
}
async function loadSurah(n){
 const box=document.getElementById('quranText');box.innerHTML='<p>جارٍ تحميل السورة...</p>';
 try{
  const res=await fetch(`https://api.alquran.cloud/v1/surah/${n}/quran-uthmani`);
  if(!res.ok) throw new Error();
  const json=await res.json();localStorage.setItem('lastSurah',n);
  box.innerHTML=`<h3 style="text-align:center;font-family:Amiri,serif">${json.data.name}</h3>`+json.data.ayahs.map(a=>`<span class="ayah">${a.text} <small style="color:#b08a42">۞${a.numberInSurah}</small></span>`).join('');
 }catch(e){box.innerHTML='<p class="notice">تعذر تحميل نص السورة. حاول مرة أخرى عند توفر الإنترنت.</p>'}
}
document.getElementById('themeBtn').addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('darkMode',document.body.classList.contains('dark'))});
if(localStorage.getItem('darkMode')==='true')document.body.classList.add('dark');
document.getElementById('menuBtn').addEventListener('click',()=>document.getElementById('sections').scrollIntoView({behavior:'smooth'}));
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
