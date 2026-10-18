import type { CSSProperties, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ThinkingOrb, type OrbVariant } from "./ThinkingOrb";
import styles from "./SharedLoading.module.css";

/** One visible, accessible loading treatment for routes, previews and compact controls. */
export function SharedLoading({
  label,
  messageKey = "loading.generic",
  page = false,
  compact = false,
  iconOnly = false,
  variant = "breathing",
  className = "",
  iconSize,
  style,
}: {
  label?: string;
  messageKey?: string;
  page?: boolean;
  compact?: boolean;
  iconOnly?: boolean;
  variant?: OrbVariant;
  className?: string;
  iconSize?: number;
  style?: CSSProperties;
}) {
  const { t } = useTranslation();
  const text = label ?? t(messageKey);
  return (
    <div
      className={`${styles.loading} ${page ? styles.page : ""} ${compact ? styles.compact : ""} ${className}`}
      style={style}
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-loading-state={variant}
    >
      <ThinkingOrb
        variant={variant}
        size={compact ? 20 : 64}
        speed={variant === "breathing" ? 0.6 : 0.8}
        style={iconSize ? { width: iconSize, height: iconSize } : undefined}
      />
      {page ? (
        <h1 className={styles.label}>{text}</h1>
      ) : (
        <span className={iconOnly ? "srOnly" : styles.label}>{text}</span>
      )}
    </div>
  );
}

/** Same shimmer for a genuinely busy control whose label already names the action. */
export function LoadingLabel({ children }: { children: ReactNode }) {
  return (
    <span className={`${styles.label} ${styles.controlLabel}`}>{children}</span>
  );
}
