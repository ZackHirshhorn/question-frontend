import type { Route } from "./+types/home";
import AuthComponent from "./authPage";
import GetAll from "./getAll";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <AuthComponent />;
}
