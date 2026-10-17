import {
  Link,
  NavLink,
  useLocation,
  useNavigationType,
  useOutlet,
} from "react-router";
import { motion } from "motion/react";
import { Files, LayoutTemplate } from "lucide-react";
import { Brand } from "../../../components/Brand";
import { SettingsMenu } from "../../../components/SettingsMenu";
import { preloadEditor } from "../../../lib/preload-editor";
import {
  DashboardProjectsProvider,
  useDashboardProjects,
} from "../state/projects";
import styles from "../styles/Dashboard.module.css";

function DashboardNavigation() {
  const { records } = useDashboardProjects();
  return (
    <nav aria-label="Workspace navigation">
      <NavLink to="/projects">
        <Files size={17} aria-hidden />
        Resumes<span>{records?.length ?? "—"}</span>
      </NavLink>
      <NavLink to="/templates">
        <LayoutTemplate size={17} aria-hidden />
        Templates
      </NavLink>
    </nav>
  );
}
function DashboardSidebar() {
  const { records } = useDashboardProjects();
  return (
    <aside className={styles.sidebar}>
      <Brand />
      <DashboardNavigation />
      {!!records?.length && (
        <div className={styles.recentNav}>
          <h2>Recent</h2>
          {records.slice(0, 5).map((project) => (
            <Link
              key={project.id}
              to={`/editor/${project.id}`}
              onPointerEnter={preloadEditor}
              onFocus={preloadEditor}
              aria-label={`Recent: ${project.document.name}`}
            >
              {project.document.name}
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
  return (
    <div className={styles.dashboard}>
      <DashboardSidebar />
      <div className={styles.dashboardBody}>
        <header className={styles.mobileHeader}>
          <div className={styles.mobileBrand}>
            <Brand />
            <SettingsMenu trigger="sidebar" />
          </div>
          <DashboardNavigation />
        </header>
        <motion.div
          key={pathname}
          initial={navigation === "POP" ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
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
