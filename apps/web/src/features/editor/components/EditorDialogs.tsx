import { lazy, Suspense } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { SharedLoading } from "../../../components/SharedLoading";
import styles from "../styles/Editor.module.css";
const CodeEditor = lazy(() =>
  import("../source/CodeEditor").then((module) => ({
    default: module.CodeEditor,
  })),
);
const AgentPanel = lazy(() =>
  import("../agent/AgentPanel").then((module) => ({
    default: module.AgentPanel,
  })),
);
export type EditorDialog = "source" | "proposal" | null;
export function EditorDialogs({
  dialog,
  close,
}: {
  dialog: EditorDialog;
  close: () => void;
}) {
  return (
    <Dialog
      open={dialog !== null}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent
        className={`${styles.projectDialog} ${dialog === "proposal" ? styles.proposalDialog : ""}`}
      >
        <DialogHeader>
          <DialogTitle>
            {dialog === "proposal" ? "Import commands" : "Source"}
          </DialogTitle>
        </DialogHeader>
        {dialog === "source" ? (
          <Suspense
            fallback={
              <SharedLoading messageKey="loading.source" variant="working" />
            }
          >
            <CodeEditor />
          </Suspense>
        ) : dialog === "proposal" ? (
          <Suspense
            fallback={
              <SharedLoading messageKey="loading.commands" variant="working" />
            }
          >
            <AgentPanel close={close} />
          </Suspense>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
