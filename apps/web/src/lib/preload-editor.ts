let editor: Promise<unknown> | undefined;
let template: Promise<unknown> | undefined;

/** Import code on intent; never invoke a client loader or write a project on hover. */
export function preloadEditor(): void {
  editor ??= import("../../app/routes/editor").catch(() => {
    editor = undefined;
  });
}

/** Template conversion needs these modules; saved native projects do not. */
export function preloadTemplateEditor(): void {
  preloadEditor();
  template ??= Promise.all([
    import("../features/editor/source/materialize"),
    import("@resumi/cv/source-render"),
    import("@resumi/cv/sample"),
  ]).catch(() => {
    template = undefined;
  });
}
