import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import styles from "../styles/Dashboard.module.css";

/** Search stays mounted while the collection and its optional tools change. */
export function LibraryToolbar({
  search,
  children,
}: {
  search: ReactNode;
  children?: ReactNode;
}) {
  const reduced = useReducedMotion();
  return (
    <div className={styles.listHeader}>
      <div className={styles.search}>{search}</div>
      <div
        className={styles.listTools}
        data-empty={!children || undefined}
        aria-hidden={!children}
        inert={!children}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {children && (
            <motion.div
              key="collection-tools"
              className={styles.listToolsContent}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.14 }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
