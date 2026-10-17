# 21 — Supplied brand artwork

The user supplied the favicon and desktop tray artwork and requested a shared Brand component plus the appropriate browser icons.

- [x] Preserve both originals and generate lightweight PNG/ICO/touch sizes without changing their composition.
- [x] Use one Brand/BrandIcon component in the existing landing/dashboard/mobile placements.
- [x] Declare favicon/touch icons globally; retain the tray asset without adding a desktop integration.
- [x] Link the landing footer to plinka.eu and add a large, theme-aware Resumi wordmark that returns to the top, respecting reduced motion.
- [x] Verify served assets, actual light/dark rendering and the final integrated gates. All five browser-icon assets return HTTP 200 with the expected content types; original artwork hashes match. Four desktop/mobile light/dark footer contexts show loaded fonts/artwork, no overflow, correct Plinka link and return to scroll position zero, without page errors. Captures were opened. The 68-journey combined suite and seven-journey visual gate pass. [Final evidence](../docs/verification.md).

Provenance and regeneration: [brand assets](../apps/web/public/brand/README.md).
