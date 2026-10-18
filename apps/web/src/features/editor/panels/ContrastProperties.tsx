import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
    <section aria-label={t("properties.textContrast")}>
      <div className={styles.head}>
        <h3>{t("properties.contrast")}</h3>
        <Tooltip
          label={
            audit.reason ??
            t("properties.wcagTextSize", {
              level: audit.level,
              size: t(
                audit.isLargeText
                  ? "properties.largeText"
                  : "properties.normalText",
              ),
            })
          }
        >
          <Button
            size="xs"
            variant="ghost"
            className={styles.grade}
            data-grade={audit.level}
            aria-label={t("properties.contrastLevel", { level: audit.level })}
          >
            <Icon size={13} aria-hidden />
            {audit.level}
          </Button>
        </Tooltip>
      </div>
      <div className={styles.score} aria-label={t("properties.contrastRatio")}>
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
          title={t("properties.textForeground", { color: audit.foreground })}
        />
        <span
          style={{ background: audit.background }}
          title={t("properties.pageBackgroundColor", {
            color: audit.background,
          })}
        />
        <small>
          {audit.isLargeText ? t("properties.large") : t("properties.normal")} ·
          AA {audit.isLargeText ? "3" : "4.5"}:1
        </small>
      </div>
    </section>
  );
}
