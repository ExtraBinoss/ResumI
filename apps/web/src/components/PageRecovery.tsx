import { FileQuestion, FolderOpen, House } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ErrorNotice } from "./ErrorNotice";
import { Button } from "../ui/button";
import { publicPath } from "../i18n/public-locale";
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
  const { t, i18n } = useTranslation();
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <div className={styles.document} aria-hidden>
          <FileQuestion size={32} strokeWidth={1.3} />
        </div>
        <span className={styles.eyebrow}>{notFound ? "404" : "ResumI"}</span>
        <h1>
          {title ??
            t(
              notFound
                ? "site.recovery.notFound"
                : "site.recovery.unableToOpen",
            )}
        </h1>
        <p>
          {description ??
            t(
              notFound
                ? "site.recovery.notFoundDescription"
                : "site.recovery.errorDescription",
            )}
        </p>
        {!notFound && (
          <ErrorNotice
            error={error || null}
            label={t("site.recovery.errorDetails")}
          />
        )}
        <div className={styles.actions}>
          <Button
            component={Link}
            to="/projects"
            leftSection={<FolderOpen size={16} aria-hidden />}
          >
            {t("site.recovery.allProjects")}
          </Button>
          <Button
            component={Link}
            to={publicPath(i18n.language)}
            variant="subtle"
            leftSection={<House size={16} aria-hidden />}
          >
            {t("site.recovery.home")}
          </Button>
        </div>
      </div>
    </main>
  );
}
