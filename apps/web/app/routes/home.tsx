import { Link, useLoaderData, useNavigation } from "react-router";
import { createResume, resumeCss } from "@resumi/cv";
import { renderTemplateResume } from "@resumi/cv/templates";
import { Button } from "../../src/ui";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  MousePointer2,
  Terminal,
  Undo2,
  Layers2,
  PanelRight,
} from "lucide-react";
import { PublicHeader, PublicFooter } from "../../src/components/Brand";
import { ResumePreview } from "../../src/components/ResumePreview";
import { preloadEditor } from "../../src/lib/preload-editor";
import styles from "../../src/styles/Landing.module.css";
export const meta = () => [
  { title: "ResumI — Your resume just got a new teammate." },
  {
    name: "description",
    content:
      "A thoughtful resume editor for you and your agents. Edit on a real canvas, keep control of every change, and take your next step.",
  },
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
              Your resume
              <br />
              just got a new
              <br />
              <span>teammate.</span>
            </h1>
            <p>
              A canvas for your story. An engine for your agents.
              <br className={styles.desktopBreak} /> Build a resume that feels
              like you, together.
            </p>
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
                Explore templates <ArrowUpRight size={15} aria-hidden />
              </Link>
            </div>
            <div className={styles.reassurance}>
              <Check size={13} aria-hidden /> No account needed <span>·</span>{" "}
              Saved on your device
            </div>
          </div>
          <div
            className={styles.product}
            role="img"
            aria-label="Preview of the ResumI editor"
          >
            <div className={styles.previewToolbar}>
              <span className={styles.dots}>
                <i />
                <i />
                <i />
              </span>
              <span>Alex Morgan — Resume</span>
              <span className={styles.saved}>
                <Check size={11} aria-hidden /> Saved
              </span>
            </div>
            <div className={styles.previewWorkspace}>
              <aside>
                <Layers2 size={17} />
                <div />
                <PanelRight size={17} />
              </aside>
              <div className={styles.previewPaper}>
                <ResumePreview {...preview} />
              </div>
            </div>
            <div className={styles.cursor}>
              <MousePointer2 size={17} fill="currentColor" aria-hidden />
              <span>You, in control</span>
            </div>
            <div className={styles.commandCard}>
              <Terminal size={16} aria-hidden />
              <div>
                <strong>One canvas. Your kind of teammate.</strong>
                <span>Human edits and agent commands. Same engine.</span>
              </div>
              <Check size={15} aria-hidden />
            </div>
          </div>
        </section>
        <section className={styles.compatible} aria-label="Agent compatibility">
          <div>
            <span>Works with your workflow.</span>
            <strong>Bring the agent you already use.</strong>
          </div>
          <div className={styles.providers}>
            <span>
              <img src="/brands/claude.svg" alt="Claude" />
              Claude Code
            </span>
            <span>
              <img src="/brands/openai.svg" alt="OpenAI" />
              Codex
            </span>
            <span>
              <img src="/brands/xai.svg" alt="xAI" />
              Grok
            </span>
            <span className={styles.anyAgent}>
              <Terminal size={19} aria-hidden />
              Any CLI agent
            </span>
          </div>
          <p>
            Through our open document format and CLI. Provider integrations are
            not included.
          </p>
        </section>
        <section className={styles.principles}>
          <div>
            <MousePointer2 size={20} aria-hidden />
            <h2>Make it yours.</h2>
            <p>
              Edit the real document. Fine-tune every word, section, and detail
              without fighting a form.
            </p>
          </div>
          <div>
            <Terminal size={20} aria-hidden />
            <h2>Work together.</h2>
            <p>
              Hand a document to your agent. Review its commands, preview the
              result, and choose what stays.
            </p>
          </div>
          <div>
            <Undo2 size={20} aria-hidden />
            <h2>Keep the last word.</h2>
            <p>
              Every edit is reversible. Your resume stays on this device, with a
              portable backup whenever you need it.
            </p>
          </div>
        </section>
        <section className={styles.finalCta}>
          <h2>Your next chapter starts here.</h2>
          <Button
            component={Link}
            to="/editor"
            variant="subtle"
            rightSection={<ArrowRight size={16} aria-hidden />}
          >
            Make room for it
          </Button>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
