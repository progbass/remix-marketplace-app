import { Outlet } from "@remix-run/react";

import AppShield from "../components/AppShield";

export default function () {
  return <AppShield content={<Outlet />} />;
}
