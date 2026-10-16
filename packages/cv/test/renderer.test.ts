import { test, expect } from "bun:test";
import { applyCommand } from "@resumi/engine";
import {
  createResume,
  renderHtml,
  renderResume,
  renderBlock,
  escapeHtml,
} from "../src/index";
test("actual portable renderer shares blocks and styles, escapes untrusted content", () => {
  let doc = createResume("doc");
  doc = applyCommand(doc, {
    type: "block.update",
    id: "profile-0",
    patch: { text: '<img src=x onerror=alert(1)> & "quotes"' },
  });
  const html = renderHtml(doc);
  expect(html).toContain(renderResume(doc));
  expect(html).toContain(renderBlock(doc.blocks["identity-0"]));
  expect(html).toContain("&lt;img");
  expect(html).not.toContain("<img src=x");
  expect(html).toContain("@page {size:A4");
  expect(escapeHtml("'&<>")).toBe("&#39;&amp;&lt;&gt;");
  expect(renderHtml(createResume("serif", "editorial"))).toContain(
    "Georgia,serif",
  );
  expect(createResume("fallback", "bad").style.font).toBe("sans");
});
