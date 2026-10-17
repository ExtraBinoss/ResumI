import { Link } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import { Button, Menu } from "../../../ui";
import {
  Copy,
  Download,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
import { renderResume, resumeCss } from "@resumi/cv";
import { serializeDocument } from "@resumi/engine";
import type { Project } from "../../../lib/projects";
import { downloadFile, fileName } from "../../../lib/files";
import { ResumePreview } from "../../../components/ResumePreview";
import { preloadEditor } from "../../../lib/preload-editor";
import styles from "../styles/ProjectCard.module.css";
export function ProjectCard({
  project,
  compact,
  onRename,
  onDuplicate,
  onDelete,
  onPreview,
}: {
  project: Project;
  compact: boolean;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onPreview: () => void;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.article
      className={`${styles.project} ${compact ? styles.compact : ""}`}
      layout={!reducedMotion ? "position" : false}
      initial={false}
      whileHover={reducedMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
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
        </div>
        <div className={styles.projectInfo}>
          <h3 title={project.document.name}>{project.document.name}</h3>
          <p>
            Edited{" "}
            <time dateTime={project.updatedAt}>
              {new Date(project.updatedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })}
            </time>
          </p>
        </div>
      </Link>
      <Button
        variant="subtle"
        color="gray"
        size="compact-xs"
        aria-label={`Preview ${project.document.name}`}
        className={styles.previewButton}
        onClick={onPreview}
      >
        <Eye size={17} aria-hidden />
      </Button>
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
    </motion.article>
  );
}
