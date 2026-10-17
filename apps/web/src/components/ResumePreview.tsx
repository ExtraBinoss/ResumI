import styles from "./Preview.module.css";
import type { Document } from "@resumi/engine";
import { lazy, Suspense } from "react";
import { SharedLoading } from "./SharedLoading";
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
          <SharedLoading
            messageKey="loading.preview"
            variant="working"
            className={styles.sourcePlaceholder}
          />
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
