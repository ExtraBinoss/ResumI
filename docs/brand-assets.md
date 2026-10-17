# Third-party marks and fonts

Product action icons use named `lucide-react` imports (ISC license) only. Small provider marks identify tools that can consume the CLI contract. They are not buttons or native integrations and do not imply endorsement or partnership. The adjacent landing copy explicitly describes file/CLI compatibility and absent provider integrations.

- Claude: [Simple Icons CC0 asset](https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/claude.svg), sourced from Anthropic branding by the vetted icon catalog.
- OpenAI: [Simple Icons 14.15.0 CC0 asset](https://cdn.jsdelivr.net/npm/simple-icons@14.15.0/icons/openai.svg), a pinned vetted asset because the current catalog no longer serves it.
- Grok: [Lobe Icons Grok SVG](https://github.com/lobehub/lobe-icons/blob/master/packages/static-svg/icons/grok.svg), [MIT license](https://github.com/lobehub/lobe-icons/blob/master/LICENSE). The local filename is `xai.svg` and the displayed product label is Grok. It is the vetted Grok mark, not a hand-drawn imitation.

Marks are unchanged in geometry, small, monochrome, supplied with accessible alt text and clear product names. Catalog asset licenses do not grant rights to the underlying trademarks. Brand approval and current brand-policy review should be repeated before a public commercial release.

The interface self-hosts Source Sans 3 and Space Grotesk through their Fontsource packages, each under the SIL Open Font License retained in that package. Inter Variable remains available for CV templates through `@fontsource-variable/inter`, under its [SIL Open Font License](https://github.com/rsms/inter/blob/master/LICENSE.txt). Templates embed their font assets and licenses; ordinary document text may use system Arial/Georgia or an explicitly imported/embedded face. [Template assets](../packages/cv/assets/README.md) and [font selection boundaries](../apps/web/src/features/editor/panels/fonts.md) record the details.

The owner-supplied ResumI icon and unused desktop tray original are preserved with [regeneration instructions](../apps/web/public/brand/README.md). The shared Brand component renders the actual supplied icon, rather than reconstructing its mark in text. Browser favicon/touch sizes are generated locally.

Loading indicators copy only two selected variants from thinking-orbs, with [pinned provenance and the full MIT license](../apps/web/src/components/thinking-orb/SOURCE.md). The license also ships in the public assets; no thinking-orbs runtime package is installed.
