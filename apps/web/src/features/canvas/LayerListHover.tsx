import { useAtomValue } from "jotai";
import { layerHoverFrameAtom } from "../../state/layer-hover";
import { HoverOutline } from "./HoverOutline";

export function LayerListHover({ overlay }: { overlay: HTMLDivElement }) {
  const frame = useAtomValue(layerHoverFrameAtom);
  return frame ? (
    <HoverOutline {...frame} overlay={overlay} source="layers" />
  ) : null;
}
