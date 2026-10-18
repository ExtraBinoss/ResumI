import { templatePreview } from "../../src/lib/template-previews.server";

export type TemplatePreviewResult =
  | { id: string; html: string; css: string; error?: never }
  | { id: string; error: string; html?: never; css?: never };

/** Keep transport failures inside the preview, while router cancellation stays native. */
export async function clientLoader({
  serverLoader,
  params,
  request,
}: {
  serverLoader: () => Promise<TemplatePreviewResult>;
  params: { templateId?: string };
  request: Request;
}): Promise<TemplatePreviewResult> {
  try {
    return await serverLoader();
  } catch (error) {
    if (request.signal.aborted) throw error;
    return {
      id: params.templateId ?? "",
      error: "The public template preview could not be loaded.",
    };
  }
}

export function loader({ params }: { params: { templateId?: string } }) {
  const id = params.templateId ?? "";
  const headers = {
    "X-Robots-Tag": "noindex",
    "Cache-Control": "no-cache",
  };
  try {
    const preview = templatePreview(id);
    const result: TemplatePreviewResult = preview ?? {
      id,
      error: "Unknown public template.",
    };
    return Response.json(result, { status: preview ? 200 : 404, headers });
  } catch {
    const result: TemplatePreviewResult = {
      id,
      error: "The public template preview could not be rendered.",
    };
    return Response.json(result, { status: 500, headers });
  }
}
