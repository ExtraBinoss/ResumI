import { useLoaderData } from "react-router";
import { templates, createResume, resumeCss } from "@resumi/cv";
import { renderTemplateResume } from "@resumi/cv/templates";
import { Templates } from "../../src/features/dashboard/Templates";
export const meta = () => [
  { title: "Templates — ResumI" },
  { name: "description", content: "Choose a resume template." },
];
export function loader() {
  return {
    templates: templates
      .filter((template) => !template.legacy)
      .map((template) => ({
        ...template,
        html: renderTemplateResume(
          createResume("preview-document", template.id),
        ),
      })),
    css: resumeCss,
  };
}
export default function TemplatesRoute() {
  return <Templates {...useLoaderData<typeof loader>()} />;
}
