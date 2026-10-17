import { Link } from "react-router";
import { useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import styles from "./Public.module.css";
import brand from "./Brand.module.css";
export function BrandIcon({
  size = 36,
  decorative = false,
}: {
  size?: number;
  decorative?: boolean;
}) {
  return (
    <img
      className={brand.mark}
      src="/favicon-64.png"
      srcSet="/favicon-64.png 64w, /brand/resumi-icon-192.png 192w"
      sizes={`${size}px`}
      width={size}
      height={size}
      alt={decorative ? "" : "ResumI"}
      aria-hidden={decorative || undefined}
      decoding="async"
    />
  );
}
export function Brand() {
  return (
    <Link to="/" className={brand.brand} aria-label="ResumI home">
      <BrandIcon decorative />
      <span className={brand.wordmark}>
        Resum<span className={brand.brandI}>I</span>
      </span>
    </Link>
  );
}
export function PublicHeader() {
  return (
    <header id="top" tabIndex={-1} className={styles.header}>
      <Brand />
      <nav aria-label="Main navigation">
        <Link to="/templates">Templates</Link>
        <Link to="/projects">
          Dashboard <span aria-hidden="true">↗</span>
        </Link>
      </nav>
    </header>
  );
}
export function PublicFooter() {
  const reduced = useReducedMotion();
  const { t } = useTranslation();
  return (
    <footer className={styles.footer}>
      <div className={styles.footerRow}>
        <div className={styles.footerIdentity}>
          <Brand />
          <a href="https://plinka.eu" className={styles.attribution}>
            {t("footer.byPlinka")} <ArrowUpRight size={16} aria-hidden />
          </a>
        </div>
        <nav aria-label={t("footer.navigation")}>
          <Link to="/templates">{t("dashboard.templates")}</Link>
          <Link to="/projects">{t("footer.workspace")}</Link>
        </nav>
      </div>
      <a
        href="#top"
        className={styles.footerWordmark}
        aria-label={t("footer.backToTop")}
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
            return;
          event.preventDefault();
          document.getElementById("top")?.focus({ preventScroll: true });
          window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });
        }}
      >
        Resumi
      </a>
    </footer>
  );
}
