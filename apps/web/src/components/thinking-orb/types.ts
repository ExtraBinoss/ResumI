// Adapted from thinking-orbs de85557ca220332586d070d8788c0e1d6e877a0d; MIT (see LICENSE).
// Engine-level contracts shared by every mode implementation.

import type { ModeOpts } from "./presets";

export type { Dot, Line, OrbFrame } from "./core";

import type { OrbFrame } from "./core";

/**
 * Geometry for one instant: pure math over (size, t, opts), no rendering
 * surface and no theme — `dark` only affects ink at paint time.
 *
 * Deliberately closure-free and `Math`-only so the same function can run
 * inside a Reanimated worklet on the React Native UI thread, and so its
 * output can be compared numerically against the Swift port.
 */
export type ModeFrame = (size: number, t: number, opts: ModeOpts) => OrbFrame;

/** One frame painter: draws a mode into a 2D context at CSS-px `size`. */
export type ModeDraw = (
  ctx: CanvasRenderingContext2D,
  size: number,
  t: number,
  dark: boolean,
  opts: ModeOpts,
) => void;
