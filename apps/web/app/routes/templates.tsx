import { Link, useLoaderData } from "react-router";
import { Button } from "@mantine/core";
import { ArrowRight } from "lucide-react";
import { templates, createResume, renderResume, resumeCss } from "@resumi/cv";
import { PublicHeader, PublicFooter } from "../../src/components/Brand";
import { ResumePreview } from "../../src/components/ResumePreview";
import styles from "../../src/styles/Templates.module.css";
export const meta = () => [
  { title: "Thoughtful resume templates — ResumI" },
  {
    name: "description",
    content:
      "Start with Studio or Editorial. Two considered, editable resume templates for your next chapter.",
  },
];
export function loader() {
  return {
    templates: templates.map((t) => ({
      ...t,
      html: renderResume(createResume("preview-document", t.id)),
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
        <p>Two thoughtful foundations. A story only you can tell.</p>
        <div className={styles.grid}>
          {data.templates.map((t) => (
            <article key={t.id}>
              <div className={styles.preview}>
                <ResumePreview html={t.html} css={data.css} />
              </div>
              <div className={styles.details}>
                <div>
                  <h2>{t.name}</h2>
                  <p>{t.description}</p>
                </div>
                <Button
                  component={Link}
                  to={`/editor?template=${t.id}`}
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
