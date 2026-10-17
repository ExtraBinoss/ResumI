import { templateSource } from "./template-source";
/** Rebuild after updating React. The resulting JSON is an offline runtime asset. */
const result = await Bun.build({
  entrypoints: [
    new URL("../packages/cv/src/source/browser-runtime.tsx", import.meta.url)
      .pathname,
  ],
  target: "browser",
  minify: true,
  define: { "process.env.NODE_ENV": '"production"' },
});
if (!result.success)
  throw new Error(result.logs.map((log) => log.message).join("\n"));
const license = await Bun.file(
  new URL("../node_modules/react/LICENSE", import.meta.url),
).text();
const runtime = `/* React, React DOM and Scheduler — ${license.trim()} */\n${await result.outputs[0].text()}`;
await Bun.write(
  new URL("../packages/cv/src/source/runtime.generated.json", import.meta.url),
  JSON.stringify(runtime) + "\n",
);
const template = await templateSource(new URL("../", import.meta.url));
await Bun.write(
  new URL("../packages/cv/src/source/template.generated.json", import.meta.url),
  JSON.stringify(template) + "\n",
);
console.log(
  `Offline React source runtime: ${runtime.length.toLocaleString()} bytes.`,
);
