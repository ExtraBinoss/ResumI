import { useLoaderData } from "react-router";
import { templatePreviews } from "../../src/lib/template-previews.server";
import { Templates } from "../../src/features/dashboard/Templates";
export const meta = () => [
  { title: "Templates — ResumI" },
  { name: "description", content: "Choose a resume template." },
];
export function loader() {
  return {
    templates: templatePreviews.map(
      ({ writing: _writing, ...template }) => template,
    ),
  };
}
export default function TemplatesRoute() {
  return <Templates {...useLoaderData<typeof loader>()} />;
}
