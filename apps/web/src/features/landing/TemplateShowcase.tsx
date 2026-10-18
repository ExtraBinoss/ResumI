import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ArrowRight, MoveRight } from "lucide-react";
import { Button } from "../../components/ui/button";
import { templateThumbnailUrls } from "../../lib/template-preview-assets";
import { preloadTemplateEditor } from "../../lib/preload-editor";
import styles from "./Landing.module.css";

export type LandingTemplate = { id: string; name: string };

export function thumbnail(template: LandingTemplate) {
  return templateThumbnailUrls[`../assets/templates/${template.id}.webp`];
}

function CarouselPaper({
  template,
  index,
  total,
  position,
}: {
  template: LandingTemplate;
  index: number;
  total: number;
  position: MotionValue<number>;
}) {
  // Cards wrap only beyond the clipped stage; their depth follows their actual
  // position, so interrupting an animation cannot bring a distant card forward.
  const distance = useTransform(
    position,
    (value) =>
      ((((index - value + total / 2) % total) + total) % total) - total / 2,
  );
  const x = useTransform(distance, (value) => `${value * 77}%`);
  const y = useTransform(
    distance,
    (value) => Math.min(Math.abs(value), 1) * 25,
  );
  const rotate = useTransform(distance, (value) => value * 7);
  const scale = useTransform(
    distance,
    (value) => 1 - Math.min(Math.abs(value), 1) * 0.11,
  );
  const opacity = useTransform(distance, (value) => {
    const offset = Math.abs(value);
    return offset <= 1 ? 1 - offset * 0.35 : Math.max(0, 2 - offset) * 0.65;
  });
  const zIndex = useTransform(distance, (value) =>
    Math.round(20 - Math.abs(value) * 5),
  );
  return (
    <motion.img
      src={thumbnail(template)}
      data-template-card={template.id}
      alt=""
      aria-hidden="true"
      draggable={false}
      width={440}
      height={622}
      className={styles.carouselPaper}
      style={{ x, y, rotate, scale, opacity, zIndex }}
      loading="lazy"
      fetchPriority="low"
      decoding="async"
    />
  );
}

export function TemplateShowcase({
  templates,
}: {
  templates: LandingTemplate[];
}) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const [selection, setSelection] = useState(
    Math.max(
      0,
      templates.findIndex((template) => template.id === "react-arcade"),
    ),
  );
  const selectedIndex =
    ((selection % templates.length) + templates.length) % templates.length;
  const position = useMotionValue(selection);
  useEffect(() => {
    if (reducedMotion) {
      position.set(selection);
      return;
    }
    const playback = animate(position, selection, {
      duration: 0.28,
      ease: [0.2, 0.8, 0.2, 1],
    });
    return () => playback.stop();
  }, [position, reducedMotion, selection]);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const selected = templates[selectedIndex];
  function advance(direction: number) {
    setSelection((current) => current + direction);
  }

  return (
    <div
      className={styles.templateShowcase}
      data-current-template={selected.id}
    >
      <Button
        variant="ghost"
        className={styles.templateStage}
        data-template-showcase
        aria-label={`${t("site.landing.templatePosition", { name: selected.name, current: selectedIndex + 1, total: templates.length })}. ${t("site.landing.nextTemplate")}`}
        aria-describedby="template-instructions"
        onClick={(event) => {
          if (swiped.current && event.detail > 0) {
            swiped.current = false;
            return;
          }
          advance(1);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            advance(event.key === "ArrowRight" ? 1 : -1);
          } else if (event.key === "Home" || event.key === "End") {
            event.preventDefault();
            setSelection(
              (current) =>
                current -
                (((current % templates.length) + templates.length) %
                  templates.length) +
                (event.key === "Home" ? 0 : templates.length - 1),
            );
          }
        }}
        onPointerDown={(event) => {
          if (!event.isPrimary || event.button !== 0) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          swiped.current = false;
          pointer.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerUp={(event) => {
          const start = pointer.current;
          pointer.current = null;
          if (!start) return;
          const distance = event.clientX - start.x;
          if (
            Math.abs(distance) > 40 &&
            Math.abs(distance) > Math.abs(event.clientY - start.y)
          ) {
            swiped.current = true;
            advance(distance < 0 ? 1 : -1);
          }
        }}
        onPointerCancel={() => {
          pointer.current = null;
        }}
      >
        <span className={styles.templateAmbient} aria-hidden />
        {templates.map((template, index) => (
          <CarouselPaper
            key={template.id}
            template={template}
            index={index}
            total={templates.length}
            position={position}
          />
        ))}
        <span className={styles.nextTemplate} aria-hidden>
          <MoveRight size={20} />
        </span>
      </Button>
      <p id="template-instructions" className={styles.templateHint}>
        {t("site.landing.templateHint")}
      </p>
      <div className={styles.templateDetails}>
        <div
          className={styles.selectedTemplate}
          aria-live="polite"
          aria-atomic="true"
        >
          <span className={styles.templateCount}>
            {String(selectedIndex + 1).padStart(2, "0")} /{" "}
            {String(templates.length).padStart(2, "0")}
          </span>
          <h3>{selected.name}</h3>
        </div>
        <Link
          to={`/editor?template=${selected.id}`}
          className={styles.templateLink}
          onPointerEnter={preloadTemplateEditor}
          onFocus={preloadTemplateEditor}
        >
          {t("site.landing.useTemplate", { name: selected.name })}
          <ArrowRight size={17} aria-hidden />
        </Link>
      </div>
    </div>
  );
}
