import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { interfaceLocale, resources } from "../../src/i18n/resources";
import {
  useLoaderData,
  useNavigate,
  useParams,
  type ClientLoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import { SharedLoading } from "../../src/components/SharedLoading";
import { PageRecovery } from "../../src/components/PageRecovery";
import { Editor } from "../../src/features/editor/Editor";
import { applyCommand } from "@resumi/engine";
import {
  projects,
  storageErrorCode,
  storageErrorKey,
} from "../../src/lib/projects";
export const meta: MetaFunction = ({ matches }) => {
  const rootData = matches.find((match) => match.id === "root")?.loaderData as
    | { uiLocale?: string }
    | undefined;
  const copy =
    resources[interfaceLocale(rootData?.uiLocale)].translation.workspace;
  return [
    { title: copy.source.metaTitle },
    { name: "robots", content: "noindex" },
  ];
};
export async function clientLoader({
  params,
  request,
}: ClientLoaderFunctionArgs) {
  try {
    let project = params.documentId
      ? await projects.get(params.documentId)
      : await projects.create(
          new URL(request.url).searchParams.get("template") ?? "studio",
        );
    if (project?.document.source && project.document.source.enabled !== false) {
      const { materializeSourceDocument } =
        await import("../../src/features/editor/source/materialize");
      try {
        const command = await materializeSourceDocument(
          project.document,
          request.signal,
        );
        if (request.signal.aborted)
          throw new DOMException("Resume preparation cancelled.", "AbortError");
        project = await projects.save(
          applyCommand(project.document, command),
          project.revision,
          request.signal,
        );
      } catch (error) {
        if (request.signal.aborted) throw error;
        return {
          project: undefined,
          storageError: null,
          preparationError:
            error instanceof Error ? error.message : String(error),
          created: false,
        };
      }
    }
    return {
      project,
      storageError: null,
      preparationError: null,
      created: !params.documentId,
    };
  } catch (error) {
    return {
      project: undefined,
      storageError: storageErrorCode(error),
      preparationError: null,
      created: false,
    };
  }
}
clientLoader.hydrate = true as const;
export function HydrateFallback() {
  return (
    <main>
      <SharedLoading page messageKey="loading.openingResume" />
    </main>
  );
}
export default function EditorRoute() {
  const { t } = useTranslation();
  const data = useLoaderData<typeof clientLoader>(),
    navigate = useNavigate(),
    { documentId } = useParams();
  // Synchronize the canonical address after creation; the canvas is already mounted.
  useEffect(() => {
    if (data.project && !documentId)
      void navigate(`/editor/${data.project.id}`, { replace: true });
  }, [data.project, documentId, navigate]);
  if (data.project)
    return <Editor key={data.project.id} project={data.project} />;
  return (
    <PageRecovery
      notFound={!data.storageError && !data.preparationError}
      title={
        data.storageError || data.preparationError
          ? t("site.recovery.workspaceError")
          : t("site.recovery.resumeNotFound")
      }
      description={
        data.storageError || data.preparationError
          ? t("site.recovery.errorDescription")
          : t("site.recovery.importBackup")
      }
      error={
        data.preparationError ??
        (data.storageError ? t(storageErrorKey(data.storageError)) : null)
      }
    />
  );
}
