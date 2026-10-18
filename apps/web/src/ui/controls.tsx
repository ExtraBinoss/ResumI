import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Slider as ShadcnSlider } from "../components/ui/slider";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { useId, useRef, type ReactNode } from "react";
import { Field, type FieldProps } from "./input";
import { classes, layoutStyle, type LayoutProps, type Size } from "./shared";
import styles from "./ui.module.css";

type SelectItem = string | { value: string; label: string; disabled?: boolean };
type SelectProps = FieldProps & {
  id?: string;
  "aria-label"?: string;
  className?: string;
  contentClassName?: string;
  data: readonly SelectItem[];
  value?: string | null;
  onChange?: (value: string | null) => void;
  onOptionPreview?: (value: string | null) => void;
  disabled?: boolean;
  allowDeselect?: boolean;
  searchable?: boolean;
  placeholder?: string;
};
export function Select({
  id: givenId,
  label,
  description,
  error,
  size = "sm",
  className,
  contentClassName,
  data,
  value,
  onChange,
  onOptionPreview,
  disabled,
  placeholder,
  "aria-label": ariaLabel,
  mt,
  mb,
  ml,
  mr,
  mx,
  my,
  w,
  h,
  style,
}: SelectProps) {
  const generated = useId(),
    id = givenId ?? generated;
  const open = useRef(false);
  function preview(value: string | null) {
    if (open.current) onOptionPreview?.(value);
  }
  return (
    <Field
      {...{
        id,
        label,
        description,
        error,
        className,
        mt,
        mb,
        ml,
        mr,
        mx,
        my,
        w,
        h,
        style,
      }}
    >
      <ShadcnSelect
        value={value ?? ""}
        onValueChange={(next) => {
          open.current = false;
          onOptionPreview?.(null);
          onChange?.(next);
        }}
        onOpenChange={(next) => {
          open.current = next;
          if (!next) onOptionPreview?.(null);
        }}
        disabled={disabled}
        items={data.map((item) =>
          typeof item === "string" ? { value: item, label: item } : item,
        )}
      >
        <SelectTrigger
          id={id}
          aria-label={ariaLabel}
          data-control-size={size}
          data-ui="input"
          className={classes(styles.input, styles.select)}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          align="start"
          alignItemWithTrigger={false}
          sideOffset={5}
          className={classes(styles.selectMenu, contentClassName)}
          onPointerLeave={() => onOptionPreview?.(null)}
        >
          {data.map((item) => {
            const option =
              typeof item === "string" ? { value: item, label: item } : item;
            return (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className={styles.selectItem}
                onPointerEnter={() =>
                  preview(option.disabled ? null : option.value)
                }
                onPointerMove={() =>
                  preview(option.disabled ? null : option.value)
                }
                onFocus={() => preview(option.disabled ? null : option.value)}
              >
                {option.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </ShadcnSelect>
    </Field>
  );
}
type SliderProps = LayoutProps & {
  size?: Size;
  className?: string;
  "aria-label"?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
};
export function Slider({
  onChange,
  onChangeEnd,
  value,
  defaultValue,
  size: _size,
  className,
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
}: SliderProps) {
  return (
    <ShadcnSlider
      {...props}
      value={value === undefined ? undefined : [value]}
      defaultValue={[defaultValue ?? props.min ?? 0]}
      className={classes(styles.slider, className)}
      style={layoutStyle({ mt, mb, ml, mr, mx, my, w, h, style })}
      onValueChange={(values) =>
        onChange?.(typeof values === "number" ? values : values[0])
      }
      onValueCommitted={(values) =>
        onChangeEnd?.(typeof values === "number" ? values : values[0])
      }
    />
  );
}
export function SegmentedControl({
  value,
  onChange,
  data,
  className,
  "aria-label": label,
  size: _size,
}: {
  value: string;
  onChange: (value: string) => void;
  data: { value: string; label: ReactNode }[];
  className?: string;
  "aria-label"?: string;
  size?: Size;
}) {
  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      aria-label={label}
      className={classes(styles.segmented, className)}
    >
      {data.map((item) => (
        <label key={item.value} data-active={value === item.value}>
          <RadioGroupItem
            className={styles.segmentedRadio}
            value={item.value}
          />
          <span>{item.label}</span>
        </label>
      ))}
    </RadioGroup>
  );
}
