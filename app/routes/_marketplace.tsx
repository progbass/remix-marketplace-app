import { Outlet } from "@remix-run/react";

import AppShield from "../components/AppShield";
import AuthService from "../services/Auth.service";

export default function () {
  return <AppShield content={<Outlet />} />;
}
