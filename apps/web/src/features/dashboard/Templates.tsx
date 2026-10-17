import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Eye, LayoutTemplate } from "lucide-react";
import { Button, Modal } from "../../ui";
import { SearchInput } from "../../components/SearchInput";
import { createSearchIndex } from "../../lib/search-index";
import { ResumePreview } from "../../components/ResumePreview";
import { preloadEditor } from "../../lib/preload-editor";
import {
  templatePreviewHtml,
  templateThumbnailUrls,
} from "../../lib/template-preview-assets";
import { LibraryToolbar } from "./components/LibraryToolbar";
import shell from "./styles/Dashboard.module.css";
import styles from "./styles/Templates.module.css";

type TemplatePreview = {
  id: string;
  name: string;
  format: string;
  html: string;
};
function displayName(name: string) {
  return name.replace(/^React /, "");
}
export function Templates({ templates }: { templates: TemplatePreview[] }) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<TemplatePreview | null>(null);
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
      <main className={shell.main}>
        <header className={shell.heading}>
          <div className={shell.collectionTitle}>
            <h1>{t("dashboard.templates")}</h1>
            <span className={shell.count}>{templates.length}</span>
          </div>
        </header>
        <LibraryToolbar
          search={
            <SearchInput
              aria-label={t("dashboard.searchTemplates")}
              prefix={t("common.search")}
              captureTyping
              hints={templates.map((template) => ({
                label: displayName(template.name),
              }))}
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              size="xs"
            />
          }
        />
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
                whileHover={reducedMotion ? undefined : { y: -4 }}
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
                  onPointerEnter={preloadEditor}
                  onFocus={preloadEditor}
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
                  onClick={() => setPreview(template)}
                >
                  <Eye size={16} aria-hidden />
                </Button>
              </motion.article>
            ))}
          </div>
        </section>
      </main>
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
            <div className={shell.previewScroller}>
              <div className={shell.previewPage}>
                <ResumePreview
                  html={templatePreviewHtml(preview.html)}
                  css=""
                />
              </div>
            </div>
            <div className={shell.previewFooter}>
              <Button
                component={Link}
                to={`/editor?template=${preview.id}`}
                aria-label={t("dashboard.useTemplate", { name: preview.name })}
                onPointerEnter={preloadEditor}
                onFocus={preloadEditor}
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
