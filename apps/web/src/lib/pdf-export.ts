import {
  documentLocale,
  type Document as ResumeDocument,
} from "@resumi/engine";
import { escapeHtml, renderDocumentHtml } from "@resumi/cv";
import {
  inertPrintMarkup,
  printBodyAttributes,
  printSnapshot,
} from "./pdf-snapshot";
import { optimizePrintImages } from "./pdf-images";
import { mountPdfLoading } from "./pdf-loading";

/** Open synchronously on user intent. Browser PDF preserves selectable text and CSS/vector fidelity. */
export function exportPdf(
  document: ResumeDocument,
  onError: (error: string) => void,
  loadingLabel = "Preparing PDF…",
) {
  const popup = window.open("", "_blank", "popup,width=960,height=900");
  if (!popup) {
    onError("Allow this page to open the PDF preview, then try again.");
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
        error instanceof Error
          ? error.message
          : "The PDF could not be prepared.",
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
  const markup = inertPrintMarkup(snapshot);
  stopLoading();
  popup.document.open();
  popup.document.write(
    `<!doctype html><html${printBodyAttributes(snapshot, "html")}><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'"><title>${escapeHtml(document.name)}</title></head><body${printBodyAttributes(snapshot)}>${markup}<style>@page{size:${width * 0.75}pt ${height * 0.75}pt;margin:0}*{animation:none!important;transition:none!important;print-color-adjust:exact!important;-webkit-print-color-adjust:exact!important}${sourceActive ? "" : `@media print{.resume.freeform{width:${width}px!important;height:${height}px!important}}`}@media screen{body{width:${width}px;margin:24px auto!important}}</style></body></html>`,
  );
  popup.document.close();
  if (!sourceActive)
    popup.document.documentElement.lang = documentLocale(document);
  void popup.document.body.offsetHeight;
  await popup.document.fonts.ready;
  await optimizePrintImages(popup.document);
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  if (popup.closed) return;
  popup.document.documentElement.dataset.pdfReady = "true";
  popup.focus();
  popup.print();
}
