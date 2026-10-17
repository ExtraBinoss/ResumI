import { useAtomValue } from "jotai";
import { sessionAtom } from "../../../state/editor";
import { CodePreview } from "../../../components/CodePreview";
import styles from "../styles/Editor.module.css";
export function SourceCanvas() {
  const document = useAtomValue(sessionAtom)!.document;
  return (
    <section className={styles.sourceCanvas} aria-label="Source canvas">
      <CodePreview document={document} interactive />
    </section>
  );
}
