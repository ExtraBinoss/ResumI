import { useAtomValue, useSetAtom, useStore } from "jotai";
import { useNavigate } from "react-router";
import { ActionIcon, Button, Menu, Tooltip } from "../../../ui";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Download,
  ChevronDown,
  FileJson,
  FileCode,
  Printer,
} from "lucide-react";
import { serializeDocument } from "@resumi/engine";
import { renderHtml, renderDocumentHtml } from "@resumi/cv";
import { downloadFile, fileName } from "../../../lib/files";
import {
  historyAtom,
  saveStatusAtom,
  saveErrorAtom,
  undoAtom,
  redoAtom,
  sessionAtom,
  type EditorController,
} from "../../../state/editor";
import { sourceAtom, designErrorAtom } from "../../../state/design";
import { SettingsMenu } from "../../../components/SettingsMenu";
import { Shortcut } from "../../../components/Shortcut";
import { ErrorNotice } from "../../../components/ErrorNotice";
import { ProjectMenu } from "./ProjectMenu";
import styles from "../styles/Editor.module.css";

export function EditorToolbar({
  controller,
}: {
  controller: EditorController;
}) {
  const source = useAtomValue(sourceAtom),
    history = useAtomValue(historyAtom),
    status = useAtomValue(saveStatusAtom),
    error = useAtomValue(saveErrorAtom);
  const undo = useSetAtom(undoAtom),
    redo = useSetAtom(redoAtom),
    setError = useSetAtom(designErrorAtom),
    store = useStore(),
    navigate = useNavigate();
  function back() {
    void controller.flush().then(() => {
      if (store.get(saveStatusAtom) !== "error") void navigate("/projects");
    });
  }
  async function exportFile(format: "json" | "html") {
    try {
      const doc = store.get(sessionAtom)!.document;
      downloadFile(
        fileName(doc.name, format),
        format === "json"
          ? serializeDocument(doc)
          : await renderDocumentHtml(doc),
        format === "json" ? "application/json" : "text/html",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "The resume could not be exported.",
      );
    }
  }
  function print() {
    const doc = store.get(sessionAtom)!.document;
    if (doc.source && doc.source.enabled !== false) {
      void exportFile("html");
      return;
    }
    const popup = window.open("", "_blank");
    if (!popup) {
      void exportFile("html");
      return;
    }
    popup.document.open();
    popup.document.write(renderHtml(doc));
    popup.document.close();
    popup.addEventListener(
      "load",
      () => {
        popup.focus();
        popup.print();
      },
      { once: true },
    );
  }
  return (
    <header className={styles.toolbar}>
      <div className={styles.toolbarLeft}>
        <Tooltip label="Back to projects">
          <ActionIcon
            variant="subtle"
            color="gray"
            aria-label="Back to projects"
            onClick={back}
          >
            <ArrowLeft size={17} aria-hidden />
          </ActionIcon>
        </Tooltip>
        <div className={styles.historyActions}>
          <Tooltip
            label={
              <span className={styles.shortcutLabel}>
                Undo <Shortcut keys={["Mod", "Z"]} />
              </span>
            }
          >
            <ActionIcon
              aria-label="Undo"
              variant="subtle"
              color="gray"
              disabled={!history.undo}
              onClick={() => undo()}
            >
              <Undo2 size={17} aria-hidden />
            </ActionIcon>
          </Tooltip>
          <Tooltip
            label={
              <span className={styles.shortcutLabel}>
                Redo <Shortcut keys={["Mod", "Shift", "Z"]} />
              </span>
            }
          >
            <ActionIcon
              aria-label="Redo"
              variant="subtle"
              color="gray"
              disabled={!history.redo}
              onClick={() => redo()}
            >
              <Redo2 size={17} aria-hidden />
            </ActionIcon>
          </Tooltip>
        </div>
      </div>
      <div className={styles.projectTitle}>
        <ProjectMenu back={back} />
        <span
          className="srOnly"
          role="status"
          aria-label="Save status"
          data-status={status}
        >
          {status === "saved"
            ? "Saved"
            : status === "saving"
              ? "Saving…"
              : "Not saved"}
        </span>
        <ErrorNotice
          error={error || null}
          label="Changes are not saved"
          compact
        >
          <Button
            variant="default"
            size="xs"
            onClick={() => void controller.flush()}
          >
            Retry save
          </Button>
        </ErrorNotice>
      </div>
      <div className={styles.toolbarRight}>
        <SettingsMenu />
        <Menu position="bottom-end">
          <Menu.Target>
            <Button
              size="xs"
              variant="filled"
              aria-label="Export"
              leftSection={<Download size={14} />}
              rightSection={<ChevronDown size={12} />}
              className={styles.exportButton}
            >
              <span>Export</span>
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<FileJson size={14} />}
              onClick={() => void exportFile("json")}
            >
              JSON document
            </Menu.Item>
            <Menu.Item
              leftSection={<FileCode size={14} />}
              onClick={() => void exportFile("html")}
            >
              Portable HTML
            </Menu.Item>
            {source && (
              <Menu.Item
                leftSection={<FileCode size={14} />}
                onClick={() =>
                  downloadFile(
                    fileName(
                      store.get(sessionAtom)!.document.name,
                      source.format === "react" ? "tsx" : "html",
                    ),
                    source.code,
                    "text/plain",
                  )
                }
              >
                Original {source.format === "react" ? "React / TSX" : "HTML"}{" "}
                source
              </Menu.Item>
            )}
            <Menu.Divider />
            <Menu.Item leftSection={<Printer size={14} />} onClick={print}>
              {source && source.enabled !== false
                ? "HTML for printing"
                : "Print / Save as PDF"}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </header>
  );
}
