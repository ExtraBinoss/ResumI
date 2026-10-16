import { applyCommands } from "../commands/apply";
import type { CommandBatch } from "../commands/schema";
import type { Document } from "../document/schema";

export interface HistoryEntry {
  before: Document;
  after: Document;
  batch: CommandBatch;
}
export interface Session {
  document: Document;
  past: HistoryEntry[];
  future: HistoryEntry[];
}
export const HISTORY_LIMIT = 50;
export function createSession(document: Document): Session {
  return { document, past: [], future: [] };
}
export function execute(session: Session, input: unknown): Session {
  const { document, batch } = applyCommands(session.document, input);
  return {
    document,
    past: [
      ...session.past.slice(-(HISTORY_LIMIT - 1)),
      { before: session.document, after: document, batch },
    ],
    future: [],
  };
}
export function undo(session: Session): Session {
  const entry = session.past.at(-1);
  return entry
    ? {
        document: entry.before,
        past: session.past.slice(0, -1),
        future: [entry, ...session.future],
      }
    : session;
}
export function redo(session: Session): Session {
  const entry = session.future[0];
  return entry
    ? {
        document: entry.after,
        past: [...session.past, entry],
        future: session.future.slice(1),
      }
    : session;
}
