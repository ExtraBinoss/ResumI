import { ScrollArea } from "@base-ui/react/scroll-area";
import type { ComponentProps, ReactNode } from "react";
import { ScrollBar } from "./ui/scroll-area";
import { cn } from "../lib/utils";
import styles from "./ScrollShadow.module.css";

/** Shared Base UI scrolling surface. Content owns padding; rails stay on the outer edge. */
export function ScrollShadow({
  children,
  className,
  viewportClassName,
  contentClassName,
  viewportRender,
  orientation = "vertical",
  ...props
}: Omit<ComponentProps<typeof ScrollArea.Root>, "children"> & {
  children: ReactNode;
  orientation?: "vertical" | "horizontal";
  viewportClassName?: string;
  contentClassName?: string;
  viewportRender?: ComponentProps<typeof ScrollArea.Viewport>["render"];
}) {
  return (
    <ScrollArea.Root
      {...props}
      className={cn(styles.root, className)}
      data-slot="scroll-shadow"
      data-fade-orientation={orientation}
    >
      <ScrollArea.Viewport
        render={viewportRender}
        className={cn(styles.viewport, viewportClassName)}
        data-slot="scroll-shadow-viewport"
      >
        <ScrollArea.Content
          className={cn(styles.content, contentClassName)}
          data-slot="scroll-shadow-content"
        >
          {children}
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollBar className={styles.scrollbar} />
      <ScrollBar orientation="horizontal" className={styles.scrollbar} />
      <ScrollArea.Corner className={styles.corner} />
    </ScrollArea.Root>
  );
}
