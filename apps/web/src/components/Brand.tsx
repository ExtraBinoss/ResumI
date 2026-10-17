import { Link } from "react-router";
import styles from "./Public.module.css";
export function Brand() {
  return (
    <Link to="/" className={styles.brand} aria-label="ResumI home">
      <span className={styles.brandMark} aria-hidden="true">
        r<span>.</span>
      </span>
      Resum<span className={styles.brandI}>I</span>
    </Link>
  );
}
export function PublicHeader() {
  return (
    <header className={styles.header}>
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
  return (
    <footer className={styles.footer}>
      <span>
        ResumI <span className={styles.muted}>by Plinka</span>
      </span>
      <Link to="/templates">Templates</Link>
    </footer>
  );
}
