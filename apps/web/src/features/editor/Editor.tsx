import { useTranslation } from "react-i18next";
import { useDeferredValue, useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ErrorToast } from "../../components/ErrorNotice";
import { Provider, useAtomValue, useStore } from "jotai";
import type { Project } from "../../lib/projects";
import {
  createEditorController,
  saveStatusAtom,
  undoAtom,
  redoAtom,
  zoomAtom,
  selectionAtom,
  sessionAtom,
  type EditorController,
} from "../../state/editor";
import {
  canvasAtom,
  modeAtom,
  sourceAtom,
  toolAtom,
  selectedIdsAtom,
  selectLayersAtom,
  groupSelectionAtom,
  duplicateSelectionAtom,
  deleteSelectionAtom,
  designCommandAtom,
  designErrorAtom,
  activePageIdAtom,
} from "../../state/design";
import { Canvas } from "../canvas/Canvas";
import { DesignCanvas } from "../canvas/DesignCanvas";
import { LayerPanel } from "./panels/LayerPanel";
import { Inspector } from "./panels/Inspector";
import { DesignInspector } from "./panels/DesignInspector";
import { TextMode } from "./text/TextMode";
import { PageRecovery } from "../../components/PageRecovery";
import { EditorDialogs, type EditorDialog } from "./components/EditorDialogs";
import { EditorToolbar } from "./components/EditorToolbar";
import { EditorDock } from "./components/EditorDock";
import styles from "./styles/Editor.module.css";
function EditorWorkspace({ controller }: { controller: EditorController }) {
  const { t } = useTranslation();
  const [dialog, setDialog] = useState<EditorDialog>(null),
    selection = useAtomValue(selectionAtom),
    canvas = useAtomValue(canvasAtom),
    mode = useAtomValue(modeAtom),
    source = useAtomValue(sourceAtom),
    activePageId = useAtomValue(activePageIdAtom),
    designError = useAtomValue(designErrorAtom),
    store = useStore(),
    reduced = useReducedMotion();
  const sourceActive = !!source && source.enabled !== false;
  // Keep the current surface painted while React prepares the other editor.
  // Dock feedback stays urgent, so mounting rich fields cannot stall its reveal.
  const displayedMode = useDeferredValue(mode);
  const view = canvas ? displayedMode : "structured";
  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if (event.defaultPrevented) return;
      const modifier = event.ctrlKey || event.metaKey;
      if (modifier && event.altKey && event.key === "Enter") {
        event.preventDefault();
        setDialog("proposal");
        return;
      }
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.matches(
          "input,textarea,select,[role=slider],[role=combobox],[role=option],[role=menuitem]",
        ) ||
          target.isContentEditable)
      )
        return;
      const key = event.key.toLowerCase();
      if (modifier && (key === "z" || key === "y")) {
        event.preventDefault();
        store.set(key === "y" || event.shiftKey ? redoAtom : undoAtom);
        return;
      }
      const savedSource = store.get(sessionAtom)?.document.source;
      if (savedSource && savedSource.enabled !== false) return;
      const ids = store.get(selectedIdsAtom),
        selection = store.get(selectionAtom);
      if (modifier && key === "g") {
        event.preventDefault();
        if (event.shiftKey) {
          if (selection?.groupId) {
            store.set(designCommandAtom, {
              type: "group.ungroup",
              id: selection.groupId,
            });
            store.set(selectLayersAtom, { ids });
          }
        } else store.set(groupSelectionAtom);
        return;
      }
      if (modifier && key === "d" && ids.length) {
        event.preventDefault();
        store.set(duplicateSelectionAtom);
        return;
      }
      if ((key === "delete" || key === "backspace") && ids.length) {
        event.preventDefault();
        store.set(deleteSelectionAtom);
        return;
      }
      if (key === "escape") {
        store.set(selectLayersAtom, { ids: [] });
        store.set(toolAtom, "select");
        return;
      }
      if (!modifier && key === "v") store.set(toolAtom, "select");
      if (!modifier && key === "t") {
        store.set(modeAtom, "visual");
        store.set(toolAtom, "text");
      }
      if (
        ids.length &&
        ["arrowleft", "arrowright", "arrowup", "arrowdown"].includes(key)
      ) {
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        store.set(designCommandAtom, {
          type: "layer.translate",
          ids,
          dx: key === "arrowleft" ? -step : key === "arrowright" ? step : 0,
          dy: key === "arrowup" ? -step : key === "arrowdown" ? step : 0,
        });
      }
    }
    function beforeUnload(event: BeforeUnloadEvent) {
      if (store.get(saveStatusAtom) !== "saved") event.preventDefault();
    }
    window.addEventListener("keydown", keydown);
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [store]);
  if (sourceActive)
    return (
      <PageRecovery
        notFound={false}
        title={t("site.recovery.workspaceError")}
        description={t("site.recovery.errorDescription")}
        error={t("workspace.errors.sourceNotReady")}
      />
    );
  return (
    <motion.main
      className={styles.editor}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.18 }}
    >
      <EditorToolbar
        controller={controller}
        openDocument={() => setDialog("document")}
      />
      <ErrorToast
        error={
          typeof designError === "string"
            ? designError
            : t("workspace.errors.unableToEditLayer")
        }
        label={t("editor.actionFailed")}
        onDismiss={() => store.set(designErrorAtom, "")}
      />
      <div className={styles.workspace}>
        <LayerPanel />
        <motion.div
          key={view}
          className={styles.modeSurface}
          aria-busy={displayedMode !== mode}
          inert={displayedMode !== mode}
          initial={reduced ? false : { opacity: 0.7 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: reduced ? 0 : 0.12,
            ease: [0.2, 0.8, 0.2, 1],
          }}
        >
          {canvas ? (
            displayedMode === "text" ? (
              <TextMode />
            ) : (
              <DesignCanvas key={activePageId} />
            )
          ) : (
            <Canvas />
          )}
        </motion.div>
        {!selection || selection.blockIds ? <DesignInspector /> : <Inspector />}
      </div>
      <EditorDock />
      <EditorDialogs dialog={dialog} close={() => setDialog(null)} />
    </motion.main>
  );
}
export function Editor({ project }: { project: Project }) {
  const [controller] = useState(() => {
    const controller = createEditorController(project);
    if (typeof window !== "undefined" && window.innerWidth < 851)
      controller.store.set(
        zoomAtom,
        Math.max(
          15,
          Math.floor(
            Math.min(
              (window.innerWidth - 40) / 794,
              (window.innerHeight * 0.6 - 135) / 1123,
            ) * 100,
          ),
        ),
      );
    return controller;
  });
  useEffect(() => {
    controller.connect();
    return () => controller.dispose();
  }, [controller]);
  return (
    <Provider store={controller.store}>
      <EditorWorkspace controller={controller} />
    </Provider>
  );
}
