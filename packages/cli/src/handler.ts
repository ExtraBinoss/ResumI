import {
  applyCommands,
  createDocument,
  deserializeDocument,
  serializeDocument,
  validateDocument,
  EngineError,
  type Document,
} from "@resumi/engine";
import { parseArgs } from "./arguments";
import { HELP, help } from "./help";
import { CliError, read, readProject, write, type IO } from "./io";
export { HELP } from "./help";
export type { IO } from "./io";

async function publishDocument(
  document: Document,
  flags: Map<string, string>,
  io: IO,
) {
  if (flags.has("--out"))
    await write(io, flags.get("--out")!, serializeDocument(document));
  return {
    document,
    ...(flags.has("--out") ? { out: flags.get("--out") } : {}),
  };
}
async function source(document: Document, flags: Map<string, string>, io: IO) {
  const file = flags.get("--file");
  if (!file)
    throw new CliError(
      2,
      "source requires --file Resume.html or Resume.tsx. See help source.",
    );
  const format =
    flags.get("--format") ??
    (/\.(tsx|jsx)$/i.test(file)
      ? "react"
      : /\.html?$/i.test(file)
        ? "html"
        : undefined);
  if (format !== "html" && format !== "react")
    throw new CliError(
      2,
      "Choose a .html/.tsx/.jsx source file, or --format html|react.",
    );
  const code = await read(io, file);
  const result = applyCommands(document, {
    version: 1,
    actor: { kind: "agent", name: flags.get("--actor") ?? "ResumI CLI" },
    commands: [{ type: "source.set", source: { format, code } }],
  });
  if (format === "react") {
    const { compileReact } = await import("@resumi/cv/source-render");
    compileReact(code);
  }
  return {
    ...(await publishDocument(result.document, flags, io)),
    actor: result.batch.actor,
  };
}
export async function runCli(
  args: string[],
  io: IO,
): Promise<{ exit: number; stdout: string; stderr: string }> {
  try {
    if (
      !args.length ||
      args.includes("--help") ||
      args.includes("-h") ||
      args[0] === "help"
    )
      return {
        exit: 0,
        stdout: args[0] === "help" ? help(args[1]) : HELP,
        stderr: "",
      };
    const { command, args: positional, flags } = parseArgs(args);
    let result: unknown;
    if (command === "docs") {
      const { docs } = await import("./docs");
      result = await docs(positional, flags, io);
    } else if (
      ["commands", "capabilities", "templates", "assets"].includes(command)
    ) {
      const discovery = await import("./discovery");
      if (command === "commands") result = { commands: discovery.commands() };
      if (command === "capabilities") result = discovery.capabilities();
      if (command === "templates")
        result = await discovery.templateDiscovery(positional);
      if (command === "assets")
        result = await discovery.assetDiscovery(positional, flags, io);
    } else if (command === "schema")
      result = (await import("@resumi/adapters/schema")).commandContract;
    else if (command === "create") {
      if (flags.has("--blank") && flags.has("--template"))
        throw new CliError(
          2,
          "--blank and --template are mutually exclusive. Use --blank for an empty editable canvas.",
        );
      let document: Document;
      if (flags.has("--blank")) {
        document = applyCommands(createDocument(io.id(), "Untitled project"), {
          version: 1,
          actor: { kind: "agent", name: "ResumI CLI" },
          commands: [{ type: "canvas.enable", layers: {} }],
        }).document;
      } else {
        const { createResume, templates } = await import("@resumi/cv");
        const template = flags.get("--template") ?? "studio";
        if (!templates.some((item) => item.id === template))
          throw new CliError(
            2,
            `Unknown template: ${template}. Use templates list.`,
          );
        document = createResume(io.id(), template);
      }
      if (flags.has("--name"))
        document = applyCommands(document, {
          version: 1,
          actor: { kind: "agent", name: "ResumI CLI" },
          commands: [{ type: "document.update", name: flags.get("--name") }],
        }).document;
      result = await publishDocument(document, flags, io);
    } else {
      const document = deserializeDocument(
        await readProject(io, positional[0]),
      );
      if (command === "inspect") result = { document };
      if (command === "validate") {
        validateDocument(document);
        result = {
          valid: true,
          schemaVersion: document.schemaVersion,
          id: document.id,
        };
      }
      if (command === "apply") {
        let patch: unknown;
        try {
          patch = JSON.parse(await read(io, positional[1]));
        } catch (error) {
          if (error instanceof CliError) throw error;
          throw new EngineError("INVALID_INPUT", "Invalid command JSON.");
        }
        const applied = applyCommands(document, patch);
        result = {
          ...(await publishDocument(applied.document, flags, io)),
          actor: applied.batch.actor,
        };
      }
      if (command === "source") result = await source(document, flags, io);
      if (command === "pages") {
        const { listPages } = await import("./pages");
        result = listPages(document);
      }
      if (command === "contrast") {
        const { contrast } = await import("./contrast");
        result = await contrast(document, flags, io, positional[0]);
      }
      if (command === "output") {
        const { output } = await import("./output");
        result = await output(document, flags, io, positional[0]);
      }
      if (command === "screenshot") {
        const { screenshot } = await import("./screenshot-output");
        result = await screenshot(document, flags, io, positional[0]);
      }
      if (command === "render") {
        if (
          !["html", "pdf", "tsx", "react"].includes(
            flags.get("--format") ?? "",
          ) ||
          (!flags.has("--out") && !flags.has("--out-dir"))
        )
          throw new CliError(
            2,
            "render requires --format html|pdf|tsx and --out FILE or --out-dir DIR.",
          );
        const { output } = await import("./output");
        result = await output(document, flags, io, positional[0]);
      }
    }
    const pdfFailed =
      !!result &&
      typeof result === "object" &&
      "ats" in result &&
      !(result as { ats: { passed: boolean } }).ats.passed;
    return {
      exit: pdfFailed ? 3 : 0,
      stdout:
        typeof result === "string"
          ? result
          : JSON.stringify(result, null, 2) + "\n",
      stderr: pdfFailed
        ? JSON.stringify({
            error: {
              code: "PDF_TEXT_MISMATCH",
              message:
                "The PDF was rendered, but its extracted text differs from the app rendering. Inspect the ATS report and output PDF.",
            },
          }) + "\n"
        : "",
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
