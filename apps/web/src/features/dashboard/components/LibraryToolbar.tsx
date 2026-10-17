import type { ReactNode } from "react";
import styles from "../styles/Dashboard.module.css";

/** Both library routes place search in this exact row and column. */
export function LibraryToolbar({
  search,
  children,
}: {
  search: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className={styles.listHeader}>
      <div className={styles.search}>{search}</div>
      <div className={styles.listTools}>{children}</div>
    </div>
  );
}
