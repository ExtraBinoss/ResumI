import type { Document } from "@resumi/engine";
import Resume from "./CodeResume";
import CreativeResume from "./CreativeResume";
import { isCreativeLayout } from "./types";
import { resumeData } from "../source/starter";

/** SSR only renders repository-authored components; it never evaluates document source. */
export function ResumeTemplate({ document }: { document: Document }) {
  const data = resumeData(document);
  return isCreativeLayout(data.layout ?? "studio") ? (
    <CreativeResume data={data} />
  ) : (
    <Resume data={data} />
  );
}
