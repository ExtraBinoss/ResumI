import { useTranslation } from "react-i18next";
import { publicPath } from "../../i18n/public-locale";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Button, TextInput, Modal, Alert, Loader } from "../../ui";
import { FileText, ArrowUpRight } from "lucide-react";
import { createSearchIndex } from "../../lib/search-index";
import { ProjectCard } from "./components/ProjectCard";
import { ResumeFileInput } from "./components/ResumeFileInput";
import { useLibraryView } from "./state/library-view";
import { ProjectPreview } from "./components/ProjectPreview";
import { useDashboardProjects } from "./state/projects";
import {
  projects,
  storageErrorCode,
  storageErrorKey,
  StorageConflict,
  type Project,
} from "../../lib/projects";
import { DocumentFileTooLargeError, readDocumentFile } from "../../lib/files";
import styles from "./styles/Dashboard.module.css";
export function Projects() {
  const { t, i18n } = useTranslation();
  const {
    records,
    error,
    setError,
    setStorageError,
    setFileTooLargeError,
    refresh,
  } = useDashboardProjects();
  const [busy, setBusy] = useState(false);
  const [renaming, setRenaming] = useState<Project | null>(null),
    [name, setName] = useState(""),
    [deleting, setDeleting] = useState<Project | null>(null);
  const { search, sort, view } = useLibraryView();
  const [preview, setPreview] = useState<Project | null>(null);
  const navigate = useNavigate();
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await action();
      await refresh();
    } catch (e) {
      if (e instanceof DocumentFileTooLargeError) setFileTooLargeError();
      else if (
        e instanceof StorageConflict ||
        (typeof DOMException !== "undefined" &&
          e instanceof DOMException &&
          e.name === "QuotaExceededError")
      )
        setStorageError(storageErrorCode(e));
      else if (
        e instanceof Error &&
        !(typeof DOMException !== "undefined" && e instanceof DOMException)
      )
        setError(e.message);
      else setStorageError(storageErrorCode(e));
    } finally {
      setBusy(false);
    }
  }
  // The immutable repository snapshot is the index identity; keypresses query it.
  const index = useMemo(
    () =>
      createSearchIndex(records ?? [], {
        text: (project) => project.document.name,
      }),
    [records],
  );
  const filtered = records
    ? index
        .search(search, { limit: 500 })
        .sort((a, b) =>
          sort === "name"
            ? a.document.name.localeCompare(b.document.name)
            : b.updatedAt.localeCompare(a.updatedAt),
        )
    : null;
  return (
    <>
      <ResumeFileInput
        disabled={busy || records === null}
        onSelect={(file) =>
          void run(async () => {
            const project = await projects.import(await readDocumentFile(file));
            await navigate(`/editor/${project.id}`);
          })
        }
      />
      {error && (
        <Alert color="red" title={t("dashboard.actionFailed")} mb="md">
          {error.kind === "message"
            ? error.value
            : error.kind === "storage"
              ? t(storageErrorKey(error.code))
              : t(error.key)}
        </Alert>
      )}
      <section
        className={styles.collection}
        aria-label={t("dashboard.library")}
      >
        {!records && !error && (
          <div className={styles.empty}>
            <Loader size="sm" label={t("loading.projects")} text />
          </div>
        )}
        {filtered?.length === 0 && (
          <div className={styles.empty}>
            <span className={styles.emptyPaper}>
              <FileText size={36} strokeWidth={1.2} aria-hidden />
            </span>
            <h2>
              {search ? t("dashboard.noResults") : t("dashboard.noResumes")}
            </h2>
            {!search && (
              <Button
                component={Link}
                to={publicPath(i18n.language, "templates")}
                variant="light"
              >
                {t("dashboard.chooseTemplate")}{" "}
                <ArrowUpRight size={15} aria-hidden />
              </Button>
            )}
          </div>
        )}
        <motion.div
          className={`${styles.grid} ${view === "list" ? styles.listView : ""}`}
          transition={{ duration: 0.24, ease: "easeOut" }}
        >
          {filtered?.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              compact={view === "list"}
              onRename={() => {
                setRenaming(project);
                setName(project.document.name);
              }}
              onDuplicate={() =>
                void run(async () => {
                  await projects.duplicate(project.id);
                })
              }
              onDelete={() => setDeleting(project)}
              onPreview={() => setPreview(project)}
            />
          ))}
        </motion.div>
      </section>
      <ProjectPreview project={preview} onClose={() => setPreview(null)} />
      <Modal
        opened={!!renaming}
        onClose={() => setRenaming(null)}
        title={t("dashboard.renameResume")}
        centered
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (renaming)
              void run(async () => {
                await projects.rename(renaming.id, name);
                setRenaming(null);
              });
          }}
        >
          <TextInput
            label={t("dashboard.resumeName")}
            autoFocus
            value={name}
            maxLength={120}
            onChange={(e) => setName(e.currentTarget.value)}
            required
          />
          <Button type="submit" mt="lg" loading={busy} disabled={!name.trim()}>
            {t("dashboard.saveName")}
          </Button>
        </form>
      </Modal>
      <Modal
        opened={!!deleting}
        onClose={() => setDeleting(null)}
        title={t("dashboard.deleteTitle")}
        centered
      >
        <p>
          {t("dashboard.deleteConfirmation", { name: deleting?.document.name })}
        </p>
        <div className={styles.actions}>
          <Button variant="default" onClick={() => setDeleting(null)}>
            {t("dashboard.keepResume")}
          </Button>
          <Button
            color="red"
            loading={busy}
            onClick={() => {
              if (deleting)
                void run(async () => {
                  await projects.delete(deleting.id);
                  setDeleting(null);
                });
            }}
          >
            {t("dashboard.deleteResume")}
          </Button>
        </div>
      </Modal>
    </>
  );
}
