import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Button,
  TextInput,
  Modal,
  FileButton,
  Alert,
  Loader,
  Select,
  SegmentedControl,
} from "../ui";
import {
  Plus,
  Upload,
  Search,
  FileText,
  ArrowUpRight,
  HardDrive,
  Grid2X2,
  Rows3,
} from "lucide-react";
import { Brand } from "../components/Brand";
import { ProjectCard } from "../components/ProjectCard";
import { ContinueResume, DashboardSidebar } from "../components/Dashboard";
import { projects, storageMessage, type Project } from "../lib/projects";
import { readDocumentFile } from "../lib/files";
import { preloadEditor } from "../lib/preload-editor";
import styles from "../styles/Projects.module.css";
export function Projects() {
  const [records, setRecords] = useState<Project[] | null>(null),
    [error, setError] = useState(""),
    [search, setSearch] = useState(""),
    [busy, setBusy] = useState(false);
  const [renaming, setRenaming] = useState<Project | null>(null),
    [name, setName] = useState(""),
    [deleting, setDeleting] = useState<Project | null>(null);
  const [sort, setSort] = useState("recent"),
    [view, setView] = useState("grid");
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    const load = () => {
      void projects
        .list()
        .then((data) => {
          if (active) setRecords(data);
        })
        .catch((e) => {
          if (active) setError(storageMessage(e));
        });
    };
    load();
    window.addEventListener("focus", load);
    return () => {
      active = false;
      window.removeEventListener("focus", load);
    };
  }, []);
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await action();
      setRecords(await projects.list());
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
    <div className={styles.dashboard}>
      <DashboardSidebar projects={records} />
      <div className={styles.dashboardBody}>
        <div className={styles.mobileBrand}>
          <Brand />
          <Link to="/templates">
            Templates <ArrowUpRight size={13} />
          </Link>
        </div>
        <main className={styles.main}>
          <div className={styles.heading}>
            <div>
              <h1>Your workspace.</h1>
              <p>
                {records?.length
                  ? "Good stories keep getting better. Pick up where you left off."
                  : "A little space for your next big step."}
              </p>
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
                  >
                    Import JSON
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
          </div>
          {error && (
            <Alert color="red" title="Could not complete that action" mb="md">
              {error}
            </Alert>
          )}
          {!search && records?.[0] && <ContinueResume project={records[0]} />}
          <div className={styles.listHeader}>
            <h2>All resumes {records && <span>{records.length}</span>}</h2>
            <div className={styles.listTools}>
              <TextInput
                aria-label="Search resumes"
                placeholder="Find a resume…"
                leftSection={<Search size={15} aria-hidden />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                size="xs"
              />
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
                        <Grid2X2 size={14} />
                      </span>
                    ),
                  },
                  {
                    value: "list",
                    label: (
                      <span aria-label="List view">
                        <Rows3 size={14} />
                      </span>
                    ),
                  },
                ]}
              />
            </div>
          </div>
          {!records && !error && (
            <div className={styles.empty}>
              <Loader size="sm" />
              <p>Opening your local workspace…</p>
            </div>
          )}
          {filtered?.length === 0 && (
            <div className={styles.empty}>
              <FileText size={30} strokeWidth={1.2} aria-hidden />
              <h2>
                {search ? "No resumes found." : "A fresh page, just for you."}
              </h2>
              <p>
                {search
                  ? "Try a different name."
                  : "Start with a thoughtful template. Make every word yours."}
              </p>
              {!search && (
                <Button component={Link} to="/templates" variant="light">
                  Choose a template <ArrowUpRight size={15} aria-hidden />
                </Button>
              )}
            </div>
          )}
          <div
            className={`${styles.grid} ${view === "list" ? styles.listView : ""}`}
          >
            {filtered?.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
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
              />
            ))}
          </div>
          <div className={styles.localNote}>
            <HardDrive size={14} aria-hidden />
            <p>
              Saved on this device. No account, no cloud copy. Your JSON export
              is your portable backup.
            </p>
          </div>
        </main>
      </div>
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
        <p>
          “{deleting?.document.name}” will be removed from this browser. Export
          a backup first if you want to keep it.
        </p>
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
    </div>
  );
}
