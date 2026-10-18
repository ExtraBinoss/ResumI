import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Grid2X2, Plus, Rows3 } from "lucide-react";
import { Button, Select, SegmentedControl } from "../../../ui";
import { SearchInput } from "../../../components/SearchInput";
import { projects, storageErrorCode } from "../../../lib/projects";
import { preloadEditor } from "../../../lib/preload-editor";
import { useDashboardProjects } from "../state/projects";
import type { LibraryView } from "../state/library-view";
import { LibraryToolbar } from "./LibraryToolbar";
import styles from "../styles/Dashboard.module.css";

function NewResumeButton() {
  const { t } = useTranslation();
  const { records, refresh, setError, setStorageError } =
    useDashboardProjects();
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function create() {
    setBusy(true);
    setError("");
    try {
      const project = await projects.create();
      await refresh();
      await navigate(`/editor/${project.id}`);
    } catch (error) {
      setStorageError(storageErrorCode(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Button
      leftSection={<Plus aria-hidden />}
      loading={busy}
      disabled={records === null}
      onPointerEnter={preloadEditor}
      onFocus={preloadEditor}
      onClick={() => void create()}
    >
      {t("dashboard.newResume")}
    </Button>
  );
}

/** Persistent collection controls: sibling navigation replaces only the results. */
export function LibraryChrome({
  templates,
  templateNames,
  state,
}: {
  templates: boolean;
  templateNames: string[];
  state: LibraryView;
}) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const { records } = useDashboardProjects();
  const count = templates ? templateNames.length : records?.length;
  const hints = templates
    ? templateNames.map((name) => ({ label: name.replace(/^React /, "") }))
    : (records ?? [])
        .slice(0, 6)
        .map((project) => ({ label: project.document.name }));
  return (
    <>
      <header className={styles.heading}>
        <div className={styles.collectionTitle}>
          <h1>
            {t(templates ? "dashboard.templates" : "dashboard.yourResumes")}
          </h1>
          {count !== undefined && (
            <motion.span
              layout={reduced ? false : "position"}
              className={styles.count}
              transition={{ duration: 0.2 }}
            >
              {count}
            </motion.span>
          )}
        </div>
        <div className={styles.actions}>
          <AnimatePresence initial={false}>
            {!templates && (
              <motion.div
                key="new-resume"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.12 }}
              >
                <NewResumeButton />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
      <LibraryToolbar
        search={
          <SearchInput
            aria-label={t(
              templates
                ? "dashboard.searchTemplates"
                : "dashboard.searchResumes",
            )}
            prefix={t("common.search")}
            captureTyping
            hints={hints}
            value={state.search}
            onChange={(event) => state.setSearch(event.currentTarget.value)}
            size="xs"
          />
        }
      >
        {!templates && (
          <>
            <Select
              aria-label={t("dashboard.sort")}
              value={state.sort}
              onChange={(value) => {
                if (value) state.setSort(value);
              }}
              allowDeselect={false}
              data={[
                { value: "recent", label: t("dashboard.lastEdited") },
                { value: "name", label: t("dashboard.sortName") },
              ]}
              size="xs"
              className={styles.sort}
              contentClassName={styles.sortMenu}
            />
            <SegmentedControl
              aria-label={t("dashboard.view")}
              size="xs"
              value={state.view}
              onChange={state.setView}
              data={[
                {
                  value: "grid",
                  label: (
                    <span aria-label={t("dashboard.grid")}>
                      <Grid2X2 size={16} aria-hidden />
                    </span>
                  ),
                },
                {
                  value: "list",
                  label: (
                    <span aria-label={t("dashboard.list")}>
                      <Rows3 size={16} aria-hidden />
                    </span>
                  ),
                },
              ]}
            />
          </>
        )}
      </LibraryToolbar>
    </>
  );
}
