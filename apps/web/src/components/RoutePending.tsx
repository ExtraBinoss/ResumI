import { useLocation, useNavigation } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import styles from "../styles/RouteTransition.module.css";

/** The current route stays interactive; this status exists only while the router waits. */
export function RoutePending() {
  const navigation = useNavigation();
  const reduced = useReducedMotion();
  const { t } = useTranslation();
  const current = useLocation().pathname;
  const path = navigation.location?.pathname;
  const canonicalizing = current === "/editor" && path?.startsWith("/editor/");
  if (navigation.state === "idle" || !path || canonicalizing) return null;
  return (
    <motion.div
      className={styles.pending}
      data-route-pending
      role="status"
      aria-live="polite"
      aria-busy="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.1 }}
    >
      <span className={styles.pendingDot} aria-hidden />
      {t("loading.generic")}
    </motion.div>
  );
}
