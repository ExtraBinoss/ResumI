import { useState } from "react";
import { Link, useLoaderData, useNavigation } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import { createResume, resumeCss, templates } from "@resumi/cv";
import { renderTemplateResume } from "@resumi/cv/templates";
import {
  ArrowRight,
  ArrowUpRight,
  AlignLeft,
  LayoutTemplate,
  Check,
} from "lucide-react";
import { Button } from "../../src/ui";
import { Button as PreviewButton } from "../../src/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../src/components/ui/tabs";
import { PublicHeader, PublicFooter } from "../../src/components/Brand";
import { ResumePreview } from "../../src/components/ResumePreview";
import { preloadEditor } from "../../src/lib/preload-editor";
import styles from "../../src/styles/Landing.module.css";

export const meta = () => [
  { title: "ResumI — A resume, beautifully presented" },
  {
    name: "description",
    content:
      "Design your resume. Start with a considered template, refine every detail, and make your next move.",
  },
];
export function loader() {
  const choices = ["react-profile", "react-classic", "react-studio"];
  const featured = templates.filter((template) =>
    choices.includes(template.id),
  );
  const previews = (
    featured.length
      ? choices.flatMap((id) =>
          featured.filter((template) => template.id === id),
        )
      : templates.slice(0, 3)
  ).map((template) => {
    const document = createResume(`landing-${template.id}`, template.id);
    return {
      id: template.id,
      name: template.name.replace(/^React /, ""),
      html: renderTemplateResume(document),
      writing: {
        name:
          Object.values(document.blocks).find(
            (block) => block.kind === "heading",
          )?.text ?? "Alex Morgan",
        role:
          Object.values(document.blocks).find(
            (block) => block.kind === "subtitle",
          )?.text ?? "Product Designer",
        sections: document.sectionIds
          .map((id) => document.sections[id])
          .filter((section) => section.title)
          .slice(0, 2)
          .map((section) => ({
            title: section.title,
            text: section.blockIds
              .map((id) => document.blocks[id].text)
              .filter(Boolean)
              .slice(0, 3),
          })),
      },
    };
  });
  return { previews, css: resumeCss };
}
type Preview = ReturnType<typeof loader>["previews"][number];

function ResumeShowcase({
  previews,
  css,
}: {
  previews: Preview[];
  css: string;
}) {
  const [selectedId, setSelected] = useState(previews[0].id);
  const reduced = useReducedMotion();
  const selected =
    previews.find((preview) => preview.id === selectedId) ?? previews[0];
  const others = previews.filter((preview) => preview.id !== selected.id);
  function position(preview: Preview) {
    return preview.id === selected.id
      ? 0
      : others.indexOf(preview) === 0
        ? -1
        : 1;
  }
  return (
    <div className={styles.showcase}>
      <div className={styles.documents} aria-label="Resume template previews">
        {previews.map((preview) => {
          const slot = position(preview);
          return (
            <motion.div
              key={preview.id}
              className={styles.document}
              role="img"
              aria-label={`${preview.name} resume template`}
              data-position={slot}
              initial={false}
              animate={{
                x: `${slot * 68}%`,
                y: slot === 0 ? 0 : 42,
                rotate: slot * 8,
                scale: slot === 0 ? 1 : 0.86,
              }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 170, damping: 24 }
              }
            >
              <ResumePreview html={preview.html} css={css} />
            </motion.div>
          );
        })}
      </div>
      <div className={styles.showcaseControls}>
        <div
          className={styles.choices}
          role="group"
          aria-label="Featured templates"
        >
          {previews.map((preview) => (
            <PreviewButton
              key={preview.id}
              variant="ghost"
              className={styles.choice}
              aria-pressed={selected.id === preview.id}
              onClick={() => setSelected(preview.id)}
            >
              {selected.id === preview.id && (
                <motion.span
                  layoutId="landing-template-choice"
                  className={styles.choiceHighlight}
                  transition={reduced ? { duration: 0 } : { duration: 0.2 }}
                />
              )}
              <span>{preview.name}</span>
            </PreviewButton>
          ))}
        </div>
        <Link
          to={`/editor?template=${selected.id}`}
          onPointerEnter={preloadEditor}
          onFocus={preloadEditor}
          className={styles.useTemplate}
        >
          Use {selected.name}
          <ArrowUpRight size={16} aria-hidden />
        </Link>
      </div>
    </div>
  );
}
function WritingPreview({ preview }: { preview: Preview }) {
  return (
    <article className={styles.writing} aria-label="Resume text preview">
      <span>{preview.writing.name}</span>
      <small>{preview.writing.role}</small>
      {preview.writing.sections.map((section) => (
        <section key={section.title}>
          <h3>{section.title}</h3>
          {section.text.map((text, index) => (
            <p key={index}>{text}</p>
          ))}
        </section>
      ))}
    </article>
  );
}
function EditingPreview({ preview, css }: { preview: Preview; css: string }) {
  const [mode, setMode] = useState("visual");
  const reduced = useReducedMotion();
  return (
    <Tabs
      value={mode}
      onValueChange={(value) => setMode(String(value))}
      className={styles.editingPreview}
    >
      <TabsList className={styles.modeList} aria-label="Editing preview">
        <TabsTrigger value="visual">
          <LayoutTemplate size={16} aria-hidden />
          Visual
        </TabsTrigger>
        <TabsTrigger value="text">
          <AlignLeft size={16} aria-hidden />
          Text
        </TabsTrigger>
      </TabsList>
      <div className={styles.previewSurface}>
        <TabsContent value="visual" keepMounted className={styles.visualPanel}>
          <motion.div
            className={styles.previewContents}
            initial={false}
            animate={{
              opacity: mode === "visual" ? 1 : 0,
            }}
            transition={{ duration: reduced ? 0 : 0.18 }}
          >
            <div className={styles.detailPaper}>
              <ResumePreview html={preview.html} css={css} />
            </div>
          </motion.div>
        </TabsContent>
        <TabsContent value="text" keepMounted className={styles.textPanel}>
          <motion.div
            initial={false}
            animate={{
              opacity: mode === "text" ? 1 : 0,
            }}
            transition={{ duration: reduced ? 0 : 0.18 }}
          >
            <WritingPreview preview={preview} />
          </motion.div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
export default function Home() {
  const { previews, css } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const editingPreview =
    previews.find((preview) => preview.id === "react-studio") ?? previews[0];
  return (
    <div className={styles.page}>
      <PublicHeader />
      <main>
        <section className={styles.hero}>
          <div className={styles.introduction}>
            <p className={styles.eyebrow}>The resume editor</p>
            <h1>
              Good work.
              <br />
              <span>Beautifully presented.</span>
            </h1>
            <p className={styles.description}>
              Your resume deserves the same care as your work. <br />
              Start with a template. Make the details yours.
            </p>
            <div className={styles.actions}>
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
              <Link to="/templates" className={styles.textLink}>
                Explore templates
                <ArrowUpRight size={17} aria-hidden />
              </Link>
            </div>
          </div>
          <ResumeShowcase previews={previews} css={css} />
        </section>
        <section
          className={styles.workflows}
          aria-labelledby="workflow-heading"
        >
          <div className={styles.workflowCopy}>
            <p className={styles.eyebrow}>Write. Arrange. Refine.</p>
            <h2 id="workflow-heading">
              One resume. <br />
              Two ways to work.
            </h2>
            <p>
              Focus on the words in Text. <br />
              Find the right balance in Visual.
            </p>
            <Link
              to="/editor"
              className={styles.textLink}
              onPointerEnter={preloadEditor}
              onFocus={preloadEditor}
            >
              Explore the editor
              <ArrowRight size={17} aria-hidden />
            </Link>
          </div>
          <EditingPreview preview={editingPreview} css={css} />
        </section>
        <section className={styles.finish} aria-labelledby="finish-heading">
          <p className={styles.eyebrow}>
            From the first draft to the final file.
          </p>
          <h2 id="finish-heading">Make your next move.</h2>
          <p>Take your resume with you. Print to PDF or export as HTML.</p>
          <div className={styles.actions}>
            <Button
              component={Link}
              to="/editor"
              onPointerEnter={preloadEditor}
              onFocus={preloadEditor}
              size="md"
              rightSection={<ArrowRight size={17} aria-hidden />}
            >
              Start designing
            </Button>
            <Link to="/projects" className={styles.textLink}>
              Open your workspace
              <ArrowUpRight size={16} aria-hidden />
            </Link>
          </div>
          <div className={styles.details}>
            <span>
              <Check size={15} aria-hidden />
              Editable templates
            </span>
            <span>
              <Check size={15} aria-hidden />
              Custom fonts and images
            </span>
            <span>
              <Check size={15} aria-hidden />
              Portable exports
            </span>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
