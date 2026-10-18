import "../src/styles/global.css";
import sourceSansFont from "@fontsource-variable/source-sans-3/files/source-sans-3-latin-wght-normal.woff2?url";
import spaceGroteskFont from "@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2?url";
import { TooltipProvider } from "../src/components/ui/tooltip";
import {
  Links,
  Meta,
  useOutlet,
  useRouteLoaderData,
  useNavigationType,
  useLocation,
  Scripts,
  ScrollRestoration,
  useRouteError,
  isRouteErrorResponse,
} from "react-router";
import type { ReactNode } from "react";
import type { ShouldRevalidateFunction } from "react-router";
import { useTranslation } from "react-i18next";
import { MotionConfig, motion } from "motion/react";
import { ThemeSync, themeBootstrap } from "../src/state/theme";
import { PageRecovery } from "../src/components/PageRecovery";
import { InterfaceLanguage } from "../src/i18n/InterfaceLanguage";
import { interfaceLocale } from "../src/i18n/resources";
import { RoutePending } from "../src/components/RoutePending";
import { publicRoute, isTemplatesPath } from "../src/i18n/public-locale";
import styles from "../src/styles/RouteTransition.module.css";
export function loader({ request }: { request: Request }) {
  const cookie = request.headers
    .get("Cookie")
    ?.match(/(?:^|;\s*)resumi-ui-language=([^;]+)/)?.[1];
  const pathname = new URL(request.url).pathname;
  return {
    uiLocale:
      publicRoute(pathname)?.locale ??
      (pathname.startsWith("/fr/") ? "fr" : interfaceLocale(cookie)),
  };
}
export const shouldRevalidate: ShouldRevalidateFunction = ({
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}) =>
  publicRoute(currentUrl.pathname)?.locale !==
    publicRoute(nextUrl.pathname)?.locale || defaultShouldRevalidate;

export function Layout({ children }: { children: ReactNode }) {
  const data = useRouteLoaderData<typeof loader>("root");
  const locale = data?.uiLocale ?? "en";
  const publicLocale = publicRoute(useLocation().pathname)?.locale ?? null;
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <link
          rel="preload"
          href={sourceSansFont}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href={spaceGroteskFont}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="icon"
          href="/favicon-32.png"
          type="image/png"
          sizes="32x32"
        />
        <link
          rel="icon"
          href="/favicon-64.png"
          type="image/png"
          sizes="64x64"
        />
        <link
          rel="apple-touch-icon"
          href="/apple-touch-icon.png"
          sizes="180x180"
        />
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="app">
          <InterfaceLanguage locale={locale} publicLocale={publicLocale}>
            <MotionConfig reducedMotion="user">
              <TooltipProvider delay={450}>
                <ThemeSync />
                {children}
              </TooltipProvider>
            </MotionConfig>
          </InterfaceLanguage>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
export default function App() {
  const { pathname } = useLocation();
  const outlet = useOutlet();
  const navigation = useNavigationType();
  const page = pathname.startsWith("/editor")
    ? "editor"
    : pathname === "/projects" || isTemplatesPath(pathname)
      ? "dashboard"
      : pathname;
  // Animate incoming views; exiting data routes lose their loader data immediately.
  return (
    <>
      <motion.div
        key={page}
        className={styles.page}
        initial={navigation === "POP" ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {outlet}
      </motion.div>
      <RoutePending />
    </>
  );
}
export function ErrorBoundary() {
  const error = useRouteError();
  const { t } = useTranslation();
  return (
    <PageRecovery
      notFound={isRouteErrorResponse(error) && error.status === 404}
      error={error instanceof Error ? error : t("site.errors.pageLoadFailed")}
    />
  );
}
