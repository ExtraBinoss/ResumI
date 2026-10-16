import "@mantine/core/styles.css";

import "../src/styles/global.css";
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
  createTheme,
} from "@mantine/core";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  isRouteErrorResponse,
  Link,
} from "react-router";
import type { ReactNode } from "react";
const theme = createTheme({
  primaryColor: "blue",
  fontFamily: "Inter Variable, Inter, sans-serif",
  defaultRadius: "md",
  colors: {
    blue: [
      "#eff6ff",
      "#dbeafe",
      "#bfdbfe",
      "#93c5fd",
      "#60a5fa",
      "#3b82f6",
      "#2563eb",
      "#1d4ed8",
      "#1e40af",
      "#1e3a8a",
    ],
  },
  headings: { fontFamily: "Inter Variable, Inter, sans-serif" },
});
export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <ColorSchemeScript forceColorScheme="light" />
        <Meta />
        <Links />
      </head>
      <body>
        <MantineProvider theme={theme} forceColorScheme="light">
          {children}
        </MantineProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
export default function App() {
  return <Outlet />;
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
      <p>
        Your resumes are stored in this browser. Return to your workspace to
        reopen them.
      </p>
      <Link to="/projects">Go to projects →</Link>
    </main>
  );
}
