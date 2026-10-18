import { useLoaderData, type MetaFunction } from "react-router";
import { templates } from "@resumi/cv/catalog";
import { interfaceLocale } from "../../src/i18n/resources";
import { publicMetadata } from "../../src/lib/seo";
import { Landing } from "../../src/features/landing/Landing";

export const meta: MetaFunction = ({ matches }) => {
  const rootData = matches.find((match) => match.id === "root")?.loaderData as
    | { uiLocale?: string }
    | undefined;
  return publicMetadata("landing", interfaceLocale(rootData?.uiLocale));
};

export function loader() {
  return {
    templates: templates
      .filter((template) => !template.legacy)
      .map(({ id, name }) => ({
        id,
        name: name.replace(/^React /, ""),
      })),
  };
}

export default function Home() {
  const { templates } = useLoaderData<typeof loader>();
  return <Landing templates={templates} />;
}
