import { useAtomValue, useSetAtom } from "jotai";
import {
  ActionIcon,
  Button,
  TextInput,
  Textarea,
  NumberInput,
  Select,
} from "../ui";
import {
  X,
  Copy,
  Trash2,
  Lock,
  Unlock,
  Link2,
  Unlink,
  ArrowUpToLine,
  ArrowDownToLine,
  Ungroup,
} from "lucide-react";
import {
  blendModes,
  boundsForElements,
  isLocked,
  type LayerPatch,
  type Command,
  type LayerGroup,
} from "@resumi/engine";
import { sessionAtom, selectionAtom, blockAtom } from "../state/editor";
import {
  canvasAtom,
  designCommandAtom,
  selectedIdsAtom,
  selectLayersAtom,
  duplicateSelectionAtom,
  deleteSelectionAtom,
  textRangeAtom,
} from "../state/design";
import { TypographyFields } from "./TextFormatting";
import { ShapeFields, ImageFields, EffectsFields } from "./VisualProperties";
import { DocumentProperties } from "./DocumentProperties";
import styles from "../styles/LayerPanels.module.css";
function SelectedProperties({ id }: { id: string }) {
  const document = useAtomValue(sessionAtom)!.document;
  const block = useAtomValue(blockAtom(id)),
    ids = useAtomValue(selectedIdsAtom),
    canvas = useAtomValue(canvasAtom),
    selection = useAtomValue(selectionAtom),
    dispatch = useSetAtom(designCommandAtom),
    setRange = useSetAtom(textRangeAtom);
  if (!block?.design || !canvas) return null;
  const layer = block.design,
    doc = document,
    group = canvas.groups.find((g) => g.id === selection?.groupId),
    multi = ids.length > 1,
    bounds = boundsForElements(ids.map((id) => doc.blocks[id].design!)),
    locked = ids.some((id) => isLocked(doc, id));
  if (!bounds) return null;
  function patch(patch: LayerPatch) {
    dispatch({ type: "layer.update", ids, patch });
  }
  function geometry(
    key: "x" | "y" | "width" | "height",
    value: string | number,
  ) {
    if (typeof value !== "number" || !Number.isFinite(value)) return;
    const limit = key === "x" || key === "y" ? 5000 : 5000,
      min = key === "x" || key === "y" ? -5000 : 1;
    if (value < min || value > limit) return;
    if (!multi) {
      const other = key === "width" ? "height" : "width";
      patch({
        [key]: value,
        ...((key === "width" || key === "height") && layer.aspectLocked
          ? { [other]: (layer[other] * value) / layer[key] }
          : {}),
      });
    } else if (key === "x" || key === "y")
      dispatch({
        type: "layer.translate",
        ids,
        dx: key === "x" ? value - bounds!.x : 0,
        dy: key === "y" ? value - bounds!.y : 0,
      });
    else {
      const scale = value / bounds![key],
        commands: Command[] = ids.map((id) => {
          const current = doc.blocks[id].design!;
          return {
            type: "layer.update",
            ids: [id],
            patch:
              key === "width"
                ? {
                    x: bounds!.x + (current.x - bounds!.x) * scale,
                    width: current.width * scale,
                  }
                : {
                    y: bounds!.y + (current.y - bounds!.y) * scale,
                    height: current.height * scale,
                  },
          };
        });
      dispatch({
        version: 1,
        actor: { kind: "human", name: "Editor" },
        commands,
      });
    }
  }
  function appearance(patch: {
    opacity?: number;
    blendMode?: LayerGroup["blendMode"];
  }) {
    if (group) dispatch({ type: "group.update", id: group.id, patch });
    else patchLayer(patch);
  }
  function patchLayer(patch: LayerPatch) {
    dispatch({ type: "layer.update", ids, patch });
  }
  return (
    <>
      <section>
        <TextInput
          label={group ? "Group name" : multi ? "Selection" : "Layer name"}
          aria-label={group ? "Group name" : "Layer name"}
          size="xs"
          value={group?.name ?? (multi ? `${ids.length} layers` : layer.name)}
          disabled={locked || (multi && !group)}
          maxLength={120}
          onChange={(e) => {
            const name = e.currentTarget.value;
            if (group) {
              if (name)
                dispatch({
                  type: "group.update",
                  id: group.id,
                  patch: { name },
                });
            } else patch({ name });
          }}
        />
        <div className={styles.blendFields}>
          <Select
            label="Blend mode"
            aria-label="Blend mode"
            size="xs"
            value={group?.blendMode ?? layer.blendMode}
            disabled={locked}
            allowDeselect={false}
            data={blendModes.map((value) => ({
              value,
              label: value.replaceAll("-", " "),
            }))}
            onChange={(value) => {
              if (value)
                appearance({ blendMode: value as LayerGroup["blendMode"] });
            }}
          />
          <NumberInput
            label="Opacity"
            aria-label="Opacity"
            size="xs"
            hideControls
            suffix="%"
            min={0}
            max={100}
            disabled={locked}
            value={Math.round((group?.opacity ?? layer.opacity) * 100)}
            onChange={(value) => {
              if (typeof value === "number" && value >= 0 && value <= 100)
                appearance({ opacity: value / 100 });
            }}
          />
        </div>
      </section>
      {locked ? (
        <section className={styles.lockedNotice}>
          <Lock size={22} />
          <strong>Selection locked</strong>
          <p>Unlock this layer or its group to edit it.</p>
        </section>
      ) : (
        <>
          <section>
            <div className={styles.sectionHead}>
              <h3>Position & size</h3>
              {!multi && (
                <ActionIcon
                  aria-label={
                    layer.aspectLocked
                      ? "Unlock aspect ratio"
                      : "Lock aspect ratio"
                  }
                  aria-pressed={layer.aspectLocked}
                  size="xs"
                  variant={layer.aspectLocked ? "light" : "subtle"}
                  color="gray"
                  onClick={() => patch({ aspectLocked: !layer.aspectLocked })}
                >
                  {layer.aspectLocked ? (
                    <Link2 size={13} />
                  ) : (
                    <Unlink size={13} />
                  )}
                </ActionIcon>
              )}
            </div>
            <div className={styles.quadGrid}>
              {(["x", "y", "width", "height"] as const).map((key) => (
                <NumberInput
                  key={key}
                  label={{ x: "X", y: "Y", width: "W", height: "H" }[key]}
                  aria-label={`Layer ${key}`}
                  hideControls
                  size="xs"
                  value={
                    Math.round((multi ? bounds[key] : layer[key]) * 100) / 100
                  }
                  decimalScale={2}
                  min={key === "x" || key === "y" ? -5000 : 1}
                  max={5000}
                  onChange={(value) => geometry(key, value)}
                />
              ))}
            </div>
            {!multi && (
              <NumberInput
                label="Rotation"
                aria-label="Rotation"
                size="xs"
                mt="sm"
                suffix="°"
                min={-360}
                max={360}
                value={layer.rotation}
                onChange={(value) => {
                  if (
                    typeof value === "number" &&
                    value >= -360 &&
                    value <= 360
                  )
                    patch({ rotation: value });
                }}
              />
            )}
          </section>
          {!multi && layer.type === "text" && (
            <>
              <section>
                <h3>Typography</h3>
                <TypographyFields
                  id={id}
                  layer={layer}
                  fonts={canvas.fonts.map((font) => font.name)}
                />
              </section>
              <section>
                <h3>Text</h3>
                <Textarea
                  label="Content"
                  aria-label="Content"
                  size="xs"
                  autosize
                  minRows={3}
                  maxRows={9}
                  value={block.text}
                  maxLength={20000}
                  onSelect={(e) => {
                    const node = e.currentTarget;
                    setRange({
                      id,
                      start: node.selectionStart,
                      end: node.selectionEnd,
                    });
                  }}
                  onChange={(e) =>
                    dispatch({
                      type: "block.update",
                      id,
                      patch: { text: e.currentTarget.value },
                    })
                  }
                />
                <p className={styles.help}>
                  Select a text range to format a few words or add a link.
                </p>
              </section>
            </>
          )}
          {!multi && layer.type === "shape" && (
            <ShapeFields id={id} layer={layer} />
          )}
          {!multi && layer.type === "image" && (
            <>
              <section>
                <TextInput
                  label="Alternative text"
                  size="xs"
                  value={layer.alt}
                  onChange={(e) => patch({ alt: e.currentTarget.value })}
                />
              </section>
              <ImageFields id={id} layer={layer} />
            </>
          )}
          {!multi && layer.type !== "text" && (
            <EffectsFields id={id} layer={layer} />
          )}
        </>
      )}
    </>
  );
}
export function DesignInspector({
  close,
  showDocument,
}: {
  close: () => void;
  showDocument: () => void;
}) {
  const document = useAtomValue(sessionAtom)!.document;
  const selection = useAtomValue(selectionAtom),
    ids = useAtomValue(selectedIdsAtom),
    canvas = useAtomValue(canvasAtom),
    dispatch = useSetAtom(designCommandAtom),
    select = useSetAtom(selectLayersAtom),
    duplicate = useSetAtom(duplicateSelectionAtom),
    remove = useSetAtom(deleteSelectionAtom),
    group = canvas?.groups.find((g) => g.id === selection?.groupId),
    doc = document,
    locked = ids.some((id) => isLocked(doc, id));
  function move(placement: "front" | "back") {
    if (ids.length === 1 || group)
      dispatch({
        type: "layer.relocate",
        source: { kind: group ? "group" : "element", id: group?.id ?? ids[0] },
        placement,
      });
  }
  return (
    <aside className={styles.inspector} aria-label="Properties inspector">
      <header className={styles.panelHeader}>
        <h2>
          {ids.length
            ? group
              ? "Group"
              : ids.length > 1
                ? "Selection"
                : "Properties"
            : "Document"}
        </h2>
        <div>
          {ids.length > 0 && (
            <>
              <ActionIcon
                aria-label={locked ? "Unlock selection" : "Lock selection"}
                variant="subtle"
                color="gray"
                size="xs"
                onClick={() => {
                  if (group)
                    dispatch({
                      type: "group.update",
                      id: group.id,
                      patch: { locked: !group.locked },
                    });
                  else
                    dispatch({
                      type: "layer.update",
                      ids,
                      patch: { locked: !locked },
                    });
                }}
              >
                {locked ? <Unlock size={13} /> : <Lock size={13} />}
              </ActionIcon>
              <ActionIcon
                aria-label="Duplicate selection"
                variant="subtle"
                color="gray"
                size="xs"
                disabled={locked}
                onClick={() => duplicate()}
              >
                <Copy size={13} />
              </ActionIcon>
              <ActionIcon
                aria-label="Delete block"
                variant="subtle"
                color="gray"
                size="xs"
                disabled={locked}
                onClick={() => remove()}
              >
                <Trash2 size={13} />
              </ActionIcon>
            </>
          )}
          <ActionIcon
            aria-label="Close properties"
            size="sm"
            variant="subtle"
            color="gray"
            onClick={close}
          >
            <X size={14} />
          </ActionIcon>
        </div>
      </header>
      {ids.length && doc.blocks[ids[0]] ? (
        <>
          <SelectedProperties id={ids[0]} />
          <section>
            <div className={styles.orderActions}>
              <Button
                size="compact-xs"
                variant="subtle"
                disabled={locked || (ids.length > 1 && !group)}
                leftSection={<ArrowUpToLine size={13} />}
                onClick={() => move("front")}
              >
                Front
              </Button>
              <Button
                size="compact-xs"
                variant="subtle"
                disabled={locked || (ids.length > 1 && !group)}
                leftSection={<ArrowDownToLine size={13} />}
                onClick={() => move("back")}
              >
                Back
              </Button>
              {group && (
                <Button
                  size="compact-xs"
                  variant="subtle"
                  disabled={locked}
                  leftSection={<Ungroup size={13} />}
                  onClick={() => {
                    dispatch({ type: "group.ungroup", id: group.id });
                    select({ ids: group.elementIds });
                  }}
                >
                  Ungroup
                </Button>
              )}
            </div>
            <Button
              variant="subtle"
              fullWidth
              size="xs"
              mt="md"
              onClick={() => {
                select({ ids: [] });
                showDocument();
              }}
            >
              Document settings
            </Button>
          </section>
        </>
      ) : (
        <DocumentProperties />
      )}
    </aside>
  );
}
