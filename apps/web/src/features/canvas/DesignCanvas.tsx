import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { useAtomValue, useSetAtom, useStore } from "jotai";
import {
  isLocked,
  groupFor,
  boundsForElements,
  type Layer,
} from "@resumi/engine";
import {
  resumeCss,
  resumeStyle,
  renderLayerContent,
  layerStyle,
  groupStyle,
  canvasFontCss,
} from "@resumi/cv";
import {
  blockAtom,
  sessionAtom,
  styleAtom,
  zoomAtom,
} from "../../state/editor";
import {
  canvasAtom,
  selectedIdsAtom,
  selectLayersAtom,
  designCommandAtom,
  toolAtom,
  shapeToolAtom,
  addLayerAtom,
} from "../../state/design";
import {
  snapMovement,
  resizeFrame,
  resizeHandles,
  type ResizeHandle,
  type Frame,
} from "../../lib/geometry";
import { useCanvasPan } from "./useCanvasPan";
import { CanvasText } from "./CanvasText";
import styles from "./styles/Canvas.module.css";
import controls from "./styles/Controls.module.css";
import viewportStyles from "./styles/Viewport.module.css";
function DesignLayer({
  id,
  groupLocked = false,
}: {
  id: string;
  groupLocked?: boolean;
}) {
  const block = useAtomValue(blockAtom(id)),
    selected = useAtomValue(selectedIdsAtom),
    zoom = useAtomValue(zoomAtom),
    store = useStore(),
    select = useSetAtom(selectLayersAtom),
    dispatch = useSetAtom(designCommandAtom),
    tool = useAtomValue(toolAtom);
  const [editing, setEditing] = useState(false),
    gesture = useRef<{
      x: number;
      y: number;
      ids: string[];
      nodes: HTMLElement[];
      resize?: Layer;
      handle?: ResizeHandle;
      nextFrame?: Frame;
      dx: number;
      dy: number;
      bounds: Frame;
      targets: { x: number[]; y: number[] };
      guides: HTMLElement[];
    } | null>(null);
  if (!block?.design || block.design.hidden) return null;
  const layer = block.design,
    locked = layer.locked || groupLocked,
    active = selected.includes(id);
  function start(event: PointerEvent<HTMLElement>, handle?: ResizeHandle) {
    if (event.button !== 0 || editing || tool !== "select") return;
    event.stopPropagation();
    if (locked) return;
    const doc = store.get(sessionAtom)!.document,
      group = groupFor(doc, id),
      old = store.get(selectedIdsAtom);
    let ids = event.shiftKey
      ? old.includes(id)
        ? old.filter((value) => value !== id)
        : [...old, id]
      : old.includes(id)
        ? old
        : group && !event.metaKey && !event.ctrlKey
          ? group.elementIds
          : [id];
    if (handle) ids = [id];
    select({
      ids,
      groupId:
        !event.shiftKey && group && ids === group.elementIds
          ? group.id
          : undefined,
    });
    if (event.shiftKey) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const nodes = ids
      .map((id) =>
        event.currentTarget
          .closest("article")
          ?.querySelector<HTMLElement>(`[data-layer-id="${id}"]`),
      )
      .filter((node): node is HTMLElement => !!node);
    const canvas = doc.canvas!,
      other = canvas.order
        .filter((id) => !ids.includes(id))
        .map((id) => doc.blocks[id].design!)
        .filter((layer) => !layer.hidden);
    gesture.current = {
      x: event.clientX,
      y: event.clientY,
      ids,
      nodes,
      resize: handle ? layer : undefined,
      handle,
      dx: 0,
      dy: 0,
      bounds: boundsForElements(ids.map((id) => doc.blocks[id].design!))!,
      targets: {
        x: [
          0,
          canvas.width / 2,
          canvas.width,
          ...other.flatMap((layer) => [
            layer.x,
            layer.x + layer.width / 2,
            layer.x + layer.width,
          ]),
        ],
        y: [
          0,
          canvas.height / 2,
          canvas.height,
          ...other.flatMap((layer) => [
            layer.y,
            layer.y + layer.height / 2,
            layer.y + layer.height,
          ]),
        ],
      },
      guides: [
        ...event.currentTarget
          .closest("article")!
          .querySelectorAll<HTMLElement>("[data-guide]"),
      ],
    };
  }
  function move(event: PointerEvent<HTMLElement>) {
    const drag = gesture.current;
    if (!drag) return;
    drag.dx = (event.clientX - drag.x) / (zoom / 100);
    drag.dy = (event.clientY - drag.y) / (zoom / 100);
    if (drag.resize) {
      const frame = resizeFrame(
        drag.resize,
        drag.handle!,
        drag.dx,
        drag.dy,
        drag.resize.aspectLocked || event.shiftKey,
      );
      drag.nextFrame = frame;
      const node = drag.nodes[0];
      node.style.left = `${frame.x}px`;
      node.style.top = `${frame.y}px`;
      node.style.width = `${frame.width}px`;
      node.style.height = `${frame.height}px`;
    } else {
      if (event.shiftKey) {
        if (Math.abs(drag.dx) > Math.abs(drag.dy)) drag.dy = 0;
        else drag.dx = 0;
      }
      const snap = event.altKey
        ? { dx: drag.dx, dy: drag.dy, guideX: undefined, guideY: undefined }
        : snapMovement(
            drag.bounds,
            drag.dx,
            drag.dy,
            drag.targets,
            6 / (zoom / 100),
          );
      drag.dx = snap.dx;
      drag.dy = snap.dy;
      drag.guides.forEach((guide, index) => {
        const value = index === 0 ? snap.guideX : snap.guideY;
        guide.style.display = value === undefined ? "none" : "block";
        if (value !== undefined)
          guide.style[index === 0 ? "left" : "top"] = `${value}px`;
      });
      for (const node of drag.nodes)
        node.style.translate = `${drag.dx}px ${drag.dy}px`;
    }
  }
  function finish(event: PointerEvent<HTMLElement>, cancel = false) {
    const drag = gesture.current;
    if (!drag) return;
    gesture.current = null;
    if (!cancel && (Math.abs(drag.dx) > 1 || Math.abs(drag.dy) > 1)) {
      if (drag.resize) {
        dispatch({
          type: "layer.update",
          ids: drag.ids,
          patch: drag.nextFrame!,
        });
      } else
        dispatch({
          type: "layer.translate",
          ids: drag.ids,
          dx: Math.round(drag.dx * 100) / 100,
          dy: Math.round(drag.dy * 100) / 100,
        });
    }
    drag.guides.forEach((guide) => (guide.style.display = "none"));
    for (const node of drag.nodes) {
      node.style.translate = "";
      if (drag.resize) {
        node.style.left = `${drag.resize.x}px`;
        node.style.top = `${drag.resize.y}px`;
        node.style.width = `${drag.resize.width}px`;
        node.style.height = `${drag.resize.height}px`;
      }
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }
  return (
    <div
      data-layer-id={id}
      data-layer-name={layer.name}
      data-edit-block={id}
      className={`${styles.layer} ${active ? styles.selected : ""} ${locked ? styles.locked : ""}`}
      style={layerStyle(layer) as CSSProperties}
      onPointerDown={(e) => start(e)}
      onPointerMove={move}
      onPointerUp={finish}
      onPointerCancel={(e) => finish(e, true)}
      onLostPointerCapture={(e) => finish(e, true)}
      onDoubleClick={() => {
        if (!locked && layer.type === "text") {
          select({ ids: [id] });
          setEditing(true);
        }
      }}
    >
      {editing && layer.type === "text" ? (
        <CanvasText block={block} finish={() => setEditing(false)} />
      ) : (
        <div
          role="button"
          tabIndex={locked ? -1 : 0}
          aria-label={`Edit ${block.kind}: ${block.text.slice(0, 45) || layer.name}`}
          aria-pressed={active}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !locked) {
              select({ ids: [id] });
              if (layer.type === "text") setEditing(true);
            }
          }}
          dangerouslySetInnerHTML={{ __html: renderLayerContent(block) }}
        />
      )}
      {active && !locked && !editing && selected.length === 1 && (
        <>
          {resizeHandles.map((handle) => (
            <button
              key={handle}
              className={controls.handle}
              data-handle={handle}
              aria-label={
                handle === "se"
                  ? `Resize ${layer.name}`
                  : `Resize ${layer.name} ${handle}`
              }
              onPointerDown={(e) => {
                e.stopPropagation();
                start(e, handle);
              }}
              onPointerMove={move}
              onPointerUp={finish}
              onPointerCancel={(e) => finish(e, true)}
            />
          ))}
          <span className={controls.size}>
            {Math.round(layer.width)} × {Math.round(layer.height)}
          </span>
        </>
      )}
    </div>
  );
}
export function DesignCanvas() {
  const pan = useCanvasPan();
  const canvas = useAtomValue(canvasAtom),
    zoom = useAtomValue(zoomAtom),
    style = useAtomValue(styleAtom),
    tool = useAtomValue(toolAtom),
    shape = useAtomValue(shapeToolAtom),
    store = useStore(),
    select = useSetAtom(selectLayersAtom),
    add = useSetAtom(addLayerAtom),
    marquee = useRef<HTMLDivElement>(null),
    drag = useRef<{ x: number; y: number; shift: boolean } | null>(null);
  if (!canvas || !style) return null;
  const seen = new Set<string>();
  function point(event: PointerEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    return {
      x: (event.clientX - bounds.left) / (zoom / 100),
      y: (event.clientY - bounds.top) / (zoom / 100),
    };
  }
  function start(event: PointerEvent<HTMLElement>) {
    if (
      event.button !== 0 ||
      (tool === "select" && event.target !== event.currentTarget)
    )
      return;
    if (tool !== "select") {
      event.preventDefault();
      event.stopPropagation();
    }
    const position = point(event);
    drag.current = { ...position, shift: event.shiftKey };
    event.currentTarget.setPointerCapture(event.pointerId);
    if (!event.shiftKey) select({ ids: [] });
  }
  function move(event: PointerEvent<HTMLElement>) {
    const initial = drag.current,
      node = marquee.current;
    if (!initial || !node) return;
    const current = point(event);
    node.style.display = "block";
    node.style.left = `${Math.min(initial.x, current.x)}px`;
    node.style.top = `${Math.min(initial.y, current.y)}px`;
    node.style.width = `${Math.abs(current.x - initial.x)}px`;
    node.style.height = `${Math.abs(current.y - initial.y)}px`;
  }
  function finish(event: PointerEvent<HTMLElement>, cancel = false) {
    const initial = drag.current;
    if (!initial) return;
    drag.current = null;
    const end = point(event),
      x = Math.min(initial.x, end.x),
      y = Math.min(initial.y, end.y),
      width = Math.abs(end.x - initial.x),
      height = Math.abs(end.y - initial.y);
    if (marquee.current) marquee.current.style.display = "none";
    if (!cancel) {
      if (tool === "text" || tool === "shape")
        add({
          type: tool,
          patch: {
            ...(tool === "shape" ? shape : {}),
            x: Math.round(x),
            y: Math.round(y),
            ...(width > 8 && height > 8
              ? { width: Math.round(width), height: Math.round(height) }
              : {}),
          },
        });
      else if (width > 4 && height > 4) {
        const doc = store.get(sessionAtom)!.document,
          ids = doc.canvas!.order.filter((id) => {
            const layer = doc.blocks[id].design!,
              group = groupFor(doc, id);
            return (
              !layer.hidden &&
              !group?.hidden &&
              !isLocked(doc, id) &&
              layer.x + layer.width > x &&
              layer.x < x + width &&
              layer.y + layer.height > y &&
              layer.y < y + height
            );
          });
        select({
          ids: initial.shift
            ? [...new Set([...store.get(selectedIdsAtom), ...ids])]
            : ids,
        });
      }
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }
  return (
    <div
      className={`${styles.viewport} ${viewportStyles.scroll}`}
      {...pan}
      onClick={(e) => {
        if (e.target === e.currentTarget) select({ ids: [] });
      }}
    >
      <div
        className={styles.stage}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) select({ ids: [] });
        }}
      >
        <style>
          {resumeCss}
          {canvasFontCss({ canvas })}
        </style>
        <div
          className={styles.paperBounds}
          style={{
            width: (canvas.width * zoom) / 100,
            height: (canvas.height * zoom) / 100,
          }}
        >
          <article
            className={`resume freeform ${styles.paper}`}
            aria-label="Resume canvas"
            style={{
              ...resumeStyle({ style } as Parameters<typeof resumeStyle>[0]),
              width: canvas.width,
              height: canvas.height,
              background: canvas.background,
              transform: `scale(${zoom / 100})`,
              cursor: tool === "select" ? "default" : "crosshair",
            }}
            onPointerDownCapture={(e) => {
              if (tool !== "select") start(e);
            }}
            onPointerDown={(e) => {
              if (tool === "select") start(e);
            }}
            onPointerMove={move}
            onPointerUp={(e) => finish(e)}
            onPointerCancel={(e) => finish(e, true)}
          >
            {canvas.order.map((id) => {
              const group = canvas.groups.find((g) =>
                g.elementIds.includes(id),
              );
              if (!group) return <DesignLayer key={id} id={id} />;
              if (seen.has(group.id) || group.hidden) return null;
              seen.add(group.id);
              return (
                <div
                  key={group.id}
                  className="design-group"
                  data-group-id={group.id}
                  style={groupStyle(group) as CSSProperties}
                >
                  {canvas.order
                    .filter((id) => group.elementIds.includes(id))
                    .map((id) => (
                      <DesignLayer
                        key={id}
                        id={id}
                        groupLocked={group.locked}
                      />
                    ))}
                </div>
              );
            })}
            <div ref={marquee} className={styles.marquee} />
            <div data-guide="x" className={styles.guideX} />
            <div data-guide="y" className={styles.guideY} />
          </article>
        </div>
      </div>
    </div>
  );
}
