import { Link } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "../../ui";
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
export function Templates({
  templates,
  css,
}: {
  templates: TemplatePreview[];
  css: string;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <main className={shell.main}>
      <div className={shell.heading}>
        <h1>Templates</h1>
      </div>
      <div className={styles.grid}>
        {templates.map((template) => (
          <motion.article
            key={template.id}
            whileHover={reducedMotion ? undefined : { y: -3 }}
            transition={{ duration: 0.22 }}
          >
            <div className={styles.preview}>
              <div className={styles.paper}>
                <ResumePreview html={template.html} css={css} />
              </div>
            </div>
            <div className={styles.details}>
              <div>
                <h2>{template.name}</h2>
                <span>{template.format === "react" ? "React" : "Canvas"}</span>
              </div>
              <Button
                component={Link}
                to={`/editor?template=${template.id}`}
                onPointerEnter={preloadEditor}
                onFocus={preloadEditor}
                variant="default"
                rightSection={<ArrowRight size={15} aria-hidden />}
              >
                Use {template.name}
              </Button>
            </div>
          </motion.article>
        ))}
      </div>
    </main>
  );
}
