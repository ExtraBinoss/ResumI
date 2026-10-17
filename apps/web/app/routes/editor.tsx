import { useEffect } from "react";
import {
  Link,
  useLoaderData,
  useNavigate,
  useParams,
  type ClientLoaderFunctionArgs,
} from "react-router";
import { Button } from "../../src/ui";
import { SharedLoading } from "../../src/components/SharedLoading";
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
      <SharedLoading page label="Opening your resume…" />
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
    <main className="recovery">
      <h1>
        {data.error ? "Could not open your workspace." : "Resume not found"}
      </h1>
      <p>{data.error || "Import a backup or create a resume."}</p>
      <Button component={Link} to="/projects">
        Go to projects
      </Button>
    </main>
  );
}
