import { useAtomValue } from "jotai";
import { sessionAtom } from "../../../state/editor";
import { CodePreview } from "../../../components/CodePreview";
import { ZoomViewport } from "../../canvas/ZoomViewport";
import styles from "../styles/Editor.module.css";
export function SourceCanvas() {
  const document = useAtomValue(sessionAtom)!.document;
  return (
    <section className={styles.sourceCanvas} aria-label="Source canvas">
      <ZoomViewport height={1123} contained initialFit="source">
        <CodePreview document={document} workspace />
      </ZoomViewport>
    </section>
  );
}
