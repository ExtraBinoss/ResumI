import { expect, test } from "bun:test";
import { runInNewContext } from "node:vm";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  applyCommand,
  applyCommands,
  createDocument,
  makeLayer,
} from "@resumi/engine";
import { renderDocumentHtml } from "../src/document-render";
import { renderHtml, renderResume } from "../src/renderer";
import { exportReactCanvas } from "../src/react-export";
import { selectedDocumentPages } from "../src/page-export";
import { compileReact } from "../src/source/render";

const image =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jvXcAAAAASUVORK5CYII=";

function project() {
  return applyCommands(createDocument("page-export", "CV & cover letter"), {
    version: 1,
    actor: { kind: "human", name: "Export QA" },
    commands: [
      {
        type: "section.create",
        section: { id: "content", title: "", blockIds: [] },
      },
      ...[
        { id: "cv", kind: "heading" as const, text: "CV_ONLY" },
        { id: "letter", kind: "text" as const, text: "LETTER_ONLY" },
        { id: "detail", kind: "text" as const, text: "Letter detail" },
        { id: "photo", kind: "image" as const, text: "" },
      ].map((block) => ({
        type: "block.create" as const,
        sectionId: "content",
        block,
      })),
      {
        type: "canvas.enable",
        layers: {
          cv: makeLayer("text", { x: 44, y: 50 }),
          letter: makeLayer("text", {
            x: 35,
            y: 40,
            fontFamily: "Export Serif",
            rotation: 3,
          }),
          detail: makeLayer("text", { x: 35, y: 120 }),
          photo: makeLayer("image", {
            x: 250,
            y: 35,
            src: image,
            alt: "Study",
          }),
        },
      },
      {
        type: "canvas.update",
        patch: {
          fonts: [
            {
              id: "export-font",
              name: "Export Serif",
              format: "woff2",
              dataUrl: "data:font/woff2;base64,AAAA",
            },
          ],
        },
      },
      {
        type: "page.create",
        page: {
          id: "cover",
          name: "Cover letter",
          width: 420,
          height: 600,
          background: "#ffeedd",
        },
      },
      {
        type: "layer.moveToPage",
        ids: ["letter", "detail", "photo"],
        pageId: "cover",
      },
      {
        type: "group.create",
        id: "letter-group",
        ids: ["letter", "detail"],
        name: "Letter text",
      },
      { type: "group.update", id: "letter-group", patch: { opacity: 0.8 } },
      { type: "locale.add", code: "fr", name: "Français" },
      {
        type: "translation.set",
        id: "letter",
        locale: "fr",
        text: "Madame, Monsieur <équipe>",
      },
      { type: "locale.activate", code: "fr" },
    ],
  }).document;
}

test("HTML page exports retain selection order, exact native assets and locale without mutating the project", async () => {
  const document = project();
  const original = JSON.stringify(document);
  const single = await renderDocumentHtml(document, { pageIds: ["cover"] });
  expect(single).toContain('lang="fr"');
  expect(single).toContain('data-page-id="cover"');
  expect(single).not.toContain('data-page-id="page-1"');
  expect(single).not.toContain("CV_ONLY");
  expect(single).toContain("Madame, Monsieur &lt;équipe&gt;");
  expect(single).toContain("width:420px;height:600px;background:#ffeedd");
  expect(single).toContain("@page resumi0{size:315pt 450pt;margin:0}");
  expect(single).toContain('data-group-id="letter-group"');
  expect(single).toContain("opacity:0.8");
  expect(single).toContain(image);
  expect(single).toContain("data:font/woff2;base64,AAAA");
  expect(single).toContain("rotate(3deg)");
  const reversed = renderHtml(document, { pageIds: ["cover", "page-1"] });
  expect(reversed.indexOf('data-page-id="cover"')).toBeLessThan(
    reversed.indexOf('data-page-id="page-1"'),
  );
  const all = await renderDocumentHtml(document);
  expect(all.indexOf('data-page-id="page-1"')).toBeLessThan(
    all.indexOf('data-page-id="cover"'),
  );
  expect(JSON.stringify(document)).toBe(original);
});

test("standalone selected-page TSX executes as a React component with the same native snapshot", () => {
  const document = project();
  const original = JSON.stringify(document);
  const options = { pageIds: ["cover"] };
  const source = exportReactCanvas(document, options);
  expect(source).not.toContain("@resumi/");
  const exported: { default?: React.ComponentType } = {};
  runInNewContext(compileReact(source), {
    exports: exported,
    require: (specifier: string) => {
      if (specifier !== "react")
        throw new Error(`Unexpected import: ${specifier}`);
      return React;
    },
  });
  expect(exported.default).toBeFunction();
  const markup = renderToStaticMarkup(React.createElement(exported.default!));
  expect(markup).toContain('<div lang="fr">');
  expect(markup).toContain(renderResume(document, options));
  expect(markup).not.toContain("CV_ONLY");
  expect(markup).toContain("font-family:'Export Serif'");
  expect(JSON.stringify(document)).toBe(original);
});

test("empty, duplicate, missing and unavailable page selections fail explicitly", async () => {
  const document = project();
  for (const render of [renderResume, renderHtml, exportReactCanvas]) {
    expect(() => render(document, { pageIds: [] })).toThrow(
      "at least one page",
    );
    expect(() => render(document, { pageIds: ["missing"] })).toThrow("missing");
    expect(() => render(document, { pageIds: ["cover", "cover"] })).toThrow(
      "only be selected once",
    );
  }
  expect(renderDocumentHtml(document, { pageIds: [] })).rejects.toThrow(
    "at least one page",
  );
  expect(() =>
    selectedDocumentPages(createDocument("plain", "Plain"), {
      pageIds: ["page-1"],
    }),
  ).toThrow("editable canvas pages");
  const invalid = structuredClone(document);
  invalid.canvas!.width = -1;
  expect(() => renderResume(invalid, { pageIds: ["cover"] })).toThrow();
});

test("active source keeps its whole-source HTML path but cannot silently export selected or approximate pages", async () => {
  const document = applyCommand(project(), {
    type: "source.set",
    source: {
      format: "react",
      code: "export default function Original(){return <p>ACTIVE SOURCE</p>}",
    },
  });
  expect(renderDocumentHtml(document, { pageIds: ["cover"] })).rejects.toThrow(
    "source is active",
  );
  expect(() => exportReactCanvas(document)).toThrow("Prepare the resume");
  expect(() => exportReactCanvas(document, { pageIds: ["cover"] })).toThrow(
    "Prepare the resume",
  );
  expect(await renderDocumentHtml(document)).toContain("ACTIVE SOURCE");
  const inactive = applyCommand(document, {
    type: "source.set",
    source: { ...document.source!, enabled: false },
  });
  expect(exportReactCanvas(inactive, { pageIds: ["cover"] })).not.toContain(
    "ACTIVE SOURCE",
  );
});
