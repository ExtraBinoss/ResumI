import {
  ColorPicker,
  ColorPickerPanel,
  ColorPickerArea,
  ColorPickerSlider,
  ColorPickerFields,
  ColorPickerSwatches,
} from "../components/reui/color-picker";
import type { ColorPickerI18nOverrides } from "../components/reui/color-picker";
export function PickerPanel({
  value,
  alpha,
  label,
  i18n,
  swatches,
  change,
  commit,
  cancel,
}: {
  value: string;
  alpha: boolean;
  label: string;
  i18n: ColorPickerI18nOverrides;
  swatches?: string[];
  change: (color: string) => void;
  commit: (color: string) => void;
  cancel: () => void;
}) {
  return (
    <ColorPicker
      value={value}
      open={false}
      format="hex"
      alpha={alpha}
      aria-label={label}
      i18n={i18n}
      onValueChange={(color) => {
        if (color) change(color);
      }}
      onValueCommit={(color) => {
        if (color) commit(color);
      }}
      onValueCancel={cancel}
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
              "#2563eb",
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
