# Document and agent contract

The generic engine exports `createDocument`, `validateDocument`, `applyCommand`, `applyCommands`, `createSession`, `execute`, `undo`, `redo`, `serializeDocument`, `deserializeDocument`, `migrateDocument` and `duplicateDocument`. IDs are supplied explicitly; commands never consult clocks, browser state, providers or randomness. For the same document and batch, the result is deterministic.

A `Document` has `schemaVersion: 1`, `id`, `name`, `sectionIds`, normalized `sections` and `blocks` maps and constrained style properties. Sections own ordered block IDs; each block belongs to exactly one section. No orphan or globally duplicated IDs, injected properties, unchecked HTML or arbitrary CSS. Empty documents/sections and text are valid. Maximums: 50 sections, 200 blocks per section, 20,000 characters per block, 100 commands per batch. Text blocks have heading/text/subtitle/meta/bullet presentation roles; the engine does not know what employment or education means. Static template catalogs do not need CRUD.

Commands: `document.update`, `style.update`, `section.create/update/delete/reorder`, `block.create/update/delete/reorder`. Section deletion cascades its blocks. Reorders must preserve exactly the current IDs. Creates support an optional insertion index; sections start empty and blocks are created explicitly. Read/inspect uses validated document snapshots, including ID maps. `EngineError` provides `INVALID_INPUT`, `NOT_FOUND`, `CONFLICT`, `INVALID_VERSION` codes. Version 0 migration maps the early ResumI `title` field to `name`; this is not a Vue V1 compatibility claim.

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
