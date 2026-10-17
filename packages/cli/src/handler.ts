import {
  applyCommands,
  deserializeDocument,
  serializeDocument,
  validateDocument,
  EngineError,
} from "@resumi/engine";
import { createResume, renderDocumentHtml, templates } from "@resumi/cv";
import { commandContract } from "@resumi/adapters/schema";
export const HELP = `ResumI — portable resume tools for humans and agents
Usage: bun run resumi document <command> [arguments]

  create [--out FILE] [--template ${templates.map((template) => template.id).join("|")}]
  inspect FILE              Read the complete normalized document (JSON)
  validate FILE             Validate document schema and invariants (JSON)
  apply FILE PATCH [--out FILE]   Apply one atomic v1 command batch
  render FILE --format html --out FILE   Export the real portable HTML/CSS
  schema                    Print the versioned command JSON Schema
  --help                    Show this help

All successful responses are JSON on stdout. Errors are JSON on stderr.
Exit codes: 0 success; 2 arguments; 3 invalid input/operation; 4 file I/O.
Without --out, create/apply return the document and never overwrite input.
Use export → inspect → propose → apply → render → validated browser import.
No network, provider credentials, browser access, MCP or live sync required.
`;
export interface IO {
  read(path: string): Promise<string>;
  write(path: string, data: string): Promise<void>;
  id(): string;
}
class CliError extends Error {
  constructor(
    public exit: number,
    message: string,
  ) {
    super(message);
  }
}
async function read(io: IO, path: string) {
  try {
    return await io.read(path);
  } catch {
    throw new CliError(4, `Cannot read file: ${path}`);
  }
}
async function write(io: IO, path: string, data: string) {
  try {
    await io.write(path, data);
  } catch {
    throw new CliError(4, `Cannot write file: ${path}`);
  }
}
export async function runCli(
  args: string[],
  io: IO,
): Promise<{ exit: number; stdout: string; stderr: string }> {
  try {
    if (!args.length || args.includes("--help") || args.includes("-h"))
      return { exit: 0, stdout: HELP, stderr: "" };
    if (args[0] !== "document")
      throw new CliError(2, "Expected document. Use --help.");
    const command = args[1],
      positional: string[] = [],
      flags = new Map<string, string>();
    for (let i = 2; i < args.length; i++) {
      const value = args[i];
      if (value.startsWith("--")) {
        if (
          !["--out", "--format", "--template"].includes(value) ||
          !args[i + 1] ||
          args[i + 1].startsWith("--") ||
          flags.has(value)
        )
          throw new CliError(2, `Invalid option: ${value}`);
        flags.set(value, args[++i]);
      } else positional.push(value);
    }
    const allowed: Record<string, string[]> = {
      create: ["--out", "--template"],
      inspect: [],
      validate: [],
      apply: ["--out"],
      render: ["--format", "--out"],
      schema: [],
    };
    if (
      !allowed[command] ||
      [...flags.keys()].some((flag) => !allowed[command].includes(flag))
    )
      throw new CliError(
        2,
        "Unknown command or incompatible option. Use --help.",
      );
    const count =
      command === "create" || command === "schema"
        ? 0
        : command === "apply"
          ? 2
          : 1;
    if (positional.length !== count)
      throw new CliError(
        2,
        `${command} expects ${count} file argument(s). Use --help.`,
      );
    let output: unknown;
    if (command === "schema") output = commandContract;
    else if (command === "create") {
      const template = flags.get("--template") ?? "studio";
      if (!templates.some((t) => t.id === template))
        throw new CliError(
          2,
          `Unknown template. Choose ${templates.map((template) => template.id).join(", ")}.`,
        );
      const document = createResume(io.id(), template);
      if (flags.has("--out"))
        await write(io, flags.get("--out")!, serializeDocument(document));
      output = {
        document,
        ...(flags.has("--out") ? { out: flags.get("--out") } : {}),
      };
    } else {
      const document = deserializeDocument(await read(io, positional[0]));
      if (command === "inspect") output = { document };
      if (command === "validate") {
        validateDocument(document);
        output = {
          valid: true,
          schemaVersion: document.schemaVersion,
          id: document.id,
        };
      }
      if (command === "apply") {
        let patch: unknown;
        try {
          patch = JSON.parse(await read(io, positional[1]));
        } catch (e) {
          if (e instanceof CliError) throw e;
          throw new EngineError("INVALID_INPUT", "Invalid command JSON.");
        }
        const result = applyCommands(document, patch);
        if (flags.has("--out"))
          await write(
            io,
            flags.get("--out")!,
            serializeDocument(result.document),
          );
        output = {
          document: result.document,
          actor: result.batch.actor,
          ...(flags.has("--out") ? { out: flags.get("--out") } : {}),
        };
      }
      if (command === "render") {
        if (flags.get("--format") !== "html" || !flags.get("--out"))
          throw new CliError(2, "render requires --format html --out FILE.");
        await write(
          io,
          flags.get("--out")!,
          await renderDocumentHtml(document),
        );
        output = { format: "html", out: flags.get("--out") };
      }
    }
    return {
      exit: 0,
      stdout: JSON.stringify(output, null, 2) + "\n",
      stderr: "",
    };
  } catch (error) {
    const exit = error instanceof CliError ? error.exit : 3;
    return {
      exit,
      stdout: "",
      stderr:
        JSON.stringify({
          error: {
            code: error instanceof EngineError ? error.code : `CLI_${exit}`,
            message: error instanceof Error ? error.message : "Unknown error",
          },
        }) + "\n",
    };
  }
}
