import { isValidElement, type HTMLAttributes, type ReactNode } from "react";
import { CopyErrorButton } from "../components/ErrorNotice";
import { classes, layoutStyle, type LayoutProps, type Size } from "./shared";
import styles from "./ui.module.css";
import {
  Alert as ShadcnAlert,
  AlertTitle,
  AlertDescription,
} from "../components/ui/alert";
import { SharedLoading } from "../components/SharedLoading";
import { ScrollArea as ShadcnScrollArea } from "../components/ui/scroll-area";

function textDetails(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node))
    return node.map(textDetails).filter(Boolean).join("\n");
  if (isValidElement<{ children?: ReactNode }>(node))
    return textDetails(node.props.children);
  return "";
}

export function Alert({
  title,
  children,
  color,
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
}: Omit<HTMLAttributes<HTMLDivElement>, "title" | "color"> &
  LayoutProps & { title?: ReactNode; color?: string }) {
  const details = textDetails(children);
  return (
    <ShadcnAlert
      {...props}
      data-color={color}
      className={classes(styles.alert, className)}
      style={layoutStyle({ mt, mb, ml, mr, mx, my, w, h, style })}
    >
      {title && <AlertTitle className={styles.alertTitle}>{title}</AlertTitle>}
      <AlertDescription className={styles.alertDescription}>
        {children}
        {(color === "red" || color === "yellow") && details && (
          <CopyErrorButton key={details} details={details} />
        )}
      </AlertDescription>
    </ShadcnAlert>
  );
}
export function Loader({
  size = "sm",
  className,
  label,
  text = false,
}: {
  size?: Size;
  className?: string;
  label?: string;
  text?: boolean;
}) {
  const pixels =
    typeof size === "number"
      ? size
      : size === "xs" || size === "compact-xs"
        ? 13
        : size === "lg" || size === "xl"
          ? 24
          : 18;
  return (
    <SharedLoading
      compact
      variant="working"
      iconOnly={!text}
      label={label}
      iconSize={pixels}
      className={className}
      style={text ? undefined : { minHeight: pixels, height: pixels }}
    />
  );
}
export function Code({
  block,
  children,
  className,
}: {
  block?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return block ? (
    <pre className={classes(styles.code, className)}>
      <code>{children}</code>
    </pre>
  ) : (
    <code className={classes(styles.code, className)}>{children}</code>
  );
}
export function ScrollArea({
  children,
  className,
  h,
  w,
}: {
  children: ReactNode;
  className?: string;
  h?: string | number;
  w?: string | number;
}) {
  return (
    <ShadcnScrollArea
      className={classes(styles.scrollArea, className)}
      style={{ height: h, width: w }}
    >
      {children}
    </ShadcnScrollArea>
  );
}
