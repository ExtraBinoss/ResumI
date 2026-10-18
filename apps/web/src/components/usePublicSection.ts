import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { publicRoute } from "../i18n/public-locale";

const sections = ["how-it-works", "templates"] as const;
type PublicSection = (typeof sections)[number];

export function usePublicSection(): PublicSection | null {
  const { pathname } = useLocation();
  const route = publicRoute(pathname);
  const landing = route?.page === "landing";
  const [section, setSection] = useState<PublicSection | null>(null);

  useEffect(() => {
    if (!landing) return;
    let frame = 0;
    function update() {
      frame = 0;
      const marker = Math.min(window.innerHeight * 0.35, 240);
      let current: PublicSection | null = null;
      for (const id of sections) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= marker)
          current = id;
      }
      setSection(current);
    }
    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [landing]);

  return landing ? section : route?.page === "templates" ? "templates" : null;
}
