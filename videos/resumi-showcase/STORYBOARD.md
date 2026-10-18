---
format: 1920x1080
duration: 15s
message: "Your resume just got a new teammate."
arc: Demo Loop
audience: designers, applicants and coding-agent users
mode: autonomous
music: none
captions: skipped (no narration; the product carries the message)
---

## Video direction

One continuous, cursorless spatial composition. The real landing page leads to
the real editor, then its page becomes a template in a gallery containing every
one of the 40 shipped designs. The gallery opens to the closing brand lockup.
No slideshow, no slide cuts, no page-flip gimmick. Smooth long-tail motion,
intentional overlaps and clear deceleration, no bounce or breathing loops.
The template itself carries continuity; the website screenshot is authoritative.
Use `#fafafa` canvas, `#202024` ink, `#2563eb` accent, `#63636d` secondary text.
Space Grotesk headings, Source Sans 3 supporting copy. Full-size media may cross
the caption zone because there are no captions; new copy stays above y=900.
Motion is most energetic at 2–3s, 6–8s and 11–13s; the closing read holds for 2s.
The opening has readable content from the first frame. All 40 designs appear,
not 40 sequential replacements. Keep template styling, photography and colors.
No fake feature, invented UI, private document, extra slogan or stock graphic.

## Frame 1 — One resume, every possibility

- src: compositions/frames/01-journey.html
- duration: 15s
- poster: 9.8s
- transition_in: cut
- status: animated
- type: feature_showcase
- blueprint: compose
- scene: Real ResumI landing → editor → all 40 templates → brand and website
- focal: assets/screens/editor.png
- asset_candidates: assets/landing.png — real landing; assets/editor.png — real editor; assets/templates.json — complete 40-template inventory; assets/react-polaroid.png — Polaroid; assets/react-cassette.png — Cassette; assets/react-nocturne.png — Nocturne; assets/react-risograph.png — Risograph; assets/react-chroma.png — Chroma; assets/resumi.png — official logo; assets/claude.svg — Claude; assets/openai.svg — OpenAI; assets/grok.svg — Grok; assets/cursor.svg — Cursor; assets/opencode.svg — OpenCode; assets/meta.svg — Muse Code mark
- roles: landing.png is the real opening page; editor.png is the real working surface; the template manifest enumerates all 40 already staged WebPs for the gallery; PNGs are high-resolution hero pages; resumi.png is the official brand mark; six SVGs are supporting coding-agent marks

Scene 1 (0.0–2.3s): Open on the actual landing page, large enough to read its
headline, with a restrained settling camera. The camera then travels toward its
actual template papers. The movement is motivated by making a resume, not a
free-floating screenshot: pan/focus-lock (`viewport-change`). Keep the landing
screen as captured, not rebuilt. No additional title over the page.

Scene 2 (2.3–5.8s): The page travel carries into the real editor with Polaroid,
not a static hard cut. The editor arrives as one clean surface, then the paper
becomes the focal point. Panels are visible long enough to read as layers and
properties. A slight perspective settles flat, then the exact paper lifts out
of the editor into the foreground, using a card morph-anchor
(`card-morph-anchor`) and coordinated camera (`viewport-change`). Source media
is authoritative; do not fabricate a new toolbar or inspector. An optional
short copy “Make it yours.” can enter beside the paper only after the editor.

Scene 3 (5.8–8.2s): The lifted Polaroid paper is joined by Cassette, Risograph,
Nocturne and Chroma as the containing world expands. Use cluster→outward
expansion (`center-outward-expansion`): papers continue their trajectories into
a gallery, not a crossfade between unrelated compositions. No uniform lazy
float. High-resolution hero pages are kept sharp at large scales.

Scene 4 (8.2–11.8s): The gallery reveals every one of the 40 manifest entries
through one motivated zoom-out and a coherent staggered rearrangement. Keep all
40 distinctly visible together at the wide landing pose. Use the installed
`parallax-zoom` component's focal/sibling separation mechanics, adapted in
reverse for the reveal, and `viewport-change`. A short, large “40 templates.”
label appears when the gallery resolves. Motion proves variety: colorful art,
photography, restrained editorial and technical/retro designs. No new generic
cards behind the pages, no long descriptions.

Scene 5 (11.8–15.0s): The gallery parts into two wings, continuously clearing
the same center for the real logo and a two-line closing slogan “Your resume
just got” / “a new teammate.”. The official six agent marks assemble below,
evenly centered, then “resumi.plinka.eu” and small “by plinka” complete the
lockup. `center-outward-expansion` provides the coherent clearing and symbol
arrival; the content stays readable through the last frame. Hold the final
read at least 1.6s, without fading to blank.
