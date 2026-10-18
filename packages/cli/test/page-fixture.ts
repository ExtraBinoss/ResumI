import {
  applyCommands,
  createDocument,
  makeLayer,
  serializeDocument,
  type Document,
} from "@resumi/engine";
import type { IO } from "../src/handler";

export function applicationDocument() {
  return applyCommands(createDocument("application", "CV and cover letter"), {
    version: 1,
    actor: { kind: "agent", name: "Synthetic application QA" },
    commands: [
      {
        type: "section.create",
        section: { id: "content", title: "", blockIds: [] },
      },
      { type: "canvas.enable", layers: {} },
      { type: "canvas.update", patch: { width: 420, height: 594 } },
      {
        type: "page.create",
        page: {
          id: "letter",
          name: "../../Cover letter ?",
          width: 600,
          height: 840,
          background: "#eeeeee",
        },
      },
      {
        type: "page.create",
        page: {
          id: "notes",
          name: "../../Cover letter ?",
          width: 500,
          height: 500,
          background: "#ffffff",
        },
      },
      {
        type: "block.create",
        sectionId: "content",
        block: {
          id: "cv",
          kind: "text",
          text: "Alex Morgan curriculum vitae",
          design: makeLayer("text", {
            x: 30,
            y: 30,
            width: 350,
            height: 50,
            fontSize: 20,
          }),
        },
      },
      {
        type: "block.create",
        sectionId: "content",
        block: {
          id: "letter-text",
          kind: "text",
          text: "Dear hiring team, I am applying for the designer role.",
          design: makeLayer("text", {
            pageId: "letter",
            x: 30,
            y: 30,
            width: 520,
            height: 70,
            fontSize: 18,
          }),
        },
      },
      {
        type: "block.create",
        sectionId: "content",
        block: {
          id: "portfolio",
          kind: "text",
          text: "Portfolio",
          design: makeLayer("text", {
            pageId: "letter",
            x: 30,
            y: 120,
            width: 300,
            height: 40,
          }),
        },
      },
      {
        type: "text.range.format",
        id: "portfolio",
        markId: "portfolio-link",
        start: 0,
        end: 9,
        style: { href: "https://example.com/work" },
      },
      {
        type: "group.create",
        id: "letter-group",
        ids: ["letter-text", "portfolio"],
        name: "Cover letter",
      },
    ],
  }).document;
}
export function pageMemory(document: Document = applicationDocument()) {
  const original = serializeDocument(document),
    files = new Map<string, string>([["application.json", original]]),
    binaries = new Map<string, Uint8Array>();
  const io: IO = {
    id: () => "application",
    read: async (path) => {
      if (!files.has(path)) throw Error("missing");
      return files.get(path)!;
    },
    write: async (path, data) => {
      files.set(path, data);
    },
    writeBinary: async (path, data) => {
      binaries.set(path, data);
    },
  };
  return { io, files, binaries, original };
}
