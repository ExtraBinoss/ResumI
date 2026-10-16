import { useState } from "react";
import { useAtomValue, useSetAtom, useStore } from "jotai";
import { Alert, Button, Textarea, Code, ActionIcon } from "@mantine/core";
import { Terminal, ArrowRight, X, Check } from "lucide-react";
import { previewProposal } from "@resumi/adapters";
import { sessionAtom, commandAtom } from "../state/editor";
import { ResumeDiff } from "./ResumeDiff";
import styles from "../styles/Agent.module.css";
import shell from "../styles/Editor.module.css";
export function AgentPanel({ close }: { close: () => void }) {
  const store = useStore(),
    session = useAtomValue(sessionAtom),
    dispatch = useSetAtom(commandAtom);
  const [json, setJson] = useState(""),
    [error, setError] = useState("");
  const [preview, setPreview] = useState<ReturnType<
    typeof previewProposal
  > | null>(null);
  if (!session) return null;
  const stale = preview !== null && preview.baseDocument !== session.document;
  function example() {
    const doc = store.get(sessionAtom)!.document;
    const block = Object.values(doc.blocks).find((b) => b.kind === "text");
    setJson(
      JSON.stringify(
        {
          version: 1,
          actor: { kind: "agent", name: "CLI teammate" },
          commands: [
            block
              ? {
                  type: "block.update",
                  id: block.id,
                  patch: {
                    text: "I design thoughtful digital products that connect business goals with real human needs.",
                  },
                }
              : { type: "style.update", patch: { accent: "#334e68" } },
          ],
        },
        null,
        2,
      ),
    );
    setPreview(null);
    setError("");
  }
  return (
    <aside className={styles.agent} aria-label="Agent command review">
      <div className={shell.panelHeading}>
        <h2>
          <Terminal size={15} aria-hidden /> Your teammate
        </h2>
        <ActionIcon
          variant="subtle"
          color="gray"
          aria-label="Close agent panel"
          onClick={close}
        >
          <X size={16} />
        </ActionIcon>
      </div>
      <div className={styles.agentBody}>
        <h3>
          Same document.
          <br />
          Another pair of hands.
        </h3>
        <p className={shell.help}>
          Export JSON, let your CLI agent propose commands, then review them
          here. Your browser data stays private.
        </p>
        <Code block className={styles.cliSnippet}>
          bun run resumi document inspect cv.json
        </Code>
        <div className={styles.agentActions}>
          <Button variant="subtle" size="compact-xs" onClick={example}>
            Load a working example
          </Button>
        </div>
        <Textarea
          label="Command proposal"
          placeholder='{"version":1,"actor":…,"commands":[…]}'
          value={json}
          minRows={9}
          maxRows={15}
          autosize
          size="xs"
          styles={{ input: { fontFamily: "monospace", fontSize: 10 } }}
          onChange={(e) => {
            setJson(e.currentTarget.value);
            setPreview(null);
            setError("");
          }}
        />
        {error && (
          <Alert color="red" mt="md" title="Proposal rejected">
            {error}
          </Alert>
        )}
        <Button
          mt="md"
          fullWidth
          size="xs"
          variant="light"
          disabled={!json.trim()}
          rightSection={<ArrowRight size={14} />}
          onClick={() => {
            try {
              setPreview(previewProposal(store.get(sessionAtom)!, json));
              setError("");
            } catch (e) {
              setError(e instanceof Error ? e.message : "Invalid proposal.");
              setPreview(null);
            }
          }}
        >
          Validate & preview
        </Button>
        {preview && (
          <div className={styles.proposal}>
            <div className={styles.proposalTitle}>
              <Check size={14} />
              <strong>
                {preview.batch.commands.length} validated command
                {preview.batch.commands.length > 1 ? "s" : ""}
              </strong>
            </div>
            <p>
              Proposed by {preview.batch.actor.name}. Applied together as one
              undo step.
            </p>
            {stale && (
              <Alert color="yellow" mb="md">
                The resume changed after this preview. Validate again before
                applying.
              </Alert>
            )}
            <ResumeDiff
              before={preview.baseDocument}
              after={preview.session.document}
            />
            <Button
              size="xs"
              fullWidth
              disabled={stale}
              onClick={() => {
                try {
                  if (store.get(sessionAtom)!.document !== preview.baseDocument)
                    throw new Error(
                      "The resume changed. Validate the proposal again.",
                    );
                  dispatch(preview.batch);
                  setPreview(null);
                  setJson("");
                } catch (e) {
                  setError(String(e));
                }
              }}
            >
              Apply changes
            </Button>
            <Button
              size="xs"
              variant="subtle"
              fullWidth
              mt={4}
              onClick={() => setPreview(null)}
            >
              Discard preview
            </Button>
          </div>
        )}
        <p className={styles.agentFoot}>
          Command review, no model connected.
          <br />
          Codex, Claude Code, Grok, or any CLI agent can use the documented
          contract. MCP and live sync are future work.
        </p>
      </div>
    </aside>
  );
}
