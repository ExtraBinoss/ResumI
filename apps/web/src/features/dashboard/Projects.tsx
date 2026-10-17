import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion, useReducedMotion } from "motion/react";
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
  Search,
  FileText,
  ArrowUpRight,
  Grid2X2,
  Rows3,
} from "lucide-react";
import { ProjectCard } from "./components/ProjectCard";
import { ProjectPreview } from "./components/ProjectPreview";
import { useDashboardProjects } from "./state/projects";
import { projects, storageMessage, type Project } from "../../lib/projects";
import { readDocumentFile } from "../../lib/files";
import { preloadEditor } from "../../lib/preload-editor";
import styles from "./styles/Dashboard.module.css";
export function Projects() {
  const { records, error, setError, refresh } = useDashboardProjects();
  const [search, setSearch] = useState(""),
    [busy, setBusy] = useState(false);
  const [renaming, setRenaming] = useState<Project | null>(null),
    [name, setName] = useState(""),
    [deleting, setDeleting] = useState<Project | null>(null);
  const [sort, setSort] = useState("recent"),
    [view, setView] = useState("grid");
  const [preview, setPreview] = useState<Project | null>(null);
  const reducedMotion = useReducedMotion();
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
  const filtered = records
    ?.filter((project) =>
      project.document.name.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.document.name.localeCompare(b.document.name)
        : b.updatedAt.localeCompare(a.updatedAt),
    );
  return (
    <>
      <main className={styles.main}>
        <header className={styles.heading}>
          <div className={styles.collectionTitle}>
            <h1>Your resumes</h1>
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
                  Import
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
              New resume
            </Button>
          </div>
        </header>
        {error && (
          <Alert color="red" title="Could not complete that action" mb="md">
            {error}
          </Alert>
        )}
        <div className={styles.listHeader}>
          <div className={styles.search}>
            <TextInput
              aria-label="Search resumes"
              placeholder="Search…"
              leftSection={<Search size={15} aria-hidden />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              size="xs"
            />
          </div>
          <div className={styles.listTools}>
            <Select
              aria-label="Sort resumes"
              value={sort}
              onChange={(value) => {
                if (value) setSort(value);
              }}
              allowDeselect={false}
              data={[
                { value: "recent", label: "Last edited" },
                { value: "name", label: "Name A–Z" },
              ]}
              size="xs"
              className={styles.sort}
            />
            <SegmentedControl
              aria-label="Resume view"
              size="xs"
              value={view}
              onChange={setView}
              data={[
                {
                  value: "grid",
                  label: (
                    <span aria-label="Grid view">
                      <Grid2X2 size={16} aria-hidden />
                    </span>
                  ),
                },
                {
                  value: "list",
                  label: (
                    <span aria-label="List view">
                      <Rows3 size={16} aria-hidden />
                    </span>
                  ),
                },
              ]}
            />
          </div>
        </div>
        <section className={styles.collection} aria-label="Resume library">
          {!records && !error && (
            <div className={styles.empty}>
              <Loader size="sm" />
            </div>
          )}
          {filtered?.length === 0 && (
            <div className={styles.empty}>
              <span className={styles.emptyPaper}>
                <FileText size={36} strokeWidth={1.2} aria-hidden />
              </span>
              <h2>{search ? "No results" : "No resumes yet"}</h2>
              {!search && (
                <Button component={Link} to="/templates" variant="light">
                  Choose a template <ArrowUpRight size={15} aria-hidden />
                </Button>
              )}
            </div>
          )}
          <motion.div
            layout={!reducedMotion}
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
        title="Rename resume"
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
            label="Resume name"
            autoFocus
            value={name}
            maxLength={120}
            onChange={(e) => setName(e.currentTarget.value)}
            required
          />
          <Button type="submit" mt="lg" loading={busy} disabled={!name.trim()}>
            Save name
          </Button>
        </form>
      </Modal>
      <Modal
        opened={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete this resume?"
        centered
      >
        <p>Delete “{deleting?.document.name}”?</p>
        <div className={styles.actions}>
          <Button variant="default" onClick={() => setDeleting(null)}>
            Keep resume
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
            Delete resume
          </Button>
        </div>
      </Modal>
    </>
  );
}
