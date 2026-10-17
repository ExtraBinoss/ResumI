import {
  useId,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import { Input } from "../components/ui/input";
import { Field, type TextInputProps } from "./input";
import { classes } from "./shared";
import styles from "./number-input.module.css";

export type NumberInputProps = Omit<
  TextInputProps,
  "onChange" | "value" | "defaultValue" | "type" | "ref"
> & {
  value?: string | number;
  defaultValue?: number;
  onChange?: (value: string | number) => void;
  /** Transient preview only; null restores the canonical document. */
  onPreview?: (value: number | null) => void;
  scrubLabel?: ReactNode;
  suffix?: string;
  unit?: string;
  hideControls?: boolean;
  decimalScale?: number;
  snapPoints?: readonly number[];
  snapThreshold?: number;
};

/** A single field with a scrub handle, native number editing and a quiet unit. */
export function NumberInput({
  value,
  defaultValue,
  onChange,
  onPreview,
  label,
  scrubLabel,
  suffix,
  unit,
  hideControls: _hideControls,
  decimalScale = 2,
  snapPoints,
  snapThreshold = 2,
  className,
  rightSection,
  leftSection: _left,
  description,
  error,
  size = "sm",
  id: givenId,
  styles: overrides,
  mt,
  mb,
  ml,
  mr,
  mx,
  my,
  w,
  h,
  style,
  ...props
}: NumberInputProps) {
  const generated = useId(),
    id = givenId ?? generated;
  const input = useRef<HTMLInputElement>(null);
  const gesture = useRef<{
    x: number;
    value: number;
    next: number;
    moved: boolean;
  } | null>(null);
  const [draft, setDraft] = useState<number | null>(null);
  const caption = scrubLabel ?? label ?? props["aria-label"] ?? "Value";
  const accessibleLabel =
    props["aria-label"] ?? (typeof label === "string" ? label : "Value");
  const step = props.step === "any" ? 0.1 : Number(props.step ?? 1);
  function bounded(next: number) {
    return Math.min(
      Number(props.max ?? Infinity),
      Math.max(Number(props.min ?? -Infinity), next),
    );
  }
  function start(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0 || props.disabled || props.readOnly) return;
    event.preventDefault();
    const initial = Number(input.current?.value || 0);
    gesture.current = {
      x: event.clientX,
      value: initial,
      next: initial,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function move(event: PointerEvent<HTMLButtonElement>) {
    const active = gesture.current;
    if (!active) return;
    const distance = event.clientX - active.x;
    if (!active.moved && Math.abs(distance) < 3) return;
    active.moved = true;
    const precision = 10 ** decimalScale;
    let next = bounded(
      Math.round(
        (active.value + distance * step * (event.shiftKey ? 2 : 0.2)) / step,
      ) * step,
    );
    const snapped = snapPoints?.find(
      (point) => Math.abs(point - next) <= snapThreshold,
    );
    next = Math.round((snapped ?? next) * precision) / precision;
    active.next = next;
    setDraft(next);
    onPreview?.(next);
  }
  function finish(event: PointerEvent<HTMLButtonElement>, cancel = false) {
    const active = gesture.current;
    if (!active) return;
    gesture.current = null;
    onPreview?.(null);
    setDraft(null);
    if (!cancel && active.moved && active.next !== active.value)
      onChange?.(active.next);
    if (!active.moved && !cancel) input.current?.focus();
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }
  return (
    <Field
      {...{ id, description, error, mt, mb, ml, mr, mx, my, w, h, style }}
      className={classes(styles.field, className)}
    >
      <div
        className={styles.control}
        data-size={size}
        data-disabled={props.disabled || undefined}
        data-dragging={draft !== null || undefined}
      >
        <button
          type="button"
          className={styles.scrub}
          tabIndex={-1}
          disabled={props.disabled || props.readOnly}
          aria-label={`Adjust ${accessibleLabel}`}
          title="Drag to adjust · Shift for larger steps"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={finish}
          onPointerCancel={(event) => finish(event, true)}
          onLostPointerCapture={(event) => finish(event, true)}
        >
          {caption}
        </button>
        <Input
          {...props}
          id={id}
          ref={input}
          type="number"
          inputMode="decimal"
          data-ui="input"
          data-number
          aria-label={accessibleLabel}
          aria-invalid={!!error || undefined}
          className={styles.input}
          style={overrides?.input}
          value={draft ?? value}
          defaultValue={value === undefined ? defaultValue : undefined}
          onChange={(event) =>
            onChange?.(
              event.currentTarget.value === ""
                ? ""
                : event.currentTarget.valueAsNumber,
            )
          }
          onKeyDown={(event) => {
            props.onKeyDown?.(event);
            if (
              !event.defaultPrevented &&
              event.shiftKey &&
              (event.key === "ArrowUp" || event.key === "ArrowDown")
            ) {
              event.preventDefault();
              onChange?.(
                bounded(
                  Number(event.currentTarget.value) +
                    (event.key === "ArrowUp" ? 10 : -10) * step,
                ),
              );
            }
          }}
        />
        <span className={styles.unit} aria-hidden>
          {unit ?? suffix ?? rightSection ?? "—"}
        </span>
      </div>
    </Field>
  );
}
