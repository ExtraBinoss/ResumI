import { useRef, useState } from "react";
import { useAtomValue, useSetAtom, useStore } from "jotai";
import { ChevronDown, ChevronRight, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Popover, TextInput } from "../../../ui";
import { Button as ShadcnButton } from "../../../components/ui/button";
import {
  nameAtom,
  commandAtom,
  documentLanguagesAtom,
} from "../../../state/editor";
import { canvasAtom } from "../../../state/design";
import { DocumentLanguages } from "../text/DocumentLanguages";
import styles from "../styles/Editor.module.css";

export function ProjectMenu({ openDocument }: { openDocument: () => void }) {
  const { t } = useTranslation();
  const canvas = useAtomValue(canvasAtom),
    localization = useAtomValue(documentLanguagesAtom),
    name = useAtomValue(nameAtom),
    dispatch = useSetAtom(commandAtom),
    store = useStore();
  const [opened, setOpened] = useState(false),
    [draft, setDraft] = useState(name);
  const cancelled = useRef(false);
  function saveName() {
    if (cancelled.current) return;
    const next = draft.trim();
    if (!next) {
      setDraft(store.get(nameAtom));
      return;
    }
    if (next !== store.get(nameAtom))
      dispatch({ type: "document.update", name: next });
  }
  return (
    <Popover
      position="bottom"
      width={320}
      opened={opened}
      onChange={(next) => {
        if (next) {
          cancelled.current = false;
          setDraft(store.get(nameAtom));
        }
        setOpened(next);
      }}
    >
      <Popover.Target>
        <ShadcnButton
          variant="ghost"
          className={styles.nameButton}
          aria-label={t("workspace.toolbar.project", { name })}
        >
          <span>{name}</span>
          <small className={styles.projectLocale}>
            {localization.locales.find(
              ({ code }) => code === localization.activeLocale,
            )?.name ?? localization.activeLocale}
          </small>
          <ChevronDown size={13} aria-hidden />
        </ShadcnButton>
      </Popover.Target>
      <Popover.Dropdown className={styles.projectMenu}>
        <div className={styles.projectLanguage}>
          <span>{t("workspace.project.language")}</span>
          <DocumentLanguages />
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            saveName();
            setOpened(false);
          }}
        >
          <TextInput
            label={t("workspace.project.name")}
            value={draft}
            onChange={(event) => setDraft(event.currentTarget.value)}
            onBlur={saveName}
            onKeyDown={(event) => {
              if (event.key !== "Escape") return;
              event.preventDefault();
              cancelled.current = true;
              setDraft(store.get(nameAtom));
              setOpened(false);
            }}
            maxLength={120}
            required
          />
        </form>
        <ShadcnButton
          variant="ghost"
          className={styles.projectSettings}
          aria-label={t("pages.settings")}
          onClick={() => {
            saveName();
            setOpened(false);
            openDocument();
          }}
        >
          <SlidersHorizontal size={16} aria-hidden />
          <span>
            {t("pages.settings")}
            <small>
              {!canvas || (canvas.width === 794 && canvas.height === 1123)
                ? t("workspace.project.a4")
                : `${canvas.width} × ${canvas.height} px`}
            </small>
          </span>
          <ChevronRight size={14} aria-hidden />
        </ShadcnButton>
      </Popover.Dropdown>
    </Popover>
  );
}
