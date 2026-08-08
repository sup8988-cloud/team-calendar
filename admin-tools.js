import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const cfg = window.APP_CONFIG || {};
const sb = createClient(String(cfg.SUPABASE_URL || "").trim(), String(cfg.SUPABASE_PUBLISHABLE_KEY || "").trim());
const ROLES = {
  "인사": ["#246BFD","인사 · Blue"],
  "감찰": ["#22A06B","감찰 · Green"],
  "교육": ["#F59E0B","교육 · Orange"],
  "안전": ["#7C3AED","안전 · Purple"],
};

const signupTab = document.querySelector("#signupTab");
if (signupTab) {
  signupTab.style.display = "none";
  signupTab.setAttribute("aria-hidden","true");
  signupTab.tabIndex = -1;
}
const loginTab = document.querySelector("#loginTab");
if (loginTab && !loginTab.classList.contains("is-active")) loginTab.click();

const css = document.createElement("style");
css.textContent = `
#teamAdminBackdrop{position:fixed;inset:0;z-index:190;display:grid;place-items:center;padding:22px;background:rgba(24,31,48,.48);backdrop-filter:blur(7px)}
#teamAdminBackdrop.is-hidden{display:none}.team-admin-card{width:min(100%,760px);max-height:calc(100vh - 44px);overflow:auto;box-sizing:border-box;padding:28px;border-radius:26px;background:#fff;box-shadow:0 30px 90px rgba(26,34,56,.32)}
.team-admin-head{display:flex;justify-content:space-between;gap:18px;margin-bottom:18px}.team-admin-head h2{margin:0;font-size:26px;color:#172033}.team-admin-head p{margin:8px 0 0;color:#738096;font-size:13px;line-height:1.6}
.team-admin-close{width:42px;height:42px;border:1px solid #dfe6f1;border-radius:12px;background:#fff;font-size:26px;cursor:pointer}.team-admin-status{min-height:20px;margin:0 0 14px;color:#d14343;font-size:13px}.team-admin-status.success{color:#16845b}
.team-admin-grid{display:grid;gap:14px}.team-member-card{border:1px solid #e1e7f0;border-radius:18px;padding:18px;background:#fbfcff}.team-member-top{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px}
.team-role{display:flex;align-items:center;gap:9px;font-size:17px;font-weight:900}.team-role-dot{width:12px;height:12px;border-radius:50%;background:var(--role-color)}.team-state{padding:6px 10px;border-radius:999px;font-size:11px;font-weight:850;background:#edf1f7;color:#647086}.team-state.ok{background:#e6f6ef;color:#116647}
.team-email{margin:-2px 0 13px;color:#58657b;font-size:13px;word-break:break-all}.team-form{display:grid;grid-template-columns:1fr 1fr auto;gap:9px;align-items:end}.team-field{display:grid;gap:6px}.team-field label{font-size:11px;font-weight:800;color:#566176}
.team-field input{width:100%;min-height:43px;box-sizing:border-box;padding:0 12px;border:1px solid #d7e0ef;border-radius:11px;font:inherit}.team-action{min-height:43px;padding:0 14px;border:1px solid #246BFD;border-radius:11px;background:#246BFD;color:#fff;font-weight:850;cursor:pointer}.team-action.reset{background:#fff;color:#27324a;border-color:#d6deea}
.team-note{margin:16px 0 0;padding:13px 14px;border-radius:13px;background:#f5f8ff;color:#69758a;font-size:12px;line-height:1.55}
@media(max-width:720px){#teamAdminBackdrop{align-items:end;padding:0}.team-admin-card{width:100%;max-height:92vh;padding:22px 16px calc(22px + env(safe-area-inset-bottom));border-radius:24px 24px 0 0}.team-form{grid-template-columns:1fr}.team-action{width:100%}}
`;
document.head.append(css);

const backdrop = document.createElement("div");
backdrop.id = "teamAdminBackdrop";
backdrop.className = "is-hidden";
backdrop.innerHTML = `<section class="team-admin-card" role="dialog" aria-modal="true">
<div class="team-admin-head"><div><h2>직원 계정 관리</h2><p>팀장 전용 기능입니다. 비어 있는 담당 계정을 만들거나 기존 담당자의 비밀번호를 초기화할 수 있습니다.</p></div><button id="teamAdminClose" class="team-admin-close">×</button></div>
<p id="teamAdminStatus" class="team-admin-status"></p><div id="teamAdminGrid" class="team-admin-grid"></div>
<p class="team-note">담당별 계정은 1개만 유지합니다. 담당자가 바뀌면 계정을 삭제하지 말고 비밀번호를 초기화해 인계하세요.</p></section>`;
document.body.append(backdrop);

const menu = document.querySelector("#userMenuPanel");
const menuButton = document.querySelector("#userMenuButton");
const logoutButton = document.querySelector("#logoutButton");
const grid = document.querySelector("#teamAdminGrid");
const status = document.querySelector("#teamAdminStatus");
let adminButton = null;

function msg(t="",ok=false){status.textContent=t;status.classList.toggle("success",ok)}
async function call(body){
  const {data,error}=await sb.functions.invoke("team-admin",{body});
  if(error){
    try{ if(error.context?.json){const b=await error.context.json();throw new Error(b.error||b.message||error.message)} }catch(e){if(e.message) throw e}
    throw error;
  }
  if(!data?.ok) throw new Error(data?.error||"요청 실패");
  return data;
}
function render(accounts){
  const map=new Map(accounts.map(x=>[x.role,x])); grid.innerHTML="";
  Object.entries(ROLES).forEach(([role,[color,label]])=>{
    const a=map.get(role)||{registered:false};
    const el=document.createElement("article"); el.className="team-member-card"; el.style.setProperty("--role-color",color);
    el.innerHTML=a.registered?`
      <div class="team-member-top"><div class="team-role"><span class="team-role-dot"></span>${label}</div><span class="team-state ok">등록됨</span></div>
      <p class="team-email">${a.email||""}</p>
      <form class="team-form" data-reset="${role}">
        <div class="team-field" style="grid-column:span 2"><label>새 임시 비밀번호</label><input name="password" type="password" minlength="8" required placeholder="8자 이상"></div>
        <button class="team-action reset">비밀번호 초기화</button>
      </form>`:`
      <div class="team-member-top"><div class="team-role"><span class="team-role-dot"></span>${label}</div><span class="team-state">미등록</span></div>
      <form class="team-form" data-create="${role}">
        <div class="team-field"><label>직원 이메일</label><input name="email" type="email" required></div>
        <div class="team-field"><label>초기 비밀번호</label><input name="password" type="password" minlength="8" required placeholder="8자 이상"></div>
        <button class="team-action">계정 생성</button>
      </form>`;
    grid.append(el);
  });
  grid.querySelectorAll("[data-create]").forEach(f=>f.onsubmit=async e=>{
    e.preventDefault(); const role=f.dataset.create,email=f.email.value.trim(),password=f.password.value;
    if(password.length<8)return msg("초기 비밀번호는 8자 이상이어야 합니다.");
    if(!confirm(`${role} 계정을 생성할까요?`))return;
    try{msg("계정 생성 중…");await call({action:"create",role,email,password});msg(`${role} 계정 생성 완료`,true);await load()}catch(x){msg(x.message)}
  });
  grid.querySelectorAll("[data-reset]").forEach(f=>f.onsubmit=async e=>{
    e.preventDefault(); const role=f.dataset.reset,password=f.password.value;
    if(password.length<8)return msg("임시 비밀번호는 8자 이상이어야 합니다.");
    if(!confirm(`${role} 비밀번호를 강제로 초기화할까요?`))return;
    try{msg("비밀번호 초기화 중…");const r=await call({action:"reset_password",role,password});msg(r.sessions_revoked===false?`${role} 비밀번호는 변경됐지만 기존 세션 정리는 확인이 필요합니다.`:`${role} 비밀번호 초기화 완료`,r.sessions_revoked!==false);f.reset()}catch(x){msg(x.message)}
  });
}
async function load(){grid.innerHTML="<div style='padding:18px;color:#738096'>불러오는 중…</div>";try{const d=await call({action:"list"});render(d.accounts||[])}catch(e){grid.innerHTML="";msg(e.message)}}
async function open(){menu?.classList.add("is-hidden");menuButton?.setAttribute("aria-expanded","false");msg("");backdrop.classList.remove("is-hidden");document.body.style.overflow="hidden";await load()}
function close(){backdrop.classList.add("is-hidden");document.body.style.overflow="";msg("")}
document.querySelector("#teamAdminClose").onclick=close; backdrop.onclick=e=>{if(e.target===backdrop)close()};

async function refresh(){
  const {data:{session}}=await sb.auth.getSession();
  if(!session?.user){adminButton?.remove();adminButton=null;return}
  const {data:p}=await sb.from("profiles").select("display_name").eq("id",session.user.id).maybeSingle();
  if(p?.display_name!=="팀장"){adminButton?.remove();adminButton=null;return}
  if(menu&&logoutButton&&!document.querySelector("#teamAdminButton")){
    adminButton=document.createElement("button");adminButton.id="teamAdminButton";adminButton.type="button";adminButton.textContent="직원 계정 관리";
    menu.insertBefore(adminButton,logoutButton);adminButton.onclick=open;
  }
}
refresh();
sb.auth.onAuthStateChange((ev)=>{if(ev==="SIGNED_IN"||ev==="INITIAL_SESSION"||ev==="TOKEN_REFRESHED")setTimeout(refresh,0);if(ev==="SIGNED_OUT"){adminButton?.remove();adminButton=null;close()}});
