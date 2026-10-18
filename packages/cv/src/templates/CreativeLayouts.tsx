import type { CreativeLayoutProps } from "./creative-types";
import { creativeFamily, isCreativeLayout } from "./types";
import { DigitalLayouts } from "./DigitalLayouts";
import { ExpressiveLayouts } from "./ExpressiveLayouts";
import { digitalCss } from "./digital-css";
import { expressiveCss } from "./expressive-css";
import { CuratedLayouts } from "./CuratedLayouts";
import { ArtfulLayouts } from "./ArtfulLayouts";
import { SpatialLayouts } from "./SpatialLayouts";
import { curatedCss } from "./curated-css";
import { artfulCss } from "./artful-css";
import { spatialCss } from "./spatial-css";

export const creativeCss =
  digitalCss + expressiveCss + curatedCss + artfulCss + spatialCss;
export function CreativeLayouts(props: CreativeLayoutProps) {
  const layout = props.data.layout ?? "terminal";
  const family = isCreativeLayout(layout) ? creativeFamily(layout) : "digital";
  switch (family) {
    case "digital":
      return <DigitalLayouts {...props} />;
    case "expressive":
      return <ExpressiveLayouts {...props} />;
    case "curated":
      return <CuratedLayouts {...props} />;
    case "artful":
      return <ArtfulLayouts {...props} />;
    case "spatial":
      return <SpatialLayouts {...props} />;
  }
}
