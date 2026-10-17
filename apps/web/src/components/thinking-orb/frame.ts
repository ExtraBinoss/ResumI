import { frameOrbits } from "./orbits";
import { frameRibbon } from "./ribbon";
import { resolvePreset, type OrbSize, type OrbVariant } from "./presets";
export function orbFrame(variant: OrbVariant, size: OrbSize, seconds: number) {
  return (variant === "working" ? frameOrbits : frameRibbon)(
    size,
    seconds,
    resolvePreset(variant, size).opts,
  );
}
