/* =====================================================================
   auth-gate.js — 京房八宮起卦工具的「登入閘門」
   目的：此工具暫不公開，只有開放名單內的 Google 帳號能使用。
   作法：沿用練息場全平台 SSO（同網域共用 localStorage 的 jte_user_email）。
        進站立刻蓋上不透明遮罩；驗證通過才掀開，未通過顯示登入／未開放說明。
   注意：這是「軟性」存取閘門。本工具是純靜態網站，原始碼可被下載，
        因此這不是密碼學等級的安全，只用來擋住一般使用者的隨手開啟。
   要加開放對象：改下面 ALLOW 陣列即可。
   ===================================================================== */
(function () {
  "use strict";

  // —— 開放名單（小寫比對；要開放給誰就加在這裡）——
  var ALLOW = [
    "simon@medialand.tw",      // 使用者指定可先用的帳號
    "flow@jointoenjoy.com"     // 平台擁有者（避免把自己鎖在外面）
  ];

  var CLIENT_ID = "1052529942242-jvr7ik3f7r987l5lq889nrfkjheoovg7.apps.googleusercontent.com";

  function email() {
    return (localStorage.getItem("jte_user_email") || "").trim().toLowerCase();
  }
  function uname() {
    return localStorage.getItem("jte_user_name") || email();
  }
  function allowed() {
    return ALLOW.indexOf(email()) !== -1;
  }

  // 通過驗證 → 不蓋遮罩，直接放行
  if (allowed()) return;

  // —— 樣式（與工具的禪風一致）——
  function injectStyles() {
    if (document.getElementById("jf-gate-style")) return;
    var s = document.createElement("style");
    s.id = "jf-gate-style";
    s.textContent = [
      "#jf-gate{position:fixed;inset:0;z-index:2147483640;display:flex;align-items:center;justify-content:center;",
      "padding:24px;font-family:ui-serif,'Songti TC','Noto Serif TC',serif;",
      "background:radial-gradient(120% 80% at 50% 0%,#fffdf6 0%,#f4efe4 60%,#ece4d3 100%)}",
      ".jf-gate-card{width:min(420px,100%);background:#fffdf6;border:1px solid #d8cdbc;border-radius:16px;",
      "box-shadow:0 18px 44px rgba(74,62,44,.16);padding:30px 26px 26px;text-align:center}",
      ".jf-gate-mark{font-size:34px;line-height:1;color:#9d4b34;margin-bottom:12px}",
      ".jf-gate-card .eyebrow{margin:0 0 4px;color:#6f7f4f;font-size:.72rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase}",
      ".jf-gate-card h2{margin:0 0 14px;font-size:1.34rem;color:#22322c;letter-spacing:.04em}",
      ".jf-gate-card p{margin:0 auto 16px;max-width:30ch;color:#766f63;font-size:.92rem;line-height:1.75}",
      ".jf-gate-card .who{color:#35614f;font-weight:600;word-break:break-all}",
      "#jf-gate-signin{display:flex;justify-content:center;min-height:44px;margin:6px 0 4px}",
      ".jf-gate-btn{appearance:none;border:1px solid #d8cdbc;background:#35614f;color:#fffdf6;font-family:inherit;",
      "font-size:.95rem;border-radius:999px;padding:11px 22px;cursor:pointer;letter-spacing:.04em}",
      ".jf-gate-btn:active{transform:scale(.98)}",
      ".jf-gate-btn.ghost{background:transparent;color:#766f63}",
      ".jf-gate-foot{margin:16px 0 0;font-size:.74rem;color:#9a9486;letter-spacing:.04em}",
      ".jf-gate-spin{color:#9a9486;font-size:.85rem}"
    ].join("");
    document.head.appendChild(s);
  }

  var overlay;
  function buildOverlay() {
    injectStyles();
    overlay = document.getElementById("jf-gate");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "jf-gate";
      (document.body || document.documentElement).appendChild(overlay);
    }
    var loggedIn = !!email();
    var msg = loggedIn
      ? '此工具目前僅開放受邀帳號使用。你登入的是 <span class="who">' + escapeHtml(uname()) +
        "</span>，尚未在開放名單中。若需使用，請與管理者聯絡，或換一個帳號登入。"
      : "此工具目前不對外公開，請先以受邀的 Google 帳號登入後使用。";
    overlay.innerHTML =
      '<div class="jf-gate-card">' +
        '<div class="jf-gate-mark" aria-hidden="true">☯</div>' +
        '<p class="eyebrow">Jing Fang Eight Palaces</p>' +
        "<h2>京房八宮起卦</h2>" +
        "<p>" + msg + "</p>" +
        '<div id="jf-gate-signin"><span class="jf-gate-spin">登入中…</span></div>' +
        (loggedIn ? '<button class="jf-gate-btn ghost" id="jf-gate-switch" type="button">換一個帳號</button>' : "") +
        '<p class="jf-gate-foot">受邀帳號限定 · 解讀僅供研究參考</p>' +
      "</div>";

    if (loggedIn) {
      var sw = document.getElementById("jf-gate-switch");
      if (sw) sw.onclick = logout;
    }
    mountSignin();
  }

  function escapeHtml(v) {
    return String(v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c];
    });
  }

  function logout() {
    localStorage.removeItem("jte_user_email");
    localStorage.removeItem("jte_user_name");
    localStorage.removeItem("jte_user_picture");
    if (window.google && google.accounts) {
      try { google.accounts.id.disableAutoSelect(); } catch (e) {}
    }
    location.reload();
  }

  // —— Google 登入（自帶；登入後寫入共用 localStorage 並重整）——
  var _inited = false;
  function handleCredential(resp) {
    try {
      var p = JSON.parse(atob(resp.credential.split(".")[1]));
      localStorage.setItem("jte_user_email", p.email || "");
      localStorage.setItem("jte_user_name", p.name || p.email || "");
      localStorage.setItem("jte_user_picture", p.picture || "");
    } catch (e) {}
    location.reload();
  }

  function mountSignin() {
    waitForGsi(function () {
      var slot = document.getElementById("jf-gate-signin");
      if (!slot) return;
      if (!_inited) {
        _inited = true;
        google.accounts.id.initialize({ client_id: CLIENT_ID, ux_mode: "popup", callback: handleCredential });
      }
      slot.innerHTML = "";
      google.accounts.id.renderButton(slot, {
        theme: "filled_black", size: "large", shape: "pill", text: "signin_with", locale: "zh-TW", width: 240
      });
    }, function () {
      // GSI 載入失敗的後備：給一顆自製鈕，點了用 One Tap / 重試
      var slot = document.getElementById("jf-gate-signin");
      if (slot) slot.innerHTML = '<button class="jf-gate-btn" type="button" onclick="location.reload()">重新載入登入</button>';
    });
  }

  function waitForGsi(ok, fail) {
    if (window.google && google.accounts && google.accounts.id) { ok(); return; }
    var n = 0;
    var t = setInterval(function () {
      n++;
      if (window.google && google.accounts && google.accounts.id) { clearInterval(t); ok(); }
      else if (n > 60) { clearInterval(t); if (fail) fail(); } // ~9s 仍無則後備
    }, 150);
  }

  if (document.body) buildOverlay();
  else document.addEventListener("DOMContentLoaded", buildOverlay);
})();
