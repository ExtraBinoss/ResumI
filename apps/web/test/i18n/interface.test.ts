import { expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { useTranslation } from "react-i18next";
import { InterfaceLanguage } from "../../src/i18n/InterfaceLanguage";
import {
  createInterfaceLanguage,
  replaceInterfaceResources,
} from "../../src/i18n/interface-language";
import { interfaceLocale, resources } from "../../src/i18n/resources";

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

test("interface providers render translated SSR without browser lifecycle access", () => {
  function Label() {
    const { t } = useTranslation();
    return createElement("span", null, t("dashboard.import"));
  }
  const render = (locale: string) =>
    renderToStaticMarkup(
      createElement(InterfaceLanguage, {
        locale,
        children: createElement(Label),
      }),
    );
  expect(render("fr")).toBe("<span>Importer</span>");
  expect(render("en")).toBe("<span>Import</span>");
  expect(render("fr")).toBe("<span>Importer</span>");
});

test("replacing dictionaries updates an existing instance without changing its selected language", () => {
  const instance = createInterfaceLanguage("fr");
  for (const locale of ["en", "fr"]) {
    const dashboard: Record<string, string> = instance.getResourceBundle(
      locale,
      "translation",
    ).dashboard;
    delete dashboard.import;
    delete dashboard.sortName;
  }
  expect(instance.t("dashboard.import")).toBe("dashboard.import");
  expect(instance.t("dashboard.sortName")).toBe("dashboard.sortName");
  const replacement = structuredClone(resources);
  replacement.fr.translation.dashboard.import = "Importer un document";
  replacement.en.translation.dashboard.import = "Import document";
  const notifications: string[] = [];
  instance.store.on("added", (locale: string) => notifications.push(locale));
  replaceInterfaceResources(instance, replacement);
  expect(instance.language).toBe("fr");
  expect(instance.t("dashboard.import")).toBe("Importer un document");
  expect(instance.t("dashboard.sortName")).toBe("Nom A–Z");
  expect(instance.t("dashboard.import", { lng: "en" })).toBe("Import document");
  expect(instance.options.react).toMatchObject({
    bindI18nStore: "added",
  });
  expect(notifications).toEqual(["en", "fr"]);
  instance.store.off("added");
});

test("resource mutations and refreshed bundles cannot leak into another SSR instance", () => {
  const first = createInterfaceLanguage("en");
  const second = createInterfaceLanguage("en");
  first.addResource(
    "en",
    "translation",
    "dashboard.import",
    "Private override",
  );
  first.addResource("en", "translation", "dashboard.retired", "Old label");
  expect(first.t("dashboard.import")).toBe("Private override");
  expect(second.t("dashboard.import")).toBe("Import");
  expect(resources.en.translation.dashboard.import).toBe("Import");
  replaceInterfaceResources(first, resources);
  expect(first.t("dashboard.import")).toBe("Import");
  expect(first.exists("dashboard.retired")).toBe(false);
  expect(second.exists("dashboard.retired")).toBe(false);
  first.addResource("en", "translation", "dashboard.import", "After refresh");
  expect(second.t("dashboard.import")).toBe("Import");
  expect(resources.en.translation.dashboard.import).toBe("Import");
});
