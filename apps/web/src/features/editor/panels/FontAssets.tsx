import { useRef } from "react";
import { useAtomValue, useSetAtom, useStore } from "jotai";
import { Upload, X } from "lucide-react";
import { ActionIcon } from "../../../ui";
import {
  canvasAtom,
  designCommandAtom,
  designErrorAtom,
} from "../../../state/design";
import styles from "../styles/Inspector.module.css";

export function FontImportButton({
  onImported,
}: {
  onImported?: (name: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const canvas = useAtomValue(canvasAtom);
  const store = useStore();
  const dispatch = useSetAtom(designCommandAtom);
  const setError = useSetAtom(designErrorAtom);
  async function upload(file: File | undefined) {
    if (!file) return;
    if (file.size > 1_000_000 || !/\.(ttf|otf|woff|woff2)$/i.test(file.name)) {
      setError("Choose a font under 1 MB (TTF, OTF, WOFF or WOFF2).");
      return;
    }
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const current = store.get(canvasAtom);
      if (!current || current.fonts.length >= 12) return;
      const name =
        file.name
          .replace(/\.[^.]+$/, "")
          .replace(/[^a-zA-Z0-9 _-]/g, "")
          .slice(0, 80) || "Custom Font";
      const extension = file.name.split(".").pop()?.toLowerCase();
      const format =
        extension === "ttf"
          ? "truetype"
          : extension === "otf"
            ? "opentype"
            : extension === "woff2"
              ? "woff2"
              : "woff";
      dispatch({
        type: "canvas.update",
        patch: {
          fonts: [
            ...current.fonts,
            {
              id: crypto.randomUUID(),
              name,
              dataUrl: dataUrl.replace(
                /^data:[^;]*;/,
                `data:font/${extension};`,
              ),
              format,
            },
          ],
        },
      });
      if (store.get(canvasAtom)?.fonts.some((font) => font.name === name))
        onImported?.(name);
    } catch {
      setError("This font could not be opened.");
    }
  }
  return (
    <>
      <input
        ref={input}
        hidden
        type="file"
        accept=".ttf,.otf,.woff,.woff2"
        aria-label="Upload font"
        onChange={(event) => {
          void upload(event.currentTarget.files?.[0]);
          event.currentTarget.value = "";
        }}
      />
      <ActionIcon
        aria-label="Import font"
        size="sm"
        variant="subtle"
        color="gray"
        disabled={!canvas || canvas.fonts.length >= 12}
        onClick={() => input.current?.click()}
      >
        <Upload size={14} />
      </ActionIcon>
    </>
  );
}
export function FontAssets() {
  const canvas = useAtomValue(canvasAtom);
  const dispatch = useSetAtom(designCommandAtom);
  if (!canvas) return null;
  return (
    <section>
      <div className={styles.sectionHead}>
        <h3>Fonts</h3>
        <FontImportButton />
      </div>
      {canvas.fonts.map((font) => (
        <div className={styles.fontRow} key={font.id}>
          <span>{font.name}</span>
          <ActionIcon
            aria-label={`Remove font ${font.name}`}
            size="xs"
            variant="subtle"
            color="gray"
            onClick={() =>
              dispatch({
                type: "canvas.update",
                patch: {
                  fonts: canvas.fonts.filter(
                    (candidate) => candidate.id !== font.id,
                  ),
                },
              })
            }
          >
            <X size={13} />
          </ActionIcon>
        </div>
      ))}
    </section>
  );
}
