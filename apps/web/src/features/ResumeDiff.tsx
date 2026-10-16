import { renderResume, resumeCss } from "@resumi/cv";
import type { Document } from "@resumi/engine";
import styles from "../styles/Agent.module.css";
export function ResumeDiff({
  before,
  after,
}: {
  before: Document;
  after: Document;
}) {
  const changes = Object.keys(after.blocks).filter(
    (id) => before.blocks[id]?.text !== after.blocks[id].text,
  );
  return (
    <div>
      <ul className={styles.diffList}>
        {changes.map((id) => (
          <li key={id}>
            <del>{before.blocks[id]?.text || "(new text)"}</del>
            <ins>{after.blocks[id].text}</ins>
          </li>
        ))}
      </ul>
      <details className={styles.renderDetails}>
        <summary>View rendered proposal</summary>
        <div className={styles.agentPreview}>
          <style>{resumeCss}</style>
          <div dangerouslySetInnerHTML={{ __html: renderResume(after) }} />
        </div>
      </details>
    </div>
  );
}
