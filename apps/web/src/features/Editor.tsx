import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Alert, Button, Loader } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Provider, useAtomValue, useStore } from "jotai";
import { projects, storageMessage } from "../lib/projects";
import {
  createEditorController,
  saveErrorAtom,
  saveStatusAtom,
  undoAtom,
  redoAtom,
  zoomAtom,
  type EditorController,
} from "../state/editor";
import { Canvas } from "./Canvas";
import { Structure } from "./Structure";
import { Inspector } from "./Inspector";
import { AgentPanel } from "./AgentPanel";
import { EditorToolbar } from "./EditorToolbar";
import styles from "../styles/Editor.module.css";
function EditorWorkspace({ controller }: { controller: EditorController }) {
  const desktop = useMediaQuery("(min-width: 851px)");
  const [outlineOverride, setOutline] = useState<boolean | null>(null),
    [inspectorOverride, setInspector] = useState<boolean | null>(null),
    [agent, setAgent] = useState(false);
  const outline = outlineOverride ?? desktop,
    inspector = inspectorOverride ?? desktop;
  const error = useAtomValue(saveErrorAtom),
    store = useStore();
  useEffect(() => {
    function keydown(e: KeyboardEvent) {
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.matches("input,textarea,select") || target.isContentEditable)
      )
        return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        store.set(e.shiftKey ? redoAtom : undoAtom);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        store.set(redoAtom);
      }
    }
    function beforeUnload(e: BeforeUnloadEvent) {
      if (store.get(saveStatusAtom) !== "saved") e.preventDefault();
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
        toggleOutline={() => {
          setOutline(!outline);
          if (!desktop) {
            setInspector(false);
            setAgent(false);
          }
        }}
        toggleInspector={() => {
          setInspector(!inspector);
          if (!desktop) setOutline(false);
          setAgent(false);
        }}
        toggleAgent={() => {
          setAgent((v) => !v);
          setInspector(agent && desktop);
          if (!desktop) setOutline(false);
        }}
        agentOpen={agent}
      />
      {error && (
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
      )}
      <div className={styles.workspace}>
        {outline && <Structure close={() => setOutline(false)} />}
        <Canvas />
        {agent ? (
          <AgentPanel
            close={() => {
              setAgent(false);
              setInspector(desktop);
            }}
          />
        ) : inspector ? (
          <Inspector close={() => setInspector(false)} />
        ) : null}
      </div>
    </main>
  );
}
export function Editor({ id }: { id: string }) {
  const [controller, setController] = useState<EditorController | null>(null),
    [missing, setMissing] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true,
      current: EditorController | undefined;
    void projects
      .get(id)
      .then((project) => {
        if (!active) return;
        if (!project) {
          setMissing(true);
          return;
        }
        current = createEditorController(project);
        if (window.innerWidth < 851)
          current.store.set(
            zoomAtom,
            Math.max(35, Math.floor(((window.innerWidth - 40) / 794) * 100)),
          );
        setController(current);
      })
      .catch((e) => {
        if (active) setError(storageMessage(e));
      });
    return () => {
      active = false;
      current?.dispose();
    };
  }, [id]);
  if (controller)
    return (
      <Provider store={controller.store}>
        <EditorWorkspace controller={controller} />
      </Provider>
    );
  return (
    <main className="recovery">
      <h1>
        {missing
          ? "This resume isn’t on this device."
          : error
            ? "Could not open your workspace."
            : "Opening your resume…"}
      </h1>
      {!missing && !error ? (
        <Loader size="sm" />
      ) : (
        <p>
          {error ||
            "Local resumes belong to the browser where you created them. Import a JSON backup, or start a new chapter."}
        </p>
      )}
      <Button component={Link} to="/projects" mt="lg">
        Go to projects
      </Button>
    </main>
  );
}
