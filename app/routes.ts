import {
  type RouteConfig,
  route,
  index,
} from "@react-router/dev/routes";

export default [
  route("/login", "./components/auth_page/AuthComponent.tsx"),
  index("routes/home.tsx"),
  route("questionnaire", "routes/qBuilder.tsx"),
  route("getall", "routes/getAll.tsx"),
] satisfies RouteConfig;