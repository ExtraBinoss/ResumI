import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ChevronDown, Clock3, FileText } from "lucide-react";
import { Button, Menu } from "../../../ui";
import { preloadEditor } from "../../../lib/preload-editor";
import { useDashboardProjects } from "../state/projects";
import styles from "../styles/LibraryHeader.module.css";

export function RecentProjects() {
  const { records, error } = useDashboardProjects();
  const { t, i18n } = useTranslation();
  return (
    <div className={styles.recents}>
      <Menu position="bottom-end" width={320}>
        <Menu.Target>
          <Button
            variant="subtle"
            color="gray"
            className={styles.recentTrigger}
            aria-label={t("dashboard.recentProjects")}
            title={t("dashboard.recentProjects")}
          >
            <Clock3 size={16} aria-hidden />
            <span className={styles.recentLabel}>{t("dashboard.recent")}</span>
            <ChevronDown
              className={styles.recentChevron}
              size={14}
              aria-hidden
            />
          </Button>
        </Menu.Target>
        <Menu.Dropdown className={styles.recentMenu}>
          <Menu.Group>
            <Menu.Label>{t("dashboard.recentProjects")}</Menu.Label>
            {records?.slice(0, 5).map((project) => (
              <Menu.Item
                key={project.id}
                render={
                  <Link
                    to={`/editor/${project.id}`}
                    onPointerEnter={preloadEditor}
                    onFocus={preloadEditor}
                  />
                }
                aria-label={t("dashboard.openRecent", {
                  name: project.document.name,
                })}
                label={project.document.name}
                title={project.document.name}
                className={styles.recentItem}
                leftSection={<FileText size={17} aria-hidden />}
              >
                <span className={styles.recentName}>
                  {project.document.name}
                </span>
                <time
                  dateTime={project.updatedAt}
                  className={styles.recentDate}
                >
                  {new Date(project.updatedAt).toLocaleDateString(
                    i18n.language === "fr" ? "fr-FR" : "en-GB",
                    { day: "numeric", month: "short" },
                  )}
                </time>
              </Menu.Item>
            ))}
            {!records?.length && (
              <p className={styles.recentEmpty} role="status">
                {error
                  ? t("dashboard.recentUnavailable")
                  : records
                    ? t("dashboard.noRecent")
                    : t("loading.library")}
              </p>
            )}
          </Menu.Group>
        </Menu.Dropdown>
      </Menu>
    </div>
  );
}
