import type { HTMLAttributes, ReactNode } from "react";
import { classes, layoutStyle, type LayoutProps, type Size } from "./shared";
import styles from "./ui.module.css";
import {
  Alert as ShadcnAlert,
  AlertTitle,
  AlertDescription,
} from "../components/ui/alert";
import { Spinner } from "../components/ui/spinner";
import { ScrollArea as ShadcnScrollArea } from "../components/ui/scroll-area";

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
      </AlertDescription>
    </ShadcnAlert>
  );
}
export function Loader({
  size = "sm",
  className,
}: {
  size?: Size;
  className?: string;
}) {
  return (
    <Spinner
      aria-hidden="true"
      role={undefined}
      aria-label={undefined}
      data-size={size}
      className={classes(styles.loaderIcon, className)}
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
