import { Suspense, use, useEffect, useRef, useState } from "react";
import { renderDocumentHtml } from "@resumi/cv";
import type { Document, DocumentSource } from "@resumi/engine";
import styles from "./Preview.module.css";

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
}: {
  document: Document;
  interactive: boolean;
  scale?: number;
}) {
  const html = use(previewFor(document));
  return (
    <iframe
      title={`${document.source?.format === "react" ? "React" : "HTML"} resume preview`}
      sandbox="allow-scripts"
      loading="lazy"
      srcDoc={html}
      style={interactive ? { transform: `scale(${scale})` } : undefined}
      className={interactive ? styles.interactiveFrame : styles.sourceFrame}
    />
  );
}
function InteractivePreview({ document }: { document: Document }) {
  const viewport = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(1),
    [zoom, setZoom] = useState<"fit" | number>("fit");
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      if (width > 0)
        setAvailable(Math.max(0.1, Math.min(1, (width - 32) / 794)));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const scale = zoom === "fit" ? available : zoom;
  return (
    <div ref={viewport} className={styles.interactiveViewport}>
      <div
        className={styles.previewControls}
        role="group"
        aria-label="Source preview zoom"
      >
        <button aria-pressed={zoom === "fit"} onClick={() => setZoom("fit")}>
          Fit page
        </button>
        <button aria-pressed={zoom === 1} onClick={() => setZoom(1)}>
          100%
        </button>
        <button
          aria-label="Zoom source preview out"
          onClick={() => setZoom(Math.max(0.25, scale - 0.1))}
        >
          −
        </button>
        <span>{Math.round(scale * 100)}%</span>
        <button
          aria-label="Zoom source preview in"
          onClick={() => setZoom(Math.min(2, scale + 0.1))}
        >
          +
        </button>
      </div>
      <div
        className={styles.previewPage}
        style={{ width: 794 * scale, height: 1123 * scale }}
      >
        <Suspense
          fallback={
            <div className={styles.sourcePlaceholder}>Preparing preview…</div>
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
}: {
  document: Document;
  interactive?: boolean;
}) {
  if (interactive) return <InteractivePreview document={document} />;
  return (
    <div className={styles.viewport} aria-hidden="true">
      <Suspense
        fallback={
          <div className={styles.sourcePlaceholder}>
            <strong>{document.name}</strong>
            <span>
              {document.source?.format === "react"
                ? "React component"
                : "HTML document"}
            </span>
          </div>
        }
      >
        <Frame document={document} interactive={interactive} />
      </Suspense>
    </div>
  );
}
