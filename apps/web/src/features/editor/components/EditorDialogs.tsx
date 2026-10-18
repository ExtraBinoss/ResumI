import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { SharedLoading } from "../../../components/SharedLoading";
import { DocumentSettings } from "../panels/DocumentSettings";
import styles from "../styles/Editor.module.css";
const AgentPanel = lazy(() =>
  import("../agent/AgentPanel").then((module) => ({
    default: module.AgentPanel,
  })),
);
export type EditorDialog = "proposal" | "document" | null;
export function EditorDialogs({
  dialog,
  close,
}: {
  dialog: EditorDialog;
  close: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Dialog
      open={dialog !== null}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent
        className={`${styles.projectDialog} ${dialog === "document" ? styles.documentDialog : dialog === "proposal" ? styles.proposalDialog : ""}`}
      >
        <DialogHeader>
          <DialogTitle>
            {dialog === "document"
              ? t("pages.settings")
              : t("workspace.dialogs.importCommands")}
          </DialogTitle>
        </DialogHeader>
        {dialog === "document" ? (
          <DocumentSettings close={close} />
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
