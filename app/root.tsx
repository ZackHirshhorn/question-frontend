import {
  Scripts,
  ScrollRestoration,
  Outlet,
} from "react-router-dom";

import { Provider } from "react-redux";
import { store } from "app/store";
import "./app.css";
import { getStoredUserId } from "utils/localUser"
import AuthComponent from "./components/auth_page/AuthComponent";

export default function Root() {
  return (
    <>
      <Provider store={store}>
        {/* your global auth/RTK wrapper, routes render inside Outlet */}
        <SessionGate />
      </Provider>

      <ScrollRestoration />
      <Scripts />
    </>
  );
}

function SessionGate() {
  const userId = getStoredUserId();   // null if not logged in

  return userId ? <Outlet /> : <AuthComponent />;
}
