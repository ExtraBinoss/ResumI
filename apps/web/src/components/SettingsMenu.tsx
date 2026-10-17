import { Settings2, Sun, Moon, Monitor, Check } from "lucide-react";
import { ActionIcon, Popover } from "../ui";
import { useTheme } from "../state/theme";
import { Button } from "./ui/button";
import styles from "../styles/Settings.module.css";

export function SettingsMenu({
  trigger = "icon",
  fullWidth = trigger === "sidebar",
}: {
  trigger?: "icon" | "sidebar";
  fullWidth?: boolean;
}) {
  const [theme, setTheme] = useTheme();
  return (
    <Popover
      position={trigger === "sidebar" ? "top-start" : "bottom-end"}
      width={210}
    >
      <Popover.Target>
        {fullWidth ? (
          <Button
            variant="ghost"
            aria-label="Settings"
            className={styles.sidebarTrigger}
          >
            <Settings2 size={17} aria-hidden />
            <span>Settings</span>
          </Button>
        ) : (
          <ActionIcon
            w={32}
            h={32}
            variant="subtle"
            color="gray"
            aria-label="Settings"
            title="Settings"
          >
            <Settings2 size={17} aria-hidden />
          </ActionIcon>
        )}
      </Popover.Target>
      <Popover.Dropdown className={styles.panel}>
        <h2>Appearance</h2>
        <div className={styles.themes} role="group" aria-label="Appearance">
          {(
            [
              { value: "light", label: "Light", icon: Sun },
              { value: "dark", label: "Dark", icon: Moon },
              { value: "system", label: "System", icon: Monitor },
            ] as const
          ).map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              variant="ghost"
              aria-pressed={theme === value}
              onClick={() => setTheme(value)}
            >
              <Icon size={16} aria-hidden />
              <span>{label}</span>
              {theme === value && <Check size={15} aria-hidden />}
            </Button>
          ))}
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}
