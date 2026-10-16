import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Button,
  TextInput,
  Modal,
  FileButton,
  Alert,
  Loader,
  Menu,
} from "@mantine/core";
import {
  Plus,
  Upload,
  Search,
  MoreHorizontal,
  Copy,
  Pencil,
  Trash2,
  ArrowUpRight,
  FileText,
  Download,
  HardDrive,
} from "lucide-react";
import { serializeDocument } from "@resumi/engine";
import { PublicFooter, PublicHeader } from "../components/Brand";
import { projects, storageMessage, type Project } from "../lib/projects";
import { downloadFile, fileName, readDocumentFile } from "../lib/files";
import styles from "../styles/Projects.module.css";

export function Projects() {
  const [records, setRecords] = useState<Project[] | null>(null),
    [error, setError] = useState("");
  const [search, setSearch] = useState(""),
    [busy, setBusy] = useState(false);
  const [renaming, setRenaming] = useState<Project | null>(null),
    [name, setName] = useState("");
  const [deleting, setDeleting] = useState<Project | null>(null);
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
  const filtered = records?.filter((project) =>
    project.document.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <PublicHeader />
      <main className={styles.main}>
        <div className={styles.heading}>
          <div>
            <h1>Your next chapter.</h1>
            <p>A little space for your ambitions.</p>
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
                  disabled={busy}
                >
                  Import JSON
                </Button>
              )}
            </FileButton>
            <Button
              leftSection={<Plus aria-hidden />}
              loading={busy}
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
        <div className={styles.listHeader}>
          <h2>Recent resumes {records && <span>{records.length}</span>}</h2>
          <TextInput
            aria-label="Search resumes"
            placeholder="Search resumes"
            leftSection={<Search size={15} aria-hidden />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            size="xs"
          />
        </div>
        {error && (
          <Alert color="red" title="Could not complete that action" mb="md">
            {error}
          </Alert>
        )}
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
        <div className={styles.grid}>
          {filtered?.map((project) => (
            <article className={styles.project} key={project.id}>
              <Link
                to={`/editor/${project.id}`}
                className={styles.projectLink}
                aria-label={`Open ${project.document.name}`}
              >
                <div
                  className={styles.thumbnail}
                  style={
                    {
                      "--thumb-accent": project.document.style.accent,
                    } as React.CSSProperties
                  }
                >
                  <div className={styles.miniPaper}>
                    <b>
                      {Object.values(project.document.blocks).find(
                        (b) => b.kind === "heading",
                      )?.text || "Your resume"}
                    </b>
                    <small>
                      {
                        Object.values(project.document.blocks).find(
                          (b) => b.kind === "subtitle",
                        )?.text
                      }
                    </small>
                    <i />
                    <i />
                    <i />
                    {project.document.sectionIds
                      .filter((id) => project.document.sections[id].title)
                      .slice(0, 3)
                      .map((id) => (
                        <div key={id}>
                          <strong>{project.document.sections[id].title}</strong>
                          <i />
                          <i />
                          <i />
                        </div>
                      ))}
                  </div>
                  <span className={styles.openHint}>
                    Open resume <ArrowUpRight size={14} aria-hidden />
                  </span>
                </div>
                <h3>{project.document.name}</h3>
                <p>
                  Edited{" "}
                  {new Date(project.updatedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </Link>
              <div className={styles.menu}>
                <Menu position="bottom-end">
                  <Menu.Target>
                    <Button
                      variant="subtle"
                      color="gray"
                      size="compact-xs"
                      aria-label={`Actions for ${project.document.name}`}
                    >
                      <MoreHorizontal aria-hidden />
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<Pencil size={14} aria-hidden />}
                      onClick={() => {
                        setRenaming(project);
                        setName(project.document.name);
                      }}
                    >
                      Rename
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<Copy size={14} aria-hidden />}
                      onClick={() =>
                        void run(async () => {
                          await projects.duplicate(project.id);
                        })
                      }
                    >
                      Duplicate
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<Download size={14} aria-hidden />}
                      onClick={() =>
                        downloadFile(
                          fileName(project.document.name, "json"),
                          serializeDocument(project.document),
                        )
                      }
                    >
                      Export JSON
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      color="red"
                      leftSection={<Trash2 size={14} aria-hidden />}
                      onClick={() => setDeleting(project)}
                    >
                      Delete
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </div>
            </article>
          ))}
        </div>
        <div className={styles.localNote}>
          <HardDrive size={14} aria-hidden />
          <p>
            Stored in this browser, on this device. Export a JSON backup to keep
            a copy or work with your agent.
          </p>
        </div>
      </main>
      <PublicFooter />
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
    </>
  );
}
