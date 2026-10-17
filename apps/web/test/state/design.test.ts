import { expect, test } from "bun:test";
import { createStore } from "jotai";
import { createSession } from "@resumi/engine";
import { createResume } from "@resumi/cv";
import { sessionAtom, undoAtom } from "../../src/state/editor";
import { enableVisualAtom, modeAtom } from "../../src/state/design";

test("opening visual mode deactivates source and creates canvas as one undo step", () => {
  const original = createResume("switch-mode", "react-studio");
  const store = createStore();
  store.set(sessionAtom, createSession(original));
  store.set(modeAtom, "text");
  store.set(enableVisualAtom);
  const session = store.get(sessionAtom)!;
  expect(session.document.canvas).toBeDefined();
  expect(session.document.source).toEqual({
    ...original.source!,
    enabled: false,
  });
  expect(session.past).toHaveLength(1);
  expect(session.past[0].batch.commands[0]).toEqual({
    type: "source.activate",
    enabled: false,
  });
  expect(store.get(modeAtom)).toBe("visual");
  store.set(undoAtom);
  expect(store.get(sessionAtom)?.document).toEqual(original);
});
