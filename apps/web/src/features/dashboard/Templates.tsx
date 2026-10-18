import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { Link, useFetcher } from "react-router";
import type { TemplatePreviewResult } from "../../../app/routes/template-preview";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Eye, LayoutTemplate } from "lucide-react";
import { Button } from "../../ui/button";
import { Modal } from "../../ui/overlays";
import { ErrorMessage } from "../../components/ErrorNotice";
import { SharedLoading } from "../../components/SharedLoading";
import { createSearchIndex } from "../../lib/search-index";
import { ResumePreview } from "../../components/ResumePreview";
import { preloadTemplateEditor } from "../../lib/preload-editor";
import {
  templatePreviewHtml,
  templatePreviewFontCss,
  templateThumbnailUrls,
} from "../../lib/template-preview-assets";
import { useLibraryView } from "./state/library-view";
import shell from "./styles/Dashboard.module.css";
import styles from "./styles/Templates.module.css";

type TemplatePreview = {
  id: string;
  name: string;
  format: string;
};
function displayName(name: string) {
  return name.replace(/^React /, "");
}
export function Templates({ templates }: { templates: TemplatePreview[] }) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const { search } = useLibraryView();
  const [preview, setPreview] = useState<TemplatePreview | null>(null);
  const fetcher = useFetcher<TemplatePreviewResult>();
  const loaded =
    fetcher.state === "idle" && fetcher.data?.id === preview?.id
      ? fetcher.data
      : undefined;
  function openPreview(template: TemplatePreview) {
    setPreview(template);
    if (
      fetcher.state !== "idle" ||
      fetcher.data?.id !== template.id ||
      fetcher.data.error
    )
      void fetcher.load(`/resources/template-preview/${template.id}`);
  }
  const index = useMemo(
    () =>
      createSearchIndex(templates, {
        text: (template) => displayName(template.name),
      }),
    [templates],
  );
  const filtered = index.search(search);
  return (
    <>
      <section
        className={styles.catalog}
        aria-label={t("dashboard.templateLibrary")}
      >
        {!filtered.length && (
          <div className={shell.empty}>
            <span className={shell.emptyPaper}>
              <LayoutTemplate size={32} strokeWidth={1.2} aria-hidden />
            </span>
            <h2>{t("dashboard.noTemplates")}</h2>
          </div>
        )}
        <div className={styles.grid}>
          {filtered.map((template, index) => (
            <motion.article
              key={template.id}
              data-template-card={template.id}
              className={styles.template}
              initial={false}
              layout={reducedMotion ? false : "position"}
              whileHover={reducedMotion ? undefined : { y: -3 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <div className={styles.preview}>
                <div className={styles.paper}>
                  <img
                    className={styles.thumbnail}
                    src={
                      templateThumbnailUrls[
                        `../assets/templates/${template.id}.webp`
                      ]
                    }
                    width={440}
                    height={622}
                    alt=""
                    aria-hidden="true"
                    loading={index < 4 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    decoding="async"
                  />
                </div>
              </div>
              <Link
                to={`/editor?template=${template.id}`}
                className={styles.templateLink}
                aria-label={t("dashboard.useTemplate", {
                  name: template.name,
                })}
                onPointerEnter={preloadTemplateEditor}
                onFocus={preloadTemplateEditor}
              >
                <div className={styles.details}>
                  <h2>{displayName(template.name)}</h2>
                  <ArrowRight size={16} aria-hidden />
                </div>
              </Link>
              <Button
                variant="subtle"
                color="gray"
                size="compact-xs"
                className={styles.previewButton}
                aria-label={t("dashboard.previewResume", {
                  name: displayName(template.name),
                })}
                onClick={() => openPreview(template)}
              >
                <Eye size={16} aria-hidden />
              </Button>
            </motion.article>
          ))}
        </div>
      </section>
      <Modal
        opened={!!preview}
        onClose={() => setPreview(null)}
        title={
          preview ? displayName(preview.name) : t("dashboard.templatePreview")
        }
        size={860}
      >
        {preview && (
          <>
            {loaded?.error ? (
              <ErrorMessage
                error={loaded.error}
                label={t("dashboard.previewFailed")}
              >
                <Button variant="subtle" onClick={() => openPreview(preview)}>
                  {t("dashboard.retryPreview")}
                </Button>
              </ErrorMessage>
            ) : loaded?.html ? (
              <div
                className={shell.previewScroller}
                data-template-preview={loaded.id}
              >
                <div className={shell.previewPage}>
                  <ResumePreview
                    html={templatePreviewHtml(loaded.html)}
                    css={templatePreviewFontCss + loaded.css}
                  />
                </div>
              </div>
            ) : (
              <SharedLoading
                messageKey="loading.preview"
                variant="working"
                className={styles.previewLoading}
              />
            )}
            <div className={shell.previewFooter}>
              <Button
                component={Link}
                to={`/editor?template=${preview.id}`}
                aria-label={t("dashboard.useTemplate", { name: preview.name })}
                onPointerEnter={preloadTemplateEditor}
                onFocus={preloadTemplateEditor}
                rightSection={<ArrowRight size={16} aria-hidden />}
              >
                {t("dashboard.useTemplate", {
                  name: displayName(preview.name),
                })}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
