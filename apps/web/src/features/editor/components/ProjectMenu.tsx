import { useRef, useState } from "react";
import { useAtomValue, useSetAtom, useStore } from "jotai";
import { ArrowUpRight, ChevronDown, FolderOpen } from "lucide-react";
import { Popover, TextInput, Button } from "../../../ui";
import { Button as ShadcnButton } from "../../../components/ui/button";
import { nameAtom, commandAtom } from "../../../state/editor";
import { canvasAtom } from "../../../state/design";
import styles from "../styles/Editor.module.css";

export function ProjectMenu({ back }: { back: () => void }) {
  const canvas = useAtomValue(canvasAtom),
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
      width={280}
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
          aria-label={`Project: ${name}`}
        >
          <span>{name}</span>
          <ChevronDown size={13} aria-hidden />
        </ShadcnButton>
      </Popover.Target>
      <Popover.Dropdown className={styles.projectMenu}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            saveName();
            setOpened(false);
          }}
        >
          <TextInput
            label="Project name"
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
        <div className={styles.projectFacts}>
          <span>Page</span>
          <span>
            {!canvas || (canvas.width === 794 && canvas.height === 1123)
              ? "A4 · Portrait"
              : `${canvas.width} × ${canvas.height} px`}
          </span>
        </div>
        <Button
          variant="subtle"
          size="xs"
          fullWidth
          leftSection={<FolderOpen size={16} />}
          rightSection={<ArrowUpRight size={14} />}
          onClick={() => {
            saveName();
            setOpened(false);
            back();
          }}
        >
          All projects
        </Button>
      </Popover.Dropdown>
    </Popover>
  );
}
