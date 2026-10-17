import { renderResume, resumeCss } from "@resumi/cv";
import type { Document } from "@resumi/engine";
import { CodePreview } from "../../../components/CodePreview";
import styles from "../styles/Commands.module.css";
function value(value: unknown, key: string) {
  if (key === "src" || key === "dataUrl") return "Embedded asset";
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return (text ?? "none").slice(0, 180);
}
export function ResumeDiff({
  before,
  after,
}: {
  before: Document;
  after: Document;
}) {
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
                  {next?.title || old?.title || "Section heading"}
                </strong>
                {old?.title !== next?.title && (
                  <span className={styles.propertyDiff}>
                    <del>{old?.title ?? "(new section)"}</del>
                    <ins>{next?.title ?? "(removed)"}</ins>
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
                        {old?.titleTranslations?.[locale] ?? "Original heading"}
                      </del>
                      <ins>
                        {next?.titleTranslations?.[locale] ??
                          "Original heading"}
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
                <del>Layer removed</del>
              ) : !old ? (
                <ins>Layer added: {next.text || design?.type}</ins>
              ) : (
                <>
                  {old.text !== next.text && (
                    <>
                      <del>{old.text || "(empty)"}</del>
                      <ins>{next.text || "(empty)"}</ins>
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
                          {old.translations?.[locale]?.text ?? "Original text"}
                        </del>
                        <ins>
                          {next.translations?.[locale]?.text ?? "Original text"}
                        </ins>
                        {JSON.stringify(old.translations?.[locale]?.marks) !==
                          JSON.stringify(
                            next.translations?.[locale]?.marks,
                          ) && <small>Text styling changed</small>}
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
                        {key}: <del>{value(oldDesign?.[key], key)}</del>
                        <ins>{value(design?.[key], key)}</ins>
                      </span>
                    ))}
                </>
              )}
            </li>
          );
        })}
        {before.name !== after.name && (
          <li>
            Resume name: <ins>{after.name}</ins>
          </li>
        )}
        {JSON.stringify(before.style) !== JSON.stringify(after.style) && (
          <li>Document typography / style changed.</li>
        )}
        {JSON.stringify(before.localization) !==
          JSON.stringify(after.localization) && (
          <li>
            CV language: <del>{before.localization?.activeLocale ?? "en"}</del>
            <ins>{after.localization?.activeLocale ?? "en"}</ins>
            <span>
              {after.localization?.locales
                .map((locale) => `${locale.name} (${locale.code})`)
                .join(", ") ?? "English (en)"}
            </span>
          </li>
        )}
        {JSON.stringify(before.canvas) !== JSON.stringify(after.canvas) && (
          <li>
            Canvas settings, layer order or groups changed:{" "}
            {after.canvas?.groups.length ?? 0} groups,{" "}
            {after.canvas?.order.length ?? 0} layers.
          </li>
        )}
        {JSON.stringify(before.source) !== JSON.stringify(after.source) && (
          <li>
            {after.source ? (
              <>
                <strong>
                  {after.source.format === "react" ? "React" : "HTML"} source
                  {after.source.enabled === false
                    ? " (saved, inactive)"
                    : " (active)"}
                </strong>
                <del>{before.source?.code.slice(0, 160) || "(new source)"}</del>
                <ins>{after.source.code.slice(0, 160)}</ins>
              </>
            ) : (
              "Return to visual layout."
            )}
          </li>
        )}
      </ul>
      <details className={styles.renderDetails}>
        <summary>View rendered proposal</summary>
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
