import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAtomValue, useSetAtom, useStore } from "jotai";
import { Alert, Button, Textarea, Code, ActionIcon } from "../../../ui";
import { Terminal, ArrowRight, X, Check } from "lucide-react";
import { previewProposal } from "@resumi/adapters";
import { sessionAtom, commandAtom } from "../../../state/editor";
import { ResumeDiff } from "./ResumeDiff";
import { materializeSourceDocument } from "../source/materialize";
import { ErrorMessage, errorDetails } from "../../../components/ErrorNotice";
import styles from "../styles/Commands.module.css";
import shell from "../styles/LegacyPanels.module.css";
export function AgentPanel({ close }: { close: () => void }) {
  const { t } = useTranslation();
  const store = useStore(),
    session = useAtomValue(sessionAtom),
    dispatch = useSetAtom(commandAtom);
  const [json, setJson] = useState(""),
    [error, setError] = useState(""),
    [applying, setApplying] = useState(false);
  const [preview, setPreview] = useState<ReturnType<
    typeof previewProposal
  > | null>(null);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => pending.current?.abort(), []);
  if (!session) return null;
  const stale = preview !== null && preview.baseDocument !== session.document;
  function example() {
    const doc = store.get(sessionAtom)!.document;
    const block = Object.values(doc.blocks).find(
      (b) => b.kind === "text" && b.text.length > 80,
    );
    setJson(
      JSON.stringify(
        {
          version: 1,
          actor: { kind: "agent", name: "CLI agent" },
          commands: [
            block
              ? {
                  type: "block.update",
                  id: block.id,
                  patch: {
                    text: t("workspace.agent.exampleText"),
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
    <aside className={styles.agent} aria-label={t("workspace.agent.review")}>
      <div className={shell.panelHeading}>
        <h2>
          <Terminal size={15} aria-hidden /> {t("workspace.agent.import")}
        </h2>
        <ActionIcon
          variant="subtle"
          color="gray"
          aria-label={t("workspace.agent.close")}
          onClick={close}
        >
          <X size={16} />
        </ActionIcon>
      </div>
      <div className={styles.agentBody}>
        <Code block className={styles.cliSnippet}>
          bun run resumi document inspect cv.json
        </Code>
        <div className={styles.agentActions}>
          <Button
            variant="subtle"
            size="compact-xs"
            disabled={applying}
            onClick={example}
          >
            {t("workspace.agent.example")}
          </Button>
        </div>
        <Textarea
          label={t("workspace.agent.proposal")}
          placeholder='{"version":1,"actor":…,"commands":[…]}'
          value={json}
          disabled={applying}
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
        <ErrorMessage error={error} label={t("workspace.agent.rejected")} />
        <Button
          mt="md"
          fullWidth
          size="xs"
          variant="light"
          disabled={applying || !json.trim()}
          rightSection={<ArrowRight size={14} />}
          onClick={() => {
            try {
              setPreview(previewProposal(store.get(sessionAtom)!, json));
              setError("");
            } catch (e) {
              setError(
                e instanceof Error ? e.message : t("workspace.agent.invalid"),
              );
              setPreview(null);
            }
          }}
        >
          {t("workspace.agent.validate")}
        </Button>
        {preview && (
          <div className={styles.proposal}>
            <div className={styles.proposalTitle}>
              <Check size={14} />
              <strong>
                {t("workspace.agent.command", {
                  count: preview.batch.commands.length,
                })}
              </strong>
            </div>
            <p>
              {t("workspace.agent.proposed", {
                name: preview.batch.actor.name,
              })}
            </p>
            {stale && (
              <Alert color="yellow" mb="md">
                {t("workspace.agent.stale")}
              </Alert>
            )}
            <ResumeDiff
              before={preview.baseDocument}
              after={preview.session.document}
            />
            <Button
              size="xs"
              fullWidth
              disabled={stale || applying}
              aria-busy={applying}
              onClick={() => {
                void (async () => {
                  setApplying(true);
                  try {
                    if (
                      store.get(sessionAtom)!.document !== preview.baseDocument
                    )
                      throw new Error(t("workspace.agent.changed"));
                    const proposed = preview.session.document;
                    let batch = preview.batch;
                    if (proposed.source && proposed.source.enabled !== false) {
                      if (batch.commands.length >= 100)
                        throw new Error(t("workspace.agent.materializeLimit"));
                      const controller = new AbortController();
                      pending.current = controller;
                      const materialize = await materializeSourceDocument(
                        proposed,
                        controller.signal,
                      );
                      if (controller.signal.aborted) return;
                      if (
                        store.get(sessionAtom)!.document !==
                        preview.baseDocument
                      )
                        throw new Error(t("workspace.agent.changed"));
                      batch = {
                        ...batch,
                        commands: [...batch.commands, materialize],
                      };
                    }
                    dispatch(batch);
                    setPreview(null);
                    setJson("");
                  } catch (e) {
                    setError(errorDetails(e));
                  } finally {
                    pending.current = null;
                    setApplying(false);
                  }
                })();
              }}
            >
              {t(
                applying
                  ? "workspace.agent.preparing"
                  : "workspace.agent.apply",
              )}
            </Button>
            <Button
              size="xs"
              variant="subtle"
              fullWidth
              mt={4}
              disabled={applying}
              onClick={() => setPreview(null)}
            >
              {t("workspace.agent.discard")}
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
