import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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
  enableVisualAtom,
  addLayerAtom,
  designErrorAtom,
  sourceAtom,
} from "../../../state/design";
import { ShapePicker } from "../../canvas/ShapePicker";
import styles from "../styles/Dock.module.css";
export function EditorDock() {
  const { t } = useTranslation();
  const source = useAtomValue(sourceAtom),
    reduced = useReducedMotion();
  const mode = useAtomValue(modeAtom),
    setMode = useSetAtom(modeAtom),
    tool = useAtomValue(toolAtom),
    setTool = useSetAtom(toolAtom),
    zoom = useAtomValue(zoomControlAtom),
    setZoom = useSetAtom(zoomControlAtom),
    enable = useSetAtom(enableVisualAtom),
    add = useSetAtom(addLayerAtom),
    setError = useSetAtom(designErrorAtom),
    input = useRef<HTMLInputElement>(null);
  const sourceActive = !!source && source.enabled !== false;
  const visual = sourceActive || mode !== "text";
  const editableVisual = visual && !sourceActive;
  function chooseMode(next: "visual" | "text") {
    const active = visual ? "visual" : "text";
    const target =
      active === next ? (next === "visual" ? "text" : "visual") : next;
    enable();
    setMode(target);
    setTool("select");
  }
  async function image(file: File | undefined) {
    if (!file) return;
    if (file.size > 1_000_000) {
      setError("Choose a PNG, JPEG or WebP image under 1 MB.");
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
      enable();
      add({
        type: "image",
        patch: { src, alt: file.name, name: "Image", width, height },
      });
    } catch {
      setError("This image could not be opened. Choose a PNG, JPEG or WebP.");
    }
  }
  return (
    <div className={styles.position}>
      <motion.nav
        layout
        initial={false}
        transition={{
          layout: reduced
            ? { duration: 0 }
            : { type: "spring", stiffness: 440, damping: 36 },
        }}
        className={styles.dock}
        aria-label="Editor tools"
      >
        <AnimatePresence initial={false}>
          {editableVisual && (
            <motion.div
              key="tools"
              className={styles.dockSection}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{
                duration: reduced ? 0 : 0.2,
                ease: [0.2, 0.8, 0.2, 1],
              }}
            >
              <div className={styles.toolGroup}>
                <Tooltip
                  label={
                    <span className={styles.shortcutLabel}>
                      Select <Shortcut keys={["V"]} />
                    </span>
                  }
                >
                  <ActionIcon
                    aria-label="Select tool"
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
                      Text · Click or drag a text box <Shortcut keys={["T"]} />
                    </span>
                  }
                >
                  <ActionIcon
                    aria-label="Text tool"
                    aria-pressed={tool === "text"}
                    color="gray"
                    variant={tool === "text" ? "light" : "subtle"}
                    onClick={() => {
                      enable();
                      setTool("text");
                    }}
                  >
                    <Type size={18} aria-hidden />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Add image">
                  <ActionIcon
                    aria-label="Add image"
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
                  aria-label="Upload image"
                  onChange={(e) => {
                    void image(e.currentTarget.files?.[0]);
                    e.currentTarget.value = "";
                  }}
                />
              </div>
              <span className={styles.rule} />
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          layout="position"
          className={styles.modeSwitch}
          role="group"
          aria-label="Editing mode"
        >
          <Button
            variant="ghost"
            aria-pressed={visual}
            onClick={() => chooseMode("visual")}
          >
            {visual && (
              <motion.span
                layoutId="editor-mode"
                className={styles.modeHighlight}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 500, damping: 38 }
                }
              />
            )}
            <LayoutTemplate size={14} aria-hidden />
            {t("editor.visual")}
          </Button>
          <Button
            variant="ghost"
            aria-pressed={!visual}
            onClick={() => chooseMode("text")}
          >
            {!visual && (
              <motion.span
                layoutId="editor-mode"
                className={styles.modeHighlight}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 500, damping: 38 }
                }
              />
            )}
            <FilePenLine size={14} aria-hidden />
            {t("editor.text")}
          </Button>
        </motion.div>
        <motion.div layout="position" className={styles.dockSection}>
          <span className={styles.rule} />
          <Tooltip label="Zoom out">
            <ActionIcon
              aria-label="Zoom out"
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
              aria-label="Canvas zoom"
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
          <Tooltip label="Zoom in">
            <ActionIcon
              aria-label="Zoom in"
              variant="subtle"
              color="gray"
              disabled={zoom >= 250}
              onClick={() => setZoom((current) => current + 10)}
            >
              <Plus size={16} aria-hidden />
            </ActionIcon>
          </Tooltip>
        </motion.div>
      </motion.nav>
    </div>
  );
}
