import { useId } from "react";
import { Link } from "react-router";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUpRight, Globe2, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { uiLanguages } from "../i18n/resources";
import { useInterfaceLocale } from "../i18n/useInterfaceLocale";
import { publicPath } from "../i18n/public-locale";
import { usePublicSection } from "./usePublicSection";
import { Button, buttonVariants } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useBrandMotion } from "./useBrandMotion";
import styles from "./Public.module.css";
import brand from "./Brand.module.css";

export function BrandIcon({
  size = 36,
  decorative = false,
}: {
  size?: number;
  decorative?: boolean;
}) {
  return (
    <img
      className={brand.mark}
      src="/favicon-64.png"
      srcSet="/favicon-64.png 64w, /brand/resumi-icon-192.png 192w"
      sizes={`${size}px`}
      width={size}
      height={size}
      alt={decorative ? "" : "ResumI"}
      aria-hidden={decorative || undefined}
      decoding="async"
      draggable={false}
    />
  );
}
export function Brand() {
  const { t, i18n } = useTranslation();
  const { root, play } = useBrandMotion();
  return (
    <Link
      ref={root}
      to={publicPath(i18n.language)}
      className={brand.brand}
      aria-label={t("site.brandHome")}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") play();
      }}
      onFocus={play}
      onClick={play}
    >
      <BrandIcon decorative />
      <span className={brand.wordmark} aria-hidden="true">
        {"ResumI".split("").map((character, index) => (
          <span
            key={index}
            data-brand-letter
            className={`${brand.letter} ${character === "I" ? brand.brandI : ""}`}
          >
            <span className={brand.measure}>{character}</span>
            <span data-brand-glyph className={brand.glyph} />
          </span>
        ))}
      </span>
    </Link>
  );
}
export function PublicHeader() {
  const { t, i18n } = useTranslation();
  const activeSection = usePublicSection();
  const reducedMotion = useReducedMotion();
  const navigationId = useId();
  const links = [
    {
      id: "how-it-works",
      to: `${publicPath(i18n.language)}#how-it-works`,
      label: t("site.publicHowItWorks"),
    },
    {
      id: "templates",
      to: `${publicPath(i18n.language)}#templates`,
      label: t("site.publicTemplates"),
    },
  ];
  return (
    <header id="top" tabIndex={-1} className={styles.header}>
      <nav
        className={styles.navigation}
        aria-label={t("site.publicNavigation")}
      >
        <Brand />
        <span className={styles.divider} aria-hidden="true" />
        <LayoutGroup id={navigationId}>
          <div className={styles.desktopLinks}>
            {links.map(({ id, to, label }) => (
              <Link
                key={to}
                to={to}
                className={styles.navLink}
                aria-current={activeSection === id ? "location" : undefined}
              >
                {label}
                {activeSection === id && (
                  <motion.span
                    className={styles.activeIndicator}
                    layoutId="active-section"
                    data-active-section={id}
                    aria-hidden="true"
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 460, damping: 36 }
                    }
                  />
                )}
              </Link>
            ))}
          </div>
        </LayoutGroup>
        <Link
          to={publicPath(i18n.language, "templates")}
          prefetch="intent"
          className={`${buttonVariants()} ${styles.createButton}`}
        >
          {t("site.createResume")} <ArrowRight size={16} aria-hidden />
        </Link>
        <div className={styles.mobileMenu}>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon" />}
              aria-label={t("site.openNavigation")}
              className={styles.menuTrigger}
            >
              <Menu size={19} aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={13}
              className={styles.mobileLinks}
            >
              {links.map(({ id, to, label }) => (
                <DropdownMenuItem
                  key={to}
                  render={
                    <Link
                      to={to}
                      aria-current={
                        activeSection === id ? "location" : undefined
                      }
                    />
                  }
                  className={styles.mobileLink}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
}
export function PublicFooter() {
  const reduced = useReducedMotion();
  const { t, i18n } = useTranslation();
  const changeLocale = useInterfaceLocale();
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerRow}>
          <div className={styles.footerIdentity}>
            <Brand />
            <a href="https://plinka.eu" className={styles.attribution}>
              {t("footer.byPlinka")} <ArrowUpRight size={14} aria-hidden />
            </a>
          </div>
          <nav aria-label={t("footer.navigation")}>
            <Link to={`${publicPath(i18n.language)}#how-it-works`}>
              {t("site.publicHowItWorks")}
            </Link>
            <Link to={publicPath(i18n.language, "templates")} prefetch="intent">
              {t("dashboard.templates")}
            </Link>
          </nav>
        </div>
        <div className={styles.footerBottom}>
          <div className={styles.language}>
            <Globe2 size={15} aria-hidden />
            <Select
              value={i18n.language}
              items={uiLanguages.map(({ code, name }) => ({
                value: code,
                label: name,
              }))}
              onValueChange={(locale) => {
                if (locale) changeLocale(locale);
              }}
            >
              <SelectTrigger
                className={styles.languageTrigger}
                aria-label={t("settings.language")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                align="start"
                alignItemWithTrigger={false}
                className={styles.languagePopup}
              >
                {uiLanguages.map(({ code, name }) => (
                  <SelectItem key={code} value={code}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <a
            href="#top"
            className={styles.backToTop}
            onClick={(event) => {
              if (
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
              )
                return;
              event.preventDefault();
              document.getElementById("top")?.focus({ preventScroll: true });
              window.scrollTo({
                top: 0,
                behavior: reduced ? "instant" : "smooth",
              });
            }}
          >
            {t("site.backToTop")} <ArrowUpRight size={16} aria-hidden />
          </a>
        </div>
      </div>
      <div className={styles.wordmarkClip}>
        <a
          href="#top"
          className={styles.footerWordmark}
          aria-label={t("footer.backToTop")}
          onClick={(event) => {
            if (
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey
            )
              return;
            event.preventDefault();
            document.getElementById("top")?.focus({ preventScroll: true });
            window.scrollTo({
              top: 0,
              behavior: reduced ? "instant" : "smooth",
            });
          }}
        >
          <span aria-hidden="true">Resumi</span>
        </a>
      </div>
    </footer>
  );
}
