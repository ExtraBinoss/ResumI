import { useTranslation } from "react-i18next";
import {
  ActionIcon,
  ColorInput,
  NumberInput,
  TextInput,
  Select,
  Slider,
  Button,
} from "../../../ui";
import { RotateCcw, Plus, X } from "lucide-react";
import { useSetAtom } from "jotai";
import {
  DEFAULT_VISUAL_EFFECTS,
  SHAPE_CATALOG,
  shapeDefinition,
  type Layer,
  type LayerPatch,
  type VisualEffects,
} from "@resumi/engine";
import { ImageBorderFields } from "./ImageAppearance";
import { VectorAppearance } from "./VectorAppearance";
export { ShadowFields } from "./ImageAppearance";
import { designCommandAtom } from "../../../state/design";
import styles from "../styles/Inspector.module.css";
import { useColorPreview } from "./useColorPreview";
export function EffectsFields({
  id,
  layer,
}: {
  id: string;
  layer: Extract<Layer, { type: "shape" | "image" }>;
}) {
  const { t } = useTranslation();
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
      label: t("properties.effectBlur"),
      min: 0,
      max: 64,
      step: 0.25,
      scale: 1,
      suffix: "px",
    },
    {
      key: "grain",
      label: t("properties.grain"),
      min: 0,
      max: 100,
      step: 1,
      scale: 100,
      suffix: "%",
    },
    {
      key: "grainSize",
      label: t("properties.grainSize"),
      min: 0.5,
      max: 12,
      step: 0.1,
      scale: 1,
      suffix: "px",
    },
    {
      key: "dither",
      label: t("properties.dither"),
      min: 0,
      max: 100,
      step: 1,
      scale: 100,
      suffix: "%",
    },
    {
      key: "brightness",
      label: t("properties.brightness"),
      min: 0,
      max: 300,
      step: 1,
      scale: 100,
      suffix: "%",
    },
    {
      key: "contrast",
      label: t("properties.contrastEffect"),
      min: 0,
      max: 300,
      step: 1,
      scale: 100,
      suffix: "%",
    },
    {
      key: "saturation",
      label: t("properties.saturation"),
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
        <h3>{t("properties.effects")}</h3>
        <ActionIcon
          aria-label={t("properties.resetEffects")}
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
          <div>
            <NumberInput
              label={control.label}
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
            aria-label={t("properties.adjustment", { label: control.label })}
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
  const { t } = useTranslation();
  const dispatch = useSetAtom(designCommandAtom);
  const preview = useColorPreview(id);
  function patch(patch: LayerPatch) {
    dispatch({ type: "layer.update", ids: [id], patch });
  }
  const gradient = layer.gradient;
  const shape = layer.vector ?? shapeDefinition(layer.shape);
  const strokeOnly = !!shape && "strokeOnly" in shape && !!shape.strokeOnly;
  if (layer.vector?.parts) return <VectorAppearance id={id} layer={layer} />;
  return (
    <section>
      <h3>{t("properties.appearance")}</h3>
      <Select
        label={t("properties.shape")}
        size="xs"
        value={layer.shape}
        data={[
          ...SHAPE_CATALOG.map((shape) => ({
            value: shape.id,
            label: shape.name,
          })),
          ...(layer.vector
            ? [{ value: "custom-icon", label: t("properties.customVector") }]
            : []),
        ]}
        allowDeselect={false}
        onChange={(value) => {
          if (value) patch({ shape: value, vector: undefined });
        }}
      />
      <ColorInput
        label={t("properties.fill")}
        size="xs"
        mt="sm"
        withEyeDropper={false}
        format="hex"
        value={layer.fill}
        onPreview={(value) => preview({ kind: "fill", id, strokeOnly }, value)}
        onChangeEnd={(value) => {
          if (/^#[0-9a-fA-F]{6}$/.test(value)) patch({ fill: value });
        }}
      />
      <div className={styles.doubleGrid}>
        <ColorInput
          label={t("properties.stroke")}
          size="xs"
          withEyeDropper={false}
          format="hex"
          value={layer.stroke === "transparent" ? "#000000" : layer.stroke}
          onPreview={(value) =>
            preview({ kind: "stroke", id, strokeOnly }, value)
          }
          onChangeEnd={(value) => {
            if (/^#[0-9a-fA-F]{6}$/.test(value))
              patch({ stroke: value, strokeWidth: layer.strokeWidth || 1 });
          }}
        />
        <NumberInput
          label={t("properties.width")}
          aria-label={t("properties.strokeWidth")}
          suffix="px"
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
        label={t("properties.radius")}
        aria-label={t("properties.cornerRadius")}
        suffix="px"
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
        <h4>{t("properties.linearGradient")}</h4>
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
          {gradient ? t("properties.remove") : t("properties.add")}
        </Button>
      </div>
      {gradient && (
        <>
          <NumberInput
            label={t("properties.angle")}
            aria-label={t("properties.gradientAngle")}
            snapPoints={[
              -360, -270, -180, -90, 0, 45, 90, 135, 180, 225, 270, 315, 360,
            ]}
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
                aria-label={t("properties.gradientStopColor", {
                  number: index + 1,
                })}
                withEyeDropper={false}
                size="xs"
                format="hex"
                value={stop.color}
                onPreview={(value) =>
                  preview({ kind: "gradient", id, index }, value)
                }
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
                scrubLabel={t("properties.stop")}
                aria-label={t("properties.gradientStopPosition", {
                  number: index + 1,
                })}
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
                aria-label={t("properties.removeGradientStop", {
                  number: index + 1,
                })}
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
            {t("properties.addGradientStop")}
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
  const { t } = useTranslation();
  const dispatch = useSetAtom(designCommandAtom);
  function patch(patch: LayerPatch) {
    dispatch({ type: "layer.update", ids: [id], patch });
  }
  const controls = [
    {
      label: t("properties.imageZoom"),
      shortLabel: t("properties.zoom"),
      value: layer.imageScale * 100,
      min: 100,
      max: 500,
      step: 1,
      patch: (value: number) => patch({ imageScale: value / 100 }),
    },
    ...(["x", "y"] as const).map((axis) => ({
      label:
        axis === "x"
          ? t("properties.horizontalCrop")
          : t("properties.verticalCrop"),
      shortLabel:
        axis === "x" ? t("properties.horizontal") : t("properties.vertical"),
      value: layer.objectPosition[axis],
      min: 0,
      max: 100,
      step: 1,
      patch: (value: number) =>
        patch({ objectPosition: { ...layer.objectPosition, [axis]: value } }),
    })),
  ];
  return (
    <>
      <section>
        <h3>{t("properties.crop")}</h3>
        <Select
          className={styles.fieldRow}
          label={t("properties.fit")}
          aria-label={t("properties.imageFit")}
          size="xs"
          value={layer.objectFit}
          allowDeselect={false}
          data={[
            { value: "cover", label: t("properties.cover") },
            { value: "contain", label: t("properties.contain") },
          ]}
          onChange={(value) => {
            if (value) patch({ objectFit: value as "cover" | "contain" });
          }}
        />
        {controls.map((control) => (
          <div className={styles.effectControl} key={control.label}>
            <div>
              <NumberInput
                label={control.shortLabel}
                aria-label={control.label}
                size="xs"
                hideControls
                suffix="%"
                min={control.min}
                max={control.max}
                value={Math.round(control.value)}
                onChange={(value) => {
                  if (
                    typeof value === "number" &&
                    value >= control.min &&
                    value <= control.max
                  )
                    control.patch(value);
                }}
              />
            </div>
            <Slider
              key={control.value}
              aria-label={t("properties.adjustment", { label: control.label })}
              min={control.min}
              max={control.max}
              step={control.step}
              defaultValue={control.value}
              onChangeEnd={control.patch}
            />
          </div>
        ))}
        <div className={styles.numberRow}>
          <NumberInput
            label={t("properties.radius")}
            suffix="px"
            aria-label={t("properties.radius")}
            size="xs"
            min={0}
            max={2500}
            value={layer.borderRadius}
            onChange={(value) => {
              if (typeof value === "number" && value >= 0 && value <= 2500)
                patch({ borderRadius: value });
            }}
          />
        </div>
        <TextInput
          className={styles.fieldRow}
          label={t("properties.altText")}
          aria-label={t("properties.alternativeText")}
          size="xs"
          value={layer.alt}
          onChange={(event) => patch({ alt: event.currentTarget.value })}
        />
      </section>
      <ImageBorderFields id={id} layer={layer} />
    </>
  );
}
