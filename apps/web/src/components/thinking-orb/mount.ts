import { paintFrame } from "./core";
import { orbFrame } from "./frame";
import { resolvePreset, type OrbVariant, type OrbSize } from "./presets";

function darkSubstrate(
  canvas: HTMLCanvasElement,
  media: MediaQueryList,
): boolean {
  for (let node: Element | null = canvas; node; node = node.parentElement) {
    const theme = node.getAttribute("data-theme");
    if (theme === "dark" || node.classList.contains("dark")) return true;
    if (theme === "light" || node.classList.contains("light")) return false;
  }
  return media.matches;
}

/** One external canvas lifecycle. No per-frame React updates or document mutations. */
export function mountOrb(
  canvas: HTMLCanvasElement,
  {
    variant,
    size,
    speed,
    paused,
    reduced,
  }: {
    variant: OrbVariant;
    size: OrbSize;
    speed: number;
    paused: boolean;
    reduced: boolean;
  },
): () => void {
  const context = canvas.getContext("2d"),
    ownerDocument = canvas.ownerDocument,
    ownerWindow = ownerDocument.defaultView;
  if (!context || !ownerWindow) return () => {};
  const requestFrame = ownerWindow.requestAnimationFrame.bind(ownerWindow),
    cancelFrame = ownerWindow.cancelAnimationFrame.bind(ownerWindow);
  const scheme = ownerWindow.matchMedia("(prefers-color-scheme: dark)");
  let dark = darkSubstrate(canvas, scheme),
    visible = false,
    running = false,
    raf = 0,
    disposed = false;
  let dpr = 1;
  const effectiveSpeed = resolvePreset(variant, size).speed * speed;
  function draw(seconds: number) {
    if (disposed || !context) return;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, size, size);
    paintFrame(context, orbFrame(variant, size, seconds), dark);
  }
  function currentFrame() {
    draw(
      reduced ? 0.6 : (ownerWindow!.performance.now() / 1000) * effectiveSpeed,
    );
  }
  function tick() {
    if (!running) return;
    currentFrame();
    raf = requestFrame(tick);
  }
  function synchronize() {
    const next =
      !disposed &&
      !reduced &&
      !paused &&
      visible &&
      ownerDocument.visibilityState !== "hidden";
    canvas.dataset.running = String(next);
    if (next === running) return;
    running = next;
    if (next) raf = requestFrame(tick);
    else {
      cancelFrame(raf);
      raf = 0;
    }
  }
  function resize() {
    const nextDpr = Math.min(2, ownerWindow!.devicePixelRatio || 1);
    if (canvas.width !== Math.round(size * nextDpr) || dpr !== nextDpr) {
      dpr = nextDpr;
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      currentFrame();
    }
  }
  function themeChanged() {
    const next = darkSubstrate(canvas, scheme);
    if (next !== dark) {
      dark = next;
      currentFrame();
    }
  }
  const intersection = new ownerWindow.IntersectionObserver(([entry]) => {
    visible = !!entry?.isIntersecting;
    synchronize();
  });
  intersection.observe(canvas);
  // Watch only this instance's ancestors, never the application subtree.
  const themeObserver = new ownerWindow.MutationObserver(themeChanged);
  for (let node: Element | null = canvas; node; node = node.parentElement)
    themeObserver.observe(node, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
  scheme.addEventListener("change", themeChanged);
  ownerDocument.addEventListener("visibilitychange", synchronize);
  ownerWindow.addEventListener("resize", resize);
  resize();
  currentFrame();
  synchronize();
  return () => {
    disposed = true;
    running = false;
    cancelFrame(raf);
    canvas.dataset.running = "false";
    intersection.disconnect();
    themeObserver.disconnect();
    scheme.removeEventListener("change", themeChanged);
    ownerDocument.removeEventListener("visibilitychange", synchronize);
    ownerWindow.removeEventListener("resize", resize);
  };
}
