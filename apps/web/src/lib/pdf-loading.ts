import { mountOrb } from "../components/thinking-orb/mount";

/** Isolated print windows do not inherit the application stylesheet or React tree. */
export function mountPdfLoading(popup: Window, label: string): () => void {
  const owner = popup.document;
  const colors = window.getComputedStyle(window.document.documentElement);
  owner.documentElement.dataset.theme =
    window.document.documentElement.dataset.theme ?? "light";
  owner.documentElement.style.setProperty(
    "--loading-ink",
    colors.getPropertyValue("--muted-foreground"),
  );
  owner.documentElement.style.setProperty(
    "--loading-highlight",
    colors.getPropertyValue("--foreground"),
  );
  owner.body.style.cssText =
    "margin:0;min-height:100vh;display:grid;place-items:center;font:14px system-ui,sans-serif";
  owner.body.style.background = colors.getPropertyValue("--background");
  owner.body.style.color = colors.getPropertyValue("--foreground");
  const status = owner.createElement("div");
  status.setAttribute("role", "status");
  status.setAttribute("aria-busy", "true");
  status.style.cssText = "display:grid;justify-items:center;gap:16px";
  const canvas = owner.createElement("canvas");
  canvas.width = canvas.height = 64;
  canvas.style.cssText = "display:block;width:64px;height:64px";
  canvas.setAttribute("aria-hidden", "true");
  canvas.dataset.thinkingOrb = "breathing";
  const text = owner.createElement("span");
  text.textContent = label;
  const style = owner.createElement("style");
  style.textContent = `
    @keyframes shimmer{from{background-position:180% 0}to{background-position:-80% 0}}
    [role=status]>span{color:var(--loading-ink);background:linear-gradient(105deg,var(--loading-ink) 32%,var(--loading-highlight) 48%,var(--loading-ink) 64%);background-size:240% 100%;background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 3.8s linear infinite}
    [role=status]:has(canvas[data-running=false])>span{animation-play-state:paused}
    @media(prefers-reduced-motion:reduce){[role=status]>span{background:none;-webkit-text-fill-color:currentColor;animation:none}}
    @media(forced-colors:active){[role=status]>span{background:none;-webkit-text-fill-color:currentColor}}
  `;
  owner.head.appendChild(style);
  status.appendChild(canvas);
  status.appendChild(text);
  owner.body.replaceChildren(status);
  const stop = mountOrb(canvas, {
    variant: "breathing",
    size: 64,
    speed: 0.6,
    paused: false,
    reduced: popup.matchMedia("(prefers-reduced-motion: reduce)").matches,
  });
  return () => {
    stop();
    style.remove();
  };
}
