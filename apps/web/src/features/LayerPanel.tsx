import { useState, type DragEvent } from "react";
import { useAtomValue, useSetAtom, useStore } from "jotai";
import { ActionIcon, Select, NumberInput, Menu } from "../ui";
import {
  Layers3,
  ListTree,
  X,
  Type,
  Image,
  Square,
  Folder,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Group,
  Ungroup,
  Copy,
  Trash2,
  ArrowUpToLine,
  ArrowDownToLine,
  MoreHorizontal,
} from "lucide-react";
import {
  blendModes,
  type LayerReference,
  type LayerGroup,
} from "@resumi/engine";
import {
  canvasAtom,
  designCommandAtom,
  selectedIdsAtom,
  selectLayersAtom,
  groupSelectionAtom,
  duplicateSelectionAtom,
  deleteSelectionAtom,
} from "../state/design";
import { blockAtom, selectionAtom } from "../state/editor";
import { Structure } from "./Structure";
import styles from "../styles/LayerPanels.module.css";
function transfer(event: DragEvent): LayerReference | undefined {
  try {
    const value = JSON.parse(
      event.dataTransfer.getData("application/x-resumi-layer"),
    );
    if (
      value &&
      ["element", "group"].includes(value.kind) &&
      typeof value.id === "string"
    )
      return value;
  } catch {
    /* Ignore unrelated external drag data. */
  }
}
function Row({ id, group }: { id: string; group?: LayerGroup }) {
  const block = useAtomValue(blockAtom(id)),
    selected = useAtomValue(selectedIdsAtom),
    selection = useAtomValue(selectionAtom),
    dispatch = useSetAtom(designCommandAtom),
    select = useSetAtom(selectLayersAtom),
    store = useStore();
  if (!block?.design) return null;
  const layer = block.design,
    ref: LayerReference = { kind: "element", id },
    locked = layer.locked || group?.locked,
    active = selected.includes(id);
  return (
    <div
      className={`${styles.layerRow} ${active ? styles.active : ""} ${group ? styles.member : ""}`}
      data-layer-row={id}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(
          "application/x-resumi-layer",
          JSON.stringify(ref),
        );
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const source = transfer(e);
        if (source)
          dispatch({
            type: "layer.relocate",
            source,
            target: ref,
            placement:
              e.clientY <
              e.currentTarget.getBoundingClientRect().top +
                e.currentTarget.offsetHeight / 2
                ? "above"
                : "below",
          });
      }}
    >
      <button
        className={styles.layerName}
        aria-label={`Select layer ${layer.name}`}
        aria-pressed={active}
        onClick={(e) =>
          select({
            ids: e.shiftKey
              ? active
                ? selected.filter((value) => value !== id)
                : [...selected, id]
              : [id],
          })
        }
        onDoubleClick={() => {
          const name = window.prompt("Layer name", layer.name);
          if (name?.trim())
            dispatch({
              type: "layer.update",
              ids: [id],
              patch: { name: name.trim().slice(0, 120) },
            });
        }}
      >
        {layer.type === "text" ? (
          <Type size={13} />
        ) : layer.type === "image" ? (
          <Image size={13} />
        ) : (
          <Square size={12} />
        )}
        <span>{layer.name}</span>
      </button>
      <ActionIcon
        size="xs"
        color="gray"
        variant="subtle"
        aria-label={`${layer.hidden ? "Show" : "Hide"} layer ${layer.name}`}
        onClick={() =>
          dispatch({
            type: "layer.update",
            ids: [id],
            patch: { hidden: !layer.hidden },
          })
        }
      >
        {layer.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
      </ActionIcon>
      <ActionIcon
        size="xs"
        color="gray"
        variant="subtle"
        aria-label={`${locked ? "Unlock" : "Lock"} layer ${layer.name}`}
        disabled={!!group?.locked}
        onClick={() =>
          dispatch({
            type: "layer.update",
            ids: [id],
            patch: { locked: !layer.locked },
          })
        }
      >
        {locked ? <Lock size={12} /> : <Unlock size={12} />}
      </ActionIcon>
      <Menu position="right-start">
        <Menu.Target>
          <ActionIcon
            size="xs"
            color="gray"
            variant="subtle"
            aria-label={`Actions for layer ${layer.name}`}
            onClick={() => {
              if (selection?.groupId || !selected.includes(id))
                select({ ids: [id] });
            }}
          >
            <MoreHorizontal size={12} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            disabled={locked}
            leftSection={<ArrowUpToLine size={13} />}
            onClick={() =>
              dispatch({
                type: "layer.relocate",
                source: ref,
                placement: "front",
              })
            }
          >
            Bring to front
          </Menu.Item>
          <Menu.Item
            disabled={locked}
            leftSection={<ArrowDownToLine size={13} />}
            onClick={() =>
              dispatch({
                type: "layer.relocate",
                source: ref,
                placement: "back",
              })
            }
          >
            Send to back
          </Menu.Item>
          <Menu.Item
            disabled={locked}
            leftSection={<Copy size={13} />}
            onClick={() => store.set(duplicateSelectionAtom)}
          >
            Duplicate
          </Menu.Item>
          <Menu.Item
            disabled={locked}
            color="red"
            leftSection={<Trash2 size={13} />}
            onClick={() => store.set(deleteSelectionAtom)}
          >
            Delete layer
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </div>
  );
}
export function LayerPanel({
  close,
  openSettings,
}: {
  close: () => void;
  openSettings: () => void;
}) {
  const [tab, setTab] = useState<"layers" | "outline">("layers"),
    canvas = useAtomValue(canvasAtom),
    selection = useAtomValue(selectionAtom),
    selected = useAtomValue(selectedIdsAtom),
    dispatch = useSetAtom(designCommandAtom),
    select = useSetAtom(selectLayersAtom),
    groupSelection = useSetAtom(groupSelectionAtom);
  const primary = useAtomValue(blockAtom(selected[0] ?? ""))?.design;
  if (!canvas) return <Structure close={close} openSettings={openSettings} />;
  const group = canvas.groups.find((g) => g.id === selection?.groupId),
    opacity = group?.opacity ?? primary?.opacity ?? 1,
    blend = group?.blendMode ?? primary?.blendMode ?? "normal",
    seen = new Set<string>();
  function patch(patch: {
    opacity?: number;
    blendMode?: LayerGroup["blendMode"];
  }) {
    if (group) dispatch({ type: "group.update", id: group.id, patch });
    else if (selected.length)
      dispatch({ type: "layer.update", ids: selected, patch });
  }
  return (
    <aside className={styles.layers} aria-label="Layers panel">
      <header className={styles.tabs}>
        <button
          aria-pressed={tab === "layers"}
          onClick={() => setTab("layers")}
        >
          <Layers3 size={14} />
          Layers
        </button>
        <button
          aria-pressed={tab === "outline"}
          onClick={() => setTab("outline")}
        >
          <ListTree size={14} />
          Outline
        </button>
        <ActionIcon
          aria-label="Close outline"
          size="sm"
          variant="subtle"
          color="gray"
          onClick={close}
        >
          <X size={14} />
        </ActionIcon>
      </header>
      {tab === "outline" ? (
        <Structure embedded close={close} openSettings={openSettings} />
      ) : (
        <>
          <div className={styles.blendRow}>
            <Select
              aria-label="Selection blend mode"
              size="xs"
              value={blend}
              disabled={!selected.length}
              data={[...blendModes].map((value) => ({
                value,
                label: value.replaceAll("-", " "),
              }))}
              allowDeselect={false}
              onChange={(value) => {
                if (value)
                  patch({ blendMode: value as LayerGroup["blendMode"] });
              }}
            />
            <NumberInput
              aria-label="Selection opacity"
              size="xs"
              suffix="%"
              hideControls
              min={0}
              max={100}
              value={Math.round(opacity * 100)}
              disabled={!selected.length}
              onChange={(value) => {
                if (typeof value === "number" && value >= 0 && value <= 100)
                  patch({ opacity: value / 100 });
              }}
            />
          </div>
          <div className={styles.layerList}>
            {[...canvas.order].reverse().map((id) => {
              const group = canvas.groups.find((g) =>
                g.elementIds.includes(id),
              );
              if (!group) return <Row key={id} id={id} />;
              if (seen.has(group.id)) return null;
              seen.add(group.id);
              return (
                <div key={group.id} data-layer-group={group.id}>
                  <div
                    className={`${styles.groupRow} ${selection?.groupId === group.id ? styles.active : ""}`}
                    draggable
                    onDragStart={(e) =>
                      e.dataTransfer.setData(
                        "application/x-resumi-layer",
                        JSON.stringify({ kind: "group", id: group.id }),
                      )
                    }
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const source = transfer(e);
                      if (source)
                        dispatch({
                          type: "layer.relocate",
                          source,
                          target: { kind: "group", id: group.id },
                          placement:
                            source.kind === "element" ? "inside" : "above",
                        });
                    }}
                  >
                    <ActionIcon
                      aria-label={`${group.collapsed ? "Expand" : "Collapse"} group ${group.name}`}
                      size="xs"
                      color="gray"
                      variant="subtle"
                      onClick={() =>
                        dispatch({
                          type: "group.update",
                          id: group.id,
                          patch: { collapsed: !group.collapsed },
                        })
                      }
                    >
                      {group.collapsed ? (
                        <ChevronRight size={12} />
                      ) : (
                        <ChevronDown size={12} />
                      )}
                    </ActionIcon>
                    <button
                      className={styles.layerName}
                      aria-label={`Select group ${group.name}`}
                      onClick={() =>
                        select({ ids: group.elementIds, groupId: group.id })
                      }
                    >
                      <Folder size={13} />
                      <span>{group.name}</span>
                      <small>{group.elementIds.length}</small>
                    </button>
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      color="gray"
                      aria-label={`${group.hidden ? "Show" : "Hide"} group ${group.name}`}
                      onClick={() =>
                        dispatch({
                          type: "group.update",
                          id: group.id,
                          patch: { hidden: !group.hidden },
                        })
                      }
                    >
                      {group.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                    </ActionIcon>
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      color="gray"
                      aria-label={`${group.locked ? "Unlock" : "Lock"} group ${group.name}`}
                      onClick={() =>
                        dispatch({
                          type: "group.update",
                          id: group.id,
                          patch: { locked: !group.locked },
                        })
                      }
                    >
                      {group.locked ? <Lock size={12} /> : <Unlock size={12} />}
                    </ActionIcon>
                  </div>
                  {!group.collapsed &&
                    [...canvas.order]
                      .reverse()
                      .filter((id) => group.elementIds.includes(id))
                      .map((id) => <Row key={id} id={id} group={group} />)}
                </div>
              );
            })}
          </div>
          <footer className={styles.layerFooter}>
            <span>
              {selected.length
                ? `${selected.length} selected`
                : `${canvas.order.length} layers`}
            </span>
            <ActionIcon
              aria-label="Group selected layers"
              disabled={selected.length < 2 || !!group}
              variant="subtle"
              color="gray"
              onClick={() => groupSelection()}
            >
              <Group size={15} />
            </ActionIcon>
            <ActionIcon
              aria-label="Ungroup selected group"
              disabled={!group || group.locked}
              variant="subtle"
              color="gray"
              onClick={() => {
                if (group) {
                  dispatch({ type: "group.ungroup", id: group.id });
                  select({ ids: group.elementIds });
                }
              }}
            >
              <Ungroup size={15} />
            </ActionIcon>
          </footer>
          <p className={styles.help}>
            Shift-click to select more. Drag to reorder or move into a group.
          </p>
        </>
      )}
    </aside>
  );
}
