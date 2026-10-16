import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import babel from "vite-plugin-babel";
const browserDependencies = [
  "react/compiler-runtime",
  "@mantine/core",
  "@mantine/hooks",
  "jotai",
  "lucide-react",
  "idb",
  "zod",
];
export default defineConfig({
  // Compiler imports are injected after scanning; UI dependencies also enter via lazy routes.
  // Prime both graphs so the first navigation never rotates the shared React chunks.
  optimizeDeps: { include: browserDependencies },
  environments: {
    ssr: { optimizeDeps: { include: browserDependencies } },
  },
  cacheDir: process.env.RESUMI_VITE_CACHE_DIR ?? "node_modules/.vite",
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    reactRouter(),
    babel({
      include: /\/apps\/web\/.*\.tsx?$/,
      babelConfig: {
        presets: ["@babel/preset-typescript"],
        plugins: [["babel-plugin-react-compiler", { target: "19" }]],
      },
    }),
  ],
});
