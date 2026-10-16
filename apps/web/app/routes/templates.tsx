import { Link, useLoaderData } from "react-router";
import { Button } from "../../src/ui";
import { ArrowRight } from "lucide-react";
import { templates, createResume, resumeCss } from "@resumi/cv";
import { renderTemplateResume } from "@resumi/cv/templates";
import { PublicHeader, PublicFooter } from "../../src/components/Brand";
import { ResumePreview } from "../../src/components/ResumePreview";
import { preloadEditor } from "../../src/lib/preload-editor";
import styles from "../../src/styles/Templates.module.css";
export const meta = () => [
  { title: "Thoughtful resume templates — ResumI" },
  {
    name: "description",
    content:
      "Start with a visual layout or an editable React component. Thoughtful templates for your next chapter.",
  },
];
export function loader() {
  return {
    templates: templates.map((t) => ({
      ...t,
      html: renderTemplateResume(createResume("preview-document", t.id)),
    })),
    css: resumeCss,
  };
}
export default function Templates() {
  const data = useLoaderData<typeof loader>();
  return (
    <>
      <PublicHeader />
      <main className={styles.main}>
        <h1>A good place to begin.</h1>
        <p>Choose a visual canvas or make it your own with React and CSS.</p>
        <div className={styles.grid}>
          {data.templates.map((t) => (
            <article key={t.id}>
              <div className={styles.preview}>
                <ResumePreview html={t.html} css={data.css} />
              </div>
              <div className={styles.details}>
                <div>
                  <h2>{t.name}</h2>
                  <span>
                    {t.format === "react"
                      ? "React · editable TSX"
                      : "Visual · layers & groups"}
                  </span>
                  <p>{t.description}</p>
                </div>
                <Button
                  component={Link}
                  to={`/editor?template=${t.id}`}
                  onPointerEnter={preloadEditor}
                  onFocus={preloadEditor}
                  variant="light"
                  rightSection={<ArrowRight size={15} aria-hidden />}
                >
                  Use {t.name}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
