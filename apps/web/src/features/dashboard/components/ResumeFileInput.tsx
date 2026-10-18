import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

/** Native Open shortcut retains JSON handoff without a primary Import action. */
export function ResumeFileInput({
  disabled,
  onSelect,
}: {
  disabled: boolean;
  onSelect: (file: File) => void;
}) {
  const { t } = useTranslation();
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    function open(event: KeyboardEvent) {
      if (
        disabled ||
        event.defaultPrevented ||
        event.altKey ||
        event.shiftKey ||
        !(event.ctrlKey || event.metaKey) ||
        event.key.toLowerCase() !== "o" ||
        document.querySelector('[role="dialog"],[role="alertdialog"]')
      )
        return;
      event.preventDefault();
      input.current?.click();
    }
    document.addEventListener("keydown", open);
    return () => document.removeEventListener("keydown", open);
  }, [disabled]);
  return (
    <input
      ref={input}
      hidden
      type="file"
      aria-label={t("dashboard.openFile")}
      accept="application/json,.json"
      disabled={disabled}
      onChange={(event) => {
        const file = event.currentTarget.files?.[0];
        event.currentTarget.value = "";
        if (file) onSelect(file);
      }}
    />
  );
}
