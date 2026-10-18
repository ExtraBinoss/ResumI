import {
  applyCommands,
  deserializeDocument,
  serializeDocument,
  validateDocument,
  EngineError,
  type Document,
} from "@resumi/engine";
import { parseArgs, boundedInteger } from "./arguments";
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
async function output(document: Document, flags: Map<string, string>, io: IO) {
  const format = flags.get("--format") ?? "json";
  if (format === "pdf") {
    const { outputPdf } = await import("./pdf-output");
    return outputPdf(document, flags, io);
  }
  if (!["json", "html", "source"].includes(format))
    throw new CliError(2, "output --format must be json, html, source or pdf.");
  let data: string;
  if (format === "json") data = serializeDocument(document);
  else if (format === "source") {
    if (!document.source)
      throw new CliError(
        3,
        "This project has no saved HTML/React source. Use output --format html for its rendered layout.",
      );
    data = document.source.code;
  } else {
    const { renderDocumentHtml } = await import("@resumi/cv");
    data = await renderDocumentHtml(document);
  }
  if (!flags.has("--out")) return data.endsWith("\n") ? data : data + "\n";
  await write(io, flags.get("--out")!, data);
  return { format, out: flags.get("--out") };
}
async function screenshot(
  document: Document,
  flags: Map<string, string>,
  io: IO,
) {
  const out = flags.get("--out");
  if (!out || !/\.png$/i.test(out))
    throw new CliError(
      2,
      "screenshot requires --out FILE.png. See help screenshot.",
    );
  const width = boundedInteger(
    flags.get("--width"),
    Math.ceil(document.canvas?.width ?? 794),
    100,
    5000,
  );
  const height = boundedInteger(
    flags.get("--height"),
    Math.ceil(document.canvas?.height ?? 1123),
    100,
    10000,
  );
  if (!io.capture || !io.writeBinary)
    throw new CliError(
      3,
      "Screenshot capture is unavailable in this adapter. Run the Bun CLI after bunx playwright install chromium.",
    );
  const { renderDocumentHtml } = await import("@resumi/cv");
  const capture = await io.capture(
    await renderDocumentHtml(document),
    width,
    height,
  );
  try {
    await io.writeBinary(out, capture.bytes);
  } catch {
    throw new CliError(4, `Cannot write screenshot: ${out}`);
  }
  return {
    format: "png",
    out,
    width: capture.width,
    height: capture.height,
    blockedRequests: capture.blockedRequests,
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
    if (["commands", "capabilities", "templates", "assets"].includes(command)) {
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
      const { createResume, templates } = await import("@resumi/cv");
      const template = flags.get("--template") ?? "studio";
      if (!templates.some((item) => item.id === template))
        throw new CliError(
          2,
          `Unknown template: ${template}. Use templates list.`,
        );
      let document = createResume(io.id(), template);
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
      if (command === "output") result = await output(document, flags, io);
      if (command === "screenshot")
        result = await screenshot(document, flags, io);
      if (command === "render") {
        if (
          !["html", "pdf"].includes(flags.get("--format") ?? "") ||
          !flags.has("--out")
        )
          throw new CliError(
            2,
            "render requires --format html|pdf --out FILE.",
          );
        result = await output(document, flags, io);
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
