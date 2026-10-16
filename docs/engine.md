# Document and agent contract

The generic engine exports `createDocument`, `validateDocument`, `applyCommand`, `applyCommands`, `createSession`, `execute`, `undo`, `redo`, `serializeDocument`, `deserializeDocument`, `migrateDocument` and `duplicateDocument`. IDs are supplied explicitly; commands never consult clocks, browser state, providers or randomness. For the same document and batch, the result is deterministic.

A `Document` has `schemaVersion: 1`, `id`, `name`, `sectionIds`, normalized `sections` and `blocks` maps and constrained style properties. Sections own ordered block IDs; each block belongs to exactly one section. Unknown fields, orphan blocks and globally duplicated document/section/block/group IDs are rejected. Empty documents/sections and text are valid. Maximums: 50 sections, 200 blocks per section, 20,000 characters per block, 100 commands per batch. Text blocks have heading/text/subtitle/meta/bullet presentation roles; the engine does not know what employment or education means. Static template catalogs do not need CRUD. Visual blocks add explicit `shape` and `image` kinds. Optional HTML/React source is opaque data to the engine, isolated from the structured document; the source workflow documents its compilation and preview policy separately.

Commands: `document.update`, `style.update`, `section.create/update/delete/reorder`, `block.create/update/delete/reorder`. Section deletion cascades its blocks. Reorders must preserve exactly the current IDs. Creates support an optional insertion index; sections start empty and blocks are created explicitly. Read/inspect uses validated document snapshots, including ID maps. `EngineError` provides `INVALID_INPUT`, `NOT_FOUND`, `CONFLICT`, `INVALID_VERSION` codes. Version 0 migration maps the early ResumI `title` field to `name`; this is not a Vue V1 compatibility claim.

## Visual document and layer commands

An optional `canvas` adds page width/height/background, an explicit back-to-front `order`, flat groups and embedded fonts. Each block then has a validated `design`: its geometry, rotation, opacity, blend mode, lock/visibility and type-specific properties. Existing structured documents remain valid. `canvas.enable` supplies every current block's layer exactly once and initializes layer order from section order. The CV package's deterministic projection constructs this command batch; it does not create a separate document model.

| Command | Meaning |
| --- | --- |
| `canvas.update` | Change page dimensions, background or embedded fonts. |
| `layer.update` | Patch one or more layers' geometry, appearance or type-specific properties. |
| `layer.translate` | Move distinct layer IDs by one shared `dx`/`dy`. |
| `layer.relocate` | Move an element/group above or below a target, to front/back, or move an element inside a group. |
| `layer.duplicate` | Copy explicit source/new-ID pairs with a shared offset; copies start ungrouped. |
| `group.create/update/ungroup` | Create a named group with an explicit ID, update composite properties, or preserve its elements while ungrouping. |
| `text.range.format` | Add or replace an explicitly identified style/link mark on a validated text range. |
| `text.mark.remove` | Remove the identified mark from a text layer. |

Groups contain contiguous elements in visual order, with at most one group per element and no nesting. Creating or relocating layers preserves these invariants. A group has independent opacity, blend mode, collapsed state, visibility and lock. Hidden layers remain editable. Locked layers and members of locked groups reject content, geometry, duplication, deletion and visual reordering commands; visibility/lock controls remain usable. Ungrouping a locked group requires unlocking it first. Semantic reading order and visual stacking order are independent; block/section deletion updates both models atomically.

All 16 blend modes include multiply, screen, overlay and luminosity. Text layers support font family/size/weight/style, line height, letter spacing, alignment, case, underline/strike and overlapping range marks. Text updates preserve or trim affected ranges and allocate valid, deterministic mark IDs when required. Range links accept only HTTP(S), mail and telephone schemes. Shape layers support the engine shape catalog or constrained SVG path geometry, solid/linear-gradient fills, stroke and radius. Images support embedded PNG/JPEG/WebP data, crop position, cover/contain, scale and radius. Images and shapes share bounded blur, grain, grain size, dither, brightness, contrast and saturation effects. Shape gradient stops have unique IDs and bounded offsets. No design command accepts arbitrary CSS or executable SVG. Fonts accept bounded embedded font data; external asset URLs are rejected.

The renderer uses the same layer geometry, rich segments, groups, gradients and effect definitions for previews and portable HTML. It validates the document before interpolation. The engine itself imports no renderer, framework, browser database or provider.

## Document size and portable files

`MAX_DOCUMENT_CONTENT_BYTES` is **12,000,000 bytes**, measured as the exact UTF-8 size of the complete canonical formatted JSON export. This global invariant includes images, fonts, source code, text, metadata, JSON escaping and indentation. Commands that exceed it fail atomically. Images/font data strings retain their individual 1,500,000-character limit, and embedded fonts are limited to 12. Assets do not each receive an independent 12 MB allowance.

`MAX_DOCUMENT_FILE_BYTES` is **16,000,000 bytes**, shared by the browser file reader and headless `deserializeDocument`. The extra 4 MB permits harmless input formatting around a valid document; parsing still enforces the 12 MB content budget and every schema/invariant. Byte counting includes multibyte Unicode rather than only JavaScript string length. Every valid canonical export therefore fits the import limit. The budget counter avoids allocating a full document JSON string on each edit and caches unchanged string measurements with weak object keys; it detects changed strings on externally supplied objects.

```json
{
  "version": 1,
  "actor": { "kind": "agent", "name": "Codex" },
  "commands": [
    { "type": "document.update", "name": "Product design application" },
    {
      "type": "style.update",
      "patch": { "font": "serif", "accent": "#334e68" }
    }
  ]
}
```

Batches parse and validate before any publication, work on immutable transformations, and validate the complete final document. If any operation fails, nothing publishes. `execute` records one attributed history entry per batch; undo/redo restores exact before/after snapshots, new edits discard the redo branch. Unaffected records retain their identity. Consumers must treat engine snapshots as immutable; use commands rather than mutate object references.

The browser event adapter wraps single human actions in the same v1 envelope. Agent-panel preview executes against a session copy. A preview that predates a human edit cannot be applied until validated again. Apply executes the validated batch against the current session, revalidating it; all changes are visible and undoable as one step. Actor names record provenance, not authenticated identity. JSON Schema is available through `bun run resumi document schema`; [generated example](../artifacts/rendered/commands.schema.json).

## File handoff for CLI agents

1. In Export, save a **JSON document**. The CLI cannot read browser IndexedDB.
2. `bun run resumi document inspect cv.json` to read IDs, content and styles.
3. Generate a v1 batch (`patch.json`) using these IDs, or paste a proposal into Teammate to validate and preview.
4. `bun run resumi document apply cv.json patch.json --out edited.json` writes a separate validated file. Without `--out`, inspect the JSON document in stdout; input is not overwritten.
5. `bun run resumi document validate edited.json` and `bun run resumi document render edited.json --format html --out preview.html`.
6. Open the standalone HTML to inspect the real rendering. Import `edited.json` from Projects to create an independent local project.

`document create [--template studio|editorial] [--out FILE]`, `inspect FILE`, `validate FILE`, `apply FILE PATCH [--out FILE]`, `render FILE --format html --out FILE` and `schema` are implemented. `--help` describes all flags. Document responses are JSON stdout, errors are JSON stderr. Exit 0 success, 2 argument errors, 3 invalid document/command, 4 file I/O. CLI handlers have injected file I/O for tests; the engine has no duplicate CLI business logic.

## Future transports

A remote **MCP server** would authenticate users, authorize a document, persist revisions remotely and expose schemas/commands through a Workers transport. A browser **WebMCP** adapter would operate in an explicitly authorized browser session. These are distinct transports; neither is implemented, deployed or advertised as live. Both can consume the existing command contract without changing business rules. Live editing additionally needs authenticated file/project association, conflict handling and explicit permissions. Provider inference (OpenAI/Anthropic/xAI) is also future work; the working CLI requires none of those providers.
