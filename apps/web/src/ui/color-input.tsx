import { lazy, Suspense, useId, useState, type HTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Field, type FieldProps } from "./input";
import styles from "./color-input.module.css";
const PickerPanel = lazy(() =>
  import("./color-picker-panel").then((module) => ({
    default: module.PickerPanel,
  })),
);
type ColorInputProps = Omit<FieldProps, "rightSection"> & {
  value: string;
  onChange?: (value: string) => void;
  onChangeEnd?: (value: string) => void;
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
  const id = useId(),
    [draft, setDraft] = useState(value),
    [open, setOpen] = useState(false);
  const accessibleLabel =
    ariaLabel ?? (typeof label === "string" ? label : "Color");
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
          <ChevronDown size={12} aria-hidden />
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={7}
          className={styles.popup}
          aria-label={accessibleLabel}
        >
          <Suspense
            fallback={
              <span
                className={styles.loading}
                role="status"
                aria-label="Loading colors"
              />
            }
          >
            {open && (
              <PickerPanel
                label={accessibleLabel}
                value={draft}
                alpha={/^#[0-9a-f]{8}$/i.test(value)}
                swatches={swatches}
                change={setDraft}
                commit={(color) => {
                  onChange?.(color);
                  onChangeEnd?.(color);
                }}
              />
            )}
          </Suspense>
        </PopoverContent>
      </Popover>
    </Field>
  );
}
