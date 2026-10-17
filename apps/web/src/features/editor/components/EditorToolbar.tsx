import { useAtomValue, useSetAtom, useStore } from "jotai";
import { useNavigate } from "react-router";
import { ActionIcon, Button, Menu, Tooltip } from "../../../ui";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Download,
  ChevronDown,
  Check,
  LoaderCircle,
  AlertCircle,
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
  undoAtom,
  redoAtom,
  sessionAtom,
  type EditorController,
} from "../../../state/editor";
import { sourceAtom } from "../../../state/design";
import { SettingsMenu } from "../../../components/SettingsMenu";
import { Shortcut } from "../../../components/Shortcut";
import { ProjectMenu } from "./ProjectMenu";
import styles from "../styles/Editor.module.css";

export function EditorToolbar({
  controller,
  openSource,
  openProposal,
}: {
  controller: EditorController;
  openSource: () => void;
  openProposal: () => void;
}) {
  const source = useAtomValue(sourceAtom),
    history = useAtomValue(historyAtom),
    status = useAtomValue(saveStatusAtom);
  const undo = useSetAtom(undoAtom),
    redo = useSetAtom(redoAtom),
    store = useStore(),
    navigate = useNavigate();
  function back() {
    void controller.flush().then(() => {
      if (store.get(saveStatusAtom) !== "error") void navigate("/projects");
    });
  }
  async function exportFile(format: "json" | "html") {
    const doc = store.get(sessionAtom)!.document;
    downloadFile(
      fileName(doc.name, format),
      format === "json"
        ? serializeDocument(doc)
        : await renderDocumentHtml(doc),
      format === "json" ? "application/json" : "text/html",
    );
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
            <ArrowLeft size={17} />
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
              <Undo2 size={17} />
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
              <Redo2 size={17} />
            </ActionIcon>
          </Tooltip>
        </div>
      </div>
      <div className={styles.projectTitle}>
        <ProjectMenu
          openSource={openSource}
          openProposal={openProposal}
          back={back}
        />
        <span
          className={styles.saveStatus}
          role="status"
          aria-label="Save status"
          data-status={status}
        >
          {status === "saved" ? (
            <Check size={11} aria-hidden />
          ) : status === "saving" ? (
            <LoaderCircle size={12} aria-hidden className={styles.saving} />
          ) : (
            <AlertCircle size={12} aria-hidden />
          )}
          <span className="srOnly">
            {status === "saved"
              ? "Saved"
              : status === "saving"
                ? "Saving…"
                : "Not saved"}
          </span>
        </span>
      </div>
      <div className={styles.toolbarRight}>
        <SettingsMenu />
        <Menu position="bottom-end">
          <Menu.Target>
            <Button
              size="xs"
              variant="subtle"
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
