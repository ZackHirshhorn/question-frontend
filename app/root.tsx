import {
  Scripts,
  ScrollRestoration,
  Outlet,
} from "react-router-dom";
import { useEffect } from "react";

import { Provider } from "react-redux";
import { store, useAppSelector } from "app/store";
import "./app.css";
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
  const userId = useAppSelector((state) => state.auth.userId);

  return userId ? <Outlet /> : <AuthComponent />;
}
