import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const config = window.APP_CONFIG || {};
const supabaseUrl = String(config.SUPABASE_URL || "").trim();
const publishableKey = String(config.SUPABASE_PUBLISHABLE_KEY || "").trim();

if (!supabaseUrl || !publishableKey) {
  console.warn("[비밀번호 변경] Supabase 연결 설정을 찾지 못했습니다.");
} else {
  const passwordClient = createClient(supabaseUrl, publishableKey);

  const style = document.createElement("style");
  style.textContent = `
    #passwordChangeBackdrop {
      position: fixed;
      inset: 0;
      z-index: 180;
      display: grid;
      place-items: center;
      padding: 22px;
      background: rgba(24, 31, 48, .46);
      backdrop-filter: blur(6px);
    }
    #passwordChangeBackdrop.is-hidden { display: none; }
    .password-change-card {
      width: min(100%, 470px);
      max-height: calc(100vh - 44px);
      overflow-y: auto;
      padding: 28px;
      border: 1px solid rgba(255,255,255,.9);
      border-radius: 24px;
      background: #fff;
      box-shadow: 0 30px 90px rgba(26, 34, 56, .30);
    }
    .password-change-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 22px;
    }
    .password-change-eyebrow {
      margin: 0 0 7px;
      color: #246BFD;
      font-size: 12px;
      font-weight: 850;
      letter-spacing: .14em;
    }
    .password-change-header h2 {
      margin: 0;
      color: #172033;
      font-size: 24px;
      letter-spacing: -.025em;
    }
    .password-change-close {
      width: 42px;
      height: 42px;
      flex: 0 0 auto;
      border: 1px solid #dfe6f1;
      border-radius: 12px;
      background: #fff;
      color: #526078;
      font-size: 26px;
      line-height: 1;
      cursor: pointer;
    }
    .password-change-close:hover { background: #f8faff; }
    .password-change-field {
      display: grid;
      gap: 8px;
      margin-top: 16px;
    }
    .password-change-field label {
      color: #172033;
      font-size: 13px;
      font-weight: 800;
    }
    .password-change-field input {
      width: 100%;
      min-height: 48px;
      box-sizing: border-box;
      padding: 0 14px;
      border: 1px solid #d7e0ef;
      border-radius: 12px;
      outline: none;
      background: #fff;
      color: #172033;
      font: inherit;
      font-size: 16px;
    }
    .password-change-field input:focus {
      border-color: #246BFD;
      box-shadow: 0 0 0 4px rgba(36,107,253,.12);
    }
    .password-change-help {
      margin: 8px 0 0;
      color: #7b8799;
      font-size: 11px;
      line-height: 1.55;
    }
    .password-change-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 24px;
    }
    .password-change-button {
      min-height: 44px;
      padding: 0 18px;
      border-radius: 11px;
      border: 1px solid #d7e0ef;
      background: #fff;
      color: #27324a;
      font-weight: 800;
      cursor: pointer;
    }
    .password-change-button.primary {
      border-color: #246BFD;
      background: #246BFD;
      color: #fff;
      box-shadow: 0 9px 22px rgba(36,107,253,.20);
    }
    .password-change-button:disabled {
      opacity: .55;
      cursor: wait;
    }
    #passwordChangeMessage {
      min-height: 20px;
      margin: 16px 0 0;
      color: #d14343;
      font-size: 13px;
      line-height: 1.5;
    }
    #passwordChangeMessage.success { color: #16845b; }
    @media (max-width: 620px) {
      #passwordChangeBackdrop {
        align-items: end;
        padding: 0;
      }
      .password-change-card {
        width: 100%;
        max-height: 92vh;
        box-sizing: border-box;
        padding: 24px 18px calc(24px + env(safe-area-inset-bottom));
        border-radius: 22px 22px 0 0;
      }
      .password-change-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }
    }
  `;
  document.head.append(style);

  const backdrop = document.createElement("div");
  backdrop.id = "passwordChangeBackdrop";
  backdrop.className = "is-hidden";
  backdrop.setAttribute("aria-hidden", "true");
  backdrop.innerHTML = `
    <section class="password-change-card" role="dialog" aria-modal="true" aria-labelledby="passwordChangeTitle">
      <div class="password-change-header">
        <div>
          <p class="password-change-eyebrow">ACCOUNT SECURITY</p>
          <h2 id="passwordChangeTitle">비밀번호 변경</h2>
        </div>
        <button id="passwordChangeClose" class="password-change-close" type="button" aria-label="비밀번호 변경 창 닫기">×</button>
      </div>

      <form id="passwordChangeForm">
        <div class="password-change-field">
          <label for="currentPassword">현재 비밀번호</label>
          <input id="currentPassword" type="password" autocomplete="current-password" required minlength="6">
        </div>

        <div class="password-change-field">
          <label for="newPassword">새 비밀번호</label>
          <input id="newPassword" type="password" autocomplete="new-password" required minlength="8">
          <p class="password-change-help">8자 이상을 권장합니다. 다른 서비스에서 쓰는 비밀번호와 겹치지 않게 설정하세요.</p>
        </div>

        <div class="password-change-field">
          <label for="confirmPassword">새 비밀번호 확인</label>
          <input id="confirmPassword" type="password" autocomplete="new-password" required minlength="8">
        </div>

        <div class="password-change-actions">
          <button id="passwordChangeCancel" class="password-change-button" type="button">취소</button>
          <button id="passwordChangeSubmit" class="password-change-button primary" type="submit">비밀번호 변경</button>
        </div>
        <p id="passwordChangeMessage" aria-live="polite"></p>
      </form>
    </section>
  `;
  document.body.append(backdrop);

  const menu = document.querySelector("#userMenuPanel");
  const menuButton = document.querySelector("#userMenuButton");
  const logoutButton = document.querySelector("#logoutButton");

  if (menu && logoutButton && !document.querySelector("#changePasswordButton")) {
    const button = document.createElement("button");
    button.id = "changePasswordButton";
    button.type = "button";
    button.setAttribute("role", "menuitem");
    button.textContent = "비밀번호 변경";
    menu.insertBefore(button, logoutButton);

    const form = document.querySelector("#passwordChangeForm");
    const closeButton = document.querySelector("#passwordChangeClose");
    const cancelButton = document.querySelector("#passwordChangeCancel");
    const submitButton = document.querySelector("#passwordChangeSubmit");
    const currentPassword = document.querySelector("#currentPassword");
    const newPassword = document.querySelector("#newPassword");
    const confirmPassword = document.querySelector("#confirmPassword");
    const message = document.querySelector("#passwordChangeMessage");

    function setMessage(text = "", success = false) {
      message.textContent = text;
      message.classList.toggle("success", success);
    }

    function openPasswordModal() {
      menu.classList.add("is-hidden");
      menuButton?.setAttribute("aria-expanded", "false");
      form.reset();
      setMessage("");
      backdrop.classList.remove("is-hidden");
      backdrop.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      window.setTimeout(() => currentPassword.focus(), 30);
    }

    function closePasswordModal() {
      backdrop.classList.add("is-hidden");
      backdrop.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      form.reset();
      setMessage("");
    }

    button.addEventListener("click", openPasswordModal);
    closeButton.addEventListener("click", closePasswordModal);
    cancelButton.addEventListener("click", closePasswordModal);

    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) closePasswordModal();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !backdrop.classList.contains("is-hidden")) {
        closePasswordModal();
      }
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      setMessage("");

      const currentValue = currentPassword.value;
      const newValue = newPassword.value;
      const confirmValue = confirmPassword.value;

      if (newValue.length < 8) {
        setMessage("새 비밀번호는 8자 이상으로 입력해주세요.");
        newPassword.focus();
        return;
      }
      if (newValue !== confirmValue) {
        setMessage("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
        confirmPassword.focus();
        return;
      }
      if (currentValue === newValue) {
        setMessage("현재 비밀번호와 다른 새 비밀번호를 입력해주세요.");
        newPassword.focus();
        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = "변경 중…";

      try {
        const { data: sessionData, error: sessionError } = await passwordClient.auth.getSession();
        if (sessionError) throw sessionError;
        if (!sessionData?.session?.user) {
          throw new Error("로그인 상태를 확인할 수 없습니다. 다시 로그인한 뒤 시도해주세요.");
        }

        const userEmail = sessionData.session.user.email;
        if (!userEmail) {
          throw new Error("로그인 이메일을 확인할 수 없습니다.");
        }

        // 현재 비밀번호가 실제로 맞는지 먼저 재인증합니다.
        const { error: verifyError } = await passwordClient.auth.signInWithPassword({
          email: userEmail,
          password: currentValue
        });
        if (verifyError) {
          throw new Error("현재 비밀번호가 맞지 않습니다.");
        }

        // 현재 비밀번호 확인 후 새 비밀번호로 변경합니다.
        const { error } = await passwordClient.auth.updateUser({
          password: newValue
        });
        if (error) throw error;

        setMessage("비밀번호가 변경되었습니다. 다음 로그인부터 새 비밀번호를 사용하세요.", true);
        currentPassword.value = "";
        newPassword.value = "";
        confirmPassword.value = "";

        window.setTimeout(closePasswordModal, 1400);
      } catch (error) {
        const raw = String(error?.message || error || "");
        let friendly = raw;

        if (/invalid.*password|current.*password|wrong.*password/i.test(raw)) {
          friendly = "현재 비밀번호가 맞지 않습니다. 다시 확인해주세요.";
        } else if (/same.*password|different.*password/i.test(raw)) {
          friendly = "기존 비밀번호와 다른 비밀번호를 입력해주세요.";
        } else if (/weak|password.*short|least.*characters|minimum/i.test(raw)) {
          friendly = "새 비밀번호가 너무 짧거나 보안 기준에 맞지 않습니다.";
        } else if (/session|jwt|token|not.*authenticated/i.test(raw)) {
          friendly = "로그인 시간이 만료되었습니다. 다시 로그인한 뒤 시도해주세요.";
        }

        setMessage(friendly || "비밀번호를 변경하지 못했습니다.");
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "비밀번호 변경";
      }
    });
  }
}
