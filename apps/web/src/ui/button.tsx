import {
  Button as ShadcnButton,
  buttonVariants,
} from "../components/ui/button";
import type { ButtonHTMLAttributes, ElementType, ReactNode, Ref } from "react";
import { classes, layoutStyle, type LayoutProps, type Size } from "./shared";
import styles from "./button.module.css";
import { ThinkingOrb } from "../components/ThinkingOrb";
import { LoadingLabel } from "../components/SharedLoading";

export type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "color"
> &
  LayoutProps & {
    component?: ElementType;
    to?: string;
    href?: string;
    target?: string;
    ref?: Ref<HTMLButtonElement>;
    variant?:
      | "filled"
      | "default"
      | "outline"
      | "subtle"
      | "light"
      | "transparent";
    color?: string;
    size?: Size;
    radius?: string | number;
    fullWidth?: boolean;
    loading?: boolean;
    leftSection?: ReactNode;
    rightSection?: ReactNode;
  };
export function Button({
  component,
  variant = "filled",
  color,
  size = "sm",
  fullWidth,
  loading,
  leftSection,
  rightSection,
  className,
  children,
  type = "button",
  mt,
  mb,
  ml,
  mr,
  mx,
  my,
  w,
  h,
  style,
  radius,
  disabled,
  ...props
}: ButtonProps) {
  // Links retain their link semantics, following shadcn's Base UI composition guidance.
  const Component = component ?? ShadcnButton;
  const content = (
    <>
      {loading ? (
        <ThinkingOrb variant="working" size={20} speed={0.8} />
      ) : (
        leftSection && (
          <span data-ui="button-section" aria-hidden>
            {leftSection}
          </span>
        )
      )}
      {loading ? (
        <LoadingLabel>{children}</LoadingLabel>
      ) : (
        <span>{children}</span>
      )}
      {rightSection && (
        <span data-ui="button-section" aria-hidden>
          {rightSection}
        </span>
      )}
    </>
  );
  return (
    <Component
      {...props}
      type={component ? undefined : type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-disabled={disabled || loading || undefined}
      data-ui="button"
      data-variant={variant}
      data-color={color}
      data-size={size}
      className={classes(
        component && buttonVariants(),
        styles.button,
        fullWidth && styles.fullWidth,
        className,
      )}
      style={{
        ...layoutStyle({ mt, mb, ml, mr, mx, my, w, h, style }),
        borderRadius: radius,
      }}
    >
      {content}
    </Component>
  );
}
export function ActionIcon({ className, size = "sm", ...props }: ButtonProps) {
  return (
    <Button
      {...props}
      size={size}
      className={classes(styles.iconButton, className)}
    />
  );
}
