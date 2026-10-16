/** Both preview and portable exports work offline and cannot contact an origin. */
export function sourcePolicy(scripts = false): string {
  return `default-src 'none'; script-src ${scripts ? "'unsafe-inline' 'unsafe-eval'" : "'none'"}; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src data:; connect-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'`;
}

export function escapeScript(value: string): string {
  return value
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
