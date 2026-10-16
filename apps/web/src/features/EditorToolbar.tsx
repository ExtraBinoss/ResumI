import { useState } from "react";
import { useAtomValue, useSetAtom, useStore } from "jotai";
import { useNavigate } from "react-router";
import { ActionIcon, Button, Menu, Modal, TextInput, Tooltip } from "../ui";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Download,
  ChevronDown,
  Check,
  LoaderCircle,
  AlertCircle,
  Terminal,
  FileJson,
  FileCode,
  Printer,
  Pencil,
} from "lucide-react";
import { serializeDocument } from "@resumi/engine";
import { renderHtml, renderDocumentHtml } from "@resumi/cv";
import { downloadFile, fileName } from "../lib/files";
import {
  nameAtom,
  historyAtom,
  saveStatusAtom,
  undoAtom,
  redoAtom,
  sessionAtom,
  commandAtom,
  type EditorController,
} from "../state/editor";
import { sourceAtom } from "../state/design";
import styles from "../styles/Editor.module.css";
export function EditorToolbar({
  controller,
  toggleAgent,
  agentOpen,
}: {
  controller: EditorController;
  toggleAgent: () => void;
  agentOpen: boolean;
}) {
  const source = useAtomValue(sourceAtom);
  const name = useAtomValue(nameAtom),
    history = useAtomValue(historyAtom),
    status = useAtomValue(saveStatusAtom);
  const undo = useSetAtom(undoAtom),
    redo = useSetAtom(redoAtom),
    dispatch = useSetAtom(commandAtom),
    store = useStore(),
    navigate = useNavigate();
  const [rename, setRename] = useState(false),
    [draft, setDraft] = useState(name);
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
      exportFile("html");
      return;
    }
    // Trusted generated HTML only; renderer validates and escapes all user content.
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
    <>
      <header className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <Tooltip label="Back to projects">
            <ActionIcon
              variant="subtle"
              color="gray"
              aria-label="Back to projects"
              onClick={() => {
                void controller.flush().then(() => {
                  if (store.get(saveStatusAtom) !== "error")
                    void navigate("/projects");
                });
              }}
            >
              <ArrowLeft size={18} />
            </ActionIcon>
          </Tooltip>
          <span className={styles.toolbarDivider} />
          <button
            className={styles.nameButton}
            onClick={() => {
              setDraft(name);
              setRename(true);
            }}
          >
            {name}
            <Pencil size={11} aria-hidden />
          </button>
          <span
            className={styles.saveStatus}
            role="status"
            aria-label="Save status"
          >
            {status === "saved" ? (
              <>
                <Check size={12} />
                Saved
              </>
            ) : status === "saving" ? (
              <>
                <LoaderCircle size={12} />
                Saving…
              </>
            ) : (
              <>
                <AlertCircle size={12} />
                Not saved
              </>
            )}
          </span>
        </div>
        <div className={styles.toolbarRight}>
          <Tooltip label="Undo (⌘/Ctrl Z)">
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
          <Tooltip label="Redo (⌘/Ctrl Shift Z)">
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
          <span className={styles.toolbarDivider} />
          <Button
            size="xs"
            variant={agentOpen ? "light" : "subtle"}
            leftSection={<Terminal size={14} />}
            onClick={toggleAgent}
            aria-label="Teammate"
            className={styles.agentToggle}
          >
            <span className={styles.teammateLabel}>Teammate</span>
          </Button>
          <Menu>
            <Menu.Target>
              <Button
                size="xs"
                leftSection={<Download size={14} />}
                rightSection={<ChevronDown size={12} />}
              >
                Export
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
                        name,
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
                {source ? "HTML for printing" : "Print / Save as PDF"}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </header>
      <Modal
        opened={rename}
        onClose={() => setRename(false)}
        title="Rename resume"
        centered
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            dispatch({ type: "document.update", name: draft });
            setRename(false);
          }}
        >
          <TextInput
            label="Resume name"
            value={draft}
            onChange={(e) => setDraft(e.currentTarget.value)}
            maxLength={120}
            required
            autoFocus
          />
          <Button type="submit" mt="lg" disabled={!draft.trim()}>
            Save name
          </Button>
        </form>
      </Modal>
    </>
  );
}
