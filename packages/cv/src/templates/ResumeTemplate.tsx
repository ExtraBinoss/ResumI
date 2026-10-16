import type { CSSProperties } from "react";
import type { Block, Document } from "@resumi/engine";

/** Trusted, repository-authored templates are ordinary React components. */
export function ResumeBlock({ block }: { block: Block }) {
  const Tag = block.kind === "heading" ? "h1" : "p";
  return (
    <Tag
      className={`resume-block resume-${block.kind}`}
      data-block-id={block.id}
    >
      {block.text}
    </Tag>
  );
}

export function ResumeTemplate({
  document,
  style,
}: {
  document: Document;
  style: CSSProperties;
}) {
  return (
    <article className="resume" aria-label="Resume" style={style}>
      {document.sectionIds.map((id) => {
        const section = document.sections[id];
        return (
          <section className="resume-section" data-section-id={id} key={id}>
            {section.title && <h2 className="resume-title">{section.title}</h2>}
            {section.blockIds.map((blockId) => (
              <ResumeBlock key={blockId} block={document.blocks[blockId]} />
            ))}
          </section>
        );
      })}
    </article>
  );
}
