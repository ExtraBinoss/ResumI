import { useCallback, useEffect, useRef } from "react";
import { animate, useReducedMotion } from "motion/react";

type Poses = {
  opacity?: (number | null)[];
  x?: (number | null)[];
  y?: (number | null)[];
  scale?: (number | null)[];
  rotate?: (number | null)[];
};
type BrandMotion = {
  name: string;
  glyphs: string;
  letters: Poses;
  symbol: Poses;
};
const motions: readonly BrandMotion[] = [
  {
    name: "decode",
    glyphs: "<>/\\01",
    letters: { opacity: [null, 0.6, 1] },
    symbol: { scale: [null, 0.92, 1] },
  },
  {
    name: "pixel",
    glyphs: "░▒▓█",
    letters: { opacity: [null, 0.75, 1] },
    symbol: { scale: [null, 0.95, 1] },
  },
  {
    name: "glitch",
    glyphs: "/\\|_#",
    letters: { x: [null, 1, -1, 0] },
    symbol: { x: [null, -2, 2, 0] },
  },
  {
    name: "scan",
    glyphs: "─━═_",
    letters: { opacity: [null, 0.65, 1] },
    symbol: { y: [null, -2, 0] },
  },
  {
    name: "burst",
    glyphs: "✦✧*+",
    letters: { scale: [null, 1.08, 1] },
    symbol: { scale: [null, 1.13, 1] },
  },
  {
    name: "shuffle",
    glyphs: "ResumI",
    letters: { x: [null, 1.5, 0] },
    symbol: { rotate: [null, -8, 0] },
  },
];
const text = "ResumI".split("");

/** Fixed text slots preserve the wordmark's metrics during Beam-style signal changes. */
export function useBrandMotion() {
  const root = useRef<HTMLAnchorElement>(null);
  const reduced = useReducedMotion();
  const sequence = useRef(-1);
  const frame = useRef(0);
  const controls = useRef<{ stop: () => void }[]>([]);
  const stop = useCallback((settle = true) => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    controls.current.forEach((control) => control.stop());
    controls.current = [];
    root.current
      ?.querySelectorAll<HTMLElement>("[data-brand-glyph]")
      .forEach((glyph) => {
        glyph.textContent = "";
      });
    if (settle) {
      root.current?.removeAttribute("data-brand-animation");
      root.current
        ?.querySelectorAll<HTMLElement>("[data-brand-letter], img")
        .forEach((element) => {
          element.style.removeProperty("transform");
          element.style.removeProperty("opacity");
        });
    }
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const changed = () => {
      if (media.matches || document.hidden) stop();
    };
    media.addEventListener("change", changed);
    document.addEventListener("visibilitychange", changed);
    return () => {
      stop();
      media.removeEventListener("change", changed);
      document.removeEventListener("visibilitychange", changed);
    };
  }, [stop]);
  const play = () => {
    if (!root.current || reduced || document.hidden) return;
    stop(false);
    sequence.current = (sequence.current + 1) % motions.length;
    const effect = motions[sequence.current]!;
    root.current.dataset.brandAnimation = effect.name;
    const duration = 1.15;
    const symbol = root.current.querySelector("img");
    if (symbol)
      controls.current.push(
        animate(symbol, effect.symbol, { duration, ease: [0.22, 1, 0.36, 1] }),
      );
    const letters = [
      ...root.current.querySelectorAll<HTMLElement>("[data-brand-letter]"),
    ];
    letters.forEach((letter, index) => {
      controls.current.push(
        animate(letter, effect.letters, {
          duration,
          delay: index * 0.025,
          ease: [0.22, 1, 0.36, 1],
        }),
      );
    });
    const glyphs = [
      ...root.current.querySelectorAll<HTMLElement>("[data-brand-glyph]"),
    ];
    let started: number | null = null;
    let previousStep = -1;
    const tick = (time: number) => {
      started ??= time;
      const progress = (time - started) / 1300;
      if (progress >= 1) {
        stop();
        return;
      }
      const step = Math.floor((time - started) / 55);
      if (step !== previousStep) {
        previousStep = step;
        glyphs.forEach((glyph, index) => {
          const position = index / (text.length - 1);
          const settled = progress < 0.06 || progress > 0.55 + position * 0.25;
          const noise =
            effect.glyphs[(step + index * 3) % effect.glyphs.length]!;
          const inSignal =
            effect.name !== "glitch" ||
            (progress > 0.15 && progress < 0.26) ||
            (progress > 0.4 && progress < 0.5);
          glyph.textContent = settled || !inSignal ? text[index]! : noise;
        });
      }
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  };
  return { root, play };
}
