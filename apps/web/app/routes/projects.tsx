import type { MetaFunction } from "react-router";
import { Projects } from "../../src/features/dashboard/Projects";
import { interfaceLocale, resources } from "../../src/i18n/resources";
export const meta: MetaFunction = ({ matches }) => {
  const root = matches.find((match) => match.id === "root")?.loaderData as
    | { uiLocale?: string }
    | undefined;
  return [
    {
      title:
        resources[interfaceLocale(root?.uiLocale)].translation.site.meta
          .projectsTitle,
    },
    { name: "robots", content: "noindex" },
  ];
};
export default Projects;
