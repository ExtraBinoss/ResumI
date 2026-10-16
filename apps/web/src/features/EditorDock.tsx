import { useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { ActionIcon, NumberInput, Tooltip } from "../ui";
import {
  MousePointer2,
  Type,
  ImagePlus,
  LayoutTemplate,
  FilePenLine,
  Code2,
  Layers3,
  SlidersHorizontal,
} from "lucide-react";
import { zoomAtom } from "../state/editor";
import {
  modeAtom,
  toolAtom,
  enableVisualAtom,
  addLayerAtom,
  designErrorAtom,
  sourceAtom,
  designCommandAtom,
} from "../state/design";
import { ShapePicker } from "./ShapePicker";
import styles from "../styles/Design.module.css";
export function EditorDock({
  toggleOutline,
  toggleInspector,
}: {
  toggleOutline: () => void;
  toggleInspector: () => void;
}) {
  const source = useAtomValue(sourceAtom),
    dispatch = useSetAtom(designCommandAtom);
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
  const code =
    (!!source && source.enabled !== false) || (mode === "code" && !source);
  const visual = !code && mode !== "text";
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
    <nav className={styles.dock} aria-label="Editor tools">
      <Tooltip label="Layers">
        <ActionIcon
          aria-label="Toggle outline"
          variant="subtle"
          color="gray"
          onClick={toggleOutline}
        >
          <Layers3 size={17} />
        </ActionIcon>
      </Tooltip>
      <span className={styles.rule} />
      {visual && (
        <>
          <div className={styles.toolGroup}>
            <Tooltip label="Select (V)">
              <ActionIcon
                aria-label="Select tool"
                aria-pressed={tool === "select"}
                variant={tool === "select" ? "light" : "subtle"}
                onClick={() => setTool("select")}
              >
                <MousePointer2 size={17} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Text (T)">
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
        </>
      )}
      <div className={styles.modeSwitch} role="group" aria-label="Editing mode">
        <button
          aria-pressed={visual}
          onClick={() => {
            enable();
          }}
        >
          <LayoutTemplate size={14} />
          Visual
        </button>
        <button
          aria-pressed={mode === "text" && !code}
          onClick={() => {
            enable();
            setMode("text");
            setTool("select");
          }}
        >
          <FilePenLine size={14} />
          Text
        </button>
        <button
          aria-pressed={code}
          onClick={() => {
            if (source && source.enabled === false)
              dispatch({ type: "source.activate", enabled: true });
            setMode("code");
          }}
        >
          <Code2 size={14} />
          Code
        </button>
      </div>
      {visual && (
        <>
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
        </>
      )}
      <span className={styles.rule} />
      <Tooltip label="Properties">
        <ActionIcon
          aria-label="Toggle properties"
          variant="subtle"
          color="gray"
          onClick={toggleInspector}
        >
          <SlidersHorizontal size={17} />
        </ActionIcon>
      </Tooltip>
    </nav>
  );
}
