import { createResume, resumeCss } from "@resumi/cv";
import { templates } from "@resumi/cv/catalog";
import { renderTemplateResume } from "@resumi/cv/templates";
import assets from "../../../../packages/cv/src/templates/assets.generated.json" with { type: "json" };
import {
  previewPortraitToken,
  previewCreativePortraitToken,
  previewArtworkTokens,
} from "./template-preview-assets";

function previewMarkup(html: string) {
  const css: string[] = [];
  const licenses: string[] = [];
  const markup = html
    .replaceAll(assets.portrait, previewPortraitToken)
    .replaceAll(assets.creativePortrait, previewCreativePortraitToken)
    .replaceAll(assets.artwork.architecture, previewArtworkTokens.architecture)
    .replaceAll(assets.artwork.coast, previewArtworkTokens.coast)
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

/** Validate before rendering: this endpoint never accepts private documents or source. */
export function templatePreview(id: string) {
  const template = templates.find((entry) => entry.id === id && !entry.legacy);
  if (!template) return null;
  const document = createResume(`preview-${template.id}`, template.id);
  const { html, css, licenses } = previewMarkup(renderTemplateResume(document));
  return {
    id: template.id,
    html,
    css: [resumeCss, ...new Set(licenses), css].join("\n"),
  };
}
