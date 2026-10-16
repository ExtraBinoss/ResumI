import { Link } from "react-router";
import { Button } from "../ui";
import {
  ArrowUpRight,
  Files,
  LayoutTemplate,
  HardDrive,
  ArrowRight,
} from "lucide-react";
import { renderResume, resumeCss } from "@resumi/cv";
import type { Project } from "../lib/projects";
import { Brand } from "./Brand";
import { ResumePreview } from "./ResumePreview";
import { preloadEditor } from "../lib/preload-editor";
import styles from "../styles/Projects.module.css";
export function DashboardSidebar({ projects }: { projects: Project[] | null }) {
  return (
    <aside className={styles.sidebar}>
      <Brand />
      <nav aria-label="Workspace navigation">
        <Link to="/projects" aria-current="page">
          <Files size={17} aria-hidden />
          Dashboard<span>{projects?.length ?? "—"}</span>
        </Link>
        <Link to="/templates">
          <LayoutTemplate size={17} aria-hidden />
          Templates
          <ArrowUpRight size={13} aria-hidden />
        </Link>
      </nav>
      {!!projects?.length && (
        <div className={styles.recentNav}>
          <h2>Pick up where you left off</h2>
          {projects.slice(0, 5).map((project) => (
            <Link
              key={project.id}
              to={`/editor/${project.id}`}
              onPointerEnter={preloadEditor}
              aria-label={`Recent: ${project.document.name}`}
            >
              <span
                className={styles.recentDot}
                style={{ background: project.document.style.accent }}
              />
              {project.document.name}
            </Link>
          ))}
        </div>
      )}
      <div className={styles.deviceNote}>
        <HardDrive size={17} aria-hidden />
        <strong>Your own little workspace.</strong>
        <p>
          Resumes stay in this browser.
          <br />
          Export a JSON backup to take
          <br />
          them anywhere.
        </p>
        <span>ResumI by Plinka</span>
      </div>
    </aside>
  );
}
export function ContinueResume({ project }: { project: Project }) {
  return (
    <section
      className={styles.continueCard}
      aria-label="Continue your latest resume"
    >
      <div className={styles.continueCopy}>
        <span className={styles.continueLabel}>Last edited resume</span>
        <h2>{project.document.name}</h2>
        <p>
          {project.document.sectionIds.length} sections <span>·</span> Edited{" "}
          {new Date(project.updatedAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
          })}
        </p>
        <Button
          component={Link}
          to={`/editor/${project.id}`}
          onPointerEnter={preloadEditor}
          onFocus={preloadEditor}
          rightSection={<ArrowRight size={15} aria-hidden />}
          size="sm"
        >
          Continue editing
        </Button>
      </div>
      <div className={styles.continuePreview}>
        <ResumePreview
          document={project.document}
          html={
            project.document.source && project.document.source.enabled !== false
              ? ""
              : renderResume(project.document)
          }
          css={resumeCss}
        />
      </div>
    </section>
  );
}
