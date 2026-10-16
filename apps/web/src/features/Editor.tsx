import { lazy, Suspense, useEffect, useState } from "react";
import { Alert, Button, Loader } from "../ui";
import { useMediaQuery } from "../ui";
import { Provider, useAtomValue, useStore } from "jotai";
import type { Project } from "../lib/projects";
import {
  createEditorController,
  saveErrorAtom,
  saveStatusAtom,
  undoAtom,
  redoAtom,
  zoomAtom,
  selectionAtom,
  sessionAtom,
  type EditorController,
} from "../state/editor";
import {
  canvasAtom,
  modeAtom,
  sourceAtom,
  toolAtom,
  enableVisualAtom,
  selectedIdsAtom,
  selectLayersAtom,
  groupSelectionAtom,
  duplicateSelectionAtom,
  deleteSelectionAtom,
  designCommandAtom,
  designErrorAtom,
} from "../state/design";
import { Canvas } from "./Canvas";
import { DesignCanvas } from "./DesignCanvas";
import { LayerPanel } from "./LayerPanel";
import { Inspector } from "./Inspector";
import { DesignInspector } from "./DesignInspector";
import { TextMode } from "./TextMode";
import { AgentPanel } from "./AgentPanel";
import { EditorToolbar } from "./EditorToolbar";
import { EditorDock } from "./EditorDock";
import styles from "../styles/Editor.module.css";
const CodeEditor = lazy(() =>
  import("./CodeEditor").then((module) => ({ default: module.CodeEditor })),
);
function EditorWorkspace({ controller }: { controller: EditorController }) {
  const desktop = useMediaQuery("(min-width: 851px)"),
    [outlineOverride, setOutline] = useState<boolean | null>(null),
    [inspectorOverride, setInspector] = useState<boolean | null>(null),
    [agent, setAgent] = useState(false),
    selection = useAtomValue(selectionAtom),
    canvas = useAtomValue(canvasAtom),
    mode = useAtomValue(modeAtom),
    source = useAtomValue(sourceAtom),
    error = useAtomValue(saveErrorAtom),
    designError = useAtomValue(designErrorAtom),
    store = useStore();
  const outline = outlineOverride ?? false,
    inspector = inspectorOverride ?? (desktop && selection !== null),
    code =
      (!!source && source.enabled !== false) || (mode === "code" && !source);
  function toggleOutline() {
    setOutline(!outline);
    if (!desktop) {
      setInspector(false);
      setAgent(false);
    }
  }
  function toggleInspector() {
    setInspector(!inspector);
    if (!desktop) setOutline(false);
    setAgent(false);
  }
  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if (event.defaultPrevented) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.matches(
          "input,textarea,select,[role=slider],[role=combobox],[role=option],[role=menuitem]",
        ) ||
          target.isContentEditable)
      )
        return;
      const key = event.key.toLowerCase(),
        modifier = event.ctrlKey || event.metaKey;
      if (modifier && (key === "z" || key === "y")) {
        event.preventDefault();
        store.set(key === "y" || event.shiftKey ? redoAtom : undoAtom);
        return;
      }
      const savedSource = store.get(sessionAtom)?.document.source;
      if (
        (savedSource && savedSource.enabled !== false) ||
        (store.get(modeAtom) === "code" && !savedSource)
      )
        return;
      const ids = store.get(selectedIdsAtom),
        selection = store.get(selectionAtom);
      if (modifier && key === "g") {
        event.preventDefault();
        if (event.shiftKey && selection?.groupId) {
          store.set(designCommandAtom, {
            type: "group.ungroup",
            id: selection.groupId,
          });
          store.set(selectLayersAtom, { ids });
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
        store.set(enableVisualAtom);
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
  return (
    <main className={styles.editor}>
      <EditorToolbar
        controller={controller}
        toggleAgent={() => {
          setAgent((value) => !value);
          setInspector(agent && desktop);
          if (!desktop) setOutline(false);
        }}
        agentOpen={agent}
      />
      {error ? (
        <Alert
          color="red"
          title="Changes are not saved"
          className={styles.saveAlert}
        >
          {error}
          <Button
            size="compact-xs"
            ml="md"
            color="red"
            variant="subtle"
            onClick={() => void controller.flush()}
          >
            Retry save
          </Button>
        </Alert>
      ) : designError ? (
        <Alert color="red" title="Unable to edit" className={styles.saveAlert}>
          {designError}
          <Button
            size="compact-xs"
            ml="md"
            variant="subtle"
            onClick={() => store.set(designErrorAtom, "")}
          >
            Dismiss
          </Button>
        </Alert>
      ) : null}
      <div className={styles.workspace}>
        {outline && !code && (
          <LayerPanel
            close={() => setOutline(false)}
            openSettings={() => {
              setInspector(true);
              if (!desktop) setOutline(false);
            }}
          />
        )}
        {code ? (
          <Suspense
            fallback={
              <div className={styles.codeLoading}>
                <Loader size="sm" />
                Opening code editor…
              </div>
            }
          >
            <CodeEditor />
          </Suspense>
        ) : canvas ? (
          mode === "text" ? (
            <TextMode />
          ) : (
            <DesignCanvas />
          )
        ) : (
          <Canvas />
        )}
        {agent ? (
          <AgentPanel
            close={() => {
              setAgent(false);
              setInspector(desktop);
            }}
          />
        ) : inspector && !code ? (
          canvas && (!selection || selection.blockIds) ? (
            <DesignInspector
              close={() => setInspector(false)}
              showDocument={() => setInspector(true)}
            />
          ) : (
            <Inspector
              close={() => setInspector(false)}
              showDocument={() => setInspector(true)}
            />
          )
        ) : null}
      </div>
      <EditorDock
        toggleOutline={toggleOutline}
        toggleInspector={toggleInspector}
      />
    </main>
  );
}
export function Editor({ project }: { project: Project }) {
  const [controller] = useState(() => {
    const controller = createEditorController(project);
    if (typeof window !== "undefined" && window.innerWidth < 851)
      controller.store.set(
        zoomAtom,
        Math.max(15, Math.floor(((window.innerWidth - 40) / 794) * 100)),
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
