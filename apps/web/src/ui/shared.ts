import type { CSSProperties } from "react";

export type Size =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "compact-xs"
  | "compact-sm"
  | number;
type Space = string | number;
export type LayoutProps = {
  mt?: Space;
  mb?: Space;
  ml?: Space;
  mr?: Space;
  mx?: Space;
  my?: Space;
  w?: Space;
  h?: Space;
  style?: CSSProperties;
};
const spaces: Record<string, string> = {
  xs: "6px",
  sm: "10px",
  md: "16px",
  lg: "24px",
  xl: "32px",
};
function space(value: Space | undefined) {
  return typeof value === "string" ? (spaces[value] ?? value) : value;
}
export function layoutStyle({
  mt,
  mb,
  ml,
  mr,
  mx,
  my,
  w,
  h,
  style,
}: LayoutProps): CSSProperties {
  return {
    marginTop: space(mt ?? my),
    marginBottom: space(mb ?? my),
    marginLeft: space(ml ?? mx),
    marginRight: space(mr ?? mx),
    width: space(w),
    height: space(h),
    ...style,
  };
}
export function classes(...values: (string | false | undefined)[]) {
  return values.filter(Boolean).join(" ");
}
