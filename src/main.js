import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/700.css";
import "./style.css";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";

const app = initializeApp({
  apiKey: "AIzaSyAslJa4LDAbyLVnTsVfnnLgjNYiyQe1qcg",
  authDomain: "delphic-arcana-admin.firebaseapp.com",
  projectId: "delphic-arcana-admin",
  appId: "1:427183701005:web:bfbb0438a519ba65516944",
});

const auth = getAuth(app);

const loginView = document.querySelector("#login");
const invalidView = document.querySelector("#invalid");
const form = document.querySelector("#form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const togglePassword = document.querySelector("#toggle-password");
const submitButton = document.querySelector("#submit");

document.querySelector("#year").textContent = String(new Date().getFullYear());

let submitting = false;
let handoff = null;

function notify(style, title) {
  const item = document.createElement("div");
  item.className = "toast";
  const icon = document.createElement("span");
  icon.className = `toast-icon ${style}`;
  const text = document.createElement("p");
  text.textContent = title;
  const close = document.createElement("button");
  close.type = "button";
  close.textContent = "×";
  close.addEventListener("click", () => item.remove());
  item.append(icon, text, close);
  document.querySelector("#toasts").append(item);
  window.setTimeout(() => item.remove(), 4000);
}

function allowedRedirect(raw) {
  if (!raw) return null;
  let url;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (url.username || url.password) return null;
  const host = url.hostname.toLowerCase();
  if (host !== "delphic.studio" && !host.endsWith(".delphic.studio")) return null;
  return url;
}

function returnUrl() {
  return allowedRedirect(new URLSearchParams(window.location.search).get("redirect"));
}

function showInvalid() {
  loginView.hidden = true;
  invalidView.hidden = false;
}

function showForm() {
  invalidView.hidden = true;
  loginView.hidden = false;
}

function setTokenCookie(idToken) {
  document.cookie = `delphic_token=${idToken}; Domain=.delphic.studio; Path=/; Secure; SameSite=Lax; Max-Age=3600`;
}

function handoffToken(user) {
  if (!handoff) handoff = sendToken(user);
  return handoff;
}

async function sendToken(user) {
  const target = returnUrl();
  if (!target) {
    showInvalid();
    handoff = null;
    return;
  }
  loginView.hidden = true;
  try {
    const idToken = await user.getIdToken(true);
    setTokenCookie(idToken);
    target.hash = `token=${idToken}`;
    window.location.replace(target.toString());
  } catch {
    handoff = null;
    showForm();
    notify("error", "登录失败");
  }
}

togglePassword.addEventListener("click", () => {
  const visible = passwordInput.type === "text";
  passwordInput.type = visible ? "password" : "text";
  togglePassword.textContent = visible ? "显示" : "隐藏";
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (submitting) return;
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  if (!email) {
    notify("error", "请输入邮箱");
    return;
  }
  if (!password) {
    notify("error", "请输入密码");
    return;
  }
  if (!returnUrl()) {
    showInvalid();
    return;
  }
  submitting = true;
  submitButton.disabled = true;
  submitButton.textContent = "登录中...";
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    notify("success", "登录成功");
    await handoffToken(credential.user);
  } catch (err) {
    const code = typeof err === "object" && err && "code" in err ? String(err.code) : "";
    if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
      notify("error", "邮箱或密码错误");
    } else {
      notify("error", "登录失败");
    }
  } finally {
    submitting = false;
    if (!handoff) {
      submitButton.disabled = false;
      submitButton.textContent = "登录";
    }
  }
});

onAuthStateChanged(auth, (user) => {
  if (!returnUrl()) {
    showInvalid();
    return;
  }
  if (user) {
    void handoffToken(user);
    return;
  }
  if (!handoff) showForm();
});
