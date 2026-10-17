import { useState } from "react";
import { Link } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Eye, Search, LayoutTemplate } from "lucide-react";
import { Button, Modal, TextInput } from "../../ui";
import { ResumePreview } from "../../components/ResumePreview";
import { preloadEditor } from "../../lib/preload-editor";
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
export function Templates({
  templates,
  css,
}: {
  templates: TemplatePreview[];
  css: string;
}) {
  const reducedMotion = useReducedMotion();
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<TemplatePreview | null>(null);
  const filtered = templates.filter((template) =>
    template.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <main className={shell.main}>
        <header className={`${shell.heading} ${styles.heading}`}>
          <div className={shell.collectionTitle}>
            <h1>Templates</h1>
            <span className={shell.count}>{templates.length}</span>
          </div>
          <TextInput
            aria-label="Search templates"
            placeholder="Search templates…"
            leftSection={<Search size={15} aria-hidden />}
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            size="xs"
            className={styles.search}
          />
        </header>
        <section className={styles.catalog} aria-label="Resume templates">
          {!filtered.length && (
            <div className={shell.empty}>
              <span className={shell.emptyPaper}>
                <LayoutTemplate size={32} strokeWidth={1.2} aria-hidden />
              </span>
              <h2>No templates found</h2>
            </div>
          )}
          <div className={styles.grid}>
            {filtered.map((template) => (
              <motion.article
                key={template.id}
                className={styles.template}
                initial={false}
                whileHover={reducedMotion ? undefined : { y: -4 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <div className={styles.preview}>
                  <div className={styles.paper}>
                    <ResumePreview html={template.html} css={css} />
                  </div>
                </div>
                <Link
                  to={`/editor?template=${template.id}`}
                  className={styles.templateLink}
                  aria-label={`Use ${template.name}`}
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
                  aria-label={`Preview ${displayName(template.name)}`}
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
        title={preview ? displayName(preview.name) : "Template preview"}
        size={860}
      >
        {preview && (
          <>
            <div className={shell.previewScroller}>
              <div className={shell.previewPage}>
                <ResumePreview html={preview.html} css={css} />
              </div>
            </div>
            <div className={shell.previewFooter}>
              <Button
                component={Link}
                to={`/editor?template=${preview.id}`}
                aria-label={`Use ${preview.name}`}
                onPointerEnter={preloadEditor}
                onFocus={preloadEditor}
                rightSection={<ArrowRight size={16} aria-hidden />}
              >
                Use {displayName(preview.name)}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
