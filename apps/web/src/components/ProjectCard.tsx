import { Link } from "react-router";
import { Button, Menu } from "../ui";
import {
  Copy,
  Download,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowUpRight,
} from "lucide-react";
import { renderResume, resumeCss } from "@resumi/cv";
import { serializeDocument } from "@resumi/engine";
import type { Project } from "../lib/projects";
import { downloadFile, fileName } from "../lib/files";
import { ResumePreview } from "./ResumePreview";
import { preloadEditor } from "../lib/preload-editor";
import styles from "../styles/Projects.module.css";
export function ProjectCard({
  project,
  onRename,
  onDuplicate,
  onDelete,
}: {
  project: Project;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  return (
    <article className={styles.project}>
      <Link
        to={`/editor/${project.id}`}
        className={styles.projectLink}
        aria-label={`Open ${project.document.name}`}
        onPointerEnter={preloadEditor}
        onFocus={preloadEditor}
      >
        <div className={styles.thumbnail}>
          <div className={styles.miniPaper}>
            <ResumePreview
              document={project.document}
              html={
                project.document.source &&
                project.document.source.enabled !== false
                  ? ""
                  : renderResume(project.document)
              }
              css={resumeCss}
            />
          </div>
          <span className={styles.openHint}>
            Open resume <ArrowUpRight size={14} aria-hidden />
          </span>
        </div>
        <div className={styles.projectInfo}>
          <h3>{project.document.name}</h3>
          <p>
            Edited{" "}
            {new Date(project.updatedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
            })}
            <span> · {project.document.sectionIds.length} sections</span>
          </p>
        </div>
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
              onClick={onRename}
            >
              Rename
            </Menu.Item>
            <Menu.Item
              leftSection={<Copy size={14} aria-hidden />}
              onClick={onDuplicate}
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
              onClick={onDelete}
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </article>
  );
}
