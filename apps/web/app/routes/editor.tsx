import { useEffect } from "react";
import {
  useLoaderData,
  useNavigate,
  useParams,
  type ClientLoaderFunctionArgs,
} from "react-router";
import { SharedLoading } from "../../src/components/SharedLoading";
import { PageRecovery } from "../../src/components/PageRecovery";
import { Editor } from "../../src/features/editor/Editor";
import { projects, storageMessage } from "../../src/lib/projects";
export const meta = () => [
  { title: "Resume workspace — ResumI" },
  { name: "robots", content: "noindex" },
];
export async function clientLoader({
  params,
  request,
}: ClientLoaderFunctionArgs) {
  try {
    const project = params.documentId
      ? await projects.get(params.documentId)
      : await projects.create(
          new URL(request.url).searchParams.get("template") ?? "studio",
        );
    return { project, error: "", created: !params.documentId };
  } catch (error) {
    return { project: undefined, error: storageMessage(error), created: false };
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
      notFound={!data.error}
      title={data.error ? "Could not open your workspace." : "Resume not found"}
      description={
        data.error
          ? "Try again, or return to your projects."
          : "Open your library or import a backup."
      }
      error={data.error || null}
    />
  );
}
