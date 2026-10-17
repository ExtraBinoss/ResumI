import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { Languages, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { localeCodeSchema } from "@resumi/engine";
import { documentLanguagesAtom } from "../../../state/editor";
import { designCommandAtom, textRangeAtom } from "../../../state/design";
import { ActionIcon, Button, Select, TextInput, Tooltip } from "../../../ui";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { SectionTranslations } from "./SectionTranslations";
import { ScrollShadow } from "../../../components/ScrollShadow";
import { ErrorMessage } from "../../../components/ErrorNotice";
import styles from "../styles/Languages.module.css";

const suggestions = ["fr", "de", "es", "it", "pt", "ja", "zh", "nl", "ar"];
function LocaleRow({
  code,
  name,
  base,
}: {
  code: string;
  name: string;
  base: boolean;
}) {
  const { t } = useTranslation();
  const dispatch = useSetAtom(designCommandAtom);
  const [nextCode, setCode] = useState(code),
    [nextName, setName] = useState(name);
  const valid =
    localeCodeSchema.safeParse(nextCode).success && !!nextName.trim();
  return (
    <div className={styles.localeRow}>
      <TextInput
        aria-label={`${t("languages.code")}: ${name}`}
        value={nextCode}
        maxLength={35}
        onChange={(event) => setCode(event.currentTarget.value)}
      />
      <TextInput
        aria-label={`${t("languages.name")}: ${name}`}
        value={nextName}
        maxLength={60}
        onChange={(event) => setName(event.currentTarget.value)}
      />
      <Button
        size="xs"
        variant="subtle"
        disabled={!valid || (code === nextCode && name === nextName)}
        onClick={() =>
          dispatch({ type: "locale.update", code, nextCode, name: nextName })
        }
      >
        {t("common.save")}
      </Button>
      {base ? (
        <span className={styles.base}>{t("languages.base")}</span>
      ) : (
        <Tooltip label={t("common.remove")}>
          <ActionIcon
            aria-label={`${t("common.remove")}: ${name}`}
            color="red"
            variant="subtle"
            onClick={() => dispatch({ type: "locale.remove", code })}
          >
            <Trash2 size={16} aria-hidden />
          </ActionIcon>
        </Tooltip>
      )}
    </div>
  );
}
function LanguageManager({ close }: { close: () => void }) {
  const { t } = useTranslation();
  const localization = useAtomValue(documentLanguagesAtom),
    dispatch = useSetAtom(designCommandAtom);
  const setRange = useSetAtom(textRangeAtom);
  const [code, setCode] = useState("fr"),
    [name, setName] = useState(t("languages.fr")),
    [error, setError] = useState("");
  function add() {
    if (!localeCodeSchema.safeParse(code).success) {
      setError(t("languages.invalid"));
      return;
    }
    if (!name.trim()) {
      setError(t("languages.empty"));
      return;
    }
    if (localization.locales.some((locale) => locale.code === code)) {
      setError(t("languages.exists"));
      return;
    }
    dispatch({
      version: 1,
      actor: { kind: "human", name: "Editor" },
      commands: [
        { type: "locale.add", code, name },
        { type: "locale.activate", code },
      ],
    });
    setRange(null);
    close();
  }
  return (
    <div className={styles.manager}>
      <ScrollShadow
        className={styles.localeScroll}
        contentClassName={styles.localeList}
      >
        {localization.locales.map((locale) => (
          <LocaleRow
            key={locale.code}
            {...locale}
            base={locale.code === localization.baseLocale}
          />
        ))}
      </ScrollShadow>
      <form
        className={styles.addForm}
        onSubmit={(event) => {
          event.preventDefault();
          add();
        }}
      >
        <h3>{t("languages.add")}</h3>
        <div className={styles.suggestions}>
          {suggestions
            .filter(
              (value) =>
                !localization.locales.some((locale) => locale.code === value),
            )
            .map((value) => (
              <Button
                key={value}
                size="xs"
                variant="subtle"
                onClick={() => {
                  setCode(value);
                  setName(t(`languages.${value}`));
                  setError("");
                }}
              >
                {t(`languages.${value}`)}
              </Button>
            ))}
        </div>
        <div className={styles.addFields}>
          <TextInput
            label={t("languages.code")}
            value={code}
            maxLength={35}
            onChange={(event) => {
              setCode(event.currentTarget.value);
              setError("");
            }}
          />
          <TextInput
            label={t("languages.name")}
            value={name}
            maxLength={60}
            onChange={(event) => {
              setName(event.currentTarget.value);
              setError("");
            }}
          />
        </div>
        {error && <ErrorMessage error={error} />}
        <footer>
          <Button variant="subtle" onClick={close}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" leftSection={<Plus size={16} aria-hidden />}>
            {t("common.add")}
          </Button>
        </footer>
      </form>
      <SectionTranslations />
      <p className={styles.hint}>{t("languages.hint")}</p>
    </div>
  );
}
export function DocumentLanguages() {
  const { t } = useTranslation();
  const localization = useAtomValue(documentLanguagesAtom),
    dispatch = useSetAtom(designCommandAtom),
    setRange = useSetAtom(textRangeAtom);
  const [open, setOpen] = useState(false);
  function close() {
    setOpen(false);
  }
  return (
    <div className={styles.toolbar}>
      <Languages size={16} aria-hidden />
      <Select
        aria-label={t("languages.label")}
        value={localization.activeLocale}
        data={localization.locales.map(({ code, name }) => ({
          value: code,
          label: name,
        }))}
        onChange={(code) => {
          if (code) {
            setRange(null);
            dispatch({ type: "locale.activate", code });
          }
        }}
      />
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (next) setOpen(true);
          else close();
        }}
      >
        <Tooltip label={t("languages.manage")}>
          <DialogTrigger
            render={
              <ActionIcon aria-label={t("languages.manage")} variant="subtle" />
            }
          >
            <Plus size={16} aria-hidden />
          </DialogTrigger>
        </Tooltip>
        <DialogContent className={styles.dialog}>
          <DialogHeader>
            <DialogTitle>{t("languages.title")}</DialogTitle>
          </DialogHeader>
          <LanguageManager close={close} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
