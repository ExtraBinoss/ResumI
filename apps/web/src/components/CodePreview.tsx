import { Suspense, use, useEffect, useRef, useState } from "react";
import { renderDocumentHtml } from "@resumi/cv";
import type { Document, DocumentSource } from "@resumi/engine";
import styles from "./Preview.module.css";
import { SharedLoading } from "./SharedLoading";

const previews = new WeakMap<DocumentSource, Promise<string>>();
function previewFor(document: Document): Promise<string> {
  const source = document.source!;
  let result = previews.get(source);
  if (!result) {
    result = renderDocumentHtml(document).catch(
      (error) =>
        `<pre>${String(error).replace(/[&<>]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[character]!)}</pre>`,
    );
    previews.set(source, result);
  }
  return result;
}
function Frame({
  document,
  interactive,
  scale = 1,
  workspace = false,
}: {
  document: Document;
  interactive: boolean;
  scale?: number;
  workspace?: boolean;
}) {
  const html = use(previewFor(document));
  return (
    <iframe
      title={`${document.source?.format === "react" ? "React" : "HTML"} resume preview`}
      sandbox="allow-scripts"
      tabIndex={interactive && !workspace ? undefined : -1}
      loading="lazy"
      srcDoc={html}
      style={interactive ? { transform: `scale(${scale})` } : undefined}
      className={
        workspace
          ? styles.workspaceFrame
          : interactive
            ? styles.interactiveFrame
            : styles.sourceFrame
      }
    />
  );
}
function InteractivePreview({ document }: { document: Document }) {
  const viewport = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      if (width > 0 && height > 0)
        setScale(
          Math.max(0.1, Math.min(1, (width - 32) / 794, (height - 32) / 1123)),
        );
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={viewport} className={styles.interactiveViewport}>
      <div
        className={styles.previewPage}
        style={{ width: 794 * scale, height: 1123 * scale }}
      >
        <Suspense
          fallback={
            <SharedLoading
              messageKey="loading.preview"
              variant="working"
              className={styles.sourcePlaceholder}
            />
          }
        >
          <Frame document={document} interactive scale={scale} />
        </Suspense>
      </div>
    </div>
  );
}
export function CodePreview({
  document,
  interactive = false,
  workspace = false,
}: {
  document: Document;
  interactive?: boolean;
  workspace?: boolean;
}) {
  if (workspace)
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
        <Frame document={document} interactive workspace />
      </Suspense>
    );
  if (interactive) return <InteractivePreview document={document} />;
  return (
    <div className={styles.viewport} aria-hidden="true">
      <Suspense
        fallback={
          <SharedLoading
            messageKey="loading.preview"
            variant="working"
            className={styles.sourcePlaceholder}
          />
        }
      >
        <Frame document={document} interactive={interactive} />
      </Suspense>
    </div>
  );
}
