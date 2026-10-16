import {
  ActionIcon,
  ColorInput,
  NumberInput,
  Select,
  Slider,
  Button,
} from "../ui";
import { RotateCcw, Plus, X } from "lucide-react";
import { useSetAtom } from "jotai";
import {
  DEFAULT_VISUAL_EFFECTS,
  SHAPE_CATALOG,
  type Layer,
  type LayerPatch,
  type VisualEffects,
} from "@resumi/engine";
import { designCommandAtom } from "../state/design";
import styles from "../styles/LayerPanels.module.css";
export function EffectsFields({
  id,
  layer,
}: {
  id: string;
  layer: Extract<Layer, { type: "shape" | "image" }>;
}) {
  const dispatch = useSetAtom(designCommandAtom);
  function patch(key: keyof VisualEffects, value: number) {
    dispatch({
      type: "layer.update",
      ids: [id],
      patch: { effects: { ...layer.effects, [key]: value } },
    });
  }
  const controls: {
    key: keyof VisualEffects;
    label: string;
    min: number;
    max: number;
    step: number;
    scale: number;
    suffix: string;
  }[] = [
    {
      key: "blur",
      label: "Blur",
      min: 0,
      max: 64,
      step: 0.25,
      scale: 1,
      suffix: "px",
    },
    {
      key: "grain",
      label: "Grain",
      min: 0,
      max: 100,
      step: 1,
      scale: 100,
      suffix: "%",
    },
    {
      key: "grainSize",
      label: "Grain size",
      min: 0.5,
      max: 12,
      step: 0.1,
      scale: 1,
      suffix: "px",
    },
    {
      key: "dither",
      label: "Dither",
      min: 0,
      max: 100,
      step: 1,
      scale: 100,
      suffix: "%",
    },
    {
      key: "brightness",
      label: "Brightness",
      min: 0,
      max: 300,
      step: 1,
      scale: 100,
      suffix: "%",
    },
    {
      key: "contrast",
      label: "Contrast",
      min: 0,
      max: 300,
      step: 1,
      scale: 100,
      suffix: "%",
    },
    {
      key: "saturation",
      label: "Saturation",
      min: 0,
      max: 300,
      step: 1,
      scale: 100,
      suffix: "%",
    },
  ];
  return (
    <section className={styles.effects}>
      <div className={styles.sectionHead}>
        <h3>Effects</h3>
        <ActionIcon
          aria-label="Reset effects"
          size="xs"
          variant="subtle"
          color="gray"
          onClick={() =>
            dispatch({
              type: "layer.update",
              ids: [id],
              patch: { effects: { ...DEFAULT_VISUAL_EFFECTS } },
            })
          }
        >
          <RotateCcw size={13} />
        </ActionIcon>
      </div>
      {controls.map((control) => (
        <div key={control.key} className={styles.effectControl}>
          <div className={styles.settingHead}>
            <label>{control.label}</label>
            <NumberInput
              aria-label={control.label}
              size="xs"
              hideControls
              suffix={control.suffix}
              value={
                Math.round(layer.effects[control.key] * control.scale * 100) /
                100
              }
              min={control.min}
              max={control.max}
              step={control.step}
              onChange={(value) => {
                if (
                  typeof value === "number" &&
                  value >= control.min &&
                  value <= control.max
                )
                  patch(control.key, value / control.scale);
              }}
            />
          </div>
          <Slider
            key={layer.effects[control.key]}
            aria-label={`${control.label} adjustment`}
            size="xs"
            min={control.min}
            max={control.max}
            step={control.step}
            defaultValue={layer.effects[control.key] * control.scale}
            onChangeEnd={(value) => patch(control.key, value / control.scale)}
          />
        </div>
      ))}
    </section>
  );
}
export function ShapeFields({
  id,
  layer,
}: {
  id: string;
  layer: Extract<Layer, { type: "shape" }>;
}) {
  const dispatch = useSetAtom(designCommandAtom);
  function patch(patch: LayerPatch) {
    dispatch({ type: "layer.update", ids: [id], patch });
  }
  const gradient = layer.gradient;
  return (
    <section>
      <h3>Appearance</h3>
      <Select
        label="Shape"
        size="xs"
        value={layer.shape}
        data={[
          ...SHAPE_CATALOG.map((shape) => ({
            value: shape.id,
            label: shape.name,
          })),
          ...(layer.vector
            ? [{ value: "custom-icon", label: "Custom vector" }]
            : []),
        ]}
        allowDeselect={false}
        onChange={(value) => {
          if (value) patch({ shape: value, vector: undefined });
        }}
      />
      <ColorInput
        label="Fill"
        size="xs"
        mt="sm"
        withEyeDropper={false}
        format="hex"
        value={layer.fill}
        onChangeEnd={(value) => {
          if (/^#[0-9a-fA-F]{6}$/.test(value)) patch({ fill: value });
        }}
      />
      <div className={styles.doubleGrid}>
        <ColorInput
          label="Stroke"
          size="xs"
          withEyeDropper={false}
          format="hex"
          value={layer.stroke === "transparent" ? "#000000" : layer.stroke}
          onChangeEnd={(value) => {
            if (/^#[0-9a-fA-F]{6}$/.test(value))
              patch({ stroke: value, strokeWidth: layer.strokeWidth || 1 });
          }}
        />
        <NumberInput
          label="Stroke width"
          size="xs"
          min={0}
          max={100}
          value={layer.strokeWidth}
          onChange={(value) => {
            if (typeof value === "number" && value >= 0 && value <= 100)
              patch({ strokeWidth: value });
          }}
        />
      </div>
      <NumberInput
        label="Corner radius"
        size="xs"
        mt="sm"
        min={0}
        max={2500}
        value={layer.borderRadius}
        onChange={(value) => {
          if (typeof value === "number" && value >= 0 && value <= 2500)
            patch({ borderRadius: value });
        }}
      />
      <div className={styles.sectionHead}>
        <h4>Linear gradient</h4>
        <Button
          size="compact-xs"
          variant="subtle"
          onClick={() =>
            patch({
              gradient: gradient
                ? null
                : {
                    type: "linear",
                    angle: 90,
                    stops: [
                      {
                        id: "start",
                        offset: 0,
                        color:
                          layer.fill === "transparent" ? "#2958e8" : layer.fill,
                      },
                      { id: "end", offset: 1, color: "#f6cfaf" },
                    ],
                  },
            })
          }
        >
          {gradient ? "Remove" : "Add"}
        </Button>
      </div>
      {gradient && (
        <>
          <NumberInput
            label="Gradient angle"
            size="xs"
            min={-360}
            max={360}
            suffix="°"
            value={gradient.angle}
            onChange={(value) => {
              if (typeof value === "number" && value >= -360 && value <= 360)
                patch({ gradient: { ...gradient, angle: value } });
            }}
          />
          {gradient.stops.map((stop, index) => (
            <div key={stop.id} className={styles.gradientStop}>
              <ColorInput
                aria-label={`Gradient stop ${index + 1} color`}
                withEyeDropper={false}
                size="xs"
                format="hex"
                value={stop.color}
                onChangeEnd={(value) => {
                  if (/^#[0-9a-fA-F]{6}$/.test(value))
                    patch({
                      gradient: {
                        ...gradient,
                        stops: gradient.stops.map((s) =>
                          s.id === stop.id ? { ...s, color: value } : s,
                        ),
                      },
                    });
                }}
              />
              <NumberInput
                aria-label={`Gradient stop ${index + 1} position`}
                size="xs"
                hideControls
                min={0}
                max={100}
                suffix="%"
                value={Math.round(stop.offset * 100)}
                onChange={(value) => {
                  if (typeof value === "number" && value >= 0 && value <= 100)
                    patch({
                      gradient: {
                        ...gradient,
                        stops: gradient.stops.map((s) =>
                          s.id === stop.id ? { ...s, offset: value / 100 } : s,
                        ),
                      },
                    });
                }}
              />
              <ActionIcon
                aria-label={`Remove gradient stop ${index + 1}`}
                size="xs"
                color="gray"
                variant="subtle"
                disabled={gradient.stops.length <= 2}
                onClick={() =>
                  patch({
                    gradient: {
                      ...gradient,
                      stops: gradient.stops.filter((s) => s.id !== stop.id),
                    },
                  })
                }
              >
                <X size={12} />
              </ActionIcon>
            </div>
          ))}
          <Button
            leftSection={<Plus size={12} />}
            variant="subtle"
            size="compact-xs"
            disabled={gradient.stops.length >= 16}
            onClick={() =>
              patch({
                gradient: {
                  ...gradient,
                  stops: [
                    ...gradient.stops,
                    { id: crypto.randomUUID(), offset: 0.5, color: "#ffffff" },
                  ],
                },
              })
            }
          >
            Add gradient stop
          </Button>
        </>
      )}
    </section>
  );
}
export function ImageFields({
  id,
  layer,
}: {
  id: string;
  layer: Extract<Layer, { type: "image" }>;
}) {
  const dispatch = useSetAtom(designCommandAtom);
  function patch(patch: LayerPatch) {
    dispatch({ type: "layer.update", ids: [id], patch });
  }
  return (
    <section>
      <h3>Image crop</h3>
      <Select
        label="Image fit"
        size="xs"
        value={layer.objectFit}
        allowDeselect={false}
        data={["cover", "contain"]}
        onChange={(value) => {
          if (value) patch({ objectFit: value as "cover" | "contain" });
        }}
      />
      <NumberInput
        label="Image zoom"
        mt="sm"
        size="xs"
        min={100}
        max={500}
        suffix="%"
        value={layer.imageScale * 100}
        onChange={(value) => {
          if (typeof value === "number" && value >= 100 && value <= 500)
            patch({ imageScale: value / 100 });
        }}
      />
      <div className={styles.doubleGrid}>
        {(["x", "y"] as const).map((axis) => (
          <NumberInput
            key={axis}
            label={axis === "x" ? "Horizontal crop" : "Vertical crop"}
            min={0}
            max={100}
            suffix="%"
            size="xs"
            value={layer.objectPosition[axis]}
            onChange={(value) => {
              if (typeof value === "number" && value >= 0 && value <= 100)
                patch({
                  objectPosition: { ...layer.objectPosition, [axis]: value },
                });
            }}
          />
        ))}
      </div>
      <NumberInput
        label="Corner radius"
        size="xs"
        mt="sm"
        min={0}
        max={2500}
        value={layer.borderRadius}
        onChange={(value) => {
          if (typeof value === "number" && value >= 0 && value <= 2500)
            patch({ borderRadius: value });
        }}
      />
    </section>
  );
}
