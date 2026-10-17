import styles from "./Preview.module.css";
import type { Document } from "@resumi/engine";
import { lazy, Suspense } from "react";
const CodePreview = lazy(() =>
  import("./CodePreview").then((module) => ({ default: module.CodePreview })),
);
export function ResumePreview({
  html,
  css,
  document,
}: {
  html: string;
  css: string;
  document?: Document;
}) {
  if (document?.source && document.source.enabled !== false)
    return (
      <Suspense
        fallback={
          <div className={styles.sourcePlaceholder} aria-hidden>
            Preparing preview…
          </div>
        }
      >
        <CodePreview document={document} />
      </Suspense>
    );
  return (
    <div className={styles.viewport} aria-hidden="true" inert>
      <style>{css}</style>
      <div
        className={styles.paper}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
