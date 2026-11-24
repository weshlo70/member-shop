const API_URL =
  "https://script.google.com/macros/s/AKfycbzoiQXbZQt12Ez_2yz2aQo4guCJwrmggYgGZr2XhB1N0xXXXH7qLUmp4-9xzDhMCvtN/exec";
const $ = id => document.getElementById(id);
const token = localStorage.getItem('adminToken');
if (!token) location.replace('admin.html');
let busy = false;
async function api(action, extra={}) {
  const response = await fetch(API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({action,token,...extra}),cache:'no-store'});
  const result = await response.json();
  if (!result.success) throw new Error(result.message || '操作失敗');
  return result;
}
function clearDetail(){ $('detail').hidden=true; $('fields').replaceChildren(); }
$('close').onclick=clearDetail;
async function run(fn){
  if(busy || !token) return;
  busy=true; $('submit').disabled=true;
  try { await fn(); } catch(e){ $('message').textContent=e.message; }
  finally {busy=false; $('submit').disabled=false;}
}
$('search').onsubmit=e=>{e.preventDefault();run(async()=>{
  clearDetail(); $('results').replaceChildren(); $('message').textContent='查詢中…';
  const r=await api('adminMemberSearch',{field:$('field').value,query:$('query').value.trim()});
  $('message').textContent=`顯示 ${r.members.length} 筆`+(r.truncated?'，請縮小查詢條件。':'');
  for(const m of r.members){
    const tr=document.createElement('tr');
    for(const k of ['memberId','name','phone','balance','status']){const td=tr.insertCell();td.textContent=m[k];}
    const b=document.createElement('button');b.textContent='詳情';b.onclick=()=>run(async()=>{
      clearDetail(); const d=await api('adminMemberDetail',{query:m.memberId});
      const labels={memberId:'會員編號',name:'姓名',phone:'電話',email:'Email',balance:'餘額',status:'狀態',createdAt:'建立時間',lastLogin:'最後登入'};
      for(const [k,label] of Object.entries(labels)){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=d.members[0][k]||'—';$('fields').append(dt,dd);}
      $('detail').hidden=false;
    });tr.insertCell().append(b);$('results').append(tr);
  }
});};
$('logout').onclick=async()=>{try{await api('adminLogout');}catch(e){$('message').textContent='伺服器登出失敗，已清除本機登入。';}finally{localStorage.removeItem('adminToken');location.replace('admin.html');}};
