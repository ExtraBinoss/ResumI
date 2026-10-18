import { help } from "./help";
import { CliError, type IO } from "./io";

export const githubDocsUrl =
  "https://raw.githubusercontent.com/ExtraBinoss/ResumI/main/docs/agents.md";
export const docTopics = [
  "agent",
  "design",
  "source",
  "assets",
  "commands",
  "screenshot",
  "pdf",
  "pages",
  "exports",
] as const;

/** Offline by default. Remote access is an explicit request to one fixed public guide. */
export async function docs(args: string[], flags: Map<string, string>, io: IO) {
  const topic = args[0],
    source = flags.get("--source") ?? "local";
  if (
    args.length > 1 ||
    (topic &&
      ![...docTopics, "all"].includes(topic as (typeof docTopics)[number]))
  )
    throw new CliError(
      2,
      `Unknown docs topic. Choose ${docTopics.join("| ")} or all.`,
    );
  if (!["local", "github"].includes(source))
    throw new CliError(2, "docs --source must be local or github.");
  if (source === "github") {
    if (topic && topic !== "agent")
      throw new CliError(
        2,
        "GitHub docs provides the agent guide: docs agent --source github. Other topics are shipped offline.",
      );
    if (!io.fetchText)
      throw new CliError(
        4,
        "GitHub docs fetch is unavailable in this adapter. Use docs agent for the shipped offline guide.",
      );
    try {
      return await io.fetchText(githubDocsUrl);
    } catch (error) {
      throw new CliError(
        4,
        `Cannot fetch GitHub docs: ${error instanceof Error ? error.message : "request failed"}. Use docs agent for the shipped offline guide; no credentials are sent.`,
      );
    }
  }
  return help(topic);
}
