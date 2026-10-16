export type ResumeData = {
  name: string;
  accent: string;
  serif: boolean;
  sections: { title: string; blocks: { kind: string; text: string }[] }[];
};

const resume: ResumeData = /* resume-data:start */ {
  name: "Alex Morgan",
  accent: "#2563eb",
  serif: false,
  sections: [
    {
      title: "",
      blocks: [
        { kind: "heading", text: "Alex Morgan" },
        { kind: "subtitle", text: "Product Designer" },
      ],
    },
    {
      title: "Profile",
      blocks: [
        {
          kind: "text",
          text: "I turn complex problems into clear, thoughtful digital experiences.",
        },
      ],
    },
  ],
}; /* resume-data:end */

/** This file is also the editable TSX starter. No renderer-specific DSL. */
export default function Resume({ data = resume }: { data?: ResumeData } = {}) {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; color: #20252d; background: #fff; }
        .resume { width: 794px; min-height: 1123px; padding: 62px 64px; margin: auto; font: 12px/1.65 Arial,sans-serif; }
        .resume section { margin-bottom: 26px; }
        .resume h1 { font-size: 38px; line-height: 1.15; letter-spacing: -1.3px; margin: 0 0 8px; }
        .resume h2 { font-size: 10px; text-transform: uppercase; letter-spacing: 1.8px; color: var(--accent); margin: 0 0 11px; padding-bottom: 7px; border-bottom: 1px solid #e4e7ed; }
        .resume p { margin: 0 0 7px; white-space: pre-wrap; }
        .resume .subtitle { font-weight: 650; font-size: 1.1em; margin-top: 10px; }
        .resume .meta { font-size: .87em; color: #606a79; }
        .resume .bullet { padding-left: 13px; }
        .resume .bullet::before { content: '•'; color: var(--accent); margin-left: -13px; margin-right: 7px; }
        .resume section:first-child .subtitle { color: var(--accent); font-size: 15px; font-weight: 500; }
        @page { size: A4; margin: 0; }
        @media print { .resume { width: 210mm; min-height: 297mm; } section { break-inside: avoid; } }
      `}</style>
      <article
        className="resume"
        aria-label="Resume"
        style={
          {
            "--accent": data.accent,
            fontFamily: data.serif ? "Georgia, serif" : "Arial, sans-serif",
          } as React.CSSProperties
        }
      >
        {data.sections.map((section, sectionIndex) => (
          <section key={sectionIndex}>
            {section.title && <h2>{section.title}</h2>}
            {section.blocks.map((block, blockIndex) =>
              block.kind === "heading" ? (
                <h1 key={blockIndex}>{block.text}</h1>
              ) : (
                <p key={blockIndex} className={block.kind}>
                  {block.text}
                </p>
              ),
            )}
          </section>
        ))}
      </article>
    </>
  );
}
