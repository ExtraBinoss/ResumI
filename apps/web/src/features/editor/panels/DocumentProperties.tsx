import { useAtomValue, useSetAtom } from "jotai";
import { ColorInput, TextInput } from "../../../ui";
import { canvasAtom, designCommandAtom } from "../../../state/design";
import { sessionAtom } from "../../../state/editor";
import { FontAssets } from "./FontAssets";
import { DocumentStyleFields } from "./DocumentStyleFields";
import styles from "../styles/Inspector.module.css";

export function DocumentProperties() {
  const canvas = useAtomValue(canvasAtom);
  const document = useAtomValue(sessionAtom)!.document;
  const dispatch = useSetAtom(designCommandAtom);
  return (
    <>
      <section>
        <h3>Page</h3>
        <div className={styles.fieldRow}>
          <span>Format</span>
          <span className={styles.formatStatic}>
            {!canvas || (canvas.width === 794 && canvas.height === 1123)
              ? "CV · A4"
              : `${canvas.width} × ${canvas.height}`}
          </span>
        </div>
        <div className={styles.fieldRow}>
          <label>Title</label>
          <TextInput
            aria-label="Document title"
            size="xs"
            value={document.name}
            maxLength={120}
            onChange={(event) =>
              dispatch({
                type: "document.update",
                name: event.currentTarget.value,
              })
            }
          />
        </div>
        {canvas && (
          <div className={styles.fieldRow}>
            <label>Background</label>
            <ColorInput
              aria-label="Page background"
              format="hex"
              size="xs"
              value={canvas.background}
              onChangeEnd={(value) =>
                dispatch({
                  type: "canvas.update",
                  patch: { background: value },
                })
              }
            />
          </div>
        )}
      </section>
      {canvas ? <FontAssets /> : <DocumentStyleFields />}
    </>
  );
}
