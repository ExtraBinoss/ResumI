# ResumI social preview

`index.html` is the standalone 1200 × 630 composition; `styles.css` owns its
layout. All image and font URLs are relative local files under `assets/`.

Regenerate from the repository root after installing dependencies:

```sh
bun scripts/build-og-image.ts
```

The renderer copies the public ResumI tray icon and existing agent marks,
loads the same Space Grotesk / Source Sans 3 variable fonts as the site,
and renders the shipped `react-profile` and `react-risograph` layouts using the fictional Alex Morgan
sample portrait. `resume.ts` contains the original, synthetic engineering career
and blue styling used only for this preview. Tool marks come from the public
template assets; the catalog templates remain unchanged. The two resumes are
stacked vertically, beside the headline and `resumi.plinka.eu` address.
It reads no personal document, browser profile or private resume.

The output is `apps/web/public/og-image.png` at exactly 1200 × 630 pixels.
Rendering uses an isolated headless browser and temporary local static server;
there are no external network dependencies. The HTML can also be opened through
any static server rooted here. Two consecutive renders were byte-identical.

Brand marks keep their original paints and attribution metadata. Their owners'
terms apply; source provenance is recorded in
`packages/assets/data/agents/sources.json`. Font licenses are copied alongside
the local WOFF2 files. No affiliation or endorsement is implied.
