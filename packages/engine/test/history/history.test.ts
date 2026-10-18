import { test, expect } from "bun:test";
import {
  createDocument,
  createSession,
  execute,
  undo,
  redo,
  HISTORY_LIMIT,
} from "../../src/index";
const change = (name: string) => ({
  version: 1,
  actor: { kind: "agent", name: "Codex" },
  commands: [
    { type: "document.update", name },
    { type: "style.update", patch: { font: "serif" } },
  ],
});
test("batch history is one attributed step, with undo/redo and branch invalidation", () => {
  const initial = createSession(createDocument("doc"));
  expect(undo(initial)).toBe(initial);
  expect(redo(initial)).toBe(initial);
  const next = execute(initial, change("Changed"));
  expect(next.past).toHaveLength(1);
  expect(next.past[0].batch.actor.name).toBe("Codex");
  expect(undo(next).document).toEqual(initial.document);
  expect(redo(undo(next)).document).toEqual(next.document);
  expect(execute(undo(next), change("Other")).future).toHaveLength(0);
  expect(() => execute(next, {})).toThrow();
  expect(next.past).toHaveLength(1);
});
test("history is bounded", () => {
  let session = createSession(createDocument("doc"));
  for (let i = 0; i < 80; i++)
    session = execute(session, change(`Version ${i}`));
  expect(session.past).toHaveLength(HISTORY_LIMIT);
});
