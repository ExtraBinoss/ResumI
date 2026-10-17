import { useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "../../../components/ui/button";
import { Shortcut } from "../../../components/Shortcut";
import { useAtomValue, useSetAtom } from "jotai";
import { ActionIcon, NumberInput, Tooltip } from "../../../ui";
import {
  MousePointer2,
  Type,
  ImagePlus,
  LayoutTemplate,
  FilePenLine,
} from "lucide-react";
import { zoomAtom } from "../../../state/editor";
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
  const source = useAtomValue(sourceAtom),
    reduced = useReducedMotion();
  const mode = useAtomValue(modeAtom),
    setMode = useSetAtom(modeAtom),
    tool = useAtomValue(toolAtom),
    setTool = useSetAtom(toolAtom),
    zoom = useAtomValue(zoomAtom),
    setZoom = useSetAtom(zoomAtom),
    enable = useSetAtom(enableVisualAtom),
    add = useSetAtom(addLayerAtom),
    setError = useSetAtom(designErrorAtom),
    input = useRef<HTMLInputElement>(null);
  const sourceActive = !!source && source.enabled !== false;
  const visual = !sourceActive && mode !== "text";
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
          {visual && (
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
                    <MousePointer2 size={17} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip
                  label={
                    <span className={styles.shortcutLabel}>
                      Text <Shortcut keys={["T"]} />
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
                    <Type size={18} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Add image">
                  <ActionIcon
                    aria-label="Add image"
                    variant="subtle"
                    color="gray"
                    onClick={() => input.current?.click()}
                  >
                    <ImagePlus size={18} />
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
            onClick={() => {
              enable();
            }}
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
            <LayoutTemplate size={14} />
            Visual
          </Button>
          <Button
            variant="ghost"
            aria-pressed={mode === "text" && !sourceActive}
            onClick={() => {
              enable();
              setMode("text");
              setTool("select");
            }}
          >
            {mode === "text" && !sourceActive && (
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
            <FilePenLine size={14} />
            Text
          </Button>
        </motion.div>
        <AnimatePresence initial={false}>
          {visual && (
            <motion.div
              key="zoom"
              className={styles.dockSection}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{
                duration: reduced ? 0 : 0.2,
                ease: [0.2, 0.8, 0.2, 1],
              }}
            >
              <span className={styles.rule} />
              <NumberInput
                aria-label="Canvas zoom"
                value={zoom}
                min={15}
                max={250}
                step={1}
                suffix="%"
                hideControls
                size="xs"
                className={styles.zoom}
                onChange={(value) => {
                  if (typeof value === "number")
                    setZoom(Math.min(250, Math.max(15, value)));
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}
