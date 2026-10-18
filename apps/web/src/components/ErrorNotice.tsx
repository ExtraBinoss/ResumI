import { useState, type ReactNode } from "react";
import { Check, Copy, TriangleAlert, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import styles from "./ErrorNotice.module.css";

export function errorDetails(error: unknown): string {
  if (error == null || error === false) return "";
  if (error instanceof Error) return error.stack || error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error, null, 2) ?? String(error);
  } catch {
    return String(error);
  }
}

export function CopyErrorButton({ details }: { details: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const { t } = useTranslation();
  return (
    <span className={styles.copyAction}>
      <Button
        variant="ghost"
        size="xs"
        aria-label={t(copied ? "site.errors.copied" : "site.errors.copy")}
        onClick={() => {
          void (async () => {
            try {
              await navigator.clipboard.writeText(details);
              setCopied(true);
              setFailed(false);
            } catch {
              setFailed(true);
            }
          })();
        }}
      >
        {copied ? (
          <Check size={16} aria-hidden />
        ) : (
          <Copy size={16} aria-hidden />
        )}
        {copied ? t("site.errors.copiedShort") : t("site.errors.copyShort")}
      </Button>
      {failed && <span role="status">{t("site.errors.copyManually")}</span>}
    </span>
  );
}

export function ErrorMessage({
  error,
  label,
  children,
}: {
  error: unknown;
  label?: string;
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  const details = errorDetails(error);
  if (!details) return null;
  return (
    <div role="alert" className={styles.message}>
      <div className={styles.messageHeading}>
        <TriangleAlert size={17} aria-hidden />
        <strong>{label ?? t("site.errors.default")}</strong>
        <CopyErrorButton key={details} details={details} />
      </div>
      <pre tabIndex={0}>{details}</pre>
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  );
}

/** Quiet when healthy; the same details/copy affordance works in alerts and popovers. */
export function ErrorNotice({
  error,
  label,
  compact = false,
  children,
}: {
  error: unknown;
  label?: string;
  compact?: boolean;
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  const errorLabel = label ?? t("site.errors.default");
  const details = errorDetails(error);
  if (!details) return null;
  if (!compact)
    return (
      <ErrorMessage error={error} label={errorLabel}>
        {children}
      </ErrorMessage>
    );
  return (
    <Popover>
      <PopoverTrigger
        openOnHover
        delay={150}
        closeDelay={180}
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            className={styles.indicator}
            aria-label={errorLabel}
          >
            <TriangleAlert size={17} aria-hidden />
          </Button>
        }
      />
      <PopoverContent
        className={styles.popup}
        side="bottom"
        align="end"
        sideOffset={8}
      >
        <ErrorMessage error={error} label={errorLabel}>
          {children}
        </ErrorMessage>
      </PopoverContent>
    </Popover>
  );
}

export function ErrorToast({
  error,
  label,
  onDismiss,
}: {
  error: unknown;
  label: string;
  onDismiss: () => void;
}) {
  const reduced = useReducedMotion();
  const { t } = useTranslation();
  const details = errorDetails(error);
  return (
    <AnimatePresence>
      {details && (
        <motion.div
          role="alert"
          className={styles.toast}
          initial={{ opacity: 0, y: reduced ? 0 : -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduced ? 0 : -4 }}
          transition={{ duration: reduced ? 0 : 0.16 }}
        >
          <ErrorNotice error={error} label={label} compact />
          <span>{label}</span>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={t("site.errors.dismiss")}
            onClick={onDismiss}
          >
            <X size={16} aria-hidden />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
