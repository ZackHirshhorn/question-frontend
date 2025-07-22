import { useAppDispatch } from "~/hooks";
import type { Route } from "./+types/home";
import { logout } from "app/auth/authSlice"
import { clearStoredUserId } from "utils/localUser"


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Questionair App Home" },
    { name: "description", content: "Welcome to Questionair!" },
  ];
}

export default function Home() {
  // const dispatch = useAppDispatch();
  // dispatch(logout());
  // clearStoredUserId();
  return <h1>Here be homepage</h1>
}
