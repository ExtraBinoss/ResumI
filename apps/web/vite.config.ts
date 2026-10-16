import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import babel from "vite-plugin-babel";
import tailwindcss from "@tailwindcss/vite";
const browserDependencies = [
  "react/compiler-runtime",
  ...[
    "button",
    "dialog",
    "input",
    "menu",
    "popover",
    "radio",
    "radio-group",
    "scroll-area",
    "select",
    "separator",
    "slider",
    "tabs",
    "tooltip",
  ].map((part) => `@base-ui/react/${part}`),
  "class-variance-authority",
  "cn",
  "jotai",
  "lucide-react",
  "idb",
  "zod/mini",
  "zod/v4/locales/en.js",
  "sucrase",
];
export default defineConfig({
  resolve: { alias: { "@": new URL("./src", import.meta.url).pathname } },
  // Compiler and Base UI imports enter via lazy routes; prebundle both development graphs.
  // Prime both graphs so the first navigation never rotates the shared React chunks.
  optimizeDeps: { include: browserDependencies },
  environments: {
    ssr: { optimizeDeps: { include: browserDependencies } },
  },
  cacheDir: process.env.RESUMI_VITE_CACHE_DIR ?? "node_modules/.vite",
  plugins: [
    tailwindcss(),
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
