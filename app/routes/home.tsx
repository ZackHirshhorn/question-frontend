import type { Route } from "./+types/home";
import AuthComponent from "../auth-page";
import QuestionnaireBuilder from "../questionnaire-builder"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  //return <QuestionnaireBuilder />;
  return <AuthComponent />;
}
