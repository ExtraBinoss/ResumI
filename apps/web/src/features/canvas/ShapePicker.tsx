import { useTranslation } from "react-i18next";
import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Popover, ActionIcon, Loader } from "../../ui";
import { Shapes, Smile, Upload } from "lucide-react";
import { SHAPE_CATALOG, type LayerPatch } from "@resumi/engine";
import { loadAssets } from "@resumi/assets";
import { useSetAtom, useAtomValue, useStore } from "jotai";
import { shapeToolAtom, toolAtom } from "../../state/design";
import { sessionAtom } from "../../state/editor";
import { Button } from "../../components/ui/button";
import { AnimatedSegments } from "../../components/AnimatedSegments";
import { SearchInput } from "../../components/SearchInput";
import { createSearchIndex } from "../../lib/search-index";
import { PaletteVector } from "./PaletteVector";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { ErrorMessage } from "../../components/ErrorNotice";
import { ScrollShadow } from "../../components/ScrollShadow";
import { importSvg } from "../../lib/svg-import";
import styles from "./styles/Palette.module.css";

type Vector = NonNullable<LayerPatch["vector"]>;
type Item = Vector & { id: string; name: string; category?: string };
type Category = "icons" | "brands" | "imported";
let gallery: Promise<Item[]> | undefined,
  icons: Promise<Item[]> | undefined,
  brands: Promise<Item[]> | undefined;
function loadIcons() {
  return (icons ??= loadAssets("icons"));
}
function loadBrands() {
  return (brands ??= loadAssets("brands"));
}
function vectorKey(item: Item) {
  return JSON.stringify([
    item.viewBox,
    item.path,
    item.parts,
    item.attribution,
  ]);
}
export function ShapePicker({ icon = false }: { icon?: boolean }) {
  const { t } = useTranslation();
  const title = t(icon ? "assets.icons" : "assets.shapes");
  const [open, setOpen] = useState(false),
    [tooltipOpen, setTooltipOpen] = useState(false),
    [items, setItems] = useState<Item[]>(icon ? [] : SHAPE_CATALOG),
    [brandItems, setBrandItems] = useState<Item[]>([]),
    [imported, setImported] = useState<Item[]>([]),
    [category, setCategory] = useState<Category>("icons"),
    [query, setQuery] = useState(""),
    [scrollTop, setScrollTop] = useState(0),
    scroll = useRef<HTMLDivElement>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    loadRequest = useRef(0),
    fileInput = useRef<HTMLInputElement>(null),
    reduced = useReducedMotion(),
    store = useStore(),
    setShape = useSetAtom(shapeToolAtom),
    setTool = useSetAtom(toolAtom),
    tool = useAtomValue(toolAtom);
  function readSavedImports() {
    const doc = store.get(sessionAtom)?.document;
    if (!doc) return;
    const saved: Item[] = [];
    for (const block of Object.values(doc.blocks)) {
      const vector =
        block.design?.type === "shape" ? block.design.vector : undefined;
      if (vector?.attribution?.startsWith("Imported SVG:"))
        saved.push({
          ...vector,
          id: `saved:${block.id}`,
          name: block.design!.name,
        });
    }
    setImported((current) => {
      const seen = new Set(current.map(vectorKey));
      return [
        ...current,
        ...saved.filter((item) => {
          const key = vectorKey(item);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }),
      ];
    });
  }
  async function load(next: Category = category) {
    const request = ++loadRequest.current;
    setLoading(true);
    try {
      if (!icon) {
        const data = await (gallery ??= loadAssets("shapes"));
        setItems(data);
      } else if (next === "icons") setItems(await loadIcons());
      else if (next === "brands") setBrandItems(await loadBrands());
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "The icon library could not be opened.",
      );
    } finally {
      if (request === loadRequest.current) setLoading(false);
    }
  }
  function openPalette(next: boolean) {
    setOpen(next);
    if (!next) return;
    setError("");
    readSavedImports();
    void load();
  }
  function prefetch() {
    if (icon) void loadIcons().catch(() => {});
  }
  function choose(item: Item) {
    const patch: LayerPatch =
      !icon && SHAPE_CATALOG.some((shape) => shape.id === item.id)
        ? { shape: item.id, vector: undefined }
        : {
            shape: "custom-icon",
            vector: {
              path: item.path,
              viewBox: item.viewBox,
              strokeOnly: item.strokeOnly,
              parts: item.parts,
              attribution: item.attribution,
            },
          };
    setShape({ ...patch, name: item.name });
    setTool("shape");
    setOpen(false);
  }
  async function importFile(file: File | undefined) {
    if (!file) return;
    setError("");
    try {
      if (file.size > 256000) throw new Error("Choose an SVG under 256 KB.");
      const item = importSvg(await file.text(), file.name);
      setImported((current) => [
        ...current.filter(
          (existing) => vectorKey(existing) !== vectorKey(item),
        ),
        item,
      ]);
      setCategory("imported");
      setQuery("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "This SVG could not be imported.",
      );
    }
  }
  const collection =
    !icon || category === "icons"
      ? items
      : category === "brands"
        ? brandItems
        : imported;
  const index = useMemo(
    () =>
      createSearchIndex(collection, {
        text: (item) => item.name,
        keywords: (item) => item.category ?? "",
      }),
    [collection],
  );
  const filtered = index.search(query, { limit: collection.length });
  const firstRow = Math.max(0, Math.floor(scrollTop / 51) - 1);
  const visible = filtered.slice(firstRow * 5, (firstRow + 8) * 5);
  function resetScroll() {
    setScrollTop(0);
    const viewport = scroll.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-shadow-viewport"]',
    );
    if (viewport) viewport.scrollTop = 0;
  }
  return (
    <Popover opened={open} onChange={openPalette} position="top" width={320}>
      <Tooltip open={!open && tooltipOpen} onOpenChange={setTooltipOpen}>
        <Popover.Target>
          <TooltipTrigger
            render={
              <ActionIcon
                variant={tool === "shape" && open ? "light" : "subtle"}
                color="gray"
                aria-label={title}
                onPointerEnter={prefetch}
                onFocus={prefetch}
                onClick={() => openPalette(!open)}
              >
                {icon ? (
                  <Smile size={18} aria-hidden />
                ) : (
                  <Shapes size={18} aria-hidden />
                )}
              </ActionIcon>
            }
          />
        </Popover.Target>
        <TooltipContent side="top">{title}</TooltipContent>
      </Tooltip>
      <Popover.Dropdown className={styles.picker}>
        <header>
          <strong>{title}</strong>
          {icon && (
            <Button
              variant={
                category === "imported" && imported.length ? "default" : "ghost"
              }
              size="xs"
              onClick={() => fileInput.current?.click()}
            >
              <Upload size={14} aria-hidden />
              {t("assets.import")}
            </Button>
          )}
        </header>
        {icon && (
          <AnimatedSegments
            value={category}
            aria-label="Icon categories"
            className={styles.categories}
            items={[
              { value: "icons", label: t("assets.icons") },
              { value: "brands", label: t("assets.brands") },
              { value: "imported", label: t("assets.imported") },
            ]}
            onChange={(value) => {
              const next = value as Category;
              setCategory(next);
              setQuery("");
              setError("");
              resetScroll();
              void load(next);
            }}
          />
        )}
        <div className={styles.search}>
          <SearchInput
            size="xs"
            prefix={t("assets.search")}
            autoFocus
            captureTyping={open}
            focusKey={category}
            aria-label={icon ? "Search icons" : "Search shapes"}
            hints={collection.slice(0, 6).map((item) => ({
              label: item.name,
              preview: <PaletteVector item={item} />,
            }))}
            value={query}
            onKeyDown={(event) => {
              if (event.key === "Enter" && filtered[0]) {
                event.preventDefault();
                choose(filtered[0]);
              }
            }}
            onChange={(event) => {
              setQuery(event.currentTarget.value);
              resetScroll();
            }}
          />
        </div>
        <input
          ref={fileInput}
          hidden
          type="file"
          accept="image/svg+xml,.svg"
          aria-label="Import SVG file"
          onChange={(event) => {
            void importFile(event.currentTarget.files?.[0]);
            event.currentTarget.value = "";
          }}
        />
        {error && (
          <div className={styles.error}>
            <ErrorMessage error={error} label="Could not import icon" />
          </div>
        )}
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={icon ? category : "shapes"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.12 }}
          >
            <ScrollShadow
              ref={scroll}
              className={styles.scroller}
              onScrollCapture={(event) =>
                setScrollTop((event.target as HTMLElement).scrollTop)
              }
              role="region"
              aria-label={icon ? "Icon library" : "Shape library"}
            >
              {loading ? (
                <div className={styles.empty}>
                  <Loader size="xs" label={t("loading.library")} text />
                </div>
              ) : (
                <>
                  <div
                    className={styles.shapeSpace}
                    style={{ height: Math.ceil(filtered.length / 5) * 51 + 15 }}
                  >
                    <div
                      className={styles.shapeGrid}
                      style={{ top: firstRow * 51 }}
                    >
                      {visible.map((item) => (
                        <button
                          key={item.id}
                          title={item.name}
                          aria-label={`Use ${item.name}`}
                          onClick={() => choose(item)}
                        >
                          <PaletteVector item={item} />
                        </button>
                      ))}
                    </div>
                  </div>
                  {filtered.length === 0 && (
                    <div className={styles.empty}>
                      {icon && category === "imported" && !query ? (
                        <Button onClick={() => fileInput.current?.click()}>
                          <Upload size={15} aria-hidden />
                          {t("assets.import")}
                        </Button>
                      ) : (
                        "No matches."
                      )}
                    </div>
                  )}
                  {filtered.length > 40 && (
                    <small className={styles.count}>
                      {filtered.length} results
                    </small>
                  )}
                </>
              )}
            </ScrollShadow>
          </motion.div>
        </AnimatePresence>
        <p className={styles.hint}>Choose, then click or drag on the canvas.</p>
      </Popover.Dropdown>
    </Popover>
  );
}
