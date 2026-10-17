import { test, expect } from "bun:test";
import { createStore } from "jotai";
import { createResume } from "@resumi/cv";
import { createSession } from "@resumi/engine";
import {
  blockAtom,
  sectionAtom,
  sessionAtom,
  commandAtom,
  undoAtom,
  redoAtom,
} from "../../src/state/editor";
test("one-field commands notify only changed block subscribers, with one canonical session", () => {
  const store = createStore();
  store.set(sessionAtom, createSession(createResume("subscriptions")));
  let changed = 0,
    unrelated = 0,
    section = 0;
  const subscriptions = [
    store.sub(blockAtom("profile-0"), () => changed++),
    store.sub(blockAtom("education-0"), () => unrelated++),
    store.sub(sectionAtom("profile"), () => section++),
  ];
  store.set(commandAtom, {
    type: "block.update",
    id: "profile-0",
    patch: { text: "Only this block changes." },
  });
  expect(changed).toBe(1);
  expect(unrelated).toBe(0);
  expect(section).toBe(0);
  store.set(undoAtom);
  expect(store.get(blockAtom("profile-0"))?.text).not.toBe(
    "Only this block changes.",
  );
  store.set(redoAtom);
  expect(store.get(blockAtom("profile-0"))?.text).toBe(
    "Only this block changes.",
  );
  expect(unrelated).toBe(0);
  expect(section).toBe(0);
  subscriptions.forEach((unsubscribe) => unsubscribe());
});

test("overlapping autosave/navigation flushes serialize writes and drain the latest edit", async () => {
  const { createEditorController, saveStatusAtom } =
    await import("../../src/state/editor");
  const document = createResume("queued-save"),
    revisions: number[] = [];
  let release!: () => void,
    concurrent = 0,
    maxConcurrent = 0;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const controller = createEditorController(
    {
      id: document.id,
      document,
      revision: 0,
      createdAt: "now",
      updatedAt: "now",
    },
    {
      async save(doc, revision) {
        revisions.push(revision);
        concurrent++;
        maxConcurrent = Math.max(maxConcurrent, concurrent);
        await gate;
        concurrent--;
        return {
          id: doc.id,
          document: doc,
          revision: revision + 1,
          createdAt: "now",
          updatedAt: "now",
        };
      },
    },
  );
  controller.store.set(commandAtom, {
    type: "document.update",
    name: "First edit",
  });
  const first = controller.flush();
  controller.store.set(commandAtom, {
    type: "document.update",
    name: "Latest edit",
  });
  const second = controller.flush(),
    third = controller.flush();
  release();
  await Promise.all([first, second, third]);
  expect(maxConcurrent).toBe(1);
  expect(revisions).toEqual([0, 1]);
  expect(controller.store.get(sessionAtom)?.document.name).toBe("Latest edit");
  expect(controller.store.get(saveStatusAtom)).toBe("saved");
  controller.dispose();
});

test("editor persistence reconnects after StrictMode cleanup", async () => {
  const { createEditorController } = await import("../../src/state/editor");
  const document = createResume("reconnect");
  const saved: string[] = [];
  const controller = createEditorController(
    {
      id: document.id,
      document,
      revision: 0,
      createdAt: "now",
      updatedAt: "now",
    },
    {
      async save(doc, revision) {
        saved.push(doc.name);
        return {
          id: doc.id,
          document: doc,
          revision: revision + 1,
          createdAt: "now",
          updatedAt: "now",
        };
      },
    },
  );
  controller.connect();
  controller.dispose();
  controller.connect();
  await Promise.resolve();
  controller.store.set(commandAtom, {
    type: "document.update",
    name: "Saved after reconnect",
  });
  await Bun.sleep(220);
  expect(saved).toEqual(["Saved after reconnect"]);
  controller.dispose();
});

test("localized block atoms preserve unrelated block identity and translate through the canonical session", () => {
  const store = createStore();
  store.set(
    sessionAtom,
    createSession(createResume("localization-subscriptions")),
  );
  let translated = 0,
    unrelated = 0;
  const subscriptions = [
    store.sub(blockAtom("identity-0"), () => translated++),
    store.sub(blockAtom("profile-0"), () => unrelated++),
  ];
  store.set(commandAtom, { type: "locale.add", code: "fr", name: "Français" });
  store.set(commandAtom, {
    type: "translation.set",
    id: "identity-0",
    locale: "fr",
    text: "Camille Martin",
  });
  expect(translated).toBe(1);
  store.set(commandAtom, { type: "locale.activate", code: "fr" });
  expect(store.get(blockAtom("identity-0"))?.text).toBe("Camille Martin");
  expect(translated).toBe(2);
  expect(unrelated).toBe(0);
  store.set(commandAtom, {
    type: "block.update",
    id: "identity-0",
    patch: { text: "Camille Durand" },
  });
  expect(store.get(sessionAtom)?.document.blocks["identity-0"].text).toBe(
    "Alex Morgan",
  );
  expect(unrelated).toBe(0);
  subscriptions.forEach((unsubscribe) => unsubscribe());
});
