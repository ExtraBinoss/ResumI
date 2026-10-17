import { Suspense, use, useEffect, useRef, useState } from "react";
import { renderDocumentHtml } from "@resumi/cv";
import type { Document, DocumentSource } from "@resumi/engine";
import styles from "./Preview.module.css";
import { Button } from "./ui/button";
import { Minus, Plus } from "lucide-react";
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
      tabIndex={interactive ? undefined : -1}
      loading="lazy"
      srcDoc={html}
      style={interactive ? { transform: `scale(${scale})` } : undefined}
      className={interactive ? styles.interactiveFrame : styles.sourceFrame}
    />
  );
}
function InteractivePreview({ document }: { document: Document }) {
  const viewport = useRef<HTMLDivElement>(null);
  const controls = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(1),
    [zoom, setZoom] = useState<"fit" | number>("fit");
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      const toolbarHeight = controls.current?.offsetHeight ?? 0;
      if (width > 0 && height > 0)
        setAvailable(
          Math.max(
            0.1,
            Math.min(
              1,
              (width - 32) / 794,
              (height - toolbarHeight - 34) / 1123,
            ),
          ),
        );
    });
    observer.observe(element);
    if (controls.current) observer.observe(controls.current);
    return () => observer.disconnect();
  }, []);
  const scale = zoom === "fit" ? available : zoom;
  return (
    <div ref={viewport} className={styles.interactiveViewport}>
      <div
        ref={controls}
        className={styles.previewControls}
        role="group"
        aria-label="Source preview zoom"
      >
        <Button
          variant="ghost"
          size="xs"
          aria-pressed={zoom === "fit"}
          onClick={() => setZoom("fit")}
        >
          Fit page
        </Button>
        <Button
          variant="ghost"
          size="xs"
          aria-pressed={zoom === 1}
          onClick={() => setZoom(1)}
        >
          100%
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Zoom source preview out"
          onClick={() => setZoom(Math.max(0.1, scale - 0.1))}
        >
          <Minus size={16} aria-hidden />
        </Button>
        <span>{Math.round(scale * 100)}%</span>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Zoom source preview in"
          onClick={() => setZoom(Math.min(2, scale + 0.1))}
        >
          <Plus size={16} aria-hidden />
        </Button>
      </div>
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
}: {
  document: Document;
  interactive?: boolean;
}) {
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
