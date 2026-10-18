import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";
import { createPreviewQueue } from "../../../lib/preview-queue";
import { googleFontBlob, type FontOption } from "./font-catalog";
import styles from "../styles/FontPicker.module.css";

const previews = createPreviewQueue(googleFontBlob);
/** Only intersecting rows subscribe; leaving/unmounting cancels queued work. */
export function FontSample({ option }: { option: FontOption }) {
  const { t } = useTranslation();
  const sample = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const element = sample.current;
    if (!element || option.source !== "google") return;
    let unsubscribe: (() => void) | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          unsubscribe ??= previews.subscribe(option.label, (loaded) => {
            element.dataset.fontReady = loaded ? "true" : "error";
          });
        } else {
          unsubscribe?.();
          unsubscribe = undefined;
        }
      },
      { root: element.closest('[data-slot="scroll-shadow-viewport"]') },
    );
    observer.observe(element);
    return () => {
      unsubscribe?.();
      observer.disconnect();
    };
  }, [option.label, option.source]);
  return (
    <span
      ref={sample}
      className={styles.sample}
      style={{ fontFamily: option.value }}
      data-font-ready={option.source === "google" ? undefined : "true"}
    >
      <span>{t("properties.fontSample")}</span>
    </span>
  );
}
