import { useAtomValue } from "jotai";
import { ShieldCheck, TriangleAlert, CircleHelp } from "lucide-react";
import { motion } from "motion/react";
import { auditTextContrast } from "@resumi/engine";
import { sessionAtom } from "../../../state/editor";
import { textRangeAtom } from "../../../state/design";
import { Tooltip } from "../../../ui";
import { Button } from "../../../components/ui/button";
import styles from "../styles/Contrast.module.css";

export function ContrastProperties({ id }: { id: string }) {
  const document = useAtomValue(sessionAtom)!.document;
  const selection = useAtomValue(textRangeAtom);
  const range =
    selection?.id === id && selection.end > selection.start
      ? selection
      : undefined;
  const audit = auditTextContrast(document, id, range);
  const Icon = audit.aa
    ? ShieldCheck
    : audit.reliable
      ? TriangleAlert
      : CircleHelp;
  return (
    <section aria-label="Text contrast">
      <div className={styles.head}>
        <h3>Contrast</h3>
        <Tooltip
          label={
            audit.reason ??
            `WCAG ${audit.level} · ${audit.isLargeText ? "large" : "normal"} text`
          }
        >
          <Button
            size="xs"
            variant="ghost"
            className={styles.grade}
            data-grade={audit.level}
            aria-label={`Contrast ${audit.level}`}
          >
            <Icon size={13} aria-hidden />
            {audit.level}
          </Button>
        </Tooltip>
      </div>
      <div className={styles.score} aria-label="Contrast ratio">
        <strong>{audit.ratio === null ? "—" : audit.ratio.toFixed(2)}</strong>
        {audit.ratio !== null && <span>: 1</span>}
      </div>
      <div className={styles.meter} aria-hidden>
        <motion.i
          initial={false}
          animate={{
            scaleX: audit.ratio === null ? 0 : Math.min(1, audit.ratio / 21),
          }}
          transition={{ duration: 0.18 }}
        />
      </div>
      <div className={styles.swatches}>
        <span
          style={{ background: audit.foreground }}
          title={`Text ${audit.foreground}`}
        />
        <span
          style={{ background: audit.background }}
          title={`Background ${audit.background}`}
        />
        <small>
          {audit.isLargeText ? "Large" : "Normal"} · AA{" "}
          {audit.isLargeText ? "3" : "4.5"}:1
        </small>
      </div>
    </section>
  );
}
