// PWA Installation Manager
let deferredPrompt = null;
const listeners = new Set();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    listeners.forEach((fn) => fn(true));
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    listeners.forEach((fn) => fn(false));
  });
}

export function subscribePwaPrompt(callback) {
  listeners.add(callback);
  callback(Boolean(deferredPrompt));
  return () => listeners.delete(callback);
}

export async function promptPwaInstall() {
  if (!deferredPrompt) {
    // If on iOS or standalone
    const isIos = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    return { outcome: isIos ? "ios" : "unavailable" };
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  listeners.forEach((fn) => fn(false));
  return { outcome };
}

export function isAppInstalled() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}
