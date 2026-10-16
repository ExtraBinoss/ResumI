import { useParams } from "react-router";
import { Editor } from "../../src/features/Editor";
export const meta = () => [
  { title: "Resume workspace — ResumI" },
  { name: "robots", content: "noindex" },
];
export default function EditorRoute() {
  const { documentId } = useParams();
  return <Editor key={documentId} id={documentId!} />;
}
