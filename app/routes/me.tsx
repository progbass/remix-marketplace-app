import {
  Outlet, useLoaderData,
} from "@remix-run/react";
import { redirect } from '@remix-run/node';
import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';
import AppShield from "../components/AppShield";
import SidebarMenu from "../components/SidebarMenu";
import AuthService from "../services/Auth.service";

export default function App() {
  return (
    <>
      <AppShield content={<Outlet/>} sidebar={<SidebarMenu/>} />
    </>
  );
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Attempt to get the user from the session
  const user = await AuthService.isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  };
  return user
}

export async function action({ request, context }: ActionFunctionArgs) {
  await AuthService.logout(request);
};
