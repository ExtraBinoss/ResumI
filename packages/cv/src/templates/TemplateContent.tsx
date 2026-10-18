import type { ResumeSection } from "./types";

// Vetted Lucide paths (ISC); the portable template embeds its licenses with the font.
function ContactIcon({
  type,
}: {
  type: "mail" | "location" | "web" | "phone";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {type === "mail" ? (
        <>
          <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
          <rect x="2" y="4" width="20" height="16" rx="2" />
        </>
      ) : type === "location" ? (
        <>
          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
          <circle cx="12" cy="10" r="3" />
        </>
      ) : type === "web" ? (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
        </>
      ) : (
        <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
      )}
    </svg>
  );
}
export function Contacts({
  values,
  icons = true,
}: {
  values: string[];
  icons?: boolean;
}) {
  return (
    <address className="cv-contacts">
      {values.map((value, index) => {
        const type = value.includes("@")
          ? "mail"
          : /^\+?[\d ()-]{7,}$/.test(value)
            ? "phone"
            : /\.[a-z]{2,}/i.test(value)
              ? "web"
              : "location";
        const href =
          type === "mail"
            ? `mailto:${value}`
            : type === "web"
              ? /^https?:\/\//i.test(value)
                ? value
                : `https://${value}`
              : type === "phone"
                ? `tel:${value.replace(/[^+\d]/g, "")}`
                : undefined;
        return (
          <span key={index}>
            {icons && <ContactIcon type={type} />}
            {href ? <a href={href}>{value}</a> : <span>{value}</span>}
          </span>
        );
      })}
    </address>
  );
}
function entries(section: ResumeSection) {
  const groups: {
    title?: ResumeSection["blocks"][number];
    meta?: ResumeSection["blocks"][number];
    body: ResumeSection["blocks"];
  }[] = [];
  for (const block of section.blocks) {
    if (block.kind === "subtitle") groups.push({ title: block, body: [] });
    else {
      if (!groups.length) groups.push({ body: [] });
      const current = groups[groups.length - 1];
      if (block.kind === "meta" && current.title && !current.meta)
        current.meta = block;
      else current.body.push(block);
    }
  }
  return groups;
}
export function Section({ section }: { section: ResumeSection }) {
  const skills = /skill|competenc|compétenc/i.test(section.title);
  return (
    <section
      className={`cv-section${skills ? " cv-skills-section" : ""}`}
      data-section-id={section.id}
    >
      {section.title && <h2>{section.title}</h2>}
      <div className="cv-section-content">
        {skills ? (
          <ul className="cv-skill-list">
            {section.blocks
              .flatMap((block) => block.text.split(/\s+\/\s+|\n/))
              .filter(Boolean)
              .map((skill, index) => (
                <li key={index}>{skill.trim()}</li>
              ))}
          </ul>
        ) : (
          entries(section).map((entry, index) => (
            <div className="cv-entry" key={index}>
              {(entry.title || entry.meta) && (
                <div className="cv-entry-head">
                  {entry.title && (
                    <h3 data-block-id={entry.title.id}>{entry.title.text}</h3>
                  )}
                  {entry.meta && (
                    <p className="cv-meta" data-block-id={entry.meta.id}>
                      {entry.meta.text}
                    </p>
                  )}
                </div>
              )}
              {entry.body
                .filter((block) => block.kind !== "bullet")
                .map((block, blockIndex) => (
                  <p
                    className={
                      block.kind === "meta" ? "cv-meta" : "cv-paragraph"
                    }
                    data-block-id={block.id}
                    key={blockIndex}
                  >
                    {block.text}
                  </p>
                ))}
              {entry.body.some((block) => block.kind === "bullet") && (
                <ul className="cv-bullets">
                  {entry.body
                    .filter((block) => block.kind === "bullet")
                    .map((block, blockIndex) => (
                      <li data-block-id={block.id} key={blockIndex}>
                        {block.text}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
