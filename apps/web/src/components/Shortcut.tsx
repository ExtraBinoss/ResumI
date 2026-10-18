import { useSyncExternalStore } from "react";
import { Kbd, KbdGroup } from "./ui/kbd";

const subscribe = () => () => {};
function platform() {
  return /Mac|iPhone|iPad/.test(navigator.platform);
}
export function Shortcut({ keys }: { keys: string[] }) {
  const apple = useSyncExternalStore(subscribe, platform, () => false);
  return (
    <KbdGroup>
      {keys.map((key) => (
        <Kbd key={key}>
          {key === "Mod" ? (apple ? "⌘" : "Ctrl") : key === "Shift" ? "⇧" : key}
        </Kbd>
      ))}
    </KbdGroup>
  );
}
