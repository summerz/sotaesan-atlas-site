(() => {
  "use strict";
  // This is a convenience gate for a public static site, not server authentication.
  const root = new URL(".", document.currentScript.src);
  const key = "sotaesan-atlas-review-access-v1";
  const duration = 24 * 60 * 60 * 1000;
  const passwordHash = "8e0f858bbbce8de159d0885873bae5731e21d8db8057f295d2d3ad3a9c7eb95d";

  function unlocked() {
    try {
      const expiry = Number(localStorage.getItem(key));
      return expiry > Date.now() && expiry <= Date.now() + duration;
    } catch {
      return false;
    }
  }

  function loginURL() {
    const url = new URL("login.html", root);
    url.searchParams.set("next", location.pathname + location.search + location.hash);
    return url.href;
  }

  function destination() {
    const fallback = new URL("index.html", root);
    try {
      const next = new URL(new URLSearchParams(location.search).get("next") || fallback.href, root);
      if (next.origin === root.origin && next.pathname.startsWith(root.pathname) && next.pathname !== new URL("login.html", root).pathname) return next.href;
    } catch { /* Invalid destinations return to the home page. */ }
    return fallback.href;
  }

  const form = document.querySelector("[data-access-form]");
  if (form) {
    if (unlocked()) {
      location.replace(destination());
      return;
    }
    const input = form.querySelector("input");
    const button = form.querySelector("button");
    const error = document.getElementById("access-error");
    input.addEventListener("input", () => {
      input.removeAttribute("aria-invalid");
      error.textContent = "";
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      button.disabled = true;
      error.textContent = "";
      try {
        const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input.value));
        const hash = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
        if (hash !== passwordHash) {
          input.setAttribute("aria-invalid", "true");
          error.textContent = "비밀번호가 맞지 않습니다. 다시 입력해 주세요.";
          input.focus();
          input.select();
          return;
        }
        localStorage.setItem(key, String(Date.now() + duration));
        location.replace(destination());
      } catch {
        error.textContent = "로그인 상태를 저장할 수 없습니다. 브라우저의 사이트 저장 설정을 확인해 주세요.";
      } finally {
        button.disabled = false;
      }
    });
    return;
  }

  const payload = document.getElementById("site-page");
  if (!payload) return;
  if (!unlocked()) {
    location.replace(loginURL());
    return;
  }
  // Render only after the check so locked pages do not start the 3D app or
  // request its models, workers, and WASM. Relative URLs keep their original base.
  const html = JSON.parse(payload.textContent);
  document.open();
  document.write(html);
  document.close();

  function addLockButton() {
    const nav = document.querySelector('nav[aria-label="자료 메뉴"]');
    if (!nav) return;
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "잠그기";
    button.style.cssText = "font:inherit;color:var(--green);background:none;border:0;padding:0;cursor:pointer;text-decoration:underline;text-underline-offset:4px";
    button.addEventListener("click", () => {
      localStorage.removeItem(key);
      location.replace(loginURL());
    });
    nav.append(button);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addLockButton, { once: true });
  else addLockButton();
  window.addEventListener("pageshow", () => {
    if (!unlocked()) location.replace(loginURL());
  });
  window.addEventListener("storage", event => {
    if ((event.key === key || event.key === null) && !unlocked()) location.replace(loginURL());
  });
})();
