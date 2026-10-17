import { useLoaderData } from "react-router";
import { DashboardLayout } from "../../src/features/dashboard/components/Dashboard";
import { templatePreviewCss } from "../../src/lib/template-previews.server";

export function loader() {
  return { previewCss: templatePreviewCss };
}

// Trusted build-time templates do not change during a library browsing session.
export function shouldRevalidate() {
  return false;
}

export default function DashboardRoute() {
  return <DashboardLayout {...useLoaderData<typeof loader>()} />;
}
