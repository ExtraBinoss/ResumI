import { expect, test } from "bun:test";
import {
  DEFAULT_VISUAL_EFFECTS,
  normalizeEffects,
  hasVisualEffects,
  effectFilterId,
  visualEffectFilterMarkup,
  visualEffectFilterValue,
  visualEffectStyle,
  normalizeGradient,
  representativeHexColor,
  paintCss,
  representativePaintColor,
  svgGradientVector,
  SHAPE_CATALOG,
  SHAPE_KINDS,
  shapeDefinition,
  makeLayer,
  applyCommand,
  type Layer,
} from "../../src";
import { visualDocument } from "./fixtures";

test("visual effect normalization bounds every channel and tolerates missing or nonfinite input", () => {
  expect(normalizeEffects()).toEqual(DEFAULT_VISUAL_EFFECTS);
  expect(
    normalizeEffects({
      blur: Infinity,
      grain: NaN,
      grainSize: -2,
      dither: 2,
      brightness: -1,
      contrast: 4,
      saturation: 0.4,
    }),
  ).toEqual({
    ...DEFAULT_VISUAL_EFFECTS,
    grainSize: 0.5,
    dither: 1,
    brightness: 0,
    contrast: 3,
    saturation: 0.4,
  });
  expect(
    normalizeEffects({
      blur: 90,
      grain: 2,
      grainSize: 20,
      dither: -2,
      brightness: NaN,
    }),
  ).toMatchObject({
    blur: 64,
    grain: 1,
    grainSize: 12,
    dither: 0,
    brightness: 1,
  });
  expect(hasVisualEffects()).toBeFalse();
  expect(hasVisualEffects({ grainSize: 5 })).toBeFalse();
  for (const effect of [
    { blur: 1 },
    { grain: 0.1 },
    { dither: 0.1 },
    { brightness: 1.1 },
    { contrast: 0.8 },
    { saturation: 0 },
  ])
    expect(hasVisualEffects(effect)).toBeTrue();
});

test("effect SVG is deterministic, escaped and faithfully carries brightness, noise and dither", () => {
  expect(visualEffectFilterMarkup("plain")).toBe("");
  expect(visualEffectFilterValue("plain")).toBe("");
  expect(visualEffectStyle("plain")).toBe("");
  const effects = {
    blur: 2,
    grain: 0.35,
    grainSize: 3,
    dither: 0.65,
    brightness: 1.2,
    contrast: 0.5,
    saturation: 0.8,
  };
  const markup = visualEffectFilterMarkup('unsafe"<id>', effects);
  expect(effectFilterId('unsafe"<id>')).toBe("folio-fx-unsafe--id-");
  expect(markup).toContain('stdDeviation="2"');
  expect(markup).toContain('slope="0.6" intercept="0.25"');
  expect(markup).toContain('result="dithered"');
  expect(markup).toContain('result="maskedGrain"');
  expect(markup).toContain('baseFrequency="0.24"');
  expect(markup).not.toContain('unsafe"<id>');
  expect(visualEffectFilterMarkup('unsafe"<id>', effects)).toBe(markup);
  expect(visualEffectFilterValue("shape", effects)).toBe(
    "url(#folio-fx-shape)",
  );
  expect(visualEffectStyle("shape", effects)).toBe(
    "filter:url(#folio-fx-shape)",
  );
  const simple = visualEffectFilterMarkup("shape", { brightness: 0.7 });
  expect(simple).not.toContain("feTurbulence");
  expect(simple).toContain('result="processed"');
});

test("solid paint fallback handles hex, RGB and invalid colors deterministically", () => {
  expect(representativeHexColor("#abc")).toBe("#aabbcc");
  expect(representativeHexColor("#abcd")).toBe("#aabbcc");
  expect(representativeHexColor("#123456ff")).toBe("#123456");
  expect(representativeHexColor("linear-gradient(#F0F0F0, #111111)")).toBe(
    "#f0f0f0",
  );
  expect(representativeHexColor("rgb(12, 26, 300)")).toBe("#0c1aff");
  expect(representativeHexColor("rgba(20 0 40 / .5)")).toBe("#140028");
  expect(representativeHexColor("transparent", "#DEF")).toBe("#ddeeff");
  expect(representativeHexColor("invalid", "invalid")).toBe("#000000");
});

test("gradients are normalized, sorted and projected consistently into CSS and SVG", () => {
  expect(normalizeGradient()).toBeUndefined();
  expect(normalizeGradient({})).toEqual({
    type: "linear",
    angle: 90,
    stops: [
      { id: "stop-1", offset: 0, color: "#000000" },
      { id: "stop-2", offset: 1, color: "#ffffff" },
    ],
  });
  const single = normalizeGradient({
    angle: NaN,
    stops: [{ id: "", offset: NaN, color: "#abc" }],
  });
  expect(single?.stops).toEqual([
    { id: "stop-1", offset: 0, color: "#aabbcc" },
    { id: "stop-1-end", offset: 1, color: "#aabbcc" },
  ]);
  const gradient = {
    type: "linear" as const,
    angle: 45,
    stops: [
      { id: "white", offset: 2, color: "#ffffff" },
      { id: "black", offset: -0.2, color: "#000000" },
      { id: "middle", offset: 0.34567, color: "#aabbcc" },
    ],
  };
  expect(normalizeGradient(gradient)?.stops.map((stop) => stop.offset)).toEqual(
    [0, 0.34567, 1],
  );
  expect(paintCss("#112233", gradient)).toBe(
    "linear-gradient(45deg, #000000 0%, #aabbcc 34.57%, #ffffff 100%)",
  );
  expect(paintCss("#112233")).toBe("#112233");
  expect(representativePaintColor("#112233", gradient)).toBe("#000000");
  expect(representativePaintColor("#112233")).toBe("#112233");
  expect(svgGradientVector(0)).toEqual({ x1: 0.5, y1: 1, x2: 0.5, y2: 0 });
  const horizontal = svgGradientVector(90);
  expect(horizontal.x1).toBeCloseTo(0);
  expect(horizontal.x2).toBeCloseTo(1);
  expect(horizontal.y1).toBeCloseTo(0.5);
});

test("shape catalog exposes valid finite geometry and custom vectors remain explicit", () => {
  expect(SHAPE_CATALOG.length).toBeGreaterThan(25);
  expect(new Set(SHAPE_CATALOG.map((shape) => shape.id)).size).toBe(
    SHAPE_CATALOG.length,
  );
  for (const definition of SHAPE_CATALOG) {
    expect(SHAPE_KINDS).toContain(definition.id);
    expect(definition.path).toStartWith("M");
    expect(definition.path).toEndWith("Z");
    expect(definition.path).not.toMatch(/NaN|Infinity/);
    expect(definition.viewBox).toBe("0 0 100 100");
    expect(definition.aspectRatio).toBeGreaterThan(0);
    expect(shapeDefinition(definition.id)).toBe(definition);
  }
  expect(shapeDefinition("unregistered")).toBeUndefined();
  expect(makeLayer("text")).toMatchObject({
    type: "text",
    fontSize: 18,
    marks: [],
  });
  expect(makeLayer("shape")).toMatchObject({
    type: "shape",
    effects: DEFAULT_VISUAL_EFFECTS,
  });
  expect(
    makeLayer("image", { src: "data:image/png;base64,AAAA" }),
  ).toMatchObject({
    type: "image",
    objectPosition: { x: 50, y: 50 },
    imageScale: 1,
  });
});

test("shape and image commands retain portable effects, gradients and crop properties", () => {
  let doc = visualDocument();
  const shape = makeLayer("shape", {
    shape: "star-5",
    fill: "#ffcc00",
    effects: { ...DEFAULT_VISUAL_EFFECTS, brightness: 1.5 },
  });
  const image = makeLayer("image", {
    src: "data:image/png;base64,AAAA",
    alt: "Synthetic swatch",
  });
  doc = applyCommand(doc, {
    type: "block.create",
    sectionId: "extra",
    block: { id: "shape", kind: "shape", text: "", design: shape },
  });
  doc = applyCommand(doc, {
    type: "block.create",
    sectionId: "extra",
    block: { id: "image", kind: "image", text: "", design: image },
  });
  const gradient = {
    type: "linear" as const,
    angle: -45,
    stops: [
      { id: "start", offset: 0, color: "#ffffff" },
      { id: "end", offset: 1, color: "#000000" },
    ],
  };
  doc = applyCommand(doc, {
    type: "layer.update",
    ids: ["shape"],
    patch: { gradient, stroke: "#112233", strokeWidth: 2, borderRadius: 12 },
  });
  doc = applyCommand(doc, {
    type: "layer.update",
    ids: ["image"],
    patch: {
      objectFit: "contain",
      objectPosition: { x: 25, y: 70 },
      imageScale: 2,
      effects: { ...DEFAULT_VISUAL_EFFECTS, saturation: 0.5, contrast: 0.8 },
    },
  });
  expect(doc.blocks.shape.design).toMatchObject({
    gradient,
    strokeWidth: 2,
    effects: { brightness: 1.5 },
  });
  expect(doc.blocks.image.design).toMatchObject({
    objectFit: "contain",
    imageScale: 2,
    objectPosition: { x: 25, y: 70 },
    effects: { saturation: 0.5 },
  });
  doc = applyCommand(doc, {
    type: "layer.update",
    ids: ["shape"],
    patch: { gradient: null },
  });
  expect(
    (doc.blocks.shape.design as Extract<Layer, { type: "shape" }>).gradient,
  ).toBeNull();
});
