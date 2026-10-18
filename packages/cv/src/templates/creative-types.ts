import type { ResumeData, ResumeSection } from "./types";

/** Shared input for trusted, portable creative document compositions. */
export type CreativeLayoutProps = {
  data: ResumeData;
  name: string;
  role?: string;
  contacts: string[];
  sections: ResumeSection[];
  portrait?: string;
};
