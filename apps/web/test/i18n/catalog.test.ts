import { expect, test } from "bun:test";
import {
  createSourceFile,
  forEachChild,
  isCallExpression,
  isIdentifier,
  isStringLiteralLike,
  ScriptTarget,
  type Node,
} from "typescript";
import { en, resources, uiLanguages } from "../../src/i18n/resources";

function flatten(value: object, prefix = ""): Record<string, string> {
  return Object.fromEntries(
    Object.entries(value).flatMap(([key, entry]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      return typeof entry === "string"
        ? [[path, entry]]
        : Object.entries(flatten(entry, path));
    }),
  );
}
const english = flatten(en);
const placeholders = (text: string) =>
  [
    ...new Set(
      [...text.matchAll(/\{\{\s*([^\s}]+)\s*\}\}/g)].map((match) => match[1]),
    ),
  ].sort();

test("all interface dictionaries preserve keys and interpolation placeholders", () => {
  expect(Object.keys(resources).sort()).toEqual(
    uiLanguages.map(({ code }) => code).sort(),
  );
  for (const [locale, { translation }] of Object.entries(resources)) {
    const dictionary = flatten(translation);
    expect(Object.keys(dictionary).sort(), locale).toEqual(
      Object.keys(english).sort(),
    );
    for (const [key, value] of Object.entries(english)) {
      expect(dictionary[key]?.trim(), `${locale}: ${key}`).toBeTruthy();
      expect(placeholders(dictionary[key] ?? ""), `${locale}: ${key}`).toEqual(
        placeholders(value),
      );
    }
  }
});

test("literal application translation references exist in every configured interface language", async () => {
  const missing: string[] = [];
  for (const root of ["apps/web/src", "apps/web/app"]) {
    for await (const path of new Bun.Glob("**/*.{ts,tsx}").scan(root)) {
      if (path.endsWith(".generated.ts")) continue;
      const file = `${root}/${path}`;
      const source = createSourceFile(
        file,
        await Bun.file(file).text(),
        ScriptTarget.Latest,
        true,
      );
      function visit(node: Node) {
        if (
          isCallExpression(node) &&
          isIdentifier(node.expression) &&
          node.expression.text === "t" &&
          node.arguments[0] &&
          isStringLiteralLike(node.arguments[0])
        ) {
          const key = node.arguments[0].text;
          if (
            !english[key] &&
            !(english[`${key}_one`] && english[`${key}_other`])
          )
            missing.push(`${file}: ${key}`);
        }
        forEachChild(node, visit);
      }
      visit(source);
    }
  }
  expect(missing).toEqual([]);
});
