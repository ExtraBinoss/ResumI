import { useAtomValue, useSetAtom, useStore, atom } from "jotai";
import { Lock } from "lucide-react";
import { RichTextField } from "../panels/RichTextField";
import { ScrollShadow } from "../../../components/ScrollShadow";
import layout from "../styles/TextFields.module.css";
import { isLocked } from "@resumi/engine";
import {
  canvasAtom,
  selectLayersAtom,
  selectedIdsAtom,
} from "../../../state/design";
import { sessionAtom, blockAtom } from "../../../state/editor";
import { TextFormatting } from "../panels/TextFormatting";
import styles from "../styles/Text.module.css";
const wordCountAtom = atom((get) =>
  Object.values(get(sessionAtom)?.document.blocks ?? {})
    .filter((block) => block.design?.type === "text")
    .reduce(
      (count, block) =>
        count + block.text.trim().split(/\s+/).filter(Boolean).length,
      0,
    ),
);
function TextEntry({ id }: { id: string }) {
  const canvas = useAtomValue(canvasAtom);
  const block = useAtomValue(blockAtom(id)),
    select = useSetAtom(selectLayersAtom),
    store = useStore();
  if (!block || block.design?.type !== "text") return null;
  const layer = block.design,
    locked =
      isLocked(store.get(sessionAtom)!.document, id) ||
      !!canvas?.groups.find(
        (group) => group.locked && group.elementIds.includes(id),
      );
  return (
    <div className={styles.copyBlock}>
      <span className={styles.copyMeta} title={layer.name}>
        {layer.name}
        <small>
          {locked ? (
            <>
              <Lock size={9} /> Locked
            </>
          ) : layer.hidden ? (
            "Hidden on canvas"
          ) : layer.marks.some((mark) => mark.href) ? (
            "Linked text"
          ) : null}
        </small>
      </span>
      <div>
        <RichTextField
          id={id}
          text={block.text}
          layer={layer}
          showLabel={false}
          className={styles.copyInput}
          ariaLabel={`Text content: ${layer.name}`}
          readOnly={locked}
          onFocus={() => select({ ids: [id] })}
        />
      </div>
    </div>
  );
}
function ActiveFormatting({ id }: { id: string }) {
  const block = useAtomValue(blockAtom(id));
  return block?.design?.type === "text" ? (
    <TextFormatting id={id} layer={block.design} />
  ) : null;
}
export function TextMode() {
  const canvas = useAtomValue(canvasAtom),
    selected = useAtomValue(selectedIdsAtom),
    words = useAtomValue(wordCountAtom);
  if (!canvas) return null;
  return (
    <div className={styles.textViewport}>
      <article className={styles.copyEditor} aria-label="Text workspace">
        <header className={styles.copyToolbar}>
          {selected[0] ? (
            <ActiveFormatting id={selected[0]} />
          ) : (
            <strong>Text</strong>
          )}
        </header>
        <ScrollShadow
          className={layout.scroll}
          contentClassName={styles.copyList}
        >
          {canvas.order.length ? (
            canvas.order.map((id) => <TextEntry key={id} id={id} />)
          ) : (
            <p className={styles.textEmpty}>
              Add your first text block in Visual mode.
            </p>
          )}
        </ScrollShadow>
        <footer>{words} words</footer>
      </article>
    </div>
  );
}
