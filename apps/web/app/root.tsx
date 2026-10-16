import "../src/styles/global.css";
import { TooltipProvider } from "../src/components/ui/tooltip";
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
export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="app">
          <TooltipProvider delay={550}>{children}</TooltipProvider>
        </div>
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
