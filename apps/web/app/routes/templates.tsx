import { useLoaderData, type MetaFunction } from "react-router";
import { templates } from "@resumi/cv/catalog";
import { Templates } from "../../src/features/dashboard/Templates";
import { interfaceLocale } from "../../src/i18n/resources";
import { publicMetadata } from "../../src/lib/seo";
export const meta: MetaFunction = ({ matches }) => {
  const rootData = matches.find((match) => match.id === "root")?.loaderData as
    | { uiLocale?: string }
    | undefined;
  return publicMetadata("templates", interfaceLocale(rootData?.uiLocale));
};
export function loader() {
  return {
    templates: templates
      .filter((template) => !template.legacy)
      .map(({ id, name, format }) => ({ id, name, format })),
  };
}
export default function TemplatesRoute() {
  return <Templates {...useLoaderData<typeof loader>()} />;
}
