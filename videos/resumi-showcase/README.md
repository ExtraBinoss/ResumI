# ResumI showcase

A 15-second, 1920×1080 product animation. The real website and editor flow into
all 40 shipped templates, then the ResumI signature. Fictional demo documents
only; no existing browser profile is accessed.

From the repository root, with the app running on `http://127.0.0.1:5173`:

```sh
bun videos/resumi-showcase/prepare.ts
cd videos/resumi-showcase
bun run check
bun run dev
```

Open the Studio preview to play or edit the composition. After reviewing:

```sh
bun run render --fps 60 --quality delivery --output renders/resumi-showcase.mp4
```

`compositions/frames/01-journey.html` owns the scene; `journey.js` owns its
seekable motion and `journey.css` its layout. `index.html` mounts the scene.
`BRIEF.md` records the request; `STORYBOARD.md` records the timing. Generated
screens, assets, verification reports and renders are ignored by Git. `prepare.ts`
copies the site's fonts, original brand marks, and public template previews,
renders crisp TSX hero pages, and captures a fresh demo editor. It downloads
the pinned GSAP runtime once; playback makes no network requests.

Asset provenance remains in the main repository: `packages/cv/assets/photos.json`,
`packages/assets/data/agents/sources.json`, and the font licenses copied into
`assets/fonts`. Templates are the same editable TSX designs as the application.
The first cut has no audio.

The rendered master is 15 seconds at 1920×1080, 60 fps. The web MP4 keeps this
format; the hover preview uses a 1280×720, 60 fps VP9 WebM. They are published at
`https://plinka.eu/videos/resumi.mp4` and `https://plinka.eu/videos/resumi.webm`.
Rendering needs FFmpeg with `libx264`; on codec-limited systems, point
`HYPERFRAMES_FFMPEG_PATH` and `HYPERFRAMES_FFPROBE_PATH` to full local binaries.
