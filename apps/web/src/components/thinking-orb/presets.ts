// Selected original tunings from thinking-orbs de85557; MIT (see LICENSE).
export type OrbVariant = "breathing" | "working";
export type OrbSize = 20 | 64;
export interface ModeOpts {
  [key: string]: number | undefined;
}
export type Preset = { speed: number; opts: ModeOpts };
const presets: Record<OrbVariant, Record<OrbSize, Preset>> = {
  breathing: {
    "64": {
      speed: 3.24,
      opts: {
        lanes: 3,
        segs: 44,
        ghostN: 0,
        faceOn: 1,
        rBase: 1.0516,
        rDepth: 1.6252,
        rsPow: 0.6,
        rMin: 0.3,
        rSizeMul: 0.956,
        spin: 0,
        bandMul: 3.627,
        wobMul: 0.368,
      },
    },
    "20": {
      speed: 3.78,
      opts: {
        lanes: 2,
        segs: 15,
        ghostN: 0,
        faceOn: 1,
        rBase: 1.7842000000000002,
        rDepth: 2.7574,
        rsPow: 0.6,
        rMin: 0.3,
        rSizeMul: 1.622,
        spin: 0,
        bandMul: 3.968,
        wobMul: 0.565,
      },
    },
  },
  working: {
    "64": {
      speed: 1.885,
      opts: {
        orbitN: 12,
        ghostN: 40,
        ghostR: 0.9,
        ghostA: 0.5,
        particles: 3,
        partR: 1.2,
        partRDepth: 1.6,
        rsPow: 0.6,
        rMin: 0.3,
      },
    },
    "20": {
      speed: 3.9,
      opts: {
        orbitN: 3,
        ghostN: 10,
        ghostR: 2.16,
        ghostA: 0.5,
        particles: 3,
        partR: 2.88,
        partRDepth: 3.84,
        rsPow: 0.6,
        rMin: 0.3,
        rSizeMul: 2.4,
      },
    },
  },
};
export function resolvePreset(variant: OrbVariant, size: OrbSize): Preset {
  return presets[variant][size];
}
