import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import { interfaceLocale } from "./resources";
import {
  rememberInterfaceLanguage,
  setInterfaceLanguage,
} from "./interface-language";
import { publicPath, publicRoute } from "./public-locale";

export function useInterfaceLocale() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  return (value: string) => {
    const locale = interfaceLocale(value);
    const route = publicRoute(location.pathname);
    if (route) {
      rememberInterfaceLanguage(locale);
      void navigate(
        publicPath(locale, route.page) + location.search + location.hash,
      );
    } else setInterfaceLanguage(i18n, locale);
  };
}
