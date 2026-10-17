import { createInstance, type i18n } from "i18next";
import { interfaceLocale, resources } from "./resources";

export function createInterfaceLanguage(locale: string): i18n {
  const instance = createInstance();
  void instance.init({
    lng: interfaceLocale(locale),
    fallbackLng: "en",
    // ResourceStore mutates its input; each SSR tree must own its dictionaries.
    resources: structuredClone(resources),
    initAsync: false,
    interpolation: { escapeValue: false },
    react: { bindI18nStore: "added" },
  });
  return instance;
}

/** Refresh keeps the instance and selected locale while replacing changed dictionaries. */
export function replaceInterfaceResources(
  instance: i18n,
  dictionaries: typeof resources,
): void {
  for (const [locale, namespaces] of Object.entries(dictionaries)) {
    for (const [namespace, dictionary] of Object.entries(namespaces)) {
      // Replace complete dictionary groups without temporarily unloading the namespace.
      // Removing it first makes subscribers suspend and can discard their local state.
      instance.addResourceBundle(locale, namespace, dictionary, false, true);
    }
  }
}

export function setInterfaceLanguage(instance: i18n, locale: string): void {
  const next = interfaceLocale(locale);
  document.cookie = `resumi-ui-language=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
  void instance.changeLanguage(next);
}
