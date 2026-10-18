import { useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Shortcut } from "../../../components/Shortcut";
import { useAtomValue, useSetAtom } from "jotai";
import { ActionIcon, Tooltip } from "../../../ui";
import {
  MousePointer2,
  Type,
  ImagePlus,
  LayoutTemplate,
  FilePenLine,
  Minus,
  Plus,
} from "lucide-react";
import { zoomControlAtom } from "../../../state/canvas-view";
import {
  modeAtom,
  toolAtom,
  addLayerAtom,
  designErrorAtom,
} from "../../../state/design";
import { ShapePicker } from "../../canvas/ShapePicker";
import styles from "../styles/Dock.module.css";
export function EditorDock() {
  const { t } = useTranslation();
  const mode = useAtomValue(modeAtom),
    setMode = useSetAtom(modeAtom),
    tool = useAtomValue(toolAtom),
    setTool = useSetAtom(toolAtom),
    zoom = useAtomValue(zoomControlAtom),
    setZoom = useSetAtom(zoomControlAtom),
    add = useSetAtom(addLayerAtom),
    setError = useSetAtom(designErrorAtom),
    input = useRef<HTMLInputElement>(null);
  const visual = mode !== "text";
  const reveal = useRef<HTMLDivElement>(null);
  const tools = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const surface = reveal.current;
    const content = tools.current;
    if (!surface || !content) return;
    const desktop = window.matchMedia("(min-width: 851px)");
    function measure() {
      const bounds = content!.getBoundingClientRect();
      surface!.style.setProperty("--tools-width", `${bounds.width}px`);
      surface!.style.setProperty("--tools-height", `${bounds.height}px`);
    }
    // An intrinsic fallback keeps first paint visible. Observe natural content,
    // not the shrinking track, so interrupted transitions cannot feed back.
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    desktop.addEventListener("change", measure);
    return () => {
      observer.disconnect();
      desktop.removeEventListener("change", measure);
    };
  }, []);
  function chooseMode(next: "visual" | "text") {
    const active = visual ? "visual" : "text";
    const target =
      active === next ? (next === "visual" ? "text" : "visual") : next;
    setMode(target);
    setTool("select");
  }
  async function image(file: File | undefined) {
    if (!file) return;
    if (file.size > 1_000_000) {
      setError(t("workspace.dock.imageTooLarge"));
      return;
    }
    try {
      const src = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const bitmap = await createImageBitmap(file);
      const width = Math.min(300, bitmap.width),
        height = (width * bitmap.height) / bitmap.width;
      bitmap.close();
      add({
        type: "image",
        patch: {
          src,
          alt: file.name,
          name: t("workspace.dock.imageName"),
          width,
          height,
        },
      });
    } catch {
      setError(t("workspace.dock.imageFailed"));
    }
  }
  return (
    <div className={styles.position}>
      <nav className={styles.dock} aria-label={t("workspace.dock.tools")}>
        <div
          ref={reveal}
          className={styles.toolsReveal}
          data-open={visual}
          aria-hidden={!visual}
          inert={!visual}
        >
          <div className={styles.toolsClip}>
            <div
              ref={tools}
              className={`${styles.dockSection} ${styles.toolsContent}`}
            >
              <div className={styles.toolGroup}>
                <Tooltip
                  label={
                    <span className={styles.shortcutLabel}>
                      {t("workspace.dock.select")} <Shortcut keys={["V"]} />
                    </span>
                  }
                >
                  <ActionIcon
                    aria-label={t("workspace.dock.select")}
                    aria-pressed={tool === "select"}
                    variant={tool === "select" ? "light" : "subtle"}
                    onClick={() => setTool("select")}
                  >
                    <MousePointer2 size={17} aria-hidden />
                  </ActionIcon>
                </Tooltip>
                <Tooltip
                  label={
                    <span className={styles.shortcutLabel}>
                      {t("workspace.dock.textHint")} <Shortcut keys={["T"]} />
                    </span>
                  }
                >
                  <ActionIcon
                    aria-label={t("workspace.dock.textTool")}
                    aria-pressed={tool === "text"}
                    color="gray"
                    variant={tool === "text" ? "light" : "subtle"}
                    onClick={() => {
                      setTool("text");
                    }}
                  >
                    <Type size={18} aria-hidden />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label={t("workspace.dock.addImage")}>
                  <ActionIcon
                    aria-label={t("workspace.dock.addImage")}
                    variant="subtle"
                    color="gray"
                    onClick={() => input.current?.click()}
                  >
                    <ImagePlus size={18} aria-hidden />
                  </ActionIcon>
                </Tooltip>
                <ShapePicker />
                <ShapePicker icon />
                <input
                  ref={input}
                  hidden
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  aria-label={t("workspace.dock.uploadImage")}
                  onChange={(e) => {
                    void image(e.currentTarget.files?.[0]);
                    e.currentTarget.value = "";
                  }}
                />
              </div>
              <span className={styles.rule} />
            </div>
          </div>
        </div>
        <div
          className={styles.modeSwitch}
          data-mode={visual ? "visual" : "text"}
          role="group"
          aria-label={t("workspace.dock.mode")}
        >
          <span className={styles.modeHighlight} aria-hidden />
          <Button
            variant="ghost"
            aria-pressed={visual}
            onClick={() => chooseMode("visual")}
          >
            <LayoutTemplate size={14} aria-hidden />
            {t("editor.visual")}
          </Button>
          <Button
            variant="ghost"
            aria-pressed={!visual}
            onClick={() => chooseMode("text")}
          >
            <FilePenLine size={14} aria-hidden />
            {t("editor.text")}
          </Button>
        </div>
        <div className={styles.dockSection}>
          <span className={styles.rule} />
          <Tooltip label={t("workspace.dock.zoomOut")}>
            <ActionIcon
              aria-label={t("workspace.dock.zoomOut")}
              variant="subtle"
              color="gray"
              disabled={zoom <= 15}
              onClick={() => setZoom((current) => current - 10)}
            >
              <Minus size={16} aria-hidden />
            </ActionIcon>
          </Tooltip>
          <div className={styles.zoom}>
            <Input
              aria-label={t("workspace.dock.canvasZoom")}
              type="number"
              value={zoom}
              style={{ width: `${String(zoom).length}ch` }}
              min={15}
              max={250}
              step={1}
              onChange={(event) => {
                const value = event.currentTarget.valueAsNumber;
                if (Number.isFinite(value))
                  setZoom(Math.min(250, Math.max(15, value)));
              }}
            />
            <span aria-hidden>%</span>
          </div>
          <Tooltip label={t("workspace.dock.zoomIn")}>
            <ActionIcon
              aria-label={t("workspace.dock.zoomIn")}
              variant="subtle"
              color="gray"
              disabled={zoom >= 250}
              onClick={() => setZoom((current) => current + 10)}
            >
              <Plus size={16} aria-hidden />
            </ActionIcon>
          </Tooltip>
        </div>
      </nav>
    </div>
  );
}
