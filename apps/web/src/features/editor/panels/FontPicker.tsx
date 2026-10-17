import { useRef, useState } from "react";
import { useSetAtom } from "jotai";
import { Check, ChevronDown, Laptop, LoaderCircle, Search } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import { ScrollShadow } from "../../../components/ScrollShadow";
import { TextInput, Select, Tooltip } from "../../../ui";
import { designErrorAtom } from "../../../state/design";
import { FontImportButton, useFontImport } from "./FontAssets";
import {
  detectedFonts,
  fontName,
  fontStack,
  googleCatalog,
  googleFontBlob,
  type FontOption,
  type LocalFont,
} from "./font-catalog";
import styles from "../styles/FontPicker.module.css";

const ROW = 62,
  HEIGHT = 310;
export function FontPicker({
  value,
  fonts,
  mixed,
  onChange,
  onPreview,
}: {
  value: string;
  fonts: string[];
  mixed: boolean;
  onChange: (value: string) => void;
  onPreview: (value: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [computer, setComputer] = useState<FontOption[]>([]);
  const [local, setLocal] = useState<LocalFont[]>([]);
  const [scrollTop, setScrollTop] = useState(0);
  const [busy, setBusy] = useState("");
  const hover = useRef(0);
  const scroll = useRef<HTMLDivElement>(null);
  const { importBlob } = useFontImport();
  const setError = useSetAtom(designErrorAtom);
  const options = [
    ...fonts.map((name): FontOption => ({
      label: name,
      value: fontStack(name),
      category: "Document",
      source: "document",
    })),
    ...computer,
    ...googleCatalog,
  ];
  if (!options.some((option) => option.value === value))
    options.unshift({
      label: fontName(value),
      value,
      category: "Current",
      source: "document",
    });
  const seen = new Set<string>();
  const needle = query.trim().toLocaleLowerCase();
  const filtered = options.filter((option) => {
    const duplicate = seen.has(`${option.source}:${option.label}`);
    seen.add(`${option.source}:${option.label}`);
    return (
      !duplicate &&
      (category === "all" ||
        option.source === category ||
        option.category === category) &&
      `${option.label} ${option.category}`.toLocaleLowerCase().includes(needle)
    );
  });
  const start = Math.max(0, Math.floor(scrollTop / ROW) - 3);
  const visible = filtered.slice(start, start + Math.ceil(HEIGHT / ROW) + 6);
  function resetScroll() {
    setScrollTop(0);
    const viewport = scroll.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-shadow-viewport"]',
    );
    if (viewport) viewport.scrollTop = 0;
  }
  function reveal(index: number) {
    const next = Math.max(0, Math.min(filtered.length - 1, index));
    const viewport = scroll.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-shadow-viewport"]',
    );
    if (viewport) {
      if (next * ROW < viewport.scrollTop) viewport.scrollTop = next * ROW;
      else if ((next + 1) * ROW > viewport.scrollTop + HEIGHT)
        viewport.scrollTop = (next + 1) * ROW - HEIGHT;
      setScrollTop(viewport.scrollTop);
    }
    requestAnimationFrame(() =>
      scroll.current
        ?.querySelector<HTMLButtonElement>(`[data-font-index="${next}"]`)
        ?.focus(),
    );
  }
  function leave() {
    hover.current += 1;
    onPreview(null);
  }
  async function preview(option: FontOption) {
    const token = ++hover.current;
    onPreview(option.value);
    if (option.source === "google") {
      try {
        await googleFontBlob(option.label);
        if (hover.current === token) onPreview(option.value);
      } catch {
        /* Hover is optional; choosing surfaces an actionable download error. */
      }
    }
  }
  async function choose(option: FontOption) {
    if (busy) return;
    setBusy(option.label);
    try {
      if (option.source === "google") {
        const blob = await googleFontBlob(option.label);
        const bytes = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
        const extension =
          String.fromCharCode(...bytes) === "wOF2" ? "woff2" : "ttf";
        await importBlob(option.label, blob, extension);
      } else {
        const font = local.find((entry) => entry.family === option.label);
        if (font) {
          const blob = await font.blob();
          const signature = new TextDecoder().decode(
            await blob.slice(0, 4).arrayBuffer(),
          );
          await importBlob(
            option.label,
            blob,
            signature === "OTTO" ? "otf" : "ttf",
          );
        }
      }
      leave();
      onChange(option.value);
      setOpen(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "This font could not be loaded.",
      );
    } finally {
      setBusy("");
    }
  }
  async function discover() {
    const queryFonts = (
      window as Window & { queryLocalFonts?: () => Promise<LocalFont[]> }
    ).queryLocalFonts;
    if (!queryFonts) {
      setError(
        "This browser cannot list local fonts. Use Import font to choose a font file.",
      );
      return;
    }
    setBusy("computer");
    try {
      const entries = await queryFonts();
      const byFamily = new Map<string, LocalFont>();
      for (const font of entries) {
        if (!/^[a-zA-Z0-9 '",._-]{1,120}$/.test(font.family)) continue;
        if (
          !byFamily.has(font.family) ||
          /regular|normal/i.test(font.style ?? "")
        )
          byFamily.set(font.family, font);
      }
      setLocal([...byFamily.values()]);
      setComputer(
        [...byFamily.keys()].sort().map((family) => ({
          label: family,
          value: fontStack(family),
          category: "Installed",
          source: "computer",
        })),
      );
      setCategory("computer");
      resetScroll();
    } catch {
      setError(
        "Local font access was declined. You can import a font file instead.",
      );
    } finally {
      setBusy("");
    }
  }
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setQuery("");
          setCategory("all");
          setComputer(detectedFonts());
          setScrollTop(0);
        } else leave();
        setOpen(next);
      }}
    >
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-label="Font family"
            className={styles.trigger}
            data-ui="input"
          />
        }
      >
        <span style={{ fontFamily: mixed ? undefined : value }}>
          {mixed ? "Mixed fonts" : fontName(value)}
        </span>
        <ChevronDown size={14} aria-hidden />
      </PopoverTrigger>
      <PopoverContent
        className={styles.popup}
        align="end"
        sideOffset={6}
        aria-label="Choose font"
      >
        <div className={styles.tools}>
          <TextInput
            type="search"
            aria-label="Search fonts"
            placeholder="Search fonts"
            leftSection={<Search size={15} aria-hidden />}
            value={query}
            onChange={(event) => {
              setQuery(event.currentTarget.value);
              resetScroll();
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                reveal(0);
              }
            }}
          />
          <Tooltip label="Fonts on this computer">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Fonts on this computer"
              disabled={!!busy}
              onClick={() => void discover()}
            >
              <Laptop size={16} aria-hidden />
            </Button>
          </Tooltip>
          <FontImportButton
            onImported={(font) => {
              leave();
              onChange(fontStack(font));
              setOpen(false);
            }}
          />
        </div>
        <div className={styles.filters}>
          <Select
            aria-label="Font category"
            value={category}
            onChange={(next) => {
              setCategory(next ?? "all");
              resetScroll();
            }}
            data={[
              { value: "all", label: "All fonts" },
              { value: "document", label: "In this document" },
              { value: "computer", label: "This computer" },
              { value: "google", label: "Google Fonts" },
              ...[
                "Sans Serif",
                "Serif",
                "Monospace",
                "Display",
                "Handwriting",
              ].map((name) => ({ value: name, label: name })),
            ]}
          />
          <span>
            {busy ? (
              <LoaderCircle
                size={14}
                aria-label={`Loading ${busy}`}
                className={styles.spinner}
              />
            ) : (
              `${filtered.length} ${filtered.length === 1 ? "font" : "fonts"}`
            )}
          </span>
        </div>
        <ScrollShadow
          ref={scroll}
          className={styles.list}
          style={{
            height: Math.min(HEIGHT, Math.max(92, filtered.length * ROW)),
          }}
          onScrollCapture={(event) =>
            setScrollTop((event.target as HTMLElement).scrollTop)
          }
        >
          <div
            role="listbox"
            aria-label="Font families"
            className={styles.spacer}
            style={{ height: filtered.length * ROW }}
            onPointerLeave={leave}
          >
            {visible.map((option, offset) => (
              <button
                key={`${option.source}:${option.value}`}
                type="button"
                role="option"
                aria-label={option.label}
                data-font-index={start + offset}
                aria-selected={
                  option.value === value || option.label === fontName(value)
                }
                disabled={!!busy}
                className={styles.option}
                style={{ top: (start + offset) * ROW }}
                onPointerEnter={() => void preview(option)}
                onFocus={() => void preview(option)}
                onBlur={leave}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                    event.preventDefault();
                    reveal(
                      start + offset + (event.key === "ArrowDown" ? 1 : -1),
                    );
                  } else if (event.key === "Home" || event.key === "End") {
                    event.preventDefault();
                    reveal(event.key === "Home" ? 0 : filtered.length - 1);
                  }
                }}
                onClick={() => void choose(option)}
              >
                <span className={styles.copy}>
                  <span className={styles.name}>
                    {option.label}
                    <small>
                      {option.source === "google"
                        ? option.category
                        : option.source === "document"
                          ? "Document"
                          : "Computer"}
                    </small>
                  </span>
                  <span
                    className={styles.sample}
                    style={{ fontFamily: option.value }}
                  >
                    Aa · The quick brown fox
                  </span>
                </span>
                {(option.value === value ||
                  option.label === fontName(value)) && (
                  <Check size={15} aria-hidden />
                )}
              </button>
            ))}
            {!filtered.length && <p className={styles.empty}>No fonts found</p>}
          </div>
        </ScrollShadow>
      </PopoverContent>
    </Popover>
  );
}
