import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../components/ui/accordion";
import styles from "./Faq.module.css";

const questions = [
  "what",
  "privacy",
  "agent",
  "source",
  "pdf",
  "languages",
] as const;
export function Faq() {
  const { t } = useTranslation();
  return (
    <section id="faq" className={styles.faq} aria-labelledby="faq-heading">
      <h2 id="faq-heading">{t("faq.title")}</h2>
      <Accordion defaultValue={["what"]} className={styles.accordion}>
        {questions.map((id) => (
          <AccordionItem key={id} value={id}>
            <AccordionTrigger className={styles.question}>
              {t(`faq.items.${id}.question`)}
            </AccordionTrigger>
            <AccordionContent keepMounted className={styles.answer}>
              <p>{t(`faq.items.${id}.answer`)}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
