import { data, type MetaFunction } from "react-router";
import { PageRecovery } from "../../src/components/PageRecovery";
import { interfaceLocale, resources } from "../../src/i18n/resources";

export const meta: MetaFunction = ({ matches }) => {
  const root = matches.find((match) => match.id === "root")?.loaderData as
    | { uiLocale?: string }
    | undefined;
  const copy = resources[interfaceLocale(root?.uiLocale)].translation.site;
  return [
    { title: `${copy.recovery.notFound} — ResumI` },
    { name: "robots", content: "noindex" },
  ];
};

// A matched route keeps the root language loader available for error-page SSR.
export function loader() {
  return data(null, { status: 404 });
}

export default function NotFound() {
  return <PageRecovery notFound />;
}
