import { useTranslation } from "react-i18next";
import { useMemo, useRef, useState } from "react";
import { useSetAtom } from "jotai";
import { Check, ChevronDown, Laptop } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import { ScrollShadow } from "../../../components/ScrollShadow";
import { Tooltip, Loader } from "../../../ui";
import { SearchInput } from "../../../components/SearchInput";
import { createSearchIndex } from "../../../lib/search-index";
import { FontSample } from "./FontSample";
import { designErrorAtom } from "../../../state/design";
import { FontImportButton, useFontImport } from "./FontAssets";
import {
  detectedFonts,
  fontName,
  fontStack,
  googleCatalog,
  googleFontBlob,
  fontCategory,
  type FontOption,
  type LocalFont,
} from "./font-catalog";
import styles from "../styles/FontPicker.module.css";

const categoryKeys: Record<string, string> = {
  all: "all",
  "Sans Serif": "sans",
  Serif: "serif",
  Monospace: "monospace",
  Display: "display",
  Handwriting: "handwriting",
};
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
  const { t } = useTranslation();
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
  const fontNames = JSON.stringify(fonts);
  // Names/source snapshots define index identity; neither scroll nor typing rebuilds it.
  const options = useMemo(() => {
    const catalog = new Map<string, FontOption>();
    const documentFonts = JSON.parse(fontNames) as string[];
    const current: FontOption = {
      label: fontName(value),
      value,
      category: fontCategory(fontName(value)),
      source: "document",
    };
    for (const option of [
      current,
      ...documentFonts.map((name): FontOption => ({
        label: name,
        value: fontStack(name, fontCategory(name)),
        category: fontCategory(name),
        source: "document",
      })),
      ...computer.map((option) => ({
        ...option,
        category: fontCategory(option.label),
      })),
      ...googleCatalog,
    ])
      if (!catalog.has(option.label.toLowerCase()))
        catalog.set(option.label.toLowerCase(), option);
    return [...catalog.values()];
  }, [fontNames, computer, value]);
  const index = useMemo(
    () =>
      createSearchIndex(options, {
        text: (option) => option.label,
        keywords: (option) => option.category,
      }),
    [options],
  );
  const filtered = index.search(query, {
    limit: options.length,
    filter:
      category === "all" ? undefined : (option) => option.category === category,
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
      setCategory("all");
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
            aria-label={t("fonts.family")}
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
        aria-label={t("fonts.choose")}
      >
        <div className={styles.tools}>
          <SearchInput
            autoFocus
            prefix={t("common.search")}
            captureTyping={open}
            aria-label={t("fonts.search")}
            hints={[
              { label: "Inter" },
              { label: "Playfair Display" },
              { label: "Space Mono" },
            ]}
            value={query}
            onChange={(event) => {
              leave();
              setQuery(event.currentTarget.value);
              resetScroll();
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                reveal(0);
              } else if (event.key === "Enter" && filtered[0]) {
                event.preventDefault();
                void choose(filtered[0]);
              }
            }}
          />
          <Tooltip label={t("fonts.computer")}>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t("fonts.computer")}
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
        <ScrollShadow orientation="horizontal" className={styles.categories}>
          <div
            className={styles.categoryTrack}
            role="group"
            aria-label={t("fonts.categories")}
          >
            {[
              "all",
              "Sans Serif",
              "Serif",
              "Monospace",
              "Display",
              "Handwriting",
            ].map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={category === name}
                onClick={() => {
                  leave();
                  setCategory(name);
                  resetScroll();
                }}
              >
                {t("fonts." + categoryKeys[name])}
              </button>
            ))}
          </div>
        </ScrollShadow>
        <div className={styles.filters} aria-live="polite">
          <span>{t("fonts.count", { count: filtered.length })}</span>
          {busy && (
            <Loader size="xs" label={t("loading.font", { name: busy })} />
          )}
        </div>
        <ScrollShadow
          ref={scroll}
          className={styles.list}
          style={{
            height: Math.min(HEIGHT, Math.max(92, filtered.length * ROW)),
          }}
          onScrollCapture={(event) => {
            leave();
            setScrollTop((event.target as HTMLElement).scrollTop);
          }}
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
                onPointerEnter={(event) => {
                  const name =
                    event.currentTarget.querySelector<HTMLElement>(
                      "[data-font-name]",
                    );
                  if (name)
                    name.style.setProperty(
                      "--name-overflow",
                      Math.min(0, name.clientWidth - name.scrollWidth) + "px",
                    );
                  void preview(option);
                }}
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
                    <span
                      className={styles.nameClip}
                      data-font-name
                      title={option.label}
                    >
                      <span>{option.label}</span>
                    </span>
                    <small>{option.category}</small>
                  </span>
                  <FontSample option={option} />
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
