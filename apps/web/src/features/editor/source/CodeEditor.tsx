import { useState } from "react";
import { useAtomValue, useSetAtom, useStore } from "jotai";
import { Code2, Download, FileCode2, Play, Upload } from "lucide-react";
import { makeReactSource, renderHtml, renderDocumentHtml } from "@resumi/cv";
import type { DocumentSource } from "@resumi/engine";
import { sessionAtom, commandAtom } from "../../../state/editor";
import { Button } from "../../../ui";
import { downloadFile, fileName } from "../../../lib/files";
import { CodePreview } from "../../../components/CodePreview";
import { ErrorMessage } from "../../../components/ErrorNotice";
import styles from "../styles/Source.module.css";

type Draft = { base: DocumentSource | undefined; source: DocumentSource };
export function CodeEditor() {
  const document = useAtomValue(sessionAtom)!.document;
  const dispatch = useSetAtom(commandAtom),
    store = useStore();
  const [draft, setDraft] = useState<Draft | null>(() =>
    document.source ? { base: document.source, source: document.source } : null,
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [previewOnly, setPreviewOnly] = useState(false);
  const stale = draft !== null && draft.base !== document.source;

  async function apply(next: DocumentSource) {
    const base = document.source;
    setBusy(true);
    try {
      // Compile before publishing; user code is never executed here.
      if (next.format === "react") {
        const { compileReact } = await import("@resumi/cv/source-render");
        compileReact(next.code);
      }
      if (store.get(sessionAtom)?.document.source !== base)
        throw new Error(
          "The saved source changed while compiling. Reload it before applying your draft.",
        );
      dispatch({ type: "source.set", source: { ...next, enabled: true } });
      setDraft(null);
      setError("");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not compile this source.",
      );
    } finally {
      setBusy(false);
    }
  }
  const active =
    draft ??
    (document.source
      ? { base: document.source, source: document.source }
      : null);
  function startDraft(format: DocumentSource["format"]) {
    const layout = { ...document };
    delete layout.source;
    setDraft({
      base: document.source,
      source: {
        format,
        code: format === "html" ? renderHtml(layout) : makeReactSource(layout),
      },
    });
    setError("");
  }

  return (
    <section
      className={styles.workspace}
      aria-label="Resume code editor"
      data-preview={previewOnly}
    >
      <div className={styles.editor}>
        <div className={styles.heading}>
          <span>
            <Code2 size={17} aria-hidden /> Resume source
          </span>
          <span className={styles.badge}>
            {active?.source.format === "react"
              ? "React · TSX"
              : active
                ? "HTML · CSS"
                : "Your choice"}
          </span>
          {document.source && (
            <button
              className={styles.mobileSwitch}
              onClick={() => setPreviewOnly(true)}
            >
              Preview
            </button>
          )}
        </div>
        {!active ? (
          <div className={styles.empty}>
            <FileCode2 size={30} aria-hidden />
            <h1>HTML or React</h1>

            <Button onClick={() => startDraft("html")}>Start with HTML</Button>
            <Button variant="outline" onClick={() => startDraft("react")}>
              Start with React
            </Button>
          </div>
        ) : (
          <>
            <p className={styles.hint}>
              {active.source.format === "react"
                ? "Export a default React component. Embed CSS and assets."
                : "HTML and CSS. Embed images and fonts as data URLs."}
            </p>
            <textarea
              aria-label={`${active.source.format === "react" ? "React" : "HTML"} resume source`}
              className={styles.source}
              spellCheck={false}
              disabled={busy}
              value={active.source.code}
              onChange={(event) => {
                setDraft({
                  base: active.base,
                  source: { ...active.source, code: event.currentTarget.value },
                });
                setError("");
              }}
              onKeyDown={(event) => {
                if (event.key !== "Tab") return;
                event.preventDefault();
                const input = event.currentTarget,
                  start = input.selectionStart;
                const code =
                  input.value.slice(0, start) +
                  "  " +
                  input.value.slice(input.selectionEnd);
                setDraft({
                  base: active.base,
                  source: { ...active.source, code },
                });
                requestAnimationFrame(() =>
                  input.setSelectionRange(start + 2, start + 2),
                );
              }}
            />
            {stale && (
              <p className={styles.warning}>
                The saved source changed while you were editing. Reload it
                before applying your draft.{" "}
                <button onClick={() => setDraft(null)}>
                  Reload saved source
                </button>
              </p>
            )}
            <ErrorMessage error={error} label="Could not apply source" />
            <div className={styles.actions}>
              <Button
                disabled={busy || stale}
                onClick={() => void apply(active.source)}
                leftSection={<Play size={14} aria-hidden />}
              >
                {busy ? "Compiling…" : "Apply & preview"}
              </Button>
              <Button
                variant="subtle"
                disabled={busy}
                onClick={() => startDraft("html")}
              >
                New HTML source
              </Button>
              <Button
                variant="subtle"
                disabled={busy}
                onClick={() => startDraft("react")}
              >
                New React source
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  downloadFile(
                    fileName(
                      document.name,
                      active.source.format === "react" ? "tsx" : "html",
                    ),
                    active.source.code,
                    "text/plain",
                  )
                }
                leftSection={<Download size={14} aria-hidden />}
              >
                Source
              </Button>
              <label className={styles.upload}>
                <Upload size={14} aria-hidden /> Import source
                <input
                  type="file"
                  accept=".html,.htm,.tsx,.jsx"
                  onChange={async (event) => {
                    const file = event.currentTarget.files?.[0];
                    if (!file) return;
                    if (file.size > 200_000) {
                      setError("Source files must be smaller than 200 KB.");
                      return;
                    }
                    setDraft({
                      base: document.source,
                      source: {
                        format: /\.[jt]sx$/i.test(file.name) ? "react" : "html",
                        code: await file.text(),
                      },
                    });
                  }}
                />
              </label>
              {document.source && (
                <Button
                  variant="subtle"
                  onClick={() =>
                    void renderDocumentHtml(document)
                      .then((html) =>
                        downloadFile(
                          fileName(document.name, "html"),
                          html,
                          "text/html",
                        ),
                      )
                      .catch((reason) => setError(String(reason)))
                  }
                >
                  Export portable HTML
                </Button>
              )}
            </div>
          </>
        )}
      </div>
      <div className={styles.preview}>
        <div className={styles.previewHeading}>
          Preview
          <button
            className={styles.mobileSwitch}
            onClick={() => setPreviewOnly(false)}
          >
            Edit source
          </button>
        </div>
        {document.source && document.source.enabled !== false ? (
          <CodePreview document={document} interactive />
        ) : (
          <div className={styles.placeholder}>Apply the source to preview.</div>
        )}
      </div>
    </section>
  );
}
