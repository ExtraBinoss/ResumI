import { Settings2, Sun, Moon, Monitor, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { uiLanguages } from "../i18n/resources";
import { setInterfaceLanguage } from "../i18n/InterfaceLanguage";
import { ActionIcon, Popover, Select } from "../ui";
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
  const { t, i18n } = useTranslation();
  return (
    <Popover
      position={trigger === "sidebar" ? "top-start" : "bottom-end"}
      width={210}
    >
      <Popover.Target>
        {fullWidth ? (
          <Button
            variant="ghost"
            aria-label={t("common.settings")}
            className={styles.sidebarTrigger}
          >
            <Settings2 size={17} aria-hidden />
            <span>{t("common.settings")}</span>
          </Button>
        ) : (
          <ActionIcon
            w={32}
            h={32}
            variant="subtle"
            color="gray"
            aria-label={t("common.settings")}
            title={t("common.settings")}
          >
            <Settings2 size={17} aria-hidden />
          </ActionIcon>
        )}
      </Popover.Target>
      <Popover.Dropdown className={styles.panel}>
        <h2>{t("settings.appearance")}</h2>
        <div
          className={styles.themes}
          role="group"
          aria-label={t("settings.appearance")}
        >
          {(
            [
              { value: "light", label: t("settings.light"), icon: Sun },
              { value: "dark", label: t("settings.dark"), icon: Moon },
              { value: "system", label: t("settings.system"), icon: Monitor },
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
        <div className={styles.language}>
          <Select
            label={t("settings.language")}
            aria-label={t("settings.language")}
            value={i18n.language}
            data={uiLanguages.map(({ code, name }) => ({
              value: code,
              label: name,
            }))}
            onChange={(locale) => {
              if (locale) setInterfaceLanguage(i18n, locale);
            }}
          />
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}
