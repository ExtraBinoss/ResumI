# Library navigation measurements

The catalog loader now returns pre-rendered, repository-authored previews rather than rendering and validating every template on each request. No user documents or UI cookies enter that immutable catalog. The common dashboard loader owns one persistent, scoped CV stylesheet and does not revalidate that static content during sibling navigation. The React Router loaders and per-request interface-language handling remain in place.

Gallery cards show real Chromium captures of the TSX templates. Their fixed-size WebP images replace the full CV DOM; opening the preview dialog still mounts the actual HTML. The first four thumbnails are eager, with the first prioritized; remaining images are lazy and decode asynchronously. The desktop card is explicitly 354px including its border, with 352px of intrinsic content. Mobile uses 368px/366px. Entering the viewport therefore does not change grid measurements.

The browser preview URLs reuse the exact Inter font and portrait files instead of embedding the same base64 binary in every catalog entry. Portable source and offline exports retain their embedded assets. Different template license notices remain present while their common CSS and font face are deduplicated. The header's active indicator uses a simple translation between equal-width tabs, avoiding Motion's layout projection measurement. Intent prefetch prepares public catalog data and route code without creating a document.

## Observed development results

These are local laboratory observations on the user's Vite development server at `127.0.0.1:5175`, in an isolated synthetic browser context. CPU was unthrottled, network was unthrottled, DPR was 1 and the desktop viewport was 1905×2053. Vite and HTTP caches were warm. Initial document reloads, module compilation and image decoding are distinct work; this is not a production performance estimate or a controlled speedup percentage.

| Stage                                     | Evidence                                                                                                                                                                                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Original four-template catalog            | `/templates.data` was 384,976 decoded bytes; three requests took 61.8, 50.3 and 56.0ms. Four identical inline font faces were present.                                                                                                     |
| Original navigation trace                 | Content first appeared around 446ms; incoming opacity reached 1 at 558.7ms. The trace reported a 105ms forced layout in Motion `measureScroll` and CLS 0.                                                                                  |
| Four templates after shared assets/styles | The payload was 51,394 decoded bytes. Request times were 48.0, 50.9 and 37.4ms. Extended CSS was already present, while only four templates were registered.                                                                               |
| Expanded ten-template HTML gallery        | 1,210 document elements; the trace reported an 82ms layout and CLS 0.                                                                                                                                                                      |
| Final ten-template thumbnail gallery      | 250 document elements. The final trace flagged neither ForcedReflow nor DOMSize. The actual sibling-navigation payload was 67,113 decoded bytes, including all ten modal HTML previews. Thumbnail files range from 18,028 to 26,300 bytes. |

In the final first measured visit after a document reload, content mounted at 371.8ms, opacity reached 1 at 559.4ms and all ten visible thumbnails had completed decoding by 685.8ms. These image requests used warm HTTP caches; calling that a cold image load would be incorrect. The original four-template measurement did not wait for an equivalent set of image decodes.

Three subsequent Projects→Templates visits mounted at 145.1, 264.7 and 143.0ms. Their fully decoded visible image sets were ready at 387.9, 439.8 and 382.7ms, including the incoming transition. The corresponding Templates→Projects visits completed at 281.3, 295.9 and 290.8ms. These samples show remaining development variability rather than establishing a universal latency guarantee.

Across those three complete round trips, the same shared stylesheet node remained connected, no new FontFace objects appeared and no font requests occurred. Earlier measurements overlapping Vite HMR were excluded from that conclusion. No console error or warning appeared during the final measurement window.

At 390×844, all ten card heights stayed 368px. Across seven scroll positions from 0 to 3382px, their offsets stayed identical and total scroll height stayed 4150px. Each visible image completed decoding; observed CLS was 0.

Exact samples, viewport data and limitations are in [the measurement artifact](../artifacts/performance/library-navigation.json). These observations do not prove that every reported raster artifact has a single cause or certify all devices and browser versions.

After that timed window, asset URL imports were moved into `template-preview-assets.ts`, which is referenced by actual client rendering of thumbnail `src`, the shared font face and portrait interpolation. This makes Vite's client asset emission explicit. The loader no longer repeats thumbnail URLs and transports a portrait placeholder resolved at render time. Its current navigation response was subsequently checked through HTTP as 200 with 66,432 decoded bytes. The resulting images, DOM and styling are identical; no additional timed speedup is claimed for this transport-only patch.

## Reproduction and verification

Regenerate real thumbnails with `bun scripts/build-template-thumbnails.ts`; [asset documentation](../apps/web/src/assets/templates/README.md) explains source/image hashes and provenance. A unit test fails if any trusted template's content, CSS or assets differ from its recorded thumbnail source hash.

The focused browser regression `apps/web/e2e/library-navigation.spec.ts` checks intent prefetch, the absence of repeated inline font/portrait binaries, the persistent stylesheet/header, real modal HTML/font rendering, and stable mobile card positions. It also requests every thumbnail and the shared font/portrait through HTTP, checks image/font magic bytes, and decodes browser images. Those assertions must pass against the production preview during the final gate, because development `?url` resolution alone does not establish that the built Worker serves all generated assets.
