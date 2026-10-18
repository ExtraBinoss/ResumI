import { useAtomValue, useSetAtom, useStore } from "jotai";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { ActionIcon, Button, Menu, Tooltip } from "../../../ui";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Download,
  ChevronDown,
  FileJson,
  FileCode,
  FileText,
} from "lucide-react";
import { serializeDocument } from "@resumi/engine";
import { renderDocumentHtml } from "@resumi/cv/document-render";
import { downloadFile, fileName } from "../../../lib/files";
import { storageErrorKey } from "../../../lib/projects";
import { exportPdf } from "../../../lib/pdf-export";
import { exportReactCanvas } from "../../../lib/react-export";
import {
  historyAtom,
  saveStatusAtom,
  saveErrorAtom,
  undoAtom,
  redoAtom,
  sessionAtom,
  type EditorController,
} from "../../../state/editor";
import { designErrorAtom } from "../../../state/design";
import { SettingsMenu } from "../../../components/SettingsMenu";
import { Shortcut } from "../../../components/Shortcut";
import { ErrorNotice } from "../../../components/ErrorNotice";
import { ProjectMenu } from "./ProjectMenu";
import styles from "../styles/Editor.module.css";

export function EditorToolbar({
  controller,
  openDocument,
}: {
  controller: EditorController;
  openDocument: () => void;
}) {
  const { t } = useTranslation();
  const history = useAtomValue(historyAtom),
    status = useAtomValue(saveStatusAtom),
    error = useAtomValue(saveErrorAtom);
  const undo = useSetAtom(undoAtom),
    redo = useSetAtom(redoAtom),
    setError = useSetAtom(designErrorAtom),
    store = useStore(),
    navigate = useNavigate();
  const saveError = error ? t(storageErrorKey(error)) : null;
  function back() {
    void controller.flush().then(() => {
      if (store.get(saveStatusAtom) !== "error") void navigate("/projects");
    });
  }
  async function exportFile(format: "json" | "html" | "tsx") {
    try {
      const doc = store.get(sessionAtom)!.document;
      downloadFile(
        fileName(doc.name, format),
        format === "json"
          ? serializeDocument(doc)
          : format === "tsx"
            ? exportReactCanvas(doc)
            : await renderDocumentHtml(doc),
        format === "json"
          ? "application/json"
          : format === "html"
            ? "text/html"
            : "text/plain",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : t("workspace.toolbar.exportFailed"),
      );
    }
  }
  function pdf() {
    exportPdf(
      store.get(sessionAtom)!.document,
      (message) => setError(message),
      t("loading.pdf"),
      {
        popupBlocked: t("site.errors.pdfPopupBlocked"),
        preparationFailed: t("site.errors.pdfPrepareFailed"),
      },
    );
  }
  return (
    <header className={styles.toolbar}>
      <div className={styles.toolbarLeft}>
        <Tooltip label={t("editor.backToProjects")}>
          <ActionIcon
            variant="subtle"
            color="gray"
            aria-label={t("editor.backToProjects")}
            onClick={back}
          >
            <ArrowLeft size={17} aria-hidden />
          </ActionIcon>
        </Tooltip>
        <div className={styles.historyActions}>
          <Tooltip
            label={
              <span className={styles.shortcutLabel}>
                {t("editor.undo")} <Shortcut keys={["Mod", "Z"]} />
              </span>
            }
          >
            <ActionIcon
              aria-label={t("editor.undo")}
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
                {t("editor.redo")} <Shortcut keys={["Mod", "Shift", "Z"]} />
              </span>
            }
          >
            <ActionIcon
              aria-label={t("editor.redo")}
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
        <ProjectMenu openDocument={openDocument} />
        <span
          className="srOnly"
          role="status"
          aria-label={t("workspace.toolbar.saveStatus")}
          data-status={status}
        >
          {status === "saved"
            ? t("workspace.toolbar.saved")
            : status === "saving"
              ? t("workspace.toolbar.saving")
              : t("workspace.toolbar.notSaved")}
        </span>
        <ErrorNotice
          error={saveError}
          label={t("editor.changesNotSaved")}
          compact
        >
          <Button
            variant="default"
            size="xs"
            onClick={() => void controller.flush()}
          >
            {t("editor.retrySave")}
          </Button>
        </ErrorNotice>
      </div>
      <div className={styles.toolbarRight}>
        <SettingsMenu />
        <div className={styles.exportGroup}>
          <Button
            size="xs"
            variant="filled"
            aria-label={t("editor.exportPdf")}
            leftSection={<Download size={14} aria-hidden />}
            onClick={pdf}
            className={styles.exportPdf}
          >
            PDF
          </Button>
          <Menu position="bottom-end">
            <Menu.Target>
              <Button
                size="xs"
                variant="filled"
                aria-label={t("editor.export")}
                className={styles.exportButton}
                title={t("editor.exportFormats")}
              >
                <ChevronDown size={14} aria-hidden />
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<FileText size={16} aria-hidden />}
                onClick={pdf}
              >
                PDF
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<FileJson size={14} />}
                onClick={() => void exportFile("json")}
              >
                {t("editor.jsonDocument")}
              </Menu.Item>
              <Menu.Item
                leftSection={<FileCode size={14} />}
                onClick={() => void exportFile("html")}
              >
                {t("editor.portableHtml")}
              </Menu.Item>
              <Menu.Item
                leftSection={<FileCode size={14} />}
                onClick={() => void exportFile("tsx")}
              >
                {t("workspace.toolbar.canvasTsx")}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </div>
    </header>
  );
}
