import { useRef } from "react";
import { useAtomValue, useSetAtom, useStore } from "jotai";
import { Upload, X } from "lucide-react";
import { ActionIcon, Tooltip } from "../../../ui";
import {
  canvasAtom,
  designCommandAtom,
  designErrorAtom,
} from "../../../state/design";
import styles from "../styles/Inspector.module.css";

export function useFontImport() {
  const store = useStore();
  const dispatch = useSetAtom(designCommandAtom);
  const setError = useSetAtom(designErrorAtom);
  async function importBlob(name: string, blob: Blob, extension = "ttf") {
    if (blob.size > 1_000_000) throw new Error("Choose a font under 1 MB.");
    const current = store.get(canvasAtom);
    if (!current) throw new Error("Open a visual document to import a font.");
    if (current.fonts.some((font) => font.name === name)) return name;
    if (current.fonts.length >= 12)
      throw new Error(
        "This document already has 12 fonts. Remove one before importing.",
      );
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        resolve(
          String(reader.result).replace(
            /^data:[^;]*;/,
            `data:font/${extension};`,
          ),
        );
      reader.onerror = () =>
        reject(new Error("This font could not be opened."));
      reader.readAsDataURL(blob);
    });
    const latest = store.get(canvasAtom)!;
    dispatch({
      type: "canvas.update",
      patch: {
        fonts: [
          ...latest.fonts,
          {
            id: crypto.randomUUID(),
            name,
            dataUrl,
            format:
              extension === "ttf"
                ? "truetype"
                : extension === "otf"
                  ? "opentype"
                  : extension === "woff2"
                    ? "woff2"
                    : "woff",
          },
        ],
      },
    });
    if (!store.get(canvasAtom)?.fonts.some((font) => font.name === name))
      throw new Error("This font could not be added to the document.");
    return name;
  }
  async function upload(file: File | undefined) {
    if (!file) return;
    try {
      if (!/\.(ttf|otf|woff|woff2)$/i.test(file.name))
        throw new Error("Choose a TTF, OTF, WOFF or WOFF2 font.");
      const name =
        file.name
          .replace(/\.[^.]+$/, "")
          .replace(/[^a-zA-Z0-9 _-]/g, "")
          .slice(0, 80) || "Custom Font";
      return await importBlob(
        name,
        file,
        file.name.split(".").pop()?.toLowerCase(),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "This font could not be opened.",
      );
      return undefined;
    }
  }
  return { importBlob, upload };
}

export function FontImportButton({
  onImported,
}: {
  onImported?: (name: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const canvas = useAtomValue(canvasAtom);
  const { upload } = useFontImport();
  return (
    <>
      <input
        ref={input}
        hidden
        type="file"
        accept=".ttf,.otf,.woff,.woff2"
        aria-label="Upload font"
        onChange={(event) => {
          void upload(event.currentTarget.files?.[0]).then((name) => {
            if (name) onImported?.(name);
          });
          event.currentTarget.value = "";
        }}
      />
      <Tooltip label="Import font file">
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
      </Tooltip>
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
