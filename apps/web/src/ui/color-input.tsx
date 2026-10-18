import {
  lazy,
  Suspense,
  useEffect,
  useEffectEvent,
  useId,
  useState,
  type HTMLAttributes,
} from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Field, type FieldProps } from "./input";
import styles from "./color-input.module.css";
import { SharedLoading } from "../components/SharedLoading";
import { nameColor } from "../components/reui/color-picker/format";
import type { ColorPickerColor } from "../components/reui/color-picker/types";
const loadPicker = () =>
  import("./color-picker-panel").then((module) => ({
    default: module.PickerPanel,
  }));
const PickerPanel = lazy(loadPicker);
type ColorInputProps = Omit<FieldProps, "rightSection"> & {
  value: string;
  onChange?: (value: string) => void;
  onChangeEnd?: (value: string) => void;
  /** Paint a disposable preview; null restores the committed document. */
  onPreview?: (value: string | null) => void;
  format?: string;
  swatches?: string[];
  eyeDropperButtonProps?: HTMLAttributes<HTMLButtonElement>;
  withEyeDropper?: boolean;
  "aria-label"?: string;
  className?: string;
};
/** Keep the registry's full color editor off the initial page/editor dependency path. */
export function ColorInput({
  value,
  onChange,
  onChangeEnd,
  onPreview,
  label,
  description,
  error,
  className,
  size: _size,
  format: _format,
  swatches,
  eyeDropperButtonProps: _eyeDropper,
  withEyeDropper: _withEyeDropper,
  "aria-label": ariaLabel,
  ...layout
}: ColorInputProps) {
  const { t, i18n } = useTranslation();
  const id = useId(),
    [draft, setDraft] = useState(value),
    [open, setOpen] = useState(false);
  const accessibleLabel =
    ariaLabel ?? (typeof label === "string" ? label : t("site.ui.color"));
  const pickerI18n = {
    labels: {
      placeholder: t("site.colorPicker.placeholder"),
      panelLabel: t("site.colorPicker.panelLabel"),
      openPicker: t("site.colorPicker.openPicker"),
      area: t("site.colorPicker.area"),
      hue: t("site.colorPicker.hue"),
      saturation: t("site.colorPicker.saturation"),
      brightness: t("site.colorPicker.brightness"),
      lightness: t("site.colorPicker.lightness"),
      chroma: t("site.colorPicker.chroma"),
      red: t("site.colorPicker.red"),
      green: t("site.colorPicker.green"),
      blue: t("site.colorPicker.blue"),
      alpha: t("site.colorPicker.alpha"),
      hex: t("site.colorPicker.hex"),
      format: t("site.colorPicker.format"),
      eyeDropper: t("site.colorPicker.eyeDropper"),
      copy: t("site.colorPicker.copy"),
      copied: t("site.colorPicker.copied"),
      clear: t("site.colorPicker.clear"),
      swatches: t("site.colorPicker.swatches"),
    },
    functions: {
      getColorName: (color: ColorPickerColor) => {
        if (!i18n.language.startsWith("fr")) return nameColor(color);
        const raw = nameColor(color);
        const exactNames: Record<string, string> = {
          black: "black",
          "dark gray": "darkGray",
          gray: "gray",
          "light gray": "lightGray",
          white: "white",
        };
        const exact = exactNames[raw];
        if (exact) return t(`site.colorNames.${exact}`);
        const tokens = raw.split(" ");
        let shade = "";
        let tone = "";
        if (tokens[0] === "dark" || tokens[0] === "light")
          shade = tokens.shift()!;
        if (tokens[0] === "grayish" || tokens[0] === "vibrant")
          tone = tokens.shift()!;
        const hue = tokens.join(" ");
        const hueNames: Record<string, string> = {
          pink: "pink",
          red: "red",
          orange: "orange",
          yellow: "yellow",
          lime: "lime",
          green: "green",
          cyan: "cyan",
          "sky blue": "skyBlue",
          blue: "blue",
          violet: "violet",
          purple: "purple",
          magenta: "magenta",
          brown: "brown",
          olive: "olive",
        };
        return [
          t(`site.colorNames.${hueNames[hue] ?? "blue"}`),
          tone ? t(`site.colorNames.${tone}`) : "",
          shade ? t(`site.colorNames.${shade}`) : "",
        ]
          .filter(Boolean)
          .join(" ");
      },
    },
  };
  const restorePreview = useEffectEvent(() => onPreview?.(null));
  useEffect(() => () => restorePreview(), []);
  return (
    <Field
      id={id}
      label={label}
      description={description}
      error={error}
      className={className}
      {...layout}
    >
      <Popover
        open={open}
        onOpenChange={(next) => {
          if (next) setDraft(value);
          else onPreview?.(null);
          setOpen(next);
        }}
      >
        <PopoverTrigger
          render={
            <Button
              id={id}
              variant="outline"
              className={styles.trigger}
              aria-label={accessibleLabel}
              data-ui="input"
              onPointerEnter={() => void loadPicker()}
              onFocus={() => void loadPicker()}
              onPointerDown={() => void loadPicker()}
            />
          }
        >
          <span
            aria-hidden
            className={styles.swatch}
            style={{ background: open ? draft : value }}
          />
          <span className={styles.value}>
            {(open ? draft : value).toUpperCase()}
          </span>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={7}
          className={styles.popup}
          aria-label={accessibleLabel}
        >
          <Suspense
            fallback={
              <SharedLoading
                messageKey="loading.colors"
                variant="working"
                className={styles.loading}
              />
            }
          >
            <PickerPanel
              label={accessibleLabel}
              i18n={pickerI18n}
              value={draft}
              alpha={/^#[0-9a-f]{8}$/i.test(value)}
              swatches={swatches}
              change={(color) => {
                onPreview?.(color);
                setDraft(color);
              }}
              commit={(color) => {
                onPreview?.(null);
                onChange?.(color);
                onChangeEnd?.(color);
              }}
              cancel={() => onPreview?.(null)}
            />
          </Suspense>
        </PopoverContent>
      </Popover>
    </Field>
  );
}
