import { Link, useLoaderData, useNavigation } from "react-router";
import { createResume, resumeCss } from "@resumi/cv";
import { renderTemplateResume } from "@resumi/cv/templates";
import { Button } from "../../src/ui";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Layers2,
  Type,
  MousePointer2,
} from "lucide-react";
import { PublicHeader, PublicFooter } from "../../src/components/Brand";
import { ResumePreview } from "../../src/components/ResumePreview";
import { preloadEditor } from "../../src/lib/preload-editor";
import styles from "../../src/styles/Landing.module.css";

export const meta = () => [
  { title: "ResumI — Resume editor" },
  { name: "description", content: "Create and design your resume." },
];
export function loader() {
  return {
    html: renderTemplateResume(createResume("preview-document")),
    css: resumeCss,
  };
}
export default function Home() {
  const preview = useLoaderData<typeof loader>(),
    navigation = useNavigation();
  return (
    <>
      <PublicHeader />
      <main>
        <section className={styles.hero}>
          <div className={styles.copy}>
            <h1>
              Your resume,
              <br />
              <span>your way.</span>
            </h1>
            <p>A blank page. All the tools to make it yours.</p>
            <div className={styles.cta}>
              <Button
                component={Link}
                to="/editor"
                onPointerEnter={preloadEditor}
                onFocus={preloadEditor}
                loading={
                  navigation.state !== "idle" &&
                  navigation.location?.pathname.startsWith("/editor")
                }
                size="md"
                rightSection={<ArrowRight size={17} aria-hidden />}
              >
                Create a resume
              </Button>
              <Link to="/templates">
                Templates <ArrowUpRight size={15} aria-hidden />
              </Link>
            </div>
          </div>
          <div
            className={styles.product}
            role="img"
            aria-label="Preview of the ResumI editor"
          >
            <div className={styles.previewToolbar}>
              <span>Alex Morgan</span>
              <Check size={12} aria-hidden />
            </div>
            <div className={styles.previewWorkspace}>
              <aside aria-hidden>
                <Layers2 size={17} />
                <span>Composition</span>
                <div>
                  <Type size={13} /> Name
                </div>
                <div>
                  <Type size={13} /> Role
                </div>
                <div>
                  <Type size={13} /> Profile
                </div>
              </aside>
              <div className={styles.previewPaper}>
                <ResumePreview {...preview} />
              </div>
            </div>
            <div className={styles.previewDock} aria-hidden>
              <MousePointer2 size={16} />
              <Type size={16} />
              <Layers2 size={16} />
              <span />
              Visual
            </div>
          </div>
        </section>
        <section className={styles.templateCta}>
          <div>
            <h2>Start with a template.</h2>
            <p>Then change everything.</p>
          </div>
          <Button
            component={Link}
            to="/templates"
            variant="default"
            rightSection={<ArrowRight size={16} aria-hidden />}
          >
            Browse templates
          </Button>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
