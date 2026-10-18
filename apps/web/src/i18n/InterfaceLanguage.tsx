import { I18nextProvider, useTranslation } from "react-i18next";
import { useEffect, useState, type ReactNode } from "react";
import { interfaceLocale, resources } from "./resources";
import {
  createInterfaceLanguage,
  replaceInterfaceResources,
} from "./interface-language";
function LanguageDomSync({ dictionaries }: { dictionaries: typeof resources }) {
  const { i18n } = useTranslation();
  useEffect(() => {
    // Fast Refresh preserves useState, so the external store needs the new bundles.
    replaceInterfaceResources(i18n, dictionaries);
    const sync = () => {
      document.documentElement.lang = i18n.language;
    };
    sync();
    i18n.on("languageChanged", sync);
    return () => {
      i18n.off("languageChanged", sync);
    };
  }, [i18n, dictionaries]);
  return null;
}
/** One isolated instance for each SSR/hydration tree. No browser reads during render. */
export function InterfaceLanguage({
  locale,
  children,
  publicLocale = null,
}: {
  locale: string;
  publicLocale?: string | null;
  children: ReactNode;
}) {
  const [instance] = useState(() => createInterfaceLanguage(locale));
  useEffect(() => {
    const next = interfaceLocale(publicLocale ?? locale);
    if (instance.language !== next) void instance.changeLanguage(next);
  }, [instance, locale, publicLocale]);
  return (
    <I18nextProvider i18n={instance}>
      <LanguageDomSync dictionaries={resources} />
      {children}
    </I18nextProvider>
  );
}
