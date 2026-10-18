import { atom, useAtomValue, useSetAtom, useStore } from "jotai";
import { RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  sectionAtom,
  sectionIdsAtom,
  sessionAtom,
  documentLanguagesAtom,
} from "../../../state/editor";
import { designCommandAtom } from "../../../state/design";
import { ActionIcon, TextInput, Tooltip } from "../../../ui";
import { ScrollShadow } from "../../../components/ScrollShadow";
import styles from "../styles/Languages.module.css";

const hasNamedSectionsAtom = atom((get) =>
  get(sectionIdsAtom).some(
    (id) => !!get(sessionAtom)?.document.sections[id].title,
  ),
);
function SectionTitle({ id }: { id: string }) {
  const { t } = useTranslation(),
    store = useStore();
  const section = useAtomValue(sectionAtom(id)),
    localization = useAtomValue(documentLanguagesAtom),
    dispatch = useSetAtom(designCommandAtom);
  if (!section) return null;
  const original = store.get(sessionAtom)!.document.sections[id].title;
  if (!original) return null;
  const variant =
    localization.activeLocale !== localization.baseLocale &&
    Object.hasOwn(section.titleTranslations ?? {}, localization.activeLocale);
  return (
    <div className={styles.sectionTitle}>
      <TextInput
        label={original}
        aria-label={`${t("languages.sectionTitle")}: ${original}`}
        value={section.title}
        maxLength={200}
        onChange={(event) =>
          dispatch({
            type: "section.update",
            id,
            title: event.currentTarget.value,
          })
        }
      />
      {variant && (
        <Tooltip label={t("languages.reset")}>
          <ActionIcon
            aria-label={`${t("languages.reset")}: ${original}`}
            variant="subtle"
            onClick={() =>
              dispatch({
                type: "section.translation.remove",
                id,
                locale: localization.activeLocale,
              })
            }
          >
            <RotateCcw size={15} aria-hidden />
          </ActionIcon>
        </Tooltip>
      )}
    </div>
  );
}
export function SectionTranslations() {
  const { t } = useTranslation();
  const ids = useAtomValue(sectionIdsAtom);
  const hasNamed = useAtomValue(hasNamedSectionsAtom);
  if (!hasNamed) return null;
  return (
    <section
      className={styles.sectionTranslations}
      aria-label={t("languages.sectionHeadings")}
    >
      <h3>{t("languages.sectionHeadings")}</h3>
      <ScrollShadow
        className={styles.sectionScroll}
        contentClassName={styles.sectionList}
      >
        {ids.map((id) => (
          <SectionTitle key={id} id={id} />
        ))}
      </ScrollShadow>
    </section>
  );
}
