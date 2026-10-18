import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { Link2, Unlink, ArrowLeftRight } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  ActionIcon,
  ColorInput,
  NumberInput,
  Select,
  Tooltip,
} from "../../../ui";
import {
  activePageIdAtom,
  canvasAtom,
  designCommandAtom,
  sourceAtom,
} from "../../../state/design";
import { DocumentStyleFields } from "./DocumentStyleFields";
import styles from "../styles/DocumentSettings.module.css";

const formats = [
  { value: "A0", width: 3179, height: 4494 },
  { value: "A1", width: 2245, height: 3179 },
  { value: "A2", width: 1587, height: 2245 },
  { value: "A3", width: 1123, height: 1587 },
  { value: "A4", width: 794, height: 1123 },
  { value: "A5", width: 559, height: 794 },
  { value: "A6", width: 397, height: 559 },
  { value: "Letter", width: 816, height: 1056 },
] as const;

/** Draft dimensions belong to this dialog; one validated command applies the change. */
export function DocumentSettings({ close }: { close: () => void }) {
  const { t } = useTranslation();
  const canvas = useAtomValue(canvasAtom),
    pageId = useAtomValue(activePageIdAtom),
    source = useAtomValue(sourceAtom);
  const dispatch = useSetAtom(designCommandAtom);
  const [draft, setDraft] = useState(() => ({
    width: canvas?.width ?? 794,
    height: canvas?.height ?? 1123,
    background: canvas?.background ?? "#ffffff",
  }));
  const [locked, setLocked] = useState(true);
  const sourceActive = !!source && source.enabled !== false;
  const preset =
    formats.find(
      (format) =>
        (format.width === draft.width && format.height === draft.height) ||
        (format.width === draft.height && format.height === draft.width),
    )?.value ?? "custom";
  const valid = [draft.width, draft.height].every(
    (value) => Number.isFinite(value) && value >= 100 && value <= 5000,
  );
  function dimension(key: "width" | "height", value: number | string) {
    if (typeof value !== "number" || !Number.isFinite(value)) return;
    const other = key === "width" ? "height" : "width";
    setDraft({
      ...draft,
      [key]: value,
      ...(locked
        ? { [other]: Math.round((value * draft[other]) / draft[key]) }
        : {}),
    });
  }
  return (
    <form
      className={styles.settings}
      onSubmit={(event) => {
        event.preventDefault();
        if (!valid) return;
        if (
          canvas &&
          !sourceActive &&
          (canvas.width !== draft.width ||
            canvas.height !== draft.height ||
            canvas.background !== draft.background)
        )
          dispatch({ type: "page.update", id: pageId, patch: draft });
        close();
      }}
    >
      {sourceActive ? (
        <p className={styles.note}>{t("pages.sourceSize")}</p>
      ) : canvas ? (
        <section className={styles.page}>
          <h3>{t("pages.dimensions")}</h3>
          <Select
            aria-label={t("pages.format")}
            value={preset}
            allowDeselect={false}
            data={[
              ...formats.map((format) => ({
                value: format.value,
                label: format.value,
              })),
              { value: "custom", label: t("pages.custom") },
            ]}
            onChange={(value) => {
              const next = formats.find((format) => format.value === value);
              if (next)
                setDraft({
                  ...draft,
                  width: draft.width > draft.height ? next.height : next.width,
                  height: draft.width > draft.height ? next.width : next.height,
                });
            }}
          />
          <div className={styles.dimensions}>
            <NumberInput
              aria-label={t("pages.width")}
              scrubLabel="W"
              unit="px"
              min={100}
              max={5000}
              value={draft.width}
              onChange={(value) => dimension("width", value)}
            />
            <Tooltip label={t("pages.lockRatio")}>
              <ActionIcon
                type="button"
                variant={locked ? "light" : "subtle"}
                aria-label={t("pages.lockRatio")}
                aria-pressed={locked}
                onClick={() => setLocked(!locked)}
              >
                {locked ? (
                  <Link2 size={16} aria-hidden />
                ) : (
                  <Unlink size={16} aria-hidden />
                )}
              </ActionIcon>
            </Tooltip>
            <NumberInput
              aria-label={t("pages.height")}
              scrubLabel="H"
              unit="px"
              min={100}
              max={5000}
              value={draft.height}
              onChange={(value) => dimension("height", value)}
            />
            <Tooltip label={t("pages.swap")}>
              <ActionIcon
                type="button"
                variant="subtle"
                aria-label={t("pages.swap")}
                onClick={() =>
                  setDraft({
                    ...draft,
                    width: draft.height,
                    height: draft.width,
                  })
                }
              >
                <ArrowLeftRight size={16} aria-hidden />
              </ActionIcon>
            </Tooltip>
          </div>
          {!valid && (
            <p role="alert" className={styles.note}>
              {t("pages.dimensionRange")}
            </p>
          )}
          <ColorInput
            label={t("pages.background")}
            aria-label={t("pages.background")}
            value={draft.background}
            onChangeEnd={(background) => setDraft({ ...draft, background })}
          />
        </section>
      ) : (
        <DocumentStyleFields />
      )}
      <footer className={styles.footer}>
        <Button variant="outline" type="button" onClick={close}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={!valid}>
          {sourceActive ? t("common.close") : t("pages.apply")}
        </Button>
      </footer>
    </form>
  );
}
