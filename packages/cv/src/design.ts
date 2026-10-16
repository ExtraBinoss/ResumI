import {
  applyCommands,
  makeLayer,
  type Document,
  type Command,
  type Layer,
} from "@resumi/engine";
/** One-time deterministic projection of structured content into the freeform workspace. */
export function visualCommands(doc: Document): Command[] {
  if (doc.canvas) return [];
  const layers: Record<string, Layer> = {},
    commands: Command[] = [],
    reserved = new Set([doc.id, ...doc.sectionIds, ...Object.keys(doc.blocks)]);
  let y = 62;
  const family =
    doc.style.font === "serif" ? "Georgia, serif" : "Arial, sans-serif";
  for (const sectionId of doc.sectionIds) {
    const section = doc.sections[sectionId];
    if (section.title) {
      const prefix = `${section.id.slice(0, 70)}-label`;
      let id = prefix,
        index = 1;
      while (reserved.has(id)) id = `${prefix}-${index++}`;
      reserved.add(id);
      commands.push({
        type: "block.create",
        sectionId,
        block: { id, kind: "text", text: section.title },
        index: 0,
      });
      layers[id] = makeLayer("text", {
        name: section.title,
        x: 64,
        y,
        width: 666,
        height: 22,
        fontFamily: family,
        fontSize: 10,
        fontWeight: 700,
        color: doc.style.accent,
        uppercase: true,
        letterSpacing: 1.8,
      });
      y += 35;
    }
    for (const id of section.blockIds) {
      const block = doc.blocks[id],
        heading = block.kind === "heading",
        meta = block.kind === "meta",
        subtitle = block.kind === "subtitle",
        identity = sectionId === doc.sectionIds[0];
      const size = heading
        ? 38
        : subtitle && identity
          ? 15
          : subtitle
            ? 13.2
            : meta
              ? 10.44
              : doc.style.fontSize;
      const height = heading
        ? 48
        : Math.max(
            20,
            Math.ceil(block.text.length / (666 / (size * 0.52))) * size * 1.65,
          );
      layers[id] = makeLayer("text", {
        name: heading ? "Name" : block.text.slice(0, 45) || "Text",
        x: 64,
        y,
        width: 666,
        height,
        fontFamily: family,
        fontSize: size,
        fontWeight: heading || subtitle ? 650 : 400,
        lineHeight: heading ? 1.15 : 1.65,
        letterSpacing: heading ? -1.3 : 0,
        color: meta
          ? "#606a79"
          : subtitle && identity
            ? doc.style.accent
            : "#20252d",
      });
      y += height + 7;
    }
    y += doc.style.spacing;
  }
  commands.push({ type: "canvas.enable", layers });
  return commands;
}
export function enableVisual(doc: Document): Document {
  const commands = visualCommands(doc);
  return commands.length
    ? applyCommands(doc, {
        version: 1,
        actor: { kind: "human", name: "Visual layout" },
        commands,
      }).document
    : doc;
}
