import { useTranslation } from "react-i18next";
import { useRef } from "react";
import { useAtomValue, useSetAtom, useStore } from "jotai";
import { Upload } from "lucide-react";
import { ActionIcon, Tooltip } from "../../../ui";
import {
  canvasAtom,
  designCommandAtom,
  designErrorAtom,
} from "../../../state/design";

export function useFontImport() {
  const { t } = useTranslation();
  const store = useStore();
  const dispatch = useSetAtom(designCommandAtom);
  const setError = useSetAtom(designErrorAtom);
  async function importBlob(name: string, blob: Blob, extension = "ttf") {
    if (blob.size > 1_000_000) throw new Error(t("properties.fontTooLarge"));
    const current = store.get(canvasAtom);
    if (!current) throw new Error(t("properties.visualDocumentRequired"));
    if (current.fonts.some((font) => font.name === name)) return name;
    if (current.fonts.length >= 12) throw new Error(t("properties.maxFonts"));
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        resolve(
          String(reader.result).replace(
            /^data:[^;]*;/,
            `data:font/${extension};`,
          ),
        );
      reader.onerror = () => reject(new Error(t("properties.fontOpenFailed")));
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
      throw new Error(t("properties.fontAddFailed"));
    return name;
  }
  async function upload(file: File | undefined) {
    if (!file) return;
    try {
      if (!/\.(ttf|otf|woff|woff2)$/i.test(file.name))
        throw new Error(t("properties.fontFileTypes"));
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
        error instanceof Error ? error.message : t("properties.fontOpenFailed"),
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
  const { t } = useTranslation();
  const input = useRef<HTMLInputElement>(null);
  const canvas = useAtomValue(canvasAtom);
  const { upload } = useFontImport();
  const setError = useSetAtom(designErrorAtom);
  return (
    <>
      <input
        ref={input}
        hidden
        type="file"
        accept=".ttf,.otf,.woff,.woff2"
        aria-label={t("properties.uploadFont")}
        onChange={(event) => {
          void upload(event.currentTarget.files?.[0])
            .then((name) => {
              if (name) onImported?.(name);
            })
            .catch((error: unknown) => {
              setError(
                error instanceof Error
                  ? error.message
                  : t("properties.fontOpenFailed"),
              );
            });
          event.currentTarget.value = "";
        }}
      />
      <Tooltip label={t("properties.importFontFile")}>
        <ActionIcon
          aria-label={t("properties.importFont")}
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
