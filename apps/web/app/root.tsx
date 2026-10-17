import "../src/styles/global.css";
import { TooltipProvider } from "../src/components/ui/tooltip";
import {
  Links,
  Meta,
  useOutlet,
  useNavigationType,
  useLocation,
  Scripts,
  ScrollRestoration,
  useRouteError,
  isRouteErrorResponse,
  Link,
} from "react-router";
import type { ReactNode } from "react";
import { MotionConfig, motion } from "motion/react";
import { ThemeSync, themeBootstrap } from "../src/state/theme";
import styles from "../src/styles/RouteTransition.module.css";
export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="app">
          <MotionConfig reducedMotion="user">
            <TooltipProvider delay={450}>
              <ThemeSync />
              {children}
            </TooltipProvider>
          </MotionConfig>
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
    : pathname === "/projects" || pathname === "/templates"
      ? "dashboard"
      : pathname;
  // Animate incoming views; exiting data routes lose their loader data immediately.
  return (
    <motion.div
      key={page}
      className={styles.page}
      initial={navigation === "POP" ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {outlet}
    </motion.div>
  );
}
export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <main className="recovery">
      <h1>
        {isRouteErrorResponse(error) && error.status === 404
          ? "Page not found"
          : "Something went wrong"}
      </h1>

      <Link to="/projects">Go to projects →</Link>
    </main>
  );
}
