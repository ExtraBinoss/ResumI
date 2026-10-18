import { useState } from "react";
import { useTranslation } from "react-i18next";
import { isTemplatesPath } from "../../../i18n/public-locale";
import { useLocation, useNavigationType, useOutlet } from "react-router";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { ScrollShadow } from "../../../components/ScrollShadow";
import { DashboardProjectsProvider } from "../state/projects";
import { LibraryHeader } from "./LibraryHeader";
import { LibraryChrome } from "./LibraryChrome";
import styles from "../styles/Dashboard.module.css";

function DashboardShell({ templateNames }: { templateNames: string[] }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigation = useNavigationType();
  const reduced = useReducedMotion();
  const tab = isTemplatesPath(pathname) ? "templates" : "projects";
  const [queries, setQueries] = useState({ projects: "", templates: "" });
  const [sort, setSort] = useState("recent");
  const [view, setView] = useState("grid");
  const state = {
    search: queries[tab],
    setSearch(query: string) {
      setQueries((current) => ({ ...current, [tab]: query }));
    },
    sort,
    setSort,
    view,
    setView,
  };
  const outlet = useOutlet(state);
  return (
    <div className={styles.dashboard}>
      <LibraryHeader />
      <ScrollShadow
        className={styles.dashboardBody}
        viewportClassName={styles.libraryViewport}
        viewportRender={<motion.div layoutScroll />}
        role="region"
        aria-label={t("dashboard.libraryContent")}
      >
        <LayoutGroup id="library-content">
          <main className={styles.main}>
            <LibraryChrome
              templates={tab === "templates"}
              templateNames={templateNames}
              state={state}
            />
            <motion.div
              layout={reduced ? false : "position"}
              className={styles.routeContent}
              data-library-results
              transition={{ type: "spring", stiffness: 480, damping: 40 }}
            >
              <motion.div
                key={pathname}
                initial={
                  navigation === "POP" || reduced ? false : { opacity: 0 }
                }
                animate={{ opacity: 1 }}
                transition={{ duration: reduced ? 0 : 0.18 }}
              >
                {outlet}
              </motion.div>
            </motion.div>
          </main>
        </LayoutGroup>
      </ScrollShadow>
    </div>
  );
}
export function DashboardLayout({
  templateNames,
}: {
  templateNames: string[];
}) {
  return (
    <DashboardProjectsProvider>
      <DashboardShell templateNames={templateNames} />
    </DashboardProjectsProvider>
  );
}
