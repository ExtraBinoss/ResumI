import styles from "./Preview.module.css";
export function ResumePreview({ html, css }: { html: string; css: string }) {
  return (
    <div className={styles.viewport}>
      <style>{css}</style>
      <div
        className={styles.paper}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
