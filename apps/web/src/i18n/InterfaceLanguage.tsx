import { createInstance, type i18n } from "i18next";
import { I18nextProvider, useTranslation } from "react-i18next";
import { useEffect, useState, type ReactNode } from "react";
import { interfaceLocale, resources } from "./resources";

export function createInterfaceLanguage(locale: string): i18n {
  const instance = createInstance();
  void instance.init({
    lng: interfaceLocale(locale),
    fallbackLng: "en",
    resources,
    initAsync: false,
    interpolation: { escapeValue: false },
  });
  return instance;
}
function LanguageDomSync() {
  const { i18n } = useTranslation();
  useEffect(() => {
    const sync = () => {
      document.documentElement.lang = i18n.language;
    };
    sync();
    i18n.on("languageChanged", sync);
    return () => {
      i18n.off("languageChanged", sync);
    };
  }, [i18n]);
  return null;
}
/** One isolated instance for each SSR/hydration tree. No browser reads during render. */
export function InterfaceLanguage({
  locale,
  children,
}: {
  locale: string;
  children: ReactNode;
}) {
  const [instance] = useState(() => createInterfaceLanguage(locale));
  return (
    <I18nextProvider i18n={instance}>
      <LanguageDomSync />
      {children}
    </I18nextProvider>
  );
}
export function setInterfaceLanguage(instance: i18n, locale: string): void {
  const next = interfaceLocale(locale);
  document.cookie = `resumi-ui-language=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
  void instance.changeLanguage(next);
}
