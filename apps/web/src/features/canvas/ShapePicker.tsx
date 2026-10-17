import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Popover, ActionIcon, TextInput, Loader } from "../../ui";
import { Shapes, Smile, Search, Upload } from "lucide-react";
import { SHAPE_CATALOG, type LayerPatch } from "@resumi/engine";
import { useSetAtom, useAtomValue, useStore } from "jotai";
import { shapeToolAtom, toolAtom } from "../../state/design";
import { sessionAtom } from "../../state/editor";
import { Button } from "../../components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
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
type BrandCatalog = {
  credits: Record<string, string>;
  icons: (Item & { source: string; license: string })[];
};
let gallery: Promise<Item[]> | undefined,
  icons: Promise<Item[]> | undefined,
  brands: Promise<Item[]> | undefined;
function loadIcons() {
  return (icons ??= import("../../data/icons.json").then(
    (module) => module.default,
  ));
}
function loadBrands() {
  return (brands ??= import("../../data/brands.json").then((module) => {
    const catalog = module.default as BrandCatalog;
    return catalog.icons.map((item) => ({
      ...item,
      attribution: `${catalog.credits[item.license]}\nSource: ${item.source}`,
    }));
  }));
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
  const [open, setOpen] = useState(false),
    [tooltipOpen, setTooltipOpen] = useState(false),
    [items, setItems] = useState<Item[]>(icon ? [] : SHAPE_CATALOG),
    [brandItems, setBrandItems] = useState<Item[]>([]),
    [imported, setImported] = useState<Item[]>([]),
    [category, setCategory] = useState<Category>("icons"),
    [query, setQuery] = useState(""),
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
        const data = await (gallery ??= import("../../data/shapes.json").then(
          (module) => module.default,
        ));
        setItems([...SHAPE_CATALOG, ...data]);
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
  const filtered = collection.filter((item) =>
    `${item.name} ${item.category ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <Popover opened={open} onChange={openPalette} position="top" width={320}>
      <Tooltip open={!open && tooltipOpen} onOpenChange={setTooltipOpen}>
        <Popover.Target>
          <TooltipTrigger
            render={
              <ActionIcon
                variant={tool === "shape" && open ? "light" : "subtle"}
                color="gray"
                aria-label={icon ? "Icons" : "Shapes"}
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
        <TooltipContent side="top">{icon ? "Icons" : "Shapes"}</TooltipContent>
      </Tooltip>
      <Popover.Dropdown className={styles.picker}>
        <header>
          <strong>{icon ? "Icons" : "Shapes"}</strong>
          {icon && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => fileInput.current?.click()}
            >
              <Upload size={14} aria-hidden />
              Import SVG
            </Button>
          )}
        </header>
        {icon && (
          <Tabs
            value={category}
            onValueChange={(value) => {
              const next = value as Category;
              setCategory(next);
              setQuery("");
              setError("");
              void load(next);
            }}
          >
            <TabsList
              className={styles.categories}
              aria-label="Icon categories"
            >
              <TabsTrigger value="icons">Icons</TabsTrigger>
              <TabsTrigger value="brands">Brands</TabsTrigger>
              <TabsTrigger value="imported">Imported</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        <div className={styles.search}>
          <TextInput
            size="xs"
            placeholder={icon ? "Search icons…" : "Search shapes…"}
            aria-label={icon ? "Search icons" : "Search shapes"}
            leftSection={<Search size={14} aria-hidden />}
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
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
              className={styles.scroller}
              role="region"
              aria-label={icon ? "Icon library" : "Shape library"}
            >
              {loading ? (
                <div className={styles.empty}>
                  <Loader size="xs" />
                </div>
              ) : (
                <>
                  <div className={styles.shapeGrid}>
                    {filtered.slice(0, 150).map((item) => (
                      <button
                        key={item.id}
                        title={item.name}
                        aria-label={`Use ${item.name}`}
                        onClick={() => choose(item)}
                      >
                        <svg
                          viewBox={item.viewBox}
                          data-preserve-paint={
                            item.parts?.length ? true : undefined
                          }
                          aria-hidden
                          fill={item.strokeOnly ? "none" : "currentColor"}
                          stroke={item.strokeOnly ? "currentColor" : "none"}
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        >
                          {item.parts?.length ? (
                            item.parts.map((part, index) => (
                              <path
                                key={index}
                                d={part.path}
                                fill={part.fill}
                                stroke={part.stroke ?? "none"}
                                strokeWidth={part.strokeWidth}
                                opacity={part.opacity}
                                fillRule={part.fillRule}
                                transform={
                                  part.matrix
                                    ? `matrix(${part.matrix.join(" ")})`
                                    : undefined
                                }
                                strokeLinecap={part.linecap}
                                strokeLinejoin={part.linejoin}
                              />
                            ))
                          ) : (
                            <path d={item.path} />
                          )}
                        </svg>
                      </button>
                    ))}
                  </div>
                  {filtered.length === 0 && (
                    <p className={styles.empty}>
                      {category === "imported" && !query
                        ? "Import an SVG to start."
                        : "No matches."}
                    </p>
                  )}
                  {filtered.length > 150 && (
                    <small className={styles.count}>
                      {filtered.length} results · Refine your search
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
