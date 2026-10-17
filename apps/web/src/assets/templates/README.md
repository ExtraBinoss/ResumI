# Template gallery previews

These WebP files are real Chromium renders of the repository's trusted TSX resumes, with the same synthetic content, fonts, portrait, brand marks and CSS as their editable versions. They are 440px wide for the approximately 220px gallery papers. The gallery uses fixed-size images; its preview dialog and the editor still render the actual HTML/TSX document.

Regenerate after changing a template, its content, styling or embedded assets:

```sh
bun scripts/build-template-thumbnails.ts
```

The script embeds the portable source assets, waits for fonts and image decoding, captures the actual resume, then uses Chromium's image encoder to create the thumbnails. It closes its own browser. It does not access saved user projects or an external service.

`manifest.generated.json` records SHA-256 hashes for the rendered HTML plus shared CV CSS, and for each resulting WebP. The unit test checks every public template against its current source and asset bytes, so stale or missing previews fail verification. Vite emits content-hashed URLs for browser caching. Existing font, portrait and brand provenance remains in `packages/cv/assets/README.md` and the template's portable license notices.
