import fontUrl from "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url";
import portraitUrl from "../../../../packages/cv/assets/alex-morgan-portrait.jpg?url";

/** Used by client rendering, so every preview asset is emitted by its Vite build. */
export const templateThumbnailUrls = import.meta.glob<string>(
  "../assets/templates/*.webp",
  { eager: true, query: "?url", import: "default" },
);

export const templatePreviewFontCss = `@font-face{font-family:ResumeInter;src:url('${fontUrl}') format('woff2');font-style:normal;font-weight:100 900;font-display:swap}`;
export const previewPortraitToken = "resumi-preview://portrait";

export function templatePreviewHtml(html: string) {
  return html.replaceAll(previewPortraitToken, portraitUrl);
}
