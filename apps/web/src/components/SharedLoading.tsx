import { motion, useReducedMotion } from "motion/react";
import styles from "./SharedLoading.module.css";

export function SharedLoading({
  label = "Loading…",
  page = false,
}: {
  label?: string;
  page?: boolean;
}) {
  const reduced = useReducedMotion();
  return (
    <div
      className={`${styles.loading} ${page ? styles.page : ""}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {page ? (
        <h1 className="srOnly">{label}</h1>
      ) : (
        <span className="srOnly">{label}</span>
      )}
      <span className={styles.orb} aria-hidden="true">
        <motion.span
          className={styles.glow}
          initial={{ scale: 1, opacity: 0.55 }}
          animate={
            reduced
              ? { scale: 1, opacity: 0.55 }
              : { scale: [1, 1.12, 1], opacity: [0.55, 0.9, 0.55] }
          }
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
          }
        />
        <motion.span
          className={styles.core}
          initial={{ scale: 1 }}
          animate={reduced ? { scale: 1 } : { scale: [1, 0.94, 1] }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
          }
        />
      </span>
    </div>
  );
}
