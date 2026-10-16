# ADR 004 — Keep the initial route fallback available to the client

Accepted after inspecting the built editor on direct navigation and reload.

The development module exposed `HydrateFallback`, but the production build split it into a separate chunk and omitted its reference from the client manifest. The server rendered the opening screen while the initial client route lacked that export. With document hydration, the old screen survived above the editor. Adding a stable `#app` container exposed the underlying React hydration error 418 rather than solving the mismatch alone.

Set the supported top-level `splitRouteModules: false` in `apps/web/react-router.config.ts`. The initial client route now contains the same fallback as the server. Normal route splitting remains available; editor intent prefetch loads its module without invoking the client loader or creating a document. Keep the stable route container, StrictMode and React Compiler. No CSS hides a leftover screen and no console filter suppresses hydration errors.

`apps/web/e2e/hydration.spec.ts` opens the built app at desktop and mobile widths, then reloads the canonical document URL. It requires exactly one main region inside `#app`, no opening heading, viewport-height content starting at zero, and no page or console errors. These tests also run in the fresh-cache development gate. The mobile workspace test limits dock height to 90px and checks vertical/horizontal overflow.

Separately, use a scaled transform around fixed document dimensions rather than CSS `zoom` for the large scrollable canvas. Actual screenshot inspection revealed initial paint culling with `zoom` despite correct DOM geometry. The bounds wrapper retains the scaled size, and gesture coordinates still convert through the selected scale.

References: [React Router route module splitting](https://reactrouter.com/explanation/code-splitting#route-module-splitting), [route fallbacks](https://reactrouter.com/start/framework/route-module#hydratefallback), and the installed `@react-router/dev` configuration types.
