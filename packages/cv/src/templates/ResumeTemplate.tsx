import type { Document } from "@resumi/engine";
import Resume from "./CodeResume";
import { resumeData } from "../source/starter";

/** SSR only renders repository-authored components; it never evaluates document source. */
export function ResumeTemplate({ document }: { document: Document }) {
  return <Resume data={resumeData(document)} />;
}
