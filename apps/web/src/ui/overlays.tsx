import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";
import {
  Popover as ShadcnPopover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipTrigger,
} from "../components/ui/tooltip";
import {
  createContext,
  isValidElement,
  useContext,
  type ComponentProps,
  type ReactNode,
} from "react";
import { classes } from "./shared";
import styles from "./ui.module.css";

type Position =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end"
  | "right-start"
  | "left-start";
type OverlayOptions = { position?: Position; width?: number | string };
const MenuOptions = createContext<OverlayOptions>({});
const PopoverOptions = createContext<OverlayOptions>({});
function positioning(position: Position = "bottom-start") {
  const [side, align = "center"] = position.split("-");
  return {
    side: side as "top" | "bottom" | "left" | "right",
    align: align as "start" | "center" | "end",
  };
}
function MenuRoot({
  children,
  position,
  width,
  opened,
  onChange,
}: OverlayOptions & {
  children: ReactNode;
  opened?: boolean;
  onChange?: (open: boolean) => void;
}) {
  return (
    <MenuOptions value={{ position, width }}>
      <DropdownMenu open={opened} onOpenChange={onChange}>
        {children}
      </DropdownMenu>
    </MenuOptions>
  );
}
function MenuTarget({ children }: { children: ReactNode }) {
  return isValidElement<Record<string, unknown>>(children) ? (
    <DropdownMenuTrigger render={children} />
  ) : null;
}
function MenuDropdown({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const options = useContext(MenuOptions);
  return (
    <DropdownMenuContent
      {...positioning(options.position)}
      sideOffset={7}
      className={classes(styles.menu, className)}
      style={{ width: options.width }}
    >
      {children}
    </DropdownMenuContent>
  );
}
function MenuItem({
  children,
  leftSection,
  rightSection,
  color,
  className,
  ...props
}: Omit<ComponentProps<typeof DropdownMenuItem>, "className"> & {
  className?: string;
  leftSection?: ReactNode;
  rightSection?: ReactNode;
  color?: string;
}) {
  return (
    <DropdownMenuItem
      {...props}
      className={classes(styles.menuItem, className)}
      data-color={color}
      variant={color === "red" ? "destructive" : "default"}
    >
      {leftSection && <span aria-hidden>{leftSection}</span>}
      <span>{children}</span>
      {rightSection && <span aria-hidden>{rightSection}</span>}
    </DropdownMenuItem>
  );
}
function MenuDivider() {
  return <DropdownMenuSeparator className={styles.separator} />;
}
function MenuLabel({ children }: { children: ReactNode }) {
  return (
    <DropdownMenuLabel className={styles.menuLabel}>
      {children}
    </DropdownMenuLabel>
  );
}
export const Menu = Object.assign(MenuRoot, {
  Target: MenuTarget,
  Dropdown: MenuDropdown,
  Group: DropdownMenuGroup,
  Item: MenuItem,
  Divider: MenuDivider,
  Label: MenuLabel,
});

function PopoverRoot({
  children,
  position,
  width,
  opened,
  onChange,
}: OverlayOptions & {
  children: ReactNode;
  opened?: boolean;
  onChange?: (open: boolean) => void;
  shadow?: string;
}) {
  return (
    <PopoverOptions value={{ position, width }}>
      <ShadcnPopover open={opened} onOpenChange={onChange}>
        {children}
      </ShadcnPopover>
    </PopoverOptions>
  );
}
function PopoverTarget({ children }: { children: ReactNode }) {
  return isValidElement<Record<string, unknown>>(children) ? (
    <PopoverTrigger render={children} />
  ) : null;
}
function PopoverDropdown({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const options = useContext(PopoverOptions);
  return (
    <PopoverContent
      {...positioning(options.position)}
      sideOffset={9}
      className={classes(styles.popover, className)}
      style={{ width: options.width }}
    >
      {children}
    </PopoverContent>
  );
}
export const Popover = Object.assign(PopoverRoot, {
  Target: PopoverTarget,
  Dropdown: PopoverDropdown,
});

export function Tooltip({
  label,
  children,
  position,
}: {
  label: ReactNode;
  children: ReactNode;
  position?: Position;
}) {
  return isValidElement<Record<string, unknown>>(children) ? (
    <ShadcnTooltip>
      <TooltipTrigger render={children} />
      <TooltipContent
        {...positioning(position ?? "top")}
        sideOffset={7}
        className={styles.tooltip}
      >
        {label}
      </TooltipContent>
    </ShadcnTooltip>
  ) : (
    children
  );
}
export function Modal({
  opened,
  onClose,
  title,
  children,
  size,
}: {
  opened: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  centered?: boolean;
  size?: string | number;
}) {
  return (
    <Dialog
      open={opened}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className={styles.dialog}
        style={{
          maxWidth: typeof size === "number" ? size : size === "sm" ? 420 : 500,
        }}
      >
        <DialogHeader className={styles.dialogHeader}>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
