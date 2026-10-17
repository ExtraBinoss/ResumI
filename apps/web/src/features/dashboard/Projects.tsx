import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Button,
  TextInput,
  Modal,
  FileButton,
  Alert,
  Loader,
  Select,
  SegmentedControl,
} from "../../ui";
import {
  Plus,
  Upload,
  FileText,
  ArrowUpRight,
  Grid2X2,
  Rows3,
} from "lucide-react";
import { SearchInput } from "../../components/SearchInput";
import { createSearchIndex } from "../../lib/search-index";
import { ProjectCard } from "./components/ProjectCard";
import { LibraryToolbar } from "./components/LibraryToolbar";
import { ProjectPreview } from "./components/ProjectPreview";
import { useDashboardProjects } from "./state/projects";
import { projects, storageMessage, type Project } from "../../lib/projects";
import { readDocumentFile } from "../../lib/files";
import { preloadEditor } from "../../lib/preload-editor";
import styles from "./styles/Dashboard.module.css";
export function Projects() {
  const { t } = useTranslation();
  const { records, error, setError, refresh } = useDashboardProjects();
  const [search, setSearch] = useState(""),
    [busy, setBusy] = useState(false);
  const [renaming, setRenaming] = useState<Project | null>(null),
    [name, setName] = useState(""),
    [deleting, setDeleting] = useState<Project | null>(null);
  const [sort, setSort] = useState("recent"),
    [view, setView] = useState("grid");
  const [preview, setPreview] = useState<Project | null>(null);
  const navigate = useNavigate();
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await action();
      await refresh();
    } catch (e) {
      setError(
        e instanceof Error && !(e instanceof DOMException)
          ? e.message
          : storageMessage(e),
      );
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
      <main className={styles.main}>
        <header className={styles.heading}>
          <div className={styles.collectionTitle}>
            <h1>{t("dashboard.yourResumes")}</h1>
            {records && <span className={styles.count}>{records.length}</span>}
          </div>
          <div className={styles.actions}>
            <FileButton
              accept="application/json,.json"
              onChange={(file) => {
                if (file)
                  void run(async () => {
                    const project = await projects.import(
                      await readDocumentFile(file),
                    );
                    await navigate(`/editor/${project.id}`);
                  });
              }}
            >
              {(props) => (
                <Button
                  {...props}
                  variant="default"
                  leftSection={<Upload aria-hidden />}
                  disabled={busy || records === null}
                  className={styles.importButton}
                >
                  {t("dashboard.import")}
                </Button>
              )}
            </FileButton>
            <Button
              leftSection={<Plus aria-hidden />}
              loading={busy}
              onPointerEnter={preloadEditor}
              onFocus={preloadEditor}
              onClick={() =>
                void run(async () => {
                  const project = await projects.create();
                  await navigate(`/editor/${project.id}`);
                })
              }
            >
              {t("dashboard.newResume")}
            </Button>
          </div>
        </header>
        {error && (
          <Alert color="red" title={t("dashboard.actionFailed")} mb="md">
            {error}
          </Alert>
        )}
        <LibraryToolbar
          search={
            <SearchInput
              aria-label={t("dashboard.searchResumes")}
              prefix={t("common.search")}
              captureTyping
              hints={(records ?? [])
                .slice(0, 6)
                .map((project) => ({ label: project.document.name }))}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              size="xs"
            />
          }
        >
          <Select
            aria-label={t("dashboard.sort")}
            value={sort}
            onChange={(value) => {
              if (value) setSort(value);
            }}
            allowDeselect={false}
            data={[
              { value: "recent", label: t("dashboard.lastEdited") },
              { value: "name", label: t("dashboard.sortName") },
            ]}
            size="xs"
            className={styles.sort}
            contentClassName={styles.sortMenu}
          />
          <SegmentedControl
            aria-label={t("dashboard.view")}
            size="xs"
            value={view}
            onChange={setView}
            data={[
              {
                value: "grid",
                label: (
                  <span aria-label={t("dashboard.grid")}>
                    <Grid2X2 size={16} aria-hidden />
                  </span>
                ),
              },
              {
                value: "list",
                label: (
                  <span aria-label={t("dashboard.list")}>
                    <Rows3 size={16} aria-hidden />
                  </span>
                ),
              },
            ]}
          />
        </LibraryToolbar>
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
                <Button component={Link} to="/templates" variant="light">
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
      </main>
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
