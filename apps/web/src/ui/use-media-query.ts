import { useCallback, useSyncExternalStore } from "react";
const serverSnapshot = () => false;
/** Stable callbacks keep the external media-query subscription attached across unrelated edits. */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (notify: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", notify);
      return () => media.removeEventListener("change", notify);
    },
    [query],
  );
  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );
  return useSyncExternalStore(subscribe, getSnapshot, serverSnapshot);
}
