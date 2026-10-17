import {
  index,
  route,
  layout,
  type RouteConfig,
} from "@react-router/dev/routes";
export default [
  index("routes/home.tsx"),
  layout("routes/dashboard.tsx", [
    route("projects", "routes/projects.tsx"),
    route("templates", "routes/templates.tsx"),
  ]),
  route("editor/:documentId?", "routes/editor.tsx"),
] satisfies RouteConfig;
