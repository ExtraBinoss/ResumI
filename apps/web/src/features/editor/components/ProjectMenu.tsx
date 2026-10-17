import { useState } from "react";
import { useAtomValue, useSetAtom, useStore } from "jotai";
import { ChevronDown, Code2, FolderOpen, ListChecks } from "lucide-react";
import { Popover, TextInput, Button } from "../../../ui";
import { Button as ShadcnButton } from "../../../components/ui/button";
import { nameAtom, commandAtom } from "../../../state/editor";
import { sourceAtom, canvasAtom } from "../../../state/design";
import styles from "../styles/Editor.module.css";

export function ProjectMenu({
  openSource,
  openProposal,
  back,
}: {
  openSource: () => void;
  openProposal: () => void;
  back: () => void;
}) {
  const source = useAtomValue(sourceAtom),
    canvas = useAtomValue(canvasAtom),
    name = useAtomValue(nameAtom),
    dispatch = useSetAtom(commandAtom),
    store = useStore();
  const [opened, setOpened] = useState(false),
    [draft, setDraft] = useState(name);
  function run(action: () => void) {
    setOpened(false);
    action();
  }
  return (
    <Popover
      position="bottom-start"
      width={270}
      opened={opened}
      onChange={(next) => {
        if (next) setDraft(store.get(nameAtom));
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
            dispatch({ type: "document.update", name: draft.trim() });
            setOpened(false);
          }}
        >
          <TextInput
            label="Project name"
            value={draft}
            onChange={(event) => setDraft(event.currentTarget.value)}
            maxLength={120}
            required
          />
          <Button
            type="submit"
            variant="subtle"
            size="xs"
            disabled={!draft.trim()}
          >
            Save name
          </Button>
        </form>
        <div className={styles.projectFacts}>
          <span>
            {!canvas || (canvas.width === 794 && canvas.height === 1123)
              ? "A4"
              : `${canvas.width} × ${canvas.height}`}
          </span>
          <span>
            {source?.format === "react" ? "React" : source ? "HTML" : "Resume"}
          </span>
        </div>
        <Button
          variant="subtle"
          size="xs"
          fullWidth
          leftSection={<Code2 size={15} />}
          onClick={() => run(openSource)}
        >
          Edit source
        </Button>
        <Button
          variant="subtle"
          size="xs"
          fullWidth
          leftSection={<ListChecks size={15} />}
          onClick={() => run(openProposal)}
        >
          Import commands
        </Button>
        <Button
          variant="subtle"
          size="xs"
          fullWidth
          leftSection={<FolderOpen size={15} />}
          onClick={() => run(back)}
        >
          All projects
        </Button>
      </Popover.Dropdown>
    </Popover>
  );
}
