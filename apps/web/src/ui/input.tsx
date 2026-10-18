import {
  useId,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  type TextareaHTMLAttributes,
} from "react";
import { classes, layoutStyle, type LayoutProps, type Size } from "./shared";
import styles from "./ui.module.css";
import { Input } from "../components/ui/input";
import { Textarea as ShadcnTextarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { CopyErrorButton } from "../components/ErrorNotice";

export type FieldProps = LayoutProps & {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  size?: Size;
  leftSection?: ReactNode;
  rightSection?: ReactNode;
  styles?: { input?: CSSProperties };
};
export function Field({
  label,
  description,
  error,
  id,
  children,
  className,
  ...layout
}: FieldProps & { id: string; children: ReactNode; className?: string }) {
  return (
    <div
      className={classes(styles.field, className)}
      style={layoutStyle(layout)}
    >
      {label && (
        <Label data-ui="label" className={styles.label} htmlFor={id}>
          {label}
        </Label>
      )}
      {children}
      {description && <p className={styles.description}>{description}</p>}
      {error && (
        <div role="alert" className={styles.fieldError}>
          <span>{error}</span>
          {typeof error === "string" && <CopyErrorButton details={error} />}
        </div>
      )}
    </div>
  );
}
export type TextInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> &
  FieldProps & { ref?: Ref<HTMLInputElement> };
export function TextInput({
  id: givenId,
  label,
  description,
  error,
  leftSection,
  rightSection,
  size = "sm",
  className,
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
}: TextInputProps) {
  const generated = useId(),
    id = givenId ?? generated;
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
      <div
        className={styles.inputWrap}
        data-size={size}
        data-has-left={!!leftSection}
      >
        {leftSection && <span className={styles.inputIcon}>{leftSection}</span>}
        <Input
          {...props}
          id={id}
          data-ui="input"
          data-size={size}
          className={styles.input}
          style={overrides?.input}
          aria-invalid={!!error || undefined}
        />
        {rightSection && (
          <span className={styles.inputRight} data-ui="input-right">
            {rightSection}
          </span>
        )}
      </div>
    </Field>
  );
}
type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> &
  FieldProps & { autosize?: boolean; minRows?: number; maxRows?: number };
export function Textarea({
  id: givenId,
  label,
  description,
  error,
  size = "sm",
  className,
  styles: overrides,
  autosize,
  minRows,
  maxRows,
  leftSection: _left,
  rightSection: _right,
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
}: TextareaProps) {
  const generated = useId(),
    id = givenId ?? generated;
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
      <ShadcnTextarea
        {...props}
        id={id}
        data-ui="input"
        data-size={size}
        className={classes(styles.input, styles.textarea)}
        rows={minRows ?? props.rows}
        style={{
          fieldSizing: autosize ? "content" : undefined,
          maxHeight: maxRows ? `${maxRows * 1.6 + 1.2}em` : undefined,
          ...overrides?.input,
        }}
      />
    </Field>
  );
}
export function FileButton({
  accept,
  onChange,
  children,
}: {
  accept?: string;
  onChange: (file: File | null) => void;
  children: (props: { onClick: () => void }) => ReactNode;
}) {
  const inputId = useId();
  return (
    <>
      <input
        id={inputId}
        hidden
        type="file"
        accept={accept}
        onChange={(event) => {
          onChange(event.currentTarget.files?.[0] ?? null);
          event.currentTarget.value = "";
        }}
      />
      {children({ onClick: () => document.getElementById(inputId)?.click() })}
    </>
  );
}
