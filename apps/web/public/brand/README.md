# ResumI artwork

The project owner supplied `resumi-favicon.png` and `resumi-tray_desktop.png` on 2026-10-17. The originals are retained byte-for-byte as `resumi-icon-source.png` and `resumi-tray-desktop.png`.

`bun run brand:assets` uses the local Chromium canvas resampler to create compact 32/64px PNG favicons, a 16/32/48px PNG-backed ICO, a 180px Apple touch icon and a 192px interface mark. The artwork, colors, alpha and composition are preserved; only pixel dimensions change. No image-generation model or external service is involved.

Shared `components/Brand.tsx` owns the mark and wordmark. The root document declares the favicon/touch links for every route. The desktop tray asset is retained for a future native shell and is not fetched by the current web interface.
