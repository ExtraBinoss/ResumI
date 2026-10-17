import {
  lazy,
  Suspense,
  useEffect,
  useEffectEvent,
  useId,
  useState,
  type HTMLAttributes,
} from "react";
import { Button } from "../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Field, type FieldProps } from "./input";
import styles from "./color-input.module.css";
import { SharedLoading } from "../components/SharedLoading";
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
  const id = useId(),
    [draft, setDraft] = useState(value),
    [open, setOpen] = useState(false);
  const accessibleLabel =
    ariaLabel ?? (typeof label === "string" ? label : "Color");
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
