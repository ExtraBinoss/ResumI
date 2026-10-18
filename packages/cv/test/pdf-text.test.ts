import { expect, test } from "bun:test";
import {
  comparePdfText,
  inspectPdfText,
  normalizePdfText,
} from "../src/pdf-text";

const fixture = async (name = "pdf-text-chromium.pdf") =>
  new Uint8Array(
    await Bun.file(new URL(`fixtures/${name}`, import.meta.url)).arrayBuffer(),
  );
const expected = [
  "Alex Morgan",
  "Ingénieur, œuvre et cœur : Éléonore.",
  "Αθήνα και γλώσσα · Москва и инженер.",
  "office affinity efficient.",
  "Hello accessible interfaces.",
  "alex@example.com · Portfolio",
  "Experience",
  "Built clear, reliable software.",
  "Repeated repeated text.",
].join("\n");

test("Mozilla PDF.js extracts actual Chromium PDF Unicode, inline style joins, order, pages and links", async () => {
  const bytes = await fixture(),
    before = new Uint8Array(bytes);
  const result = await inspectPdfText(bytes);
  expect(bytes).toEqual(before);
  expect(result.pageCount).toBe(2);
  expect(result.hasText).toBe(true);
  expect(result.characterCount).toBe(206);
  expect(result.text).toContain("Ingénieur, œuvre et cœur : Éléonore.");
  expect(result.text).toContain("Αθήνα και γλώσσα · Москва и инженер.");
  expect(result.text).toContain("office affinity efficient.");
  expect(result.text).toContain("Hello accessible interfaces.");
  expect(result.pages.map((page) => page.number)).toEqual([1, 2]);
  expect(result.pages[0].links).toEqual([
    "mailto:alex@example.com",
    "https://example.com/work",
  ]);
  expect(result.pages[1].links).toEqual([]);
  expect(result.pages[0].width).toBeGreaterThan(590);
  expect(result.pages[0].width).toBeLessThan(600);
  expect(result.pages[0].height).toBeGreaterThan(840);
  expect(result.pages[0].height).toBeLessThan(845);
  expect(result.pages[0].items.some((item) => item.text === "Morgan")).toBe(
    false,
  );
  expect(
    result.pages[0].items.some(
      (item) =>
        item.text.includes("Alex Morgan") && item.width > 0 && item.height > 0,
    ),
  ).toBe(true);
  expect(comparePdfText(expected, result.text)).toMatchObject({
    passed: true,
    coveragePassed: true,
    orderPassed: true,
    coherencePassed: true,
    missing: [],
    unexpected: [],
  });
});

test("a graphical PDF with no selectable text is identified honestly", async () => {
  const result = await inspectPdfText(
    await fixture("pdf-no-text-chromium.pdf"),
  );
  expect(result.pageCount).toBe(1);
  expect(result.hasText).toBe(false);
  expect(result.characterCount).toBe(0);
  expect(result.text).toBe("");
  expect(comparePdfText("Alex Morgan", result.text)).toMatchObject({
    passed: false,
    coveragePassed: false,
    missing: ["Alex", "Morgan"],
  });
  expect(comparePdfText("", "").passed).toBe(false);
});

test("comparison normalizes Unicode ligatures, composed accents and layout whitespace", () => {
  expect(normalizePdfText("  ofﬁce\u00a0\nAme\u0301lie  ")).toBe(
    "office Amélie",
  );
  expect(
    comparePdfText("office Amélie\nœuvre", "ofﬁce\u00a0Ame\u0301lie  œuvre")
      .passed,
  ).toBe(true);
  expect(comparePdfText("Hello, world.", "Hello , world .")).toMatchObject({
    passed: true,
    whitespacePassed: false,
  });
});

test("coverage and reading order are separate, including multi-column order changes", () => {
  const result = comparePdfText(
    "Experience\nEducation",
    "Education\nExperience",
  );
  expect(result).toMatchObject({
    passed: false,
    coveragePassed: true,
    coherencePassed: true,
    orderPassed: false,
    missing: [],
    unexpected: [],
  });
});

test("missing duplicate occurrences, Unicode glyphs and unexpected text are not hidden", () => {
  expect(
    comparePdfText("Repeat repeat repeat", "Repeat repeat").missing,
  ).toEqual(["repeat"]);
  expect(comparePdfText("cœur", "coeur")).toMatchObject({
    passed: false,
    missing: ["cœur"],
    unexpected: ["coeur"],
  });
  expect(comparePdfText("Αθήνα Москва", "Αθήνα Мосkва").passed).toBe(false);
  expect(comparePdfText("Alex Morgan", "Alex Morgan extra").unexpected).toEqual(
    ["extra"],
  );
  expect(comparePdfText("Experience", "experience").passed).toBe(false);
});

test("joined or broken words and replacement glyphs fail coherence", () => {
  expect(comparePdfText("Design engineer", "Designengineer")).toMatchObject({
    passed: false,
    missing: ["Design", "engineer"],
    unexpected: ["Designengineer"],
  });
  expect(comparePdfText("Hello", "Hel lo")).toMatchObject({
    passed: false,
    missing: ["Hello"],
    unexpected: ["Hel", "lo"],
  });
  expect(comparePdfText("Alex", "Al�x")).toMatchObject({
    passed: false,
    coherencePassed: false,
    replacementCharacters: 1,
  });
  expect(comparePdfText("ÉDITION", "É D I T I O N")).toMatchObject({
    passed: false,
    coveragePassed: true,
    orderPassed: true,
    coherencePassed: false,
  });
  expect(comparePdfText("Design engineer", "Designengineer")).toMatchObject({
    coveragePassed: true,
    orderPassed: true,
    coherencePassed: false,
  });
  expect(
    comparePdfText("d’impression Aujourd’hui", "dʼimpression Aujourd'hui")
      .passed,
  ).toBe(true);
});

test("PDF inspection rejects invalid data and bounded work without retaining the caller's bytes", async () => {
  await expect(inspectPdfText(new Uint8Array())).rejects.toThrow("nonempty");
  await expect(
    inspectPdfText(await fixture(), { maxBytes: 10 }),
  ).rejects.toThrow("byte limit");
  await expect(
    inspectPdfText(await fixture(), { maxPages: 1 }),
  ).rejects.toThrow("page limit");
  await expect(
    inspectPdfText(await fixture(), { maxPages: 0 }),
  ).rejects.toThrow("positive integers");
  await expect(
    inspectPdfText(new TextEncoder().encode("not a PDF")),
  ).rejects.toThrow();
  // A failed parse must not poison PDF.js' local worker for subsequent valid exports.
  expect((await inspectPdfText(await fixture())).hasText).toBe(true);
});
