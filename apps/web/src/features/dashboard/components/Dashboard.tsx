import { useTranslation } from "react-i18next";
import {
  Link,
  NavLink,
  useLocation,
  useNavigationType,
  useOutlet,
} from "react-router";
import { motion, useReducedMotion } from "motion/react";
import { Files, FileText, LayoutTemplate } from "lucide-react";
import { Brand } from "../../../components/Brand";
import { SettingsMenu } from "../../../components/SettingsMenu";
import { preloadEditor } from "../../../lib/preload-editor";
import {
  DashboardProjectsProvider,
  useDashboardProjects,
} from "../state/projects";
import styles from "../styles/Dashboard.module.css";

function DashboardNavigation() {
  const { t } = useTranslation();
  const { records } = useDashboardProjects();
  return (
    <nav aria-label="Workspace navigation">
      <NavLink to="/projects">
        <Files size={17} aria-hidden />
        {t("dashboard.resumes")}
        <span>{records?.length ?? "—"}</span>
      </NavLink>
      <NavLink to="/templates">
        <LayoutTemplate size={17} aria-hidden />
        {t("dashboard.templates")}
      </NavLink>
    </nav>
  );
}
function DashboardSidebar() {
  const { t } = useTranslation();
  const { records } = useDashboardProjects();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarBrand}>
        <Brand />
      </div>
      <div className={styles.sidebarSection}>
        <h2>{t("dashboard.library")}</h2>
        <DashboardNavigation />
      </div>
      {!!records?.length && (
        <div className={styles.recentNav}>
          <h2>{t("dashboard.recent")}</h2>
          {records.slice(0, 5).map((project) => (
            <Link
              key={project.id}
              to={`/editor/${project.id}`}
              onPointerEnter={preloadEditor}
              onFocus={preloadEditor}
              aria-label={`Recent: ${project.document.name}`}
            >
              <FileText size={15} strokeWidth={1.5} aria-hidden />
              <span>{project.document.name}</span>
            </Link>
          ))}
        </div>
      )}
      <div className={styles.sidebarFooter}>
        <SettingsMenu trigger="sidebar" />
      </div>
    </aside>
  );
}
function DashboardShell() {
  const outlet = useOutlet(),
    { pathname } = useLocation(),
    navigation = useNavigationType();
  const reducedMotion = useReducedMotion();
  return (
    <div className={styles.dashboard}>
      <DashboardSidebar />
      <div className={styles.dashboardBody}>
        <header className={styles.mobileHeader}>
          <div className={styles.mobileBrand}>
            <Brand />
            <SettingsMenu />
          </div>
          <DashboardNavigation />
        </header>
        <motion.div
          key={pathname}
          className={styles.routeContent}
          initial={
            navigation === "POP" || reducedMotion ? false : { opacity: 0 }
          }
          animate={{ opacity: 1 }}
          transition={{ duration: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {outlet}
        </motion.div>
      </div>
    </div>
  );
}
export function DashboardLayout() {
  return (
    <DashboardProjectsProvider>
      <DashboardShell />
    </DashboardProjectsProvider>
  );
}
