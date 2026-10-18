import fontUrl from "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url";
import portraitUrl from "../../../../packages/cv/assets/alex-morgan-portrait.jpg?url";
import creativePortraitUrl from "../../../../packages/cv/assets/creative-portrait.webp?url";
import architectureUrl from "../../../../packages/cv/assets/architecture.webp?url";
import coastUrl from "../../../../packages/cv/assets/coast.webp?url";

/** Used by client rendering, so every preview asset is emitted by its Vite build. */
export const templateThumbnailUrls = import.meta.glob<string>(
  "../assets/templates/*.webp",
  { eager: true, query: "?url", import: "default" },
);

export const templatePreviewFontCss = `@font-face{font-family:ResumeInter;src:url('${fontUrl}') format('woff2');font-style:normal;font-weight:100 900;font-display:swap}`;
export const previewPortraitToken = "resumi-preview://portrait";
export const previewCreativePortraitToken =
  "resumi-preview://creative-portrait";
export const previewArtworkTokens = {
  architecture: "resumi-preview://architecture",
  coast: "resumi-preview://coast",
};

export function templatePreviewHtml(html: string) {
  return html
    .replaceAll(previewPortraitToken, portraitUrl)
    .replaceAll(previewCreativePortraitToken, creativePortraitUrl)
    .replaceAll(previewArtworkTokens.architecture, architectureUrl)
    .replaceAll(previewArtworkTokens.coast, coastUrl);
}
