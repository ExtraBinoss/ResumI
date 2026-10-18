import {
  index,
  route,
  layout,
  type RouteConfig,
} from "@react-router/dev/routes";
export default [
  index("routes/home.tsx"),
  route("fr", "routes/home-fr.tsx"),
  layout("routes/dashboard.tsx", [
    route("projects", "routes/projects.tsx"),
    route("templates", "routes/templates.tsx"),
    route("fr/templates", "routes/templates-fr.tsx"),
  ]),
  route("editor/:documentId?", "routes/editor.tsx"),
  route("resources/template-preview/:templateId", "routes/template-preview.ts"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
