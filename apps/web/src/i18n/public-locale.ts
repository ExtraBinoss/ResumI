export type PublicLocale = "en" | "fr";
export type PublicPage = "landing" | "templates";

/** Public language is URL-owned; private workspaces continue to use their UI cookie. */
export function publicRoute(
  pathname: string,
): { locale: PublicLocale; page: PublicPage } | null {
  switch (pathname.replace(/\/+$/, "") || "/") {
    case "/":
      return { locale: "en", page: "landing" };
    case "/fr":
      return { locale: "fr", page: "landing" };
    case "/templates":
      return { locale: "en", page: "templates" };
    case "/fr/templates":
      return { locale: "fr", page: "templates" };
    default:
      return null;
  }
}
export function publicPath(
  locale: string,
  page: PublicPage = "landing",
): string {
  const prefix = locale === "fr" ? "/fr" : "";
  return page === "templates" ? `${prefix}/templates` : prefix || "/";
}
export const isTemplatesPath = (pathname: string) =>
  publicRoute(pathname)?.page === "templates";
