import { renderResume, resumeCss } from "@resumi/cv/renderer";
import { useTranslation } from "react-i18next";
import type { Document } from "@resumi/engine";
import { CodePreview } from "../../../components/CodePreview";
import styles from "../styles/Commands.module.css";
function value(
  value: unknown,
  key: string,
  labels: { embedded: string; none: string },
) {
  if (key === "src" || key === "dataUrl") return labels.embedded;
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return (text ?? labels.none).slice(0, 180);
}
export function ResumeDiff({
  before,
  after,
}: {
  before: Document;
  after: Document;
}) {
  const { t } = useTranslation();
  const diffLabels = {
    embedded: t("workspace.diff.embedded"),
    none: t("workspace.diff.none"),
  };
  const ids = [
      ...new Set([...Object.keys(before.blocks), ...Object.keys(after.blocks)]),
    ],
    changes = ids.filter(
      (id) =>
        JSON.stringify(before.blocks[id]) !== JSON.stringify(after.blocks[id]),
    );
  return (
    <div>
      <ul className={styles.diffList}>
        {[
          ...new Set([
            ...Object.keys(before.sections),
            ...Object.keys(after.sections),
          ]),
        ]
          .filter(
            (id) =>
              JSON.stringify(before.sections[id]?.title) !==
                JSON.stringify(after.sections[id]?.title) ||
              JSON.stringify(before.sections[id]?.titleTranslations) !==
                JSON.stringify(after.sections[id]?.titleTranslations),
          )
          .map((id) => {
            const old = before.sections[id],
              next = after.sections[id];
            return (
              <li key={`section-${id}`}>
                <strong>
                  {next?.title ||
                    old?.title ||
                    t("workspace.diff.sectionHeading")}
                </strong>
                {old?.title !== next?.title && (
                  <span className={styles.propertyDiff}>
                    <del>{old?.title ?? t("workspace.diff.newSection")}</del>
                    <ins>{next?.title ?? t("workspace.diff.removed")}</ins>
                  </span>
                )}
                {[
                  ...new Set([
                    ...Object.keys(old?.titleTranslations ?? {}),
                    ...Object.keys(next?.titleTranslations ?? {}),
                  ]),
                ]
                  .filter(
                    (locale) =>
                      old?.titleTranslations?.[locale] !==
                      next?.titleTranslations?.[locale],
                  )
                  .map((locale) => (
                    <span key={locale} className={styles.propertyDiff}>
                      {locale}:{" "}
                      <del>
                        {old?.titleTranslations?.[locale] ??
                          t("workspace.diff.originalHeading")}
                      </del>
                      <ins>
                        {next?.titleTranslations?.[locale] ??
                          t("workspace.diff.originalHeading")}
                      </ins>
                    </span>
                  ))}
              </li>
            );
          })}
        {changes.map((id) => {
          const old = before.blocks[id],
            next = after.blocks[id],
            design = next?.design,
            oldDesign = old?.design,
            keys = design
              ? (Object.keys(design) as (keyof typeof design)[])
              : [];
          return (
            <li key={id}>
              <strong>
                {design?.name ?? oldDesign?.name ?? next?.kind ?? old?.kind}
              </strong>
              {!next ? (
                <del>{t("workspace.diff.layerRemoved")}</del>
              ) : !old ? (
                <ins>
                  {t("workspace.diff.layerAdded")}: {next.text || design?.type}
                </ins>
              ) : (
                <>
                  {old.text !== next.text && (
                    <>
                      <del>{old.text || t("workspace.diff.empty")}</del>
                      <ins>{next.text || t("workspace.diff.empty")}</ins>
                    </>
                  )}
                  {[
                    ...new Set([
                      ...Object.keys(old.translations ?? {}),
                      ...Object.keys(next.translations ?? {}),
                    ]),
                  ]
                    .filter(
                      (locale) =>
                        JSON.stringify(old.translations?.[locale]) !==
                        JSON.stringify(next.translations?.[locale]),
                    )
                    .map((locale) => (
                      <span key={locale} className={styles.propertyDiff}>
                        {locale}:{" "}
                        <del>
                          {old.translations?.[locale]?.text ??
                            t("workspace.diff.originalText")}
                        </del>
                        <ins>
                          {next.translations?.[locale]?.text ??
                            t("workspace.diff.originalText")}
                        </ins>
                        {JSON.stringify(old.translations?.[locale]?.marks) !==
                          JSON.stringify(
                            next.translations?.[locale]?.marks,
                          ) && <small>{t("workspace.diff.textChanged")}</small>}
                      </span>
                    ))}
                  {keys
                    .filter(
                      (key) =>
                        JSON.stringify(oldDesign?.[key]) !==
                        JSON.stringify(design?.[key]),
                    )
                    .map((key) => (
                      <span className={styles.propertyDiff} key={key}>
                        {key}:{" "}
                        <del>{value(oldDesign?.[key], key, diffLabels)}</del>
                        <ins>{value(design?.[key], key, diffLabels)}</ins>
                      </span>
                    ))}
                </>
              )}
            </li>
          );
        })}
        {before.name !== after.name && (
          <li>
            {t("workspace.diff.resumeName")}: <ins>{after.name}</ins>
          </li>
        )}
        {JSON.stringify(before.style) !== JSON.stringify(after.style) && (
          <li>{t("workspace.diff.styleChanged")}</li>
        )}
        {JSON.stringify(before.localization) !==
          JSON.stringify(after.localization) && (
          <li>
            {t("languages.label")}:{" "}
            <del>{before.localization?.activeLocale ?? "en"}</del>
            <ins>{after.localization?.activeLocale ?? "en"}</ins>
            <span>
              {after.localization?.locales
                .map((locale) => `${locale.name} (${locale.code})`)
                .join(", ") ?? `${t("languages.en")} (en)`}
            </span>
          </li>
        )}
        {JSON.stringify(before.canvas) !== JSON.stringify(after.canvas) && (
          <li>
            {t("workspace.diff.canvas")}{" "}
            {t("workspace.diff.groups", {
              count: after.canvas?.groups.length ?? 0,
            })}
            ,{" "}
            {t("workspace.diff.layers", {
              count: after.canvas?.order.length ?? 0,
            })}
            .
          </li>
        )}
        {JSON.stringify(before.source) !== JSON.stringify(after.source) && (
          <li>
            {after.source ? (
              <>
                <strong>
                  {after.source.format === "react" ? "React" : "HTML"}{" "}
                  {t("workspace.diff.source")}
                  {after.source.enabled === false
                    ? ` ${t("workspace.diff.inactive")}`
                    : ` ${t("workspace.diff.active")}`}
                </strong>
                <del>
                  {before.source?.code.slice(0, 160) ||
                    t("workspace.diff.newSource")}
                </del>
                <ins>{after.source.code.slice(0, 160)}</ins>
              </>
            ) : (
              t("workspace.diff.returnVisual")
            )}
          </li>
        )}
      </ul>
      <details className={styles.renderDetails}>
        <summary>{t("workspace.diff.rendered")}</summary>
        <div className={styles.agentPreview}>
          {after.source && after.source.enabled !== false ? (
            <CodePreview document={after} />
          ) : (
            <>
              <style>{resumeCss}</style>
              <div dangerouslySetInnerHTML={{ __html: renderResume(after) }} />
            </>
          )}
        </div>
      </details>
    </div>
  );
}
