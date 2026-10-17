import { expect, test } from "bun:test";
import { assetSvg, loadAssets } from "@resumi/assets";
import { renderSourceHtml } from "@resumi/cv/source-render";
import { captureScreenshot } from "../src/screenshot";

test("real capture runs TSX/hooks only in an opaque browser frame, decodes artwork and blocks network", async () => {
  const figma = (await loadAssets("brands")).find(
    (asset) => asset.id === "brand-figma",
  )!;
  const image = `data:image/svg+xml;base64,${Buffer.from(assetSvg(figma)).toString("base64")}`;
  const code = `import { useState } from "react";
export default function Resume() {
  const [title] = useState("Isolated portfolio");
  let isolated = false;
  try { parent.document.body.setAttribute("data-leaked", "yes"); } catch { isolated = true; }
  if (!isolated) throw Error("Source escaped its opaque sandbox");
  return <main style={{width:794,minHeight:1123,padding:48,background:"#fafafa"}}>
    <h1>{title}</h1><img alt="Figma" src=${JSON.stringify(image)} width={40} height={40}/>
  </main>;
}`;
  const portable = renderSourceHtml(
    { format: "react", code },
    "Synthetic isolated CV",
  );
  const result = await captureScreenshot(portable, 794, 1123);
  expect(result.width).toBe(794);
  expect(result.height).toBe(1123);
  const view = new DataView(
    result.bytes.buffer,
    result.bytes.byteOffset,
    result.bytes.byteLength,
  );
  expect(view.getUint32(16)).toBe(794);
  expect(view.getUint32(20)).toBe(1123);
  expect(result.bytes.length).toBeGreaterThan(5000);
  expect(result.blockedRequests).toEqual([]);

  // Even a missing source CSP cannot cause capture to contact another origin.
  const network = await captureScreenshot(
    '<main>Offline</main><script>fetch("https://resumi-capture.invalid/probe").catch(() => {})</script>',
    794,
    1123,
  );
  expect(network.blockedRequests).toEqual([
    "https://resumi-capture.invalid/probe",
  ]);
  await expect(
    captureScreenshot(
      renderSourceHtml({
        format: "html",
        code: '<img alt="Broken portrait" src="data:image/png;base64,AAAA">',
      }),
      794,
      1123,
    ),
  ).rejects.toThrow("could not decode");
}, 30000);
