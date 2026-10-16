import type { Document } from "@resumi/engine";
import template from "./template.generated.json" with { type: "json" };

/** Data injection keeps the editable template genuine JSX, including loops/styles. */
export function makeReactSource(document: Document): string {
  const data = resumeData(document);
  return template.replace(
    /\/\* resume-data:start \*\/[\s\S]*?\/\* resume-data:end \*\//,
    () => JSON.stringify(data, null, 2),
  );
}
export function resumeData(document: Document) {
  return {
    name: document.name,
    accent: document.style.accent,
    serif: document.style.font === "serif",
    sections: document.sectionIds.map((id) => ({
      title: document.sections[id].title,
      blocks: document.sections[id].blockIds
        .filter((blockId) => {
          const block = document.blocks[blockId],
            layer = block.design;
          const projectedTitle =
            layer?.type === "text" &&
            layer.uppercase &&
            layer.name === document.sections[id].title &&
            block.text === document.sections[id].title;
          return !["image", "shape"].includes(block.kind) && !projectedTitle;
        })
        .map((blockId) => ({
          kind: document.blocks[blockId].kind,
          text: document.blocks[blockId].text,
        })),
    })),
  };
}
