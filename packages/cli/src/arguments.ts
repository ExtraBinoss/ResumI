import { CliError } from "./io";

const options: Record<string, string[]> = {
  docs: ["--source"],
  create: ["--out", "--template", "--name", "--blank"],
  inspect: [],
  pages: [],
  validate: [],
  apply: ["--out"],
  schema: [],
  commands: [],
  capabilities: [],
  render: ["--format", "--out", "--out-dir", "--pages"],
  output: ["--format", "--out", "--out-dir", "--pages"],
  source: ["--file", "--format", "--actor", "--out"],
  screenshot: ["--out", "--width", "--height", "--page"],
  templates: [],
  assets: ["--kind", "--search", "--limit", "--format", "--out"],
};
export function parseArgs(input: string[]) {
  const argv = input[0] === "document" ? input.slice(1) : input;
  const command = argv[0] === "new" ? "create" : argv[0];
  if (!options[command]) throw new CliError(2, "Unknown command. Use --help.");
  const args: string[] = [],
    flags = new Map<string, string>();
  for (let index = 1; index < argv.length; index++) {
    const value = argv[index];
    if (value.startsWith("--")) {
      if (command === "create" && value === "--blank") {
        if (flags.has(value))
          throw new CliError(2, "Duplicate --blank option.");
        flags.set(value, "true");
        continue;
      }
      const next = argv[index + 1];
      if (
        !options[command].includes(value) ||
        !next ||
        next.startsWith("--") ||
        flags.has(value)
      )
        throw new CliError(
          2,
          `Invalid option for ${command}: ${value}. Use --help.`,
        );
      flags.set(value, next);
      index++;
    } else args.push(value);
  }
  const count = ["create", "schema", "commands", "capabilities"].includes(
    command,
  )
    ? 0
    : command === "apply"
      ? 2
      : 1;
  if (
    !["templates", "assets", "docs"].includes(command) &&
    args.length !== count
  )
    throw new CliError(
      2,
      `${command} expects ${count} file argument(s). Use --help.`,
    );
  return { command, args, flags };
}
export function boundedInteger(
  value: string | undefined,
  fallback: number,
  min: number,
  max: number,
) {
  if (value === undefined) return fallback;
  const number = Number(value);
  if (
    !/^\d+$/.test(value) ||
    !Number.isSafeInteger(number) ||
    number < min ||
    number > max
  )
    throw new CliError(
      2,
      `Expected an integer from ${min} to ${max}, received: ${value}`,
    );
  return number;
}
