# 20 — Thinking-orb loading states

## Scope

The user explicitly requested locally copied variants from Jakub Antalik's thinking-orbs repository, without installing its package, combined with restrained throbbing and shimmer text.

## Acceptance and evidence

- [x] Copy selected real upstream variants, retaining pinned provenance and the MIT license.
- [x] Shared themed loading component with short copy, subtle pulsation/shimmer, static reduced-motion output and cleaned-up/offscreen/hidden lifecycle.
- [x] Apply to real application loading boundaries without delaying document opening or displaying false agent work.
- [x] Verify actual loading frames in light/dark and reduced motion, source policy and the final integrated check. Both lifecycle browser journeys and the geometry golden test pass; actual captures were opened. The combined 68-journey suite and seven-journey visual gate pass. [Final evidence](../docs/verification.md).

[Source and license](../apps/web/src/components/thinking-orb/SOURCE.md): upstream commit `de85557ca220332586d070d8788c0e1d6e877a0d`; only breathing/working geometry and four resolved presets are copied. Sixteen upstream golden cases cover both variants, both sizes and four timestamps. `loading-orbs.spec.ts` holds a real IndexedDB opening boundary and verifies canvas pixels, animation, theme, offscreen/hidden pausing, unmount cleanup and static reduced motion. No upstream package is installed, no per-frame React state is used and no minimum loading delay is added. The print window uses the same renderer and removes it before printing.
