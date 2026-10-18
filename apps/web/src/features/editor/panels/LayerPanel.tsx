import { useTranslation } from "react-i18next";
import { useAtomValue, useSetAtom } from "jotai";
import {
  Layers3,
  Sun,
  ChevronsDownUp,
  ChevronsUpDown,
  Plus,
} from "lucide-react";
import { LayoutGroup } from "motion/react";
import { blendModes, type LayerGroup as Group } from "@resumi/engine";
import { ActionIcon, Select, NumberInput, Tooltip } from "../../../ui";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Accordion } from "../../../components/ui/accordion";
import { ScrollShadow } from "../../../components/ScrollShadow";
import {
  canvasAtom,
  designCommandAtom,
  pagesAtom,
  activePageIdAtom,
  selectedIdsAtom,
  addPageAtom,
} from "../../../state/design";
import { blockAtom, selectionAtom } from "../../../state/editor";
import {
  useBlendPreview,
  useOpacityPreview,
} from "../../canvas/useBlendPreview";
import { LegacyLayers } from "./LegacyLayers";
import { LayerRow } from "./LayerRow";
import { LayerGroup } from "./LayerGroup";
import { useLayerReorder } from "./useLayerReorder";
import styles from "../styles/Composition.module.css";

export function LayerPanel() {
  const { t } = useTranslation();
  const canonicalCanvas = useAtomValue(canvasAtom),
    { treeRef, preview: reorderPreview, dragging, bind } = useLayerReorder();
  const selection = useAtomValue(selectionAtom),
    selected = useAtomValue(selectedIdsAtom);
  const dispatch = useSetAtom(designCommandAtom);
  const addPage = useSetAtom(addPageAtom);
  const pages = useAtomValue(pagesAtom),
    activePageId = useAtomValue(activePageIdAtom),
    setActivePage = useSetAtom(activePageIdAtom);
  const canvas = reorderPreview ?? canonicalCanvas;
  const primary = useAtomValue(blockAtom(selected[0] ?? ""))?.design;
  const previewBlend = useBlendPreview({
    ids: selected,
    groupId: selection?.groupId,
  });
  const previewOpacity = useOpacityPreview({
    ids: selected,
    groupId: selection?.groupId,
  });
  if (!canvas)
    return (
      <div className={styles.layers}>
        <LegacyLayers embedded />
      </div>
    );
  const group = canvas.groups.find((g) => g.id === selection?.groupId);
  const opacity = group?.opacity ?? primary?.opacity ?? 1;
  const blend = group?.blendMode ?? primary?.blendMode ?? "normal";
  const expanded = canvas.groups.filter((g) => !g.collapsed).map((g) => g.id);
  const memberships = new Map(
    canvas.groups.flatMap((g) => g.elementIds.map((id) => [id, g] as const)),
  );
  const seen = new Set<string>();
  const entries = [...canvas.order]
    .reverse()
    .flatMap<{ id: string; group: Group | undefined }>((id) => {
      const parent = memberships.get(id);
      if (!parent) return [{ id, group: undefined }];
      if (seen.has(parent.id)) return [];
      seen.add(parent.id);
      return [{ id: parent.id, group: parent }];
    });
  function patch(value: { opacity?: number; blendMode?: Group["blendMode"] }) {
    if (group) dispatch({ type: "group.update", id: group.id, patch: value });
    else if (selected.length)
      dispatch({ type: "layer.update", ids: selected, patch: value });
  }
  function changeExpanded(ids: string[]) {
    const changes = canvas!.groups.filter(
      (g) => g.collapsed === ids.includes(g.id),
    );
    if (changes.length)
      dispatch({
        version: 1,
        actor: { kind: "human", name: "Layer groups" },
        commands: changes.map((g) => ({
          type: "group.update",
          id: g.id,
          patch: { collapsed: !ids.includes(g.id) },
        })),
      });
  }
  return (
    <aside className={styles.layers} aria-label={t("layers.layersPanel")}>
      <header className={styles.compositionHeader}>
        <h2>
          <Layers3 size={16} aria-hidden /> {t("layers.layers")}
        </h2>
        <div>
          {!!canvas.groups.length && (
            <>
              <ActionIcon
                size="xs"
                variant="subtle"
                color="gray"
                aria-label={t(
                  expanded.length
                    ? "layers.collapseAllGroups"
                    : "layers.expandAllGroups",
                )}
                onClick={() =>
                  changeExpanded(
                    expanded.length ? [] : canvas.groups.map((g) => g.id),
                  )
                }
              >
                {expanded.length ? (
                  <ChevronsDownUp size={14} aria-hidden />
                ) : (
                  <ChevronsUpDown size={14} aria-hidden />
                )}
              </ActionIcon>
            </>
          )}
        </div>
      </header>
      <Tabs
        value={activePageId}
        onValueChange={(id) => setActivePage(String(id))}
        className={styles.pageTabs}
      >
        <ScrollShadow orientation="horizontal" className={styles.pageScroll}>
          <div className={styles.pageTabRow}>
            <TabsList
              variant="line"
              className={styles.pageTabList}
              aria-label={t("layers.pages")}
            >
              {pages.map((page, index) => (
                <TabsTrigger
                  key={page.id}
                  value={page.id}
                  className={styles.pageTab}
                >
                  {t("layers.page", { number: index + 1 })}
                </TabsTrigger>
              ))}
            </TabsList>
            <Tooltip label={t("pages.add")}>
              <ActionIcon
                className={styles.pageAdd}
                size="xs"
                variant="subtle"
                color="gray"
                aria-label={t("pages.add")}
                onClick={() => addPage()}
              >
                <Plus size={15} aria-hidden />
              </ActionIcon>
            </Tooltip>
          </div>
        </ScrollShadow>
      </Tabs>
      <div className={styles.tabContent}>
        <div className={styles.blendRow}>
          <Select
            aria-label={t("layers.blendMode")}
            size="xs"
            value={blend}
            disabled={!selected.length}
            data={[...blendModes].map((value) => ({
              value,
              label: t(
                `layers.blend${value
                  .split("-")
                  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                  .join("")}`,
              ),
            }))}
            allowDeselect={false}
            onOptionPreview={previewBlend}
            onChange={(value) => {
              if (value) patch({ blendMode: value as Group["blendMode"] });
            }}
          />
          <NumberInput
            aria-label={t("layers.opacity")}
            scrubLabel={<Sun size={16} aria-hidden />}
            unit="%"
            onPreview={previewOpacity}
            size="xs"
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
        <ScrollShadow
          className={styles.layerScroll}
          contentClassName={styles.layerList}
          aria-label={t("layers.compositionLayers")}
        >
          <div
            ref={treeRef}
            className={styles.reorderTree}
            data-reordering={dragging || undefined}
          >
            <LayoutGroup id="layer-order">
              <Accordion
                multiple
                value={expanded}
                onValueChange={changeExpanded}
                className={styles.layerTree}
              >
                {entries.map((entry) =>
                  entry.group ? (
                    <LayerGroup
                      key={entry.id}
                      group={entry.group}
                      ids={[...canvas.order]
                        .reverse()
                        .filter((id) => memberships.get(id)?.id === entry.id)}
                      active={selection?.groupId === entry.id}
                      bind={bind}
                    />
                  ) : (
                    <LayerRow
                      key={entry.id}
                      id={entry.id}
                      drag={bind({ kind: "element", id: entry.id })}
                    />
                  ),
                )}
              </Accordion>
            </LayoutGroup>
          </div>
        </ScrollShadow>
      </div>
    </aside>
  );
}
