# Brand SVG sources

This local catalog contains 50 original brand marks. It is a documented exception to the application's Lucide-only control icon policy: these SVGs identify brands rather than application actions. Colors and path geometry come from the source collections, not approximations.

- 49 marks: the `devicon` collection in [Iconify icon-sets, revision 69ca5094ddd4aad6d797e689bb13ee8b692ae232](https://github.com/iconify/icon-sets/blob/69ca5094ddd4aad6d797e689bb13ee8b692ae232/json/devicon.json), distributed under [Devicon's MIT license](https://github.com/devicons/devicon/blob/6a37858047b0e8d9c9c0e68f4a071fc410652e89/LICENSE).
- Microsoft: the four-color [SVG Logos mark, revision 4a5b550414be64d5c007574cd395d910d50e8950](https://github.com/gilbarbara/logos/blob/4a5b550414be64d5c007574cd395d910d50e8950/logos/microsoft-icon.svg), with the collection's [CC0 license](https://github.com/gilbarbara/logos/blob/4a5b550414be64d5c007574cd395d910d50e8950/LICENSE.txt).

License copies are retained in `licenses/`. Each entry retains its source URL and license. Adding a mark embeds the corresponding full credit and source in its validated document vector; standalone HTML preserves those credits in SVG metadata. These collection licenses concern the artwork distribution. Brand names and trademarks remain their owners' property; the catalog does not imply endorsement or grant trademark rights. See the source collections' own [Devicon notes](https://github.com/devicons/devicon#about-the-project) and [SVG Logos notes](https://github.com/gilbarbara/logos#readme).

Regenerate with `bun run icons:brands`. The script fetches pinned source revisions and validates every vector through the engine schema. The browser loads only the local catalog, on opening Brands. No logo CDN, external SVG references, executable markup or invented brand paths are used. Tests verify all 50 entries, including Figma's five colors and Microsoft's four colors.

Imported SVGs use a separate bounded parser. It accepts paths and basic geometry, inherited solid paints and affine transforms. Scripts, external resources, filters, gradients, text and unsupported markup are rejected with a copyable error rather than silently omitted. The validated document stores paths and numeric properties, never raw SVG markup.
