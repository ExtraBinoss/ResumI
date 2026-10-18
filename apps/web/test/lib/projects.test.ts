import "fake-indexeddb/auto";
import { test, expect, spyOn } from "bun:test";
import { openDB, deleteDB } from "idb";
import {
  ProjectRepository,
  StorageConflict,
  storageMessage,
} from "../../src/lib/projects";
import { applyCommand } from "@resumi/engine";
test("IndexedDB complete project CRUD, reload, duplicate independence, validation and stale writes", async () => {
  const name = `projects-${crypto.randomUUID()}`,
    repo = new ProjectRepository(name);
  try {
    expect(await repo.list()).toEqual([]);
    const original = await repo.create();
    expect((await repo.get(original.id))?.document).toEqual(original.document);
    const renamed = await repo.rename(original.id, "Renamed");
    expect(renamed.revision).toBe(1);
    const copy = await repo.duplicate(original.id);
    expect(copy.id).not.toBe(original.id);
    expect(copy.document.sectionIds).not.toEqual(original.document.sectionIds);
    await repo.save(
      applyCommand(copy.document, {
        type: "document.update",
        name: "Copy edit",
      }),
      copy.revision,
    );
    expect((await repo.get(original.id))?.document.name).toBe("Renamed");
    await expect(
      repo.save(original.document, original.revision),
    ).rejects.toBeInstanceOf(StorageConflict);
    await repo.close();
    const reopened = new ProjectRepository(name);
    expect(await reopened.list()).toHaveLength(2);
    expect((await reopened.get(copy.id))?.document.name).toBe("Copy edit");
    await reopened.delete(original.id);
    expect(await reopened.get(original.id)).toBeUndefined();
    await expect(reopened.save(original.document, 0)).rejects.toThrow();
    await expect(reopened.rename("missing", "x")).rejects.toThrow();
    await expect(reopened.duplicate("missing")).rejects.toThrow();
    await expect(reopened.import({} as never)).rejects.toThrow();
    await reopened.close();
  } finally {
    await repo.close();
    await deleteDB(name);
  }
});
test("version 1 → 2 storage upgrade preserves records and initializes revisions", async () => {
  const name = `upgrade-${crypto.randomUUID()}`;
  const old = await openDB(name, 1, {
    upgrade(db) {
      db.createObjectStore("projects", { keyPath: "id" });
    },
  });
  const { createResume } = await import("@resumi/cv");
  const document = createResume("v1-doc");
  await old.put("projects", {
    id: document.id,
    document,
    createdAt: "2020",
    updatedAt: "2020",
  });
  old.close();
  const repo = new ProjectRepository(name);
  expect((await repo.get(document.id))?.revision).toBe(0);
  expect(await repo.list()).toHaveLength(1);
  await repo.rename(document.id, "Migrated");
  expect((await repo.get(document.id))?.revision).toBe(1);
  await repo.close();
  await deleteDB(name);
});
test("storage failure feedback distinguishes quota and conflicts", () => {
  expect(
    storageMessage(new DOMException("Full", "QuotaExceededError")),
  ).toContain("full");
  expect(storageMessage(new StorageConflict())).toContain("another tab");
  expect(storageMessage(new Error())).toContain("backup");
});

test("cancelled saves preserve the exact stored project before and during the IndexedDB transaction", async () => {
  const name = `cancel-${crypto.randomUUID()}`;
  const repo = new ProjectRepository(name);
  const original = await repo.create();
  const changed = applyCommand(original.document, {
    type: "document.update",
    name: "Cancelled edit",
  });
  const rawGet = IDBObjectStore.prototype.get;
  const controller = new AbortController();
  let interrupted = false;
  const get = spyOn(IDBObjectStore.prototype, "get").mockImplementation(
    function (this: IDBObjectStore, key: IDBValidKey | IDBKeyRange) {
      const request = rawGet.call(this, key);
      if (
        this.transaction.db.name === name &&
        this.transaction.mode === "readwrite"
      ) {
        interrupted = true;
        queueMicrotask(() => controller.abort());
      }
      return request;
    },
  );
  try {
    let failure: unknown;
    try {
      await repo.save(changed, original.revision, controller.signal);
    } catch (error) {
      failure = error;
    }
    expect(interrupted).toBe(true);
    expect(failure).toBeInstanceOf(DOMException);
    expect((failure as DOMException).name).toBe("AbortError");
    get.mockRestore();
    expect(await repo.get(original.id)).toEqual(original);
    const alreadyAborted = AbortSignal.abort();
    failure = undefined;
    try {
      await repo.save(changed, original.revision, alreadyAborted);
    } catch (error) {
      failure = error;
    }
    expect((failure as DOMException).name).toBe("AbortError");
    expect(await repo.get(original.id)).toEqual(original);
  } finally {
    get.mockRestore();
    await repo.close();
    await deleteDB(name);
  }
});
