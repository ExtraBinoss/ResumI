import { useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { ActionIcon, ColorInput } from "../ui";
import { Upload, X } from "lucide-react";
import {
  canvasAtom,
  designCommandAtom,
  designErrorAtom,
} from "../state/design";
import styles from "../styles/LayerPanels.module.css";
export function DocumentProperties() {
  const canvas = useAtomValue(canvasAtom),
    dispatch = useSetAtom(designCommandAtom),
    setError = useSetAtom(designErrorAtom),
    input = useRef<HTMLInputElement>(null);
  if (!canvas) return null;
  async function font(file: File | undefined) {
    if (!file) return;
    if (file.size > 1_000_000) {
      setError("Choose a font under 1 MB.");
      return;
    }
    if (!/\.(ttf|otf|woff|woff2)$/i.test(file.name)) {
      setError("Choose a TTF, OTF, WOFF or WOFF2 font.");
      return;
    }
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const name =
          file.name
            .replace(/\.[^.]+$/, "")
            .replace(/[^a-zA-Z0-9 _-]/g, "")
            .slice(0, 80) || "Custom Font",
        extension = file.name.split(".").pop()?.toLowerCase(),
        format =
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
            ...canvas!.fonts,
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
    } catch {
      setError("This font could not be opened.");
    }
  }
  return (
    <>
      <section>
        <h3>Page</h3>
        <div className={styles.pageFacts}>
          <span>
            Format
            <strong>
              {canvas.width === 794 && canvas.height === 1123
                ? "A4 / portrait"
                : "Custom"}
            </strong>
          </span>
          <span>
            Size
            <strong>
              {canvas.width} × {canvas.height} px
            </strong>
          </span>
        </div>
        <ColorInput
          label="Page background"
          format="hex"
          size="xs"
          withEyeDropper={false}
          value={canvas.background}
          onChangeEnd={(value) => {
            if (/^#[0-9a-fA-F]{6}$/.test(value))
              dispatch({ type: "canvas.update", patch: { background: value } });
          }}
        />
      </section>
      <section>
        <div className={styles.sectionHead}>
          <h3>Custom fonts</h3>
          <ActionIcon
            aria-label="Import font"
            size="xs"
            variant="subtle"
            color="gray"
            disabled={canvas.fonts.length >= 12}
            onClick={() => input.current?.click()}
          >
            <Upload size={13} />
          </ActionIcon>
        </div>
        <input
          ref={input}
          hidden
          type="file"
          accept=".ttf,.otf,.woff,.woff2"
          aria-label="Upload font"
          onChange={(e) => {
            void font(e.currentTarget.files?.[0]);
            e.currentTarget.value = "";
          }}
        />
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
                    fonts: canvas.fonts.filter((f) => f.id !== font.id),
                  },
                })
              }
            >
              <X size={12} />
            </ActionIcon>
          </div>
        ))}
        <p className={styles.help}>
          {canvas.fonts.length
            ? "Fonts are embedded in your portable document."
            : "Import a TTF, OTF, WOFF or WOFF2 font, then choose it in Typography."}
        </p>
      </section>
      <section>
        <h3>Workspace</h3>
        <div className={styles.pageFacts}>
          <span>
            Layers<strong>{canvas.order.length}</strong>
          </span>
          <span>
            Groups<strong>{canvas.groups.length}</strong>
          </span>
          <span>
            Storage<strong>This browser</strong>
          </span>
        </div>
        <p className={styles.help}>
          Move freely in Visual. Focus on your words in Text. Both modes share
          this document and its history.
        </p>
      </section>
    </>
  );
}
