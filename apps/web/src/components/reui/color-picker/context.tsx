// Imported with shadcn CLI from ReUI's Base UI registry (MIT); split by responsibility.
import type { ReactNode, Ref } from "react";
import { createContext, useContext } from "react";
import { parseColor } from "./parse";
import {
  ColorPickerColor,
  ColorPickerFormat,
  ColorPickerI18nConfig,
  ColorPickerI18nOverrides,
} from "./types";

export type ColorPickerContextValue = {
  id: string;
  value: string | null;
  /** The color written in `format` for display, hex in capitals, or `null`. */
  text: string | null;
  /** The committed color, or `null` while empty. */
  color: ColorPickerColor | null;
  /** What the controls show: the color, or white while empty. */
  display: ColorPickerColor;
  format: ColorPickerFormat;
  alpha: boolean;
  i18n: ColorPickerI18nConfig;
  disabled: boolean;
  readOnly: boolean;
  editable: boolean;
  invalid: boolean;
  required: boolean;
  label: string | undefined;
  labelledBy: string | undefined;
  describedBy: string | undefined;
  swatches: string[] | undefined;
  open: boolean;
  setOpen: (open: boolean) => void;
  /** The latest color, for handlers that fire before the next render. */
  getColor: () => ColorPickerColor;
  /** Changes the value mid-interaction; `onValueCommit` waits for the end. */
  emit: (color: ColorPickerColor | null) => void;
  startInteraction: () => void;
  endInteraction: () => void;
  /** A whole interaction in one: emits and commits. */
  change: (color: ColorPickerColor | null) => void;
  /** The trigger or the input: where a failed `required` check sends focus. */
  registerFocusTarget: (node: HTMLElement | null) => void;
  /** The format on screen: the fields' when they are shown, else `format`. */
  shownFormat: ColorPickerFormat;
  fieldsFormat: ColorPickerFormat | null;
  setFieldsFormat: (format: ColorPickerFormat | null) => void;
  /** Writes the value to the clipboard, in the format on screen by default. */
  copy: (format?: ColorPickerFormat) => void;
  /** The format just copied, for 1.5 seconds, so its button can confirm. */
  copied: ColorPickerFormat | null;
};

export const ColorPickerContext = createContext<ColorPickerContextValue | null>(
  null,
);

export const SurfaceContext = createContext<"inline" | "popup">("inline");

export function useColorPickerContext(part: string) {
  const context = useContext(ColorPickerContext);
  if (!context) throw new Error(`${part} must be used within a ColorPicker`);
  return context;
}

export type ColorPickerApi = {
  /** The value as emitted, or `null`. */
  value: string | null;
  color: ColorPickerColor | null;
  format: ColorPickerFormat;
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Commits any color `parseColor` reads; `null` or `""` clears, anything else is ignored. */
  setValue: (value: string | null) => void;
  clear: () => void;
};

export function useColorPicker(): ColorPickerApi {
  const context = useColorPickerContext("useColorPicker");
  return {
    value: context.value,
    color: context.color,
    format: context.format,
    open: context.open,
    setOpen: context.setOpen,
    setValue: (value) => {
      if (!value) return context.change(null);
      const parsed = parseColor(value);
      if (parsed) context.change(parsed);
    },
    clear: () => context.change(null),
  };
}

export function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") ref(node);
  else if (ref) ref.current = node;
}

export type ColorPickerProps = {
  /** Controlled value: any color `parseColor` reads. `null` is empty. */
  value?: string | null;
  defaultValue?: string | null;
  /** Fires on every change, a drag included, with the value in `format`. */
  onValueChange?: (value: string | null) => void;
  /** Fires once an interaction ends: a drag released, a key, a field, a swatch. */
  onValueCommit?: (value: string | null) => void;
  /** How the value is written. */
  format?: ColorPickerFormat;
  /** Adds the opacity slider and field, and lets the value carry alpha. */
  alpha?: boolean;
  /** Preset colors under the default panel. */
  swatches?: string[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  /** Submits the value with a native form under this name. */
  name?: string;
  form?: string;
  required?: boolean;
  /** The hidden form field, for form libraries that focus a field on error. */
  inputRef?: Ref<HTMLInputElement>;
  /** Lands on the trigger or the input. */
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  i18n?: ColorPickerI18nOverrides;
  /** Without children the picker renders a trigger and a popover; these reach the trigger. */
  placeholder?: string;
  className?: string;
  children?: ReactNode;
};
