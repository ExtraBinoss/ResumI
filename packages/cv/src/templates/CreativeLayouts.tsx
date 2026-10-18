import type { CreativeLayoutProps } from "./creative-types";
import { isDigitalLayout } from "./types";
import { DigitalLayouts } from "./DigitalLayouts";
import { ExpressiveLayouts } from "./ExpressiveLayouts";
import { digitalCss } from "./digital-css";
import { expressiveCss } from "./expressive-css";

export const creativeCss = digitalCss + expressiveCss;
export function CreativeLayouts(props: CreativeLayoutProps) {
  return isDigitalLayout(props.data.layout ?? "terminal") ? (
    <DigitalLayouts {...props} />
  ) : (
    <ExpressiveLayouts {...props} />
  );
}
