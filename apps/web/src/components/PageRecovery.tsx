import { FileQuestion, FolderOpen, House } from "lucide-react";
import { Link } from "react-router";
import { ErrorNotice } from "./ErrorNotice";
import { Button } from "../ui";
import styles from "../styles/Recovery.module.css";

export function PageRecovery({
  notFound,
  error,
  title,
  description,
}: {
  notFound: boolean;
  error?: Error | string | null;
  title?: string;
  description?: string;
}) {
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <div className={styles.document} aria-hidden>
          <FileQuestion size={32} strokeWidth={1.3} />
        </div>
        <span className={styles.eyebrow}>{notFound ? "404" : "ResumI"}</span>
        <h1>
          {title ?? (notFound ? "Page not found" : "Unable to open this page")}
        </h1>
        <p>
          {description ??
            (notFound
              ? "Check the address, or return to your projects."
              : "Try again, or return to your projects.")}
        </p>
        {!notFound && (
          <ErrorNotice error={error || null} label="Error details" />
        )}
        <div className={styles.actions}>
          <Button
            component={Link}
            to="/projects"
            leftSection={<FolderOpen size={16} aria-hidden />}
          >
            All projects
          </Button>
          <Button
            component={Link}
            to="/"
            variant="subtle"
            leftSection={<House size={16} aria-hidden />}
          >
            Home
          </Button>
        </div>
      </div>
    </main>
  );
}
