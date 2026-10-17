# Template portrait

`alex-morgan-portrait.jpg` is a fictional professional portrait generated with the built-in imagegen tool for ResumI's editable CV templates. It does not depict a real user's identity. The generated image was encoded as a compact 512px JPEG for offline embedding; the composition is unchanged.

Final generation prompt:

> Use case: photorealistic-natural. Asset type: a small professional portrait photograph embedded in a premium editable resume template. Generate one square editorial head-and-shoulders portrait of a fictional person named Alex Morgan, a product designer in their early thirties with an androgynous appearance, short dark wavy hair, natural skin texture, a calm approachable expression and subtle smile. Simple charcoal crewneck and understated navy jacket. Quiet light gray seamless studio background, soft natural daylight, balanced composition with head fully within the frame and generous clean space around shoulders. Straight-on eye-level camera, crisp but naturally photographic, refined, professional and human. The portrait should remain clear as a small 90px square or circular photo on an A4 resume. No text, no logos, no watermark, no frame, no decorative objects, no collage, no fake UI. Produce a single finished portrait, preferably a compact 512px square asset.

Templates embed the optimized asset as a data URL so standalone HTML does not request a remote image. Code-native icons remain SVG.

## Offline assets and licenses

The templates embed the Inter Latin variable WOFF2 font (48,256 bytes), distributed under the [SIL Open Font License](inter-license.txt), and code-native contact icons using vetted Lucide paths under the [ISC license](lucide-license.txt). The complete licenses travel inside the portable template's style comment. Classic omits the portrait; only Profile includes the synthetic photo.

Run `bun scripts/build-template-assets.ts` after changing the portrait, font or `CodeResume.tsx`. It regenerates `src/templates/assets.generated.json` and the single-file TSX snapshot in `src/source/template.generated.json`. This does not rebuild or change the standalone React runtime. The existing `bun scripts/build-source-runtime.ts` command remains the runtime regeneration command when React itself changes.

The human-editable TSX keeps content and layout at the top. Embedded binary data is isolated in an assets section at the bottom. The synthetic sample's career history and metrics are illustrative and do not describe a real user's professional history.
