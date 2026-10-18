import { NavLink, useLocation } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import { isTemplatesPath, publicPath } from "../../../i18n/public-locale";
import { Files, LayoutTemplate } from "lucide-react";
import { Brand } from "../../../components/Brand";
import { SettingsMenu } from "../../../components/SettingsMenu";
import { RecentProjects } from "./RecentProjects";
import styles from "../styles/LibraryHeader.module.css";

/** Persistent navigation: only its background pill moves, never the labels. */
export function LibraryHeader() {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const reduced = useReducedMotion();
  return (
    <header className={styles.header} data-library-header>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Brand />
        </div>
        <div className={styles.controls} data-library-controls>
          <nav
            aria-label={t("dashboard.navigation")}
            className={styles.navigation}
          >
            <motion.span
              aria-hidden
              className={styles.pill}
              initial={false}
              animate={{ x: isTemplatesPath(pathname) ? "100%" : "0%" }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 500, damping: 38 }
              }
            />
            {[
              { to: "/projects", label: t("dashboard.resumes"), icon: Files },
              {
                to: publicPath(i18n.language, "templates"),
                label: t("dashboard.templates"),
                icon: LayoutTemplate,
              },
            ].map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                prefetch="intent"
                className={styles.tab}
              >
                <span className={styles.label}>
                  <Icon size={16} aria-hidden />
                  {label}
                </span>
              </NavLink>
            ))}
          </nav>
          <RecentProjects />
          <div className={styles.settings}>
            <SettingsMenu
              position="top-end"
              size="var(--library-settings-size)"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
