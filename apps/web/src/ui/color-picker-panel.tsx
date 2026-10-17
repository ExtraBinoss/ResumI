import {
  ColorPicker,
  ColorPickerPanel,
  ColorPickerArea,
  ColorPickerSlider,
  ColorPickerFields,
  ColorPickerSwatches,
} from "../components/reui/color-picker";
export function PickerPanel({
  value,
  alpha,
  label,
  swatches,
  change,
  commit,
}: {
  value: string;
  alpha: boolean;
  label: string;
  swatches?: string[];
  change: (color: string) => void;
  commit: (color: string) => void;
}) {
  return (
    <ColorPicker
      value={value}
      open={false}
      format="hex"
      alpha={alpha}
      aria-label={label}
      onValueChange={(color) => {
        if (color) change(color);
      }}
      onValueCommit={(color) => {
        if (color) commit(color);
      }}
    >
      <ColorPickerPanel>
        <ColorPickerArea />
        <ColorPickerSlider channel="hue" />
        {alpha && <ColorPickerSlider channel="alpha" />}
        <ColorPickerFields formats={["hex", "rgb", "hsl"]} />
        <ColorPickerSwatches
          colors={
            swatches ?? [
              "#151515",
              "#ffffff",
              "#2958e8",
              "#ed6b4c",
              "#78a892",
              "#d7be91",
            ]
          }
        />
      </ColorPickerPanel>
    </ColorPicker>
  );
}
