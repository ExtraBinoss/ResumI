import { useTranslation } from "react-i18next";
import { useLocation, useNavigationType, useOutlet } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import { ScrollShadow } from "../../../components/ScrollShadow";
import { templatePreviewFontCss } from "../../../lib/template-preview-assets";
import { DashboardProjectsProvider } from "../state/projects";
import { LibraryHeader } from "./LibraryHeader";
import styles from "../styles/Dashboard.module.css";

function DashboardShell() {
  const { t } = useTranslation();
  const outlet = useOutlet(),
    { pathname } = useLocation(),
    navigation = useNavigationType();
  const reducedMotion = useReducedMotion();
  return (
    <div className={styles.dashboard}>
      <LibraryHeader />
      <ScrollShadow
        className={styles.dashboardBody}
        viewportClassName={styles.libraryViewport}
        role="region"
        aria-label={t("dashboard.libraryContent")}
      >
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
      </ScrollShadow>
    </div>
  );
}
export function DashboardLayout({ previewCss }: { previewCss: string }) {
  return (
    <DashboardProjectsProvider>
      <style data-template-preview-styles>
        {templatePreviewFontCss + previewCss}
      </style>
      <DashboardShell />
    </DashboardProjectsProvider>
  );
}
