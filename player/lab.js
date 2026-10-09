// Interactive check tied to the learning goal: pick the right tool for each task (official guidance:
// structured integrations first, built-in browser for local web apps, Computer use for GUI-only work).
(function(){
 const KEYS={cu:'Computer use',plugin:'外掛／MCP',browser:'內建瀏覽器',shell:'Shell 指令'};
 const TASKS=[
  {q:'檢查本機開發中的網頁，在手機寬度下版面有沒有跑掉。',a:'browser',why:'官方建議：本機網頁應用程式優先用內建瀏覽器（@Browser）。'},
  {q:'確認簡報 App 裡每一頁的標題有沒有超出版面，這個 App 沒有外掛。',a:'cu',why:'需要用眼睛判斷畫面、又沒有結構化整合，正是 Computer use 的用途。'},
  {q:'從已安裝外掛的雲端試算表讀取 200 列資料。',a:'plugin',why:'有專屬外掛或 MCP 時，資料存取與重複操作優先用結構化整合，比看畫面更快更穩。'},
  {q:'把資料夾裡 80 個檔案依日期批次重新命名。',a:'shell',why:'檔案與指令能直接驗證結果；而且 Computer use 不能操作終端機 App。'}];
 const lab=document.getElementById('lab');if(!lab)return;
 let h='<h2>互動練習：這個任務該用哪一種工具？</h2><p class="fine">依官方文件的建議作答；每題可重選。</p><div class="lab-grid">';
 TASKS.forEach((t,i)=>{h+=`<div class="lab-card"><p><strong>${i+1}.</strong> ${t.q}</p><div class="choices" role="group" aria-label="第 ${i+1} 題選項">`+
  Object.entries(KEYS).map(([k,l])=>`<button type="button" data-i="${i}" data-k="${k}" aria-pressed="false">${l}</button>`).join('')+`</div><p class="feedback" id="fb${i}" aria-live="polite"></p></div>`});
 lab.innerHTML=h+'</div>';
 lab.addEventListener('click',e=>{const b=e.target.closest('button[data-i]');if(!b)return;const i=+b.dataset.i,t=TASKS[i],fb=document.getElementById('fb'+i);
  lab.querySelectorAll(`button[data-i="${i}"]`).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  const ok=b.dataset.k===t.a;fb.className='feedback '+(ok?'ok':'bad');fb.textContent=ok?'正確！'+t.why:'再想想：'+KEYS[b.dataset.k]+' 不是最適合的選擇。提示：'+t.why.split('：')[0]+'。'});
 window.labInfo={keys:Object.keys(KEYS),answers:TASKS.map(t=>t.a)};
})();
