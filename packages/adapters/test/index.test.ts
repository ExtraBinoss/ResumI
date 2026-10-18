import { test, expect } from "bun:test";
import { createResume } from "@resumi/cv";
import { createSession } from "@resumi/engine";
import { parseProposal, previewProposal } from "../src/index";
import { commandContract } from "../src/schema";
test("protocol-independent preview is validated and does not mutate current session", () => {
  const session = createSession(createResume("doc")),
    json = JSON.stringify({
      version: 1,
      actor: { kind: "agent", name: "Example" },
      commands: [
        { type: "block.update", id: "profile-0", patch: { text: "New" } },
      ],
    });
  const result = previewProposal(session, json);
  expect(result.changedBlocks).toEqual(["profile-0"]);
  expect(session.document.blocks["profile-0"].text).not.toBe("New");
  expect(result.session.document.blocks["profile-0"].text).toBe("New");
  expect(commandContract).toHaveProperty("properties");
  expect(() => parseProposal("x")).toThrow();
  expect(() => parseProposal("x".repeat(200001))).toThrow();
  expect(() => parseProposal("{}")).toThrow();
});
