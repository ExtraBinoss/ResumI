import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import {
  applyCommand,
  duplicateDocument,
  validateDocument,
  type Document,
} from "@resumi/engine";
import { createResume, enableVisual } from "@resumi/cv";

export interface Project {
  id: string;
  document: Document;
  createdAt: string;
  updatedAt: string;
  revision: number;
}
interface ProjectDB extends DBSchema {
  projects: { key: string; value: Project; indexes: { "by-updated": string } };
}
export class StorageConflict extends Error {}
export function storageMessage(error: unknown): string {
  if (error instanceof StorageConflict)
    return "This resume changed in another tab. Export your changes, then reload to open the latest version.";
  if (error instanceof DOMException && error.name === "QuotaExceededError")
    return "Device storage is full. Export your resume as JSON, then free some space.";
  return "Could not access local storage. Keep this tab open and export a JSON backup. You can retry saving.";
}
export class ProjectRepository {
  private database?: Promise<IDBPDatabase<ProjectDB>>;
  constructor(private name = "resumi-projects") {}
  private db() {
    return (this.database ??= openDB<ProjectDB>(this.name, 2, {
      upgrade(db, oldVersion, _newVersion, tx) {
        if (oldVersion < 1) db.createObjectStore("projects", { keyPath: "id" });
        if (oldVersion < 2) {
          const store = tx.objectStore("projects");
          store.createIndex("by-updated", "updatedAt");
          void store
            .openCursor()
            .then(async function migrate(cursor): Promise<void> {
              if (!cursor) return;
              await cursor.update({
                ...cursor.value,
                revision: cursor.value.revision ?? 0,
              });
              return migrate(await cursor.continue());
            });
        }
      },
      blocking: () => {
        void this.close();
      },
    }).catch((error) => {
      this.database = undefined;
      throw error;
    }));
  }
  async list(): Promise<Project[]> {
    const db = await this.db();
    return (await db.getAllFromIndex("projects", "by-updated")).reverse();
  }
  async get(id: string): Promise<Project | undefined> {
    const record = await (await this.db()).get("projects", id);
    return record
      ? { ...record, document: validateDocument(record.document) }
      : undefined;
  }
  async create(template = "studio"): Promise<Project> {
    const document = createResume(crypto.randomUUID(), template);
    return this.import(document.source ? document : enableVisual(document));
  }
  async import(document: Document): Promise<Project> {
    const copy = duplicateDocument(
      validateDocument(document),
      crypto.randomUUID(),
      () => crypto.randomUUID(),
    );
    const imported = applyCommand(copy, {
      type: "document.update",
      name: document.name,
    });
    const date = new Date().toISOString();
    const project = {
      id: copy.id,
      document: imported,
      createdAt: date,
      updatedAt: date,
      revision: 0,
    };
    await (await this.db()).add("projects", project);
    return project;
  }
  async save(document: Document, expectedRevision: number): Promise<Project> {
    const valid = validateDocument(document);
    const tx = (await this.db()).transaction("projects", "readwrite");
    const existing = await tx.store.get(valid.id);
    if (!existing || existing.revision !== expectedRevision) {
      tx.abort();
      await tx.done.catch(() => undefined);
      throw new StorageConflict("Stale or missing project.");
    }
    const project = {
      ...existing,
      document: valid,
      updatedAt: new Date().toISOString(),
      revision: expectedRevision + 1,
    };
    await tx.store.put(project);
    await tx.done;
    return project;
  }
  async rename(id: string, name: string): Promise<Project> {
    const project = await this.get(id);
    if (!project) throw new Error("Project not found.");
    return this.save(
      applyCommand(project.document, { type: "document.update", name }),
      project.revision,
    );
  }
  async duplicate(id: string): Promise<Project> {
    const project = await this.get(id);
    if (!project) throw new Error("Project not found.");
    const doc = duplicateDocument(project.document, crypto.randomUUID(), () =>
      crypto.randomUUID(),
    );
    return this.import(doc);
  }
  async delete(id: string): Promise<void> {
    await (await this.db()).delete("projects", id);
  }
  async close() {
    if (this.database) (await this.database).close();
    this.database = undefined;
  }
}
export const projects = new ProjectRepository();
