import { Popover } from "@/components/ui/popover";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { EMPTY_COLOR } from "./channels";
import {
  assignRef,
  ColorPickerContext,
  ColorPickerContextValue,
  ColorPickerProps,
} from "./context";
import { ColorPickerTrigger } from "./display";
import { formatColor, mergeColorPickerI18n } from "./format";
import { parseColor } from "./parse";
import { ColorPickerContent } from "./surface";
import { ColorPickerColor, ColorPickerFormat } from "./types";

export function ColorPicker({
  value,
  defaultValue = null,
  onValueChange,
  onValueCommit,
  onValueCancel,
  format = "hex",
  alpha = false,
  swatches,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  readOnly = false,
  invalid = false,
  name,
  form,
  required = false,
  inputRef,
  id: idProp,
  "aria-label": label,
  "aria-labelledby": labelledBy,
  "aria-describedby": describedBy,
  i18n: i18nProp,
  placeholder,
  className,
  children,
}: ColorPickerProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  /* What a form reset restores, as a native field returns to its default. */
  const [initialValue] = useState(defaultValue);
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  const raw = (value !== undefined ? value : uncontrolled) || null;

  /* The channels behind the value, kept in the space they were edited in. A
     value from outside is parsed afresh; one this picker emitted keeps its
     channels, so the hue of a gray and an OKLCH chroma survive. */
  const [held, setHeld] = useState(() => ({
    value: raw,
    color: parseColor(raw),
  }));
  let color = held.color;
  if (held.value !== raw) {
    color = parseColor(raw);
    setHeld({ value: raw, color });
  }
  if (color && !alpha && color.alpha !== 1) color = { ...color, alpha: 1 };
  const display = color ?? EMPTY_COLOR;

  const latest = useRef({ value: raw, color: display });
  useLayoutEffect(() => {
    latest.current = { value: raw, color: display };
  });
  const interaction = useRef<{
    from: string | null;
    color: ColorPickerColor;
  } | null>(null);
  const focusTarget = useRef<HTMLElement | null>(null);
  const fieldRef = useRef<HTMLInputElement | null>(null);
  const resetRef = useRef(() => {});
  const i18n = mergeColorPickerI18n(i18nProp);
  const editable = !disabled && !readOnly;

  const setOpen = (next: boolean) => {
    if (next && disabled) return;
    if (openProp === undefined) setOpenState(next);
    onOpenChange?.(next);
  };

  const canonical = (text: string | null) => {
    const parsed = parseColor(text);
    if (!parsed) return null;
    return formatColor(alpha ? parsed : { ...parsed, alpha: 1 }, format);
  };

  const emit = (next: ColorPickerColor | null) => {
    if (!editable) return;
    const normalized = next && !alpha ? { ...next, alpha: 1 } : next;
    const nextValue = normalized ? formatColor(normalized, format) : null;
    const previous = latest.current.value;
    /* The same color written another way, `#FF0000` for `#ff0000`, keeps its
       string: no change is emitted that nobody made. */
    const same = nextValue === previous || nextValue === canonical(previous);
    const kept = same ? previous : nextValue;
    latest.current = { value: kept, color: normalized ?? EMPTY_COLOR };
    setHeld({ value: kept, color: normalized });
    if (same) return;
    if (value === undefined) setUncontrolled(nextValue);
    onValueChange?.(nextValue);
  };

  const startInteraction = () => {
    interaction.current = {
      from: latest.current.value,
      color: latest.current.color,
    };
  };

  const endInteraction = () => {
    const started = interaction.current;
    interaction.current = null;
    if (started && started.from !== latest.current.value) {
      onValueCommit?.(latest.current.value);
    }
  };
  const cancelInteraction = () => {
    const started = interaction.current;
    interaction.current = null;
    if (!started) return;
    const changed = latest.current.value !== started.from;
    latest.current = { value: started.from, color: started.color };
    setHeld({
      value: started.from,
      color: started.from === null ? null : started.color,
    });
    if (value === undefined) setUncontrolled(started.from);
    if (changed) onValueChange?.(started.from);
    onValueCancel?.();
  };

  /* The fields report the format they show, so a copy takes what is seen. */
  const [fieldsFormat, setFieldsFormat] = useState<ColorPickerFormat | null>(
    null,
  );
  const shownFormat = fieldsFormat ?? format;
  const [copied, setCopied] = useState<ColorPickerFormat | null>(null);
  const copiedTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(copiedTimer.current), []);

  const context: ColorPickerContextValue = {
    id,
    value: raw,
    text: color
      ? format === "hex"
        ? formatColor(color, format).toUpperCase()
        : formatColor(color, format)
      : null,
    color,
    display,
    format,
    alpha,
    i18n,
    disabled,
    readOnly,
    editable,
    invalid,
    required,
    label,
    labelledBy,
    describedBy,
    swatches,
    open,
    setOpen,
    getColor: () => latest.current.color,
    emit,
    startInteraction,
    endInteraction,
    cancelInteraction,
    change: (next) => {
      startInteraction();
      emit(next);
      endInteraction();
    },
    registerFocusTarget: (node) => {
      if (node) focusTarget.current = node;
    },
    shownFormat,
    fieldsFormat,
    setFieldsFormat,
    copy: (to = shownFormat) => {
      if (!color) return;
      navigator.clipboard?.writeText(formatColor(color, to)).then(
        () => {
          setCopied(to);
          window.clearTimeout(copiedTimer.current);
          copiedTimer.current = window.setTimeout(() => setCopied(null), 1500);
        },
        /* No clipboard permission: nothing was copied, nothing to confirm. */
        () => {},
      );
    },
    copied,
  };

  useEffect(() => {
    resetRef.current = () => context.change(parseColor(initialValue));
  });

  /* Listens on the field's own root and asks for its form at reset time, so a
     `form` attribute is honoured. The restore waits a task, like a native
     reset's default action, because any listener may still cancel it. */
  const hasField = !!name || required;
  useEffect(() => {
    const root = fieldRef.current?.getRootNode();
    if (!root) return;
    let pending = 0;
    const onReset = (event: Event) => {
      if (event.target !== fieldRef.current?.form) return;
      pending = window.setTimeout(() => {
        if (!event.defaultPrevented) resetRef.current();
      });
    };
    root.addEventListener("reset", onReset, true);
    return () => {
      root.removeEventListener("reset", onReset, true);
      window.clearTimeout(pending);
    };
  }, [hasField]);

  return (
    <ColorPickerContext.Provider value={context}>
      <Popover open={open} onOpenChange={(next) => setOpen(next)}>
        {children === undefined ? (
          <>
            <ColorPickerTrigger
              className={className}
              placeholder={placeholder}
            />
            <ColorPickerContent />
          </>
        ) : (
          children
        )}
      </Popover>
      <span role="status" className="sr-only">
        {copied ? i18n.labels.copied : ""}
      </span>
      {hasField && (
        <input
          ref={(node) => {
            fieldRef.current = node;
            assignRef(inputRef, node);
          }}
          type="text"
          name={name}
          form={form}
          required={required && !readOnly}
          disabled={disabled}
          value={color ? formatColor(color, format) : ""}
          onChange={() => {}}
          tabIndex={-1}
          aria-hidden="true"
          data-slot="color-picker-field"
          /* A failed `required` check focuses this field; hand that to the control. */
          onFocus={(event) => {
            const target =
              (focusTarget.current?.isConnected ? focusTarget.current : null) ??
              event.currentTarget.ownerDocument.getElementById(`${id}-area`);
            if (target) target.focus();
            else event.currentTarget.blur();
          }}
          className="pointer-events-none absolute size-px max-w-px opacity-0"
        />
      )}
    </ColorPickerContext.Provider>
  );
}
