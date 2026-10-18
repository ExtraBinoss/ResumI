import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigation } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUpRight, Check, Copy } from "lucide-react";
import { PublicFooter, PublicHeader } from "../../components/Brand";
import {
  Button as IconButton,
  buttonVariants,
} from "../../components/ui/button";
import { AgentBrands } from "./AgentBrands";
import { Faq } from "./Faq";
import {
  TemplateShowcase,
  thumbnail,
  type LandingTemplate,
} from "./TemplateShowcase";
import { publicPath } from "../../i18n/public-locale";
import styles from "./Landing.module.css";

const commands = [
  "bun run resumi new --template react-studio --out resume.json",
  "bun run resumi output resume.json --format source --out Resume.tsx",
  "bun run resumi document source resume.json --file Resume.tsx --out resume.json",
  "bun run resumi document validate resume.json",
];

function CliWorkflow() {
  const { t } = useTranslation();
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  async function copyCommands() {
    try {
      await navigator.clipboard.writeText(commands.join("\n"));
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  }
  return (
    <div className={styles.terminal}>
      <div className={styles.terminalHeader}>
        <span className={styles.windowDots} aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span>{t("site.landing.cliLabel")}</span>
        <IconButton
          variant="ghost"
          size="icon-sm"
          className={styles.copyButton}
          onClick={() => void copyCommands()}
          aria-label={t(
            copyStatus === "copied"
              ? "site.landing.commandsCopied"
              : "site.landing.copyCommands",
          )}
        >
          {copyStatus === "copied" ? (
            <Check size={15} aria-hidden />
          ) : (
            <Copy size={15} aria-hidden />
          )}
        </IconButton>
      </div>
      <pre className={styles.commands} aria-label={t("site.landing.cliLabel")}>
        {commands.map((command) => (
          <code key={command}>
            <span aria-hidden>$ </span>
            {command}
            {"\n"}
          </code>
        ))}
      </pre>
      <span className={styles.copyStatus} role="status">
        {copyStatus === "copied"
          ? t("site.landing.commandsCopied")
          : copyStatus === "failed"
            ? t("site.landing.copyFailed")
            : ""}
      </span>
    </div>
  );
}

export function Landing({ templates }: { templates: LandingTemplate[] }) {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const reducedMotion = useReducedMotion();
  const heroIds = ["react-blueprint", "react-cassette", "react-botanica"];
  const heroTemplates = heroIds.flatMap((id) =>
    templates.filter((template) => template.id === id),
  );
  return (
    <div className={styles.page}>
      <PublicHeader />
      <main>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <h1>{t("site.landing.headline")}</h1>
            <div className={styles.actions}>
              <Link
                to={publicPath(i18n.language, "templates")}
                prefetch="intent"
                className={`${buttonVariants({ size: "lg" })} ${styles.primaryAction}`}
                aria-busy={
                  navigation.state !== "idle" &&
                  navigation.location?.pathname.endsWith("/templates")
                }
              >
                {t("site.landing.createResume")}
                <ArrowRight size={17} aria-hidden />
              </Link>
              <Link
                to={publicPath(i18n.language, "templates")}
                prefetch="intent"
                className={styles.textLink}
              >
                {t("site.landing.exploreTemplates")}
                <ArrowUpRight size={17} aria-hidden />
              </Link>
            </div>
          </div>
          <div className={styles.agents}>
            <AgentBrands />
          </div>
          <div className={styles.heroGallery}>
            <div className={styles.heroGlow} aria-hidden />
            {heroTemplates.map((template, index) => (
              <motion.img
                key={template.id}
                src={thumbnail(template)}
                alt={
                  index === 1
                    ? t("site.landing.templatePreview", { name: template.name })
                    : ""
                }
                aria-hidden={index !== 1 || undefined}
                className={styles.heroPaper}
                data-position={index - 1}
                width={440}
                height={622}
                initial={false}
                whileHover={reducedMotion ? undefined : { y: -8 }}
                transition={{
                  duration: reducedMotion ? 0 : 0.35,
                  ease: "easeOut",
                }}
                fetchPriority={index === 1 ? "high" : "auto"}
                decoding="async"
              />
            ))}
          </div>
        </section>
        <section
          id="how-it-works"
          className={styles.workflow}
          aria-labelledby="workflow-heading"
        >
          <h2 id="workflow-heading">{t("site.landing.workflowTitle")}</h2>
          <div className={styles.workflowGrid}>
            <div className={styles.workflowSteps}>
              <div className={styles.step}>
                <span className={styles.stepNumber} aria-hidden>
                  01
                </span>
                <div>
                  <h3>{t("site.landing.workflowCodeTitle")}</h3>
                  <p>{t("site.landing.workflowCodeDescription")}</p>
                </div>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber} aria-hidden>
                  02
                </span>
                <div>
                  <h3>{t("site.landing.workflowEditTitle")}</h3>
                  <p>{t("site.landing.workflowEditDescription")}</p>
                  <Link to="/projects" className={styles.textLink}>
                    {t("site.landing.openWorkspace")}
                    <ArrowUpRight size={16} aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
            <CliWorkflow />
          </div>
        </section>
        <section
          id="templates"
          className={styles.templates}
          aria-labelledby="templates-heading"
        >
          <div className={styles.sectionHeading}>
            <h2 id="templates-heading">{t("site.landing.templatesTitle")}</h2>
            <Link
              to={publicPath(i18n.language, "templates")}
              prefetch="intent"
              className={styles.textLink}
            >
              {t("site.landing.browseTemplates")}
              <ArrowUpRight size={17} aria-hidden />
            </Link>
          </div>
          <TemplateShowcase templates={templates} />
        </section>
        <Faq />
      </main>
      <PublicFooter />
    </div>
  );
}
