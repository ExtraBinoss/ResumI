import {
  documentLocale,
  type Document as ResumeDocument,
} from "@resumi/engine";
import { escapeHtml } from "@resumi/cv/renderer";
import { renderDocumentHtml } from "@resumi/cv/document-render";
import { printSnapshot } from "./pdf-snapshot";
import { optimizePrintImages } from "./pdf-images";
import {
  createPdfPrintSnapshot,
  normalizePdfTracking,
} from "@resumi/cv/pdf-print";
import { mountPdfLoading } from "./pdf-loading";

export type PdfExportMessages = {
  popupBlocked: string;
  preparationFailed: string;
};
const defaultMessages: PdfExportMessages = {
  popupBlocked: "Allow this page to open the PDF preview, then try again.",
  preparationFailed: "The PDF could not be prepared.",
};

/** Open synchronously on user intent. Browser PDF preserves selectable text and CSS/vector fidelity. */
export function exportPdf(
  document: ResumeDocument,
  onError: (error: string) => void,
  loadingLabel = "Preparing PDF…",
  messages: PdfExportMessages = defaultMessages,
) {
  const popup = window.open("", "_blank", "popup,width=960,height=900");
  if (!popup) {
    onError(messages.popupBlocked);
    return;
  }
  popup.opener = null;
  popup.document.title = document.name;
  const stopLoading = mountPdfLoading(popup, loadingLabel);
  const controller = new AbortController();
  const closed = setInterval(() => {
    if (popup.closed) controller.abort();
  }, 250);
  void prepare(document, popup, controller.signal, stopLoading)
    .catch((error: unknown) => {
      if (controller.signal.aborted || popup.closed) return;
      popup.close();
      onError(
        error instanceof Error ? error.message : messages.preparationFailed,
      );
    })
    .finally(() => {
      clearInterval(closed);
      stopLoading();
    });
}

async function prepare(
  document: ResumeDocument,
  popup: Window,
  signal: AbortSignal,
  stopLoading: () => void,
) {
  const sourceActive = !!document.source && document.source.enabled !== false;
  const width = sourceActive ? 794 : (document.canvas?.width ?? 794);
  const height = sourceActive ? 1123 : (document.canvas?.height ?? 1123);
  const html = await renderDocumentHtml(document);
  const snapshot = await printSnapshot(
    html,
    width,
    height,
    document.source?.enabled !== false && document.source?.format === "react",
    signal,
  );
  if (popup.closed) return;
  const inert = createPdfPrintSnapshot(snapshot);
  stopLoading();
  popup.document.open();
  popup.document.write(
    `<!doctype html><html${inert.htmlAttributes}><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'"><title>${escapeHtml(document.name)}</title><style>@page{size:${width * 0.75}pt ${height * 0.75}pt;margin:0}</style></head><body${inert.bodyAttributes}>${inert.markup}<style>*{animation:none!important;transition:none!important;print-color-adjust:exact!important;-webkit-print-color-adjust:exact!important}@media screen{body{width:${width}px;margin:24px auto!important}}</style></body></html>`,
  );
  popup.document.close();
  if (!sourceActive)
    popup.document.documentElement.lang = documentLocale(document);
  normalizePdfTracking(popup.document);
  popup.addEventListener(
    "beforeprint",
    () => normalizePdfTracking(popup.document),
    { once: true },
  );
  void popup.document.body.offsetHeight;
  await popup.document.fonts.ready;
  await optimizePrintImages(popup.document);
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
  if (popup.closed) return;
  popup.document.documentElement.dataset.pdfReady = "true";
  popup.focus();
  popup.print();
}
