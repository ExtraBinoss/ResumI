# Interface and CV languages

These are independent settings. Settings → Interface language changes translated application controls between English and French through `react-i18next`. Text → CV language selects the document variant rendered in Visual, Text, HTML and PDF. Changing an interface language never rewrites a CV. Adding a CV language does not invoke an automatic translation service.

## Editing a multilingual CV

The Text toolbar contains the language selector and an add/manage button. Add a code such as `fr` or `pt-BR` and its display name, then edit each text block normally. A missing translation displays the original text and a quiet “Original text” indication. The footer counts translated blocks. An empty translated block is intentionally empty, rather than a missing translation. The reset action on a translated row restores its original fallback. The same manager exposes translations of existing semantic section headings. Language names/codes can be changed in the manager; removing a non-original language removes its variants. The original language cannot be deleted, but its code and name can be corrected.

Both workspaces edit the same canonical document. Rich-text ranges belong to their particular language, so French bold/italic/link ranges never overwrite the original ranges. Geometry, groups, images and base typography remain shared. Translation-specific layouts and per-language geometry are not implemented. Human edits, agent commands, undo/redo, IndexedDB persistence, duplication and JSON round trips use the same engine contract.

## Engine representation and agent commands

Existing schema-version-1 documents require no migration. Without `localization`, their original language is `en`. On first addition, the optional document metadata records `baseLocale`, `activeLocale` and up to 30 `{code,name}` entries. An individual text block may contain `translations[code] = {text,marks}`. A section may separately contain `titleTranslations[code] = "Translated heading"`; its ordinary `title` remains the original variant. A block’s ordinary `text` and `design.marks` remain the original variant. Missing variants fall back to those fields. The engine rejects translations of shapes/images, unknown/base locale entries, invalid or duplicate mark ranges and unknown fields, and includes translated data in the existing 12 MB document budget.

The engine accepts these commands in the ordinary validated version-1 batch:

```json
{
  "version": 1,
  "actor": { "kind": "agent", "name": "Translator" },
  "commands": [
    { "type": "locale.add", "code": "fr", "name": "Français" },
    {
      "type": "translation.set",
      "id": "identity-0",
      "locale": "fr",
      "text": "Camille Martin"
    },
    { "type": "locale.activate", "code": "fr" }
  ]
}
```

`section.translation.set` takes `id`, `locale` and `title`; `section.translation.remove` restores the original heading fallback for one non-original language. Ordinary `section.update` title edits target the active language. Section titles support intentionally empty translations, serialization, duplication, history and language-code rename/removal just like block translations.

Semantic section titles and freeform visual label blocks are separate editable content. The Text language manager edits semantic titles used by structured/trusted TSX templates and the reading-order outline. Existing visual page headings are text blocks, edited on the page or in normal Text rows; changing semantic metadata does not infer or rewrite a visual layer. A first-time projection from a translated structured document copies its current section-title variants into the newly generated visual labels.

`translation.set` can include explicit `marks`; otherwise the engine remaps existing range marks across the text replacement. `translation.remove` removes one non-original variant. `locale.update` takes `code`, `name` and optional `nextCode`; renaming a code preserves its variants. `locale.remove` drops a non-original language. `locale.activate` selects a registered code. Ordinary `block.update` text edits and `text.range.format`/`text.mark.remove` target the active variant, including the original fallback on first edit. Explicit `translation.set` can update a language without switching the active view. Original text can be updated explicitly by supplying the base locale.

`localizedBlock(document,id)` resolves one block with a weakly cached stable identity. Untranslated blocks retain their canonical identity, so an edit to one translated block does not notify unrelated block subscribers. `localizedSectionTitle(document,id)` and stable `localizedSection(document,id)` expose active semantic headings; `documentLocale(document)` exposes the active language. These helpers import no React, browser API or provider.

Portable structured/visual output and trusted TSX template data resolve the active language; HTML declares the corresponding `lang`. JSON preserves every language. Arbitrary user-authored React/HTML source remains an opaque separate representation: the app does not translate arbitrary source code or infer a data binding from it. Switch to the structured Visual/Text representation to export its selected CV language.

## Adding application translations

The editable dictionaries and language list live in [resources.ts](../apps/web/src/i18n/resources.ts). Add a matching dictionary and language entry, then include that dictionary in `resources`. The existing `Translation` type requires a complete matching key set. Components call `useTranslation` from `react-i18next`; new visible strings should use descriptive keys and receive English/French entries. Settings, library navigation/search/sorting, project actions and dialogs, template controls and empty states, workspace modes, export controls and CV language management use these dictionaries; detailed inspector labels remain English. Project/template names remain user/catalog data, and CV content changes only through its independent language commands.

Each SSR instance owns a cloned dictionary store. During development, Fast Refresh updates complete dictionary groups without unloading the active namespace; subscribers observe the added-resource event. This restores newly added keys in an already-open tab while preserving its language, input draft and DOM. The provider exports only its React component; factory/actions live in a separate module so resource updates preserve the refresh boundary. [Real HMR regression](../artifacts/performance/interface-language-hmr.json).

The root creates one synchronous i18next instance per SSR tree and initializes it from the allowlisted interface-language cookie. Hydration receives the same locale. An interface-language user action changes the instance and writes that cookie; an external DOM subscription updates the page language with cleanup. No locale fetch, asynchronous backend or shared mutable server-language singleton is involved.

Implementation references: [react-i18next hooks](https://react.i18next.com/latest/usetranslation-hook), [SSR instance isolation](https://react.i18next.com/latest/ssr), [i18next createInstance](https://www.i18next.com/overview/api), [synchronous resource initialization](https://www.i18next.com/overview/configuration-options).
