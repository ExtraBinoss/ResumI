import { createResume, resumeCss, templates } from "@resumi/cv";
import { renderTemplateResume } from "@resumi/cv/templates";
import assets from "../../../../packages/cv/src/templates/assets.generated.json" with { type: "json" };
import { previewPortraitToken } from "./template-preview-assets";

function previewMarkup(html: string) {
  const css: string[] = [];
  const licenses: string[] = [];
  const markup = html
    .replaceAll(assets.portrait, previewPortraitToken)
    .replace(/<style>([\s\S]*?)<\/style>/g, (_, content: string) => {
      // License comments differ for templates with brand marks. Keep each
      // notice while deduplicating their otherwise identical styles/font face.
      css.push(
        content
          .replace(/^\/\*[\s\S]*?\*\//, (license) => {
            licenses.push(license);
            return "";
          })
          .replace(/@font-face\{font-family:ResumeInter;[^}]+\}/g, ""),
      );
      return "";
    });
  return { html: markup, css: css.join("\n"), licenses };
}

/** Only repository-authored synthetic documents enter this immutable catalog. */
const catalog = templates
  .filter((template) => !template.legacy)
  .map((template) => {
    const document = createResume(`preview-${template.id}`, template.id);
    return {
      ...template,
      // Portable exports retain their embedded assets. Browser cards share the
      // same immutable files, rather than decoding a font for every preview.
      ...previewMarkup(renderTemplateResume(document)),
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

/** One shared CV stylesheet, independent of UI locale and private project data. */
export const templatePreviewCss = [
  resumeCss,
  ...new Set(catalog.flatMap((template) => template.licenses)),
  ...new Set(catalog.map((template) => template.css)),
].join("\n");
export const templatePreviews = catalog.map(
  ({ css: _css, licenses: _licenses, ...template }) => template,
);
