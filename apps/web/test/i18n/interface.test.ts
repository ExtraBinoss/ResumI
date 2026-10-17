import { expect, test } from "bun:test";
import { createInterfaceLanguage } from "../../src/i18n/InterfaceLanguage";
import { interfaceLocale } from "../../src/i18n/resources";

test("interface dictionaries are synchronous and isolated between SSR requests", async () => {
  const english = createInterfaceLanguage("en"),
    french = createInterfaceLanguage("fr");
  expect(english.t("common.settings")).toBe("Settings");
  expect(french.t("common.settings")).toBe("Réglages");
  expect(french.t("editor.words", { count: 12 })).toBe("12 mots");
  await french.changeLanguage("en");
  expect(english.language).toBe("en");
  expect(french.t("settings.language")).toBe("Interface language");
  expect(interfaceLocale("<bad>")).toBe("en");
  expect(interfaceLocale(undefined)).toBe("en");
});
