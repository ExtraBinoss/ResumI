import type { Config } from "@react-router/dev/config";
export default {
  ssr: true,
  // Preserve HydrateFallback in the initial client module as well as the SSR module.
  // With split chunks this build omitted hydrateFallbackModule from the manifest.
  splitRouteModules: false,
} satisfies Config;
