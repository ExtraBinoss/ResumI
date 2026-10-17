import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { renderResume, resumeCss } from "@resumi/cv";
import type { Project } from "../../../lib/projects";
import { Button, Modal } from "../../../ui";
import { ResumePreview } from "../../../components/ResumePreview";
import styles from "../styles/Dashboard.module.css";

export function ProjectPreview({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  return (
    <Modal
      opened={!!project}
      onClose={onClose}
      title={project?.document.name ?? "Resume preview"}
      size={860}
    >
      {project && (
        <>
          <div className={styles.previewScroller}>
            <div className={styles.previewPage}>
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
          <div className={styles.previewFooter}>
            <Button
              component={Link}
              to={`/editor/${project.id}`}
              rightSection={<ArrowUpRight size={16} aria-hidden />}
            >
              Edit resume
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
