import { expect, test } from "bun:test";
import {
  applyCommand,
  applyCommands,
  createDocument,
  makeLayer,
  DEFAULT_VISUAL_EFFECTS,
  type Document,
} from "@resumi/engine";
import {
  renderHtml,
  renderResume,
  renderLayerContent,
  canvasFontCss,
  layerStyle,
  groupStyle,
} from "../src";

function designDocument(): Document {
  return applyCommands(createDocument("visual-document", "Synthetic resume"), {
    version: 1,
    actor: { kind: "human", name: "Renderer QA" },
    commands: [
      {
        type: "section.create",
        section: { id: "content", title: "", blockIds: [] },
      },
      {
        type: "block.create",
        sectionId: "content",
        block: { id: "name", kind: "heading", text: "Alex <Morgan> & Co" },
      },
      {
        type: "block.create",
        sectionId: "content",
        block: { id: "caption", kind: "text", text: "Creative designer" },
      },
      {
        type: "canvas.enable",
        layers: {
          name: makeLayer("text", {
            x: 42,
            y: 55,
            width: 510,
            height: 80,
            rotation: 5,
            opacity: 0.7,
            blendMode: "multiply",
            fontSize: 42,
            fontWeight: 650,
          }),
          caption: makeLayer("text", { y: 150 }),
        },
      },
    ],
  }).document;
}

test("freeform renderer uses actual layer frames and escapes rich text and links", () => {
  let doc = designDocument();
  doc = applyCommand(doc, {
    type: "text.range.format",
    id: "name",
    markId: "link",
    start: 0,
    end: 4,
    style: {
      href: 'https://example.com/?a=1&b="quoted"',
      fontSize: 30,
      fontWeight: 700,
      color: "#aabbcc",
      underline: true,
      strike: true,
    },
  });
  const html = renderResume(doc);
  expect(html).toContain('class="resume freeform"');
  expect(html).toContain(
    "left:42px;top:55px;width:510px;height:80px;transform:rotate(5deg);opacity:0.7;mix-blend-mode:multiply",
  );
  expect(html).toContain("&lt;Morgan&gt; &amp; Co");
  expect(html).not.toContain("<Morgan>");
  expect(html).toContain(
    'href="https://example.com/?a=1&amp;b=&quot;quoted&quot;"',
  );
  expect(html).toContain("text-decoration:underline line-through");
  expect(html).toContain('rel="noopener noreferrer"');
  expect(html).toContain(renderLayerContent(doc.blocks.name));
  expect(layerStyle(doc.blocks.name.design!)).toMatchObject({
    left: 42,
    top: 55,
    transform: "rotate(5deg)",
    mixBlendMode: "multiply",
  });
});

test("groups preserve z-order, composite appearance, and hide children without leaking content", () => {
  let doc = designDocument();
  doc = applyCommand(doc, {
    type: "group.create",
    id: "identity",
    ids: ["name", "caption"],
    name: "Identity",
  });
  doc = applyCommand(doc, {
    type: "group.update",
    id: "identity",
    patch: { opacity: 0.4, blendMode: "screen" },
  });
  const html = renderResume(doc);
  expect(html.match(/data-group-id="identity"/g)).toHaveLength(1);
  expect(html).toContain('style="opacity:0.4;mix-blend-mode:screen"');
  expect(html.indexOf('data-block-id="name"')).toBeLessThan(
    html.indexOf('data-block-id="caption"'),
  );
  expect(groupStyle(doc.canvas!.groups[0])).toEqual({
    opacity: 0.4,
    mixBlendMode: "screen",
  });
  doc = applyCommand(doc, {
    type: "layer.update",
    ids: ["name"],
    patch: { hidden: true },
  });
  expect(renderResume(doc)).not.toContain('data-block-id="name"');
  expect(renderResume(doc)).toContain("Creative designer");
  doc = applyCommand(doc, {
    type: "group.update",
    id: "identity",
    patch: { hidden: true },
  });
  expect(renderResume(doc)).not.toContain("Creative designer");
  expect(renderResume(doc)).not.toContain('data-group-id="identity"');
});

test("shape gradients, rounded geometry and visual effects are preserved in portable SVG", () => {
  let doc = designDocument();
  const gradient = {
    type: "linear" as const,
    angle: 90,
    stops: [
      { id: "start", offset: 0, color: "#ff0000" },
      { id: "end", offset: 1, color: "#0000ff" },
    ],
  };
  doc = applyCommand(doc, {
    type: "block.create",
    sectionId: "content",
    block: {
      id: "shape",
      kind: "shape",
      text: "",
      design: makeLayer("shape", {
        width: 200,
        height: 100,
        borderRadius: 20,
        gradient,
        stroke: "#112233",
        strokeWidth: 3,
        effects: {
          ...DEFAULT_VISUAL_EFFECTS,
          blur: 1.5,
          brightness: 1.2,
          grain: 0.25,
          dither: 0.4,
        },
      }),
    },
  });
  const html = renderHtml(doc);
  expect(html).toContain('<linearGradient id="gradient-shape"');
  expect(html).toContain('<stop offset="0" stop-color="#ff0000"/>');
  expect(html).toContain(
    'fill="url(#gradient-shape)" stroke="#112233" stroke-width="3"',
  );
  expect(html).toContain('<rect width="100" height="100" rx="10" ry="20"/>');
  expect(html).toContain("filter:url(#folio-fx-shape)");
  expect(html).toContain('stdDeviation="1.5"');
  expect(html).toContain('result="dithered"');
  expect(html).toContain('result="maskedGrain"');
  doc = applyCommand(doc, {
    type: "layer.update",
    ids: ["shape"],
    patch: {
      shape: "custom-icon",
      vector: { path: "M2 2L20 20Z", viewBox: "0 0 24 24", strokeOnly: true },
      fill: "#123456",
      strokeWidth: 0,
    },
  });
  expect(renderResume(doc)).toContain(
    'fill="none" stroke="#123456" stroke-width="2"',
  );
  expect(renderResume(doc)).toContain('<path d="M2 2L20 20Z"/>');
});

test("raster images retain crop, effects and escaped alt text; fonts are offline embedded", () => {
  let doc = designDocument();
  doc = applyCommand(doc, {
    type: "block.create",
    sectionId: "content",
    block: {
      id: "image",
      kind: "image",
      text: "",
      design: makeLayer("image", {
        src: "data:image/png;base64,AAAA",
        alt: 'A "sample" <portrait>',
        objectFit: "contain",
        objectPosition: { x: 25, y: 75 },
        imageScale: 2,
        borderRadius: 24,
        effects: { ...DEFAULT_VISUAL_EFFECTS, saturation: 0.5 },
      }),
    },
  });
  doc = applyCommand(doc, {
    type: "canvas.update",
    patch: {
      fonts: [
        {
          id: "font",
          name: "Synthetic 'Font'",
          dataUrl: "data:font/woff2;base64,AAAA",
          format: "woff2",
        },
      ],
    },
  });
  const html = renderHtml(doc);
  expect(html).toContain('src="data:image/png;base64,AAAA"');
  expect(html).toContain('alt="A &quot;sample&quot; &lt;portrait&gt;"');
  expect(html).toContain(
    "object-fit:contain;object-position:25% 75%;transform:scale(2)",
  );
  expect(html).toContain("border-radius:24px;filter:url(#folio-fx-image)");
  expect(html).toContain(
    "font-family:'Synthetic Font';src:url('data:font/woff2;base64,AAAA') format('woff2')",
  );
  expect(canvasFontCss(doc)).not.toContain("https:");
  expect(canvasFontCss({ ...doc, canvas: undefined })).toBe("");
});

test("public renderer rejects unsafe SVG/CSS/link/image payloads before interpolation", () => {
  const original = designDocument();
  for (const mutate of [
    (doc: Document) => {
      if (doc.blocks.name.design?.type === "text")
        doc.blocks.name.design.fontFamily =
          "Arial; background:url(https://example.com)";
    },
    (doc: Document) => {
      if (doc.blocks.name.design?.type === "text")
        doc.blocks.name.design.marks = [
          { id: "unsafe", start: 0, end: 4, href: "javascript:alert(1)" },
        ];
    },
    (doc: Document) => {
      doc.blocks.name.design!.blendMode = "normal;display:none" as "normal";
    },
    (doc: Document) => {
      doc.blocks.name.design!.x = NaN;
    },
  ]) {
    const doc = structuredClone(original);
    mutate(doc);
    expect(() => renderHtml(doc)).toThrow();
  }
  expect(renderHtml(original)).not.toContain("<script");
});

test("range formatting can remove a base underline and strike without decoration propagating from the parent", () => {
  let doc = applyCommand(designDocument(), {
    type: "layer.update",
    ids: ["name"],
    patch: { underline: true, strike: true },
  });
  doc = applyCommand(doc, {
    type: "text.range.format",
    id: "name",
    markId: "plain-prefix",
    start: 0,
    end: 4,
    style: { underline: false, strike: false },
  });
  const html = renderLayerContent(doc.blocks.name);
  const parent = html.match(/^<h1[^>]*style="([^"]+)"/)![1];
  const segments = [...html.matchAll(/<span style="([^"]+)">([^<]*)<\/span>/g)];
  expect(parent).toContain("text-decoration:none");
  expect(segments[0][2]).toBe("Alex");
  expect(segments[0][1]).toContain("text-decoration:none");
  expect(segments[1][1]).toContain("text-decoration:underline line-through");
});

test("image border radius and shadow render identically in canvas styles and portable CSS", () => {
  let doc = designDocument();
  const layer = makeLayer("image", {
    src: "data:image/png;base64,AAAA",
    borderRadius: 12,
    border: { width: 3, color: "#123456", style: "dotted" },
    shadow: { x: 2, y: 6, blur: 18, spread: -1, color: "#00000040" },
  });
  doc = applyCommand(doc, {
    type: "block.create",
    sectionId: "content",
    block: { id: "photo", kind: "image", text: "", design: layer },
  });
  expect(layerStyle(layer)).toMatchObject({
    border: "3px dotted #123456",
    borderRadius: 12,
    boxShadow: "2px 6px 18px -1px #00000040",
    boxSizing: "border-box",
  });
  const html = renderHtml(doc);
  expect(html).toContain("border-radius:12px");
  expect(html).toContain("border:3px dotted #123456");
  expect(html).toContain("box-shadow:2px 6px 18px -1px #00000040");
});
