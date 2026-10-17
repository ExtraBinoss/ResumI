import { useState } from "react";
import { Popover, ActionIcon, TextInput, Loader } from "../../ui";
import { Shapes, Smile, Search } from "lucide-react";
import { SHAPE_CATALOG, type LayerPatch } from "@resumi/engine";
import { useSetAtom, useAtomValue } from "jotai";
import { shapeToolAtom, toolAtom } from "../../state/design";
import styles from "./styles/Palette.module.css";
import { ScrollShadow } from "../../components/ScrollShadow";
type Item = {
  id: string;
  name: string;
  path: string;
  viewBox: string;
  strokeOnly?: boolean;
};
let gallery: Promise<Item[]> | undefined, icons: Promise<Item[]> | undefined;
export function ShapePicker({ icon = false }: { icon?: boolean }) {
  const [open, setOpen] = useState(false),
    [items, setItems] = useState<Item[]>(icon ? [] : SHAPE_CATALOG),
    [query, setQuery] = useState(""),
    [loading, setLoading] = useState(false),
    setShape = useSetAtom(shapeToolAtom),
    setTool = useSetAtom(toolAtom),
    tool = useAtomValue(toolAtom);
  async function load() {
    setOpen(true);
    setLoading(true);
    try {
      const data = await (icon
        ? (icons ??= import("../../data/icons.json").then((m) => m.default))
        : (gallery ??= import("../../data/shapes.json").then(
            (m) => m.default,
          )));
      setItems(icon ? data : [...SHAPE_CATALOG, ...data]);
    } finally {
      setLoading(false);
    }
  }
  function choose(item: Item) {
    const patch: LayerPatch = SHAPE_CATALOG.some(
      (shape) => shape.id === item.id,
    )
      ? { shape: item.id, vector: undefined }
      : {
          shape: "custom-icon",
          vector: {
            path: item.path,
            viewBox: item.viewBox,
            strokeOnly: item.strokeOnly,
          },
        };
    setShape({ ...patch, name: item.name });
    setTool("shape");
    setOpen(false);
  }
  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <Popover
      opened={open}
      onChange={setOpen}
      position="top"
      width={292}
      shadow="lg"
    >
      <Popover.Target>
        <ActionIcon
          variant={tool === "shape" && open ? "light" : "subtle"}
          color="gray"
          aria-label={icon ? "Icons" : "Shapes"}
          onClick={() => {
            if (open) setOpen(false);
            else void load();
          }}
        >
          {icon ? <Smile size={18} /> : <Shapes size={18} />}
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown className={styles.picker}>
        <header>
          <strong>{icon ? "Icons" : "Shapes"}</strong>
        </header>
        <TextInput
          size="xs"
          placeholder={icon ? "Search icons…" : "Search shapes…"}
          aria-label={icon ? "Search icons" : "Search shapes"}
          leftSection={<Search size={13} />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
        />
        {loading ? (
          <Loader size="xs" />
        ) : (
          <ScrollShadow style={{ height: 280 }}>
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
                    aria-hidden
                    fill={item.strokeOnly ? "none" : "currentColor"}
                    stroke={item.strokeOnly ? "currentColor" : "none"}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  >
                    <path d={item.path} />
                  </svg>
                </button>
              ))}
            </div>
            {filtered.length === 0 && <p>No matches.</p>}
            {filtered.length > 150 && <small>{filtered.length} results</small>}
          </ScrollShadow>
        )}
      </Popover.Dropdown>
    </Popover>
  );
}
