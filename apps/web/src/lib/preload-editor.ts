let pending: Promise<unknown> | undefined;
/** Import code on intent; never invoke the client loader or write a project on hover. */
export function preloadEditor() {
  pending ??= import("../../app/routes/editor").catch(() => {
    pending = undefined;
  });
  return pending;
}
