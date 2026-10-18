import { useLoaderData } from "react-router";
import { templates } from "@resumi/cv/catalog";
import { DashboardLayout } from "../../src/features/dashboard/components/Dashboard";

export function loader() {
  return {
    templateNames: templates
      .filter((template) => !template.legacy)
      .map((template) => template.name),
  };
}

// Trusted build-time template names do not change during a library session.
export function shouldRevalidate() {
  return false;
}

export default function DashboardRoute() {
  return <DashboardLayout {...useLoaderData<typeof loader>()} />;
}
