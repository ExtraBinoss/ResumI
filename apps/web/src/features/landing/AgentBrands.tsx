import { useTranslation } from "react-i18next";
import styles from "./AgentBrands.module.css";

const brands = [
  { id: "claude", name: "Claude" },
  { id: "openai", name: "Codex / ChatGPT" },
  { id: "grok", name: "Grok / Grok Bot" },
  { id: "cursor", name: "Cursor" },
  { id: "opencode", name: "OpenCode" },
  { id: "meta", name: "Muse Code" },
] as const;

/** Identification of tools that can work with a local CLI, without claiming a native integration. */
export function AgentBrands() {
  const { t } = useTranslation();
  return (
    <div
      className={styles.brands}
      role="group"
      aria-label={t("site.landing.agentBrandsLabel")}
    >
      {brands.map(({ id, name }) => (
        <span className={styles.brand} key={id}>
          <span className={`${styles.mark} ${styles[id]}`}>
            <img
              src={`/brands/agents/${id}.svg`}
              alt=""
              width="36"
              height="36"
            />
          </span>
          <span>{name}</span>
        </span>
      ))}
    </div>
  );
}
