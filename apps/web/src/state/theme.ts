import { useEffect, useSyncExternalStore } from "react";

export type Theme = "light" | "dark" | "system";
const key = "resumi-theme";
const eventName = "resumi-theme-change";
let currentTheme: Theme | undefined;
function preference(): Theme {
  if (currentTheme) return currentTheme;
  try {
    const value = localStorage.getItem(key);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}
function applyTheme() {
  const theme = preference();
  const dark =
    theme === "dark" ||
    (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}
function subscribe(notify: () => void) {
  function storage() {
    currentTheme = undefined;
    notify();
  }
  window.addEventListener("storage", storage);
  window.addEventListener(eventName, notify);
  return () => {
    window.removeEventListener("storage", storage);
    window.removeEventListener(eventName, notify);
  };
}
export function useTheme() {
  const theme = useSyncExternalStore(
    subscribe,
    preference,
    (): Theme => "system",
  );
  return [theme, setTheme] as const;
}
export function setTheme(theme: Theme) {
  currentTheme = theme;
  try {
    localStorage.setItem(key, theme);
  } catch {
    /* Theme remains usable when storage is unavailable. */
  }
  applyTheme();
  window.dispatchEvent(new Event(eventName));
}
export function ThemeSync() {
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    applyTheme();
    function storage() {
      currentTheme = undefined;
      applyTheme();
    }
    window.addEventListener("storage", storage);
    window.addEventListener(eventName, applyTheme);
    media.addEventListener("change", applyTheme);
    return () => {
      window.removeEventListener("storage", storage);
      window.removeEventListener(eventName, applyTheme);
      media.removeEventListener("change", applyTheme);
    };
  }, []);
  return null;
}
export const themeBootstrap = `try{let t=localStorage.getItem("resumi-theme");let d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.dataset.theme=d?"dark":"light";document.documentElement.style.colorScheme=d?"dark":"light"}catch{}`;
