import { index, route, type RouteConfig } from "@react-router/dev/routes";
export default [
  index("routes/home.tsx"),
  route("projects", "routes/projects.tsx"),
  route("templates", "routes/templates.tsx"),
  route("editor", "routes/new.tsx"),
  route("editor/:documentId", "routes/editor.tsx"),
] satisfies RouteConfig;
