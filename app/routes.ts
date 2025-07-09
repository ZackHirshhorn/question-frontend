import {
  type RouteConfig,
  route,
  index,
  layout,
  prefix,
} from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("questionnaire", "routes/qBuilder.tsx"),
    route("getall", "routes/getAll.tsx")
] satisfies RouteConfig;