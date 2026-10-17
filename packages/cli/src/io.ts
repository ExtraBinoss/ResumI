export interface CaptureResult {
  bytes: Uint8Array;
  width: number;
  height: number;
  blockedRequests: string[];
}
export interface IO {
  read(path: string): Promise<string>;
  write(path: string, data: string): Promise<void>;
  writeBinary?(path: string, data: Uint8Array): Promise<void>;
  capture?(html: string, width: number, height: number): Promise<CaptureResult>;
  id(): string;
}
export class CliError extends Error {
  constructor(
    public exit: number,
    message: string,
  ) {
    super(message);
  }
}
export async function read(io: IO, path: string) {
  try {
    return await io.read(path);
  } catch {
    throw new CliError(4, `Cannot read file: ${path}`);
  }
}
/** A project name resolves only to a file in the current working directory. */
export async function readProject(io: IO, path: string) {
  try {
    return await io.read(path);
  } catch {
    if (!path.endsWith(".json")) {
      try {
        return await io.read(`${path}.json`);
      } catch {
        /* Report both explicit filesystem candidates below. */
      }
    }
    throw new CliError(
      4,
      `Cannot read project: ${path}${path.endsWith(".json") ? "" : ` (also tried ${path}.json)`}. Export browser projects as JSON first; the CLI cannot read private IndexedDB.`,
    );
  }
}
export async function write(io: IO, path: string, data: string) {
  try {
    await io.write(path, data);
  } catch {
    throw new CliError(4, `Cannot write file: ${path}`);
  }
}
