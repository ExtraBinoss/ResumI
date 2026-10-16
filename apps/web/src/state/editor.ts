import { atom, createStore } from "jotai";
import {
  createSession,
  execute,
  redo,
  undo,
  type Command,
  type CommandBatch,
  type Session,
  type Document,
} from "@resumi/engine";
import { projects, storageMessage, type Project } from "../lib/projects";

export const sessionAtom = atom<Session | null>(null);
export const selectionAtom = atom<{
  sectionId: string;
  blockId?: string;
  blockIds?: string[];
  groupId?: string;
} | null>(null);
export const saveStatusAtom = atom<"saved" | "saving" | "error">("saved");
export const saveErrorAtom = atom("");
export const zoomAtom = atom(75);
export const sectionIdsAtom = atom(
  (get) => get(sessionAtom)?.document.sectionIds ?? [],
);
export const styleAtom = atom((get) => get(sessionAtom)?.document.style);
export const nameAtom = atom(
  (get) => get(sessionAtom)?.document.name ?? "Resume",
);
export const historyAtom = atom((get) => {
  const session = get(sessionAtom);
  return { undo: !!session?.past.length, redo: !!session?.future.length };
});
const sections = new Map<string, ReturnType<typeof makeSectionAtom>>();
const blocks = new Map<string, ReturnType<typeof makeBlockAtom>>();
function makeSectionAtom(id: string) {
  return atom((get) => get(sessionAtom)?.document.sections[id]);
}
function makeBlockAtom(id: string) {
  return atom((get) => get(sessionAtom)?.document.blocks[id]);
}
// Atom caches live for one editor mount, and are released by the controller on dispose.
export function sectionAtom(id: string) {
  let value = sections.get(id);
  if (!value) {
    value = makeSectionAtom(id);
    sections.set(id, value);
  }
  return value;
}
export function blockAtom(id: string) {
  let value = blocks.get(id);
  if (!value) {
    value = makeBlockAtom(id);
    blocks.set(id, value);
  }
  return value;
}
function prepareSelectors(document: Document) {
  sectionAtom("");
  blockAtom("");
  document.sectionIds.forEach(sectionAtom);
  Object.keys(document.blocks).forEach(blockAtom);
}
export const commandAtom = atom(
  null,
  (get, set, input: Command | CommandBatch) => {
    const session = get(sessionAtom);
    if (!session) return;
    const batch =
      "commands" in input
        ? input
        : {
            version: 1,
            actor: { kind: "human", name: "Editor" },
            commands: [input],
          };
    const next = execute(session, batch);
    prepareSelectors(next.document);
    set(sessionAtom, next);
  },
);
export const undoAtom = atom(null, (get, set) => {
  const session = get(sessionAtom);
  if (session) set(sessionAtom, undo(session));
});
export const redoAtom = atom(null, (get, set) => {
  const session = get(sessionAtom);
  if (session) set(sessionAtom, redo(session));
});
export function createEditorController(
  project: Project,
  repository: Pick<typeof projects, "save"> = projects,
) {
  const store = createStore();
  store.set(sessionAtom, createSession(project.document));
  prepareSelectors(store.get(sessionAtom)!.document);
  let revision = project.revision,
    saved = store.get(sessionAtom)!.document;
  let timer: ReturnType<typeof setTimeout> | undefined,
    active: Promise<void> | undefined;
  async function drain(): Promise<void> {
    while (store.get(sessionAtom)!.document !== saved) {
      const document = store.get(sessionAtom)!.document;
      store.set(saveStatusAtom, "saving");
      try {
        const record = await repository.save(document, revision);
        revision = record.revision;
        saved = document;
      } catch (error) {
        store.set(saveStatusAtom, "error");
        store.set(saveErrorAtom, storageMessage(error));
        return;
      }
    }
    store.set(saveStatusAtom, "saved");
    store.set(saveErrorAtom, "");
  }
  function flush(): Promise<void> {
    clearTimeout(timer);
    // Every caller joins one drain, including edits made during an in-flight write.
    return (active ??= drain().finally(() => {
      active = undefined;
    }));
  }
  let unsubscribe: (() => void) | undefined;
  function connect() {
    prepareSelectors(store.get(sessionAtom)!.document);
    unsubscribe ??= store.sub(sessionAtom, () => {
      store.set(saveStatusAtom, "saving");
      clearTimeout(timer);
      timer = setTimeout(() => {
        void flush();
      }, 180);
    });
  }
  return {
    store,
    connect,
    flush,
    dispose() {
      unsubscribe?.();
      unsubscribe = undefined;
      clearTimeout(timer);
      void flush();
      sections.clear();
      blocks.clear();
    },
  };
}
export type EditorController = ReturnType<typeof createEditorController>;
