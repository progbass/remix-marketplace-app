import {
  NavLink,
  Outlet,
  useNavigate,
  useLoaderData,
} from "@remix-run/react";
import { ActionFunctionArgs } from "@remix-run/node";

import AuthService from "~/services/Auth.service";
import classNames from "~/utils/classNames";
import { redirect } from "react-router-dom";

const tabs = [
  { name: "Mi perfil", href: "/account", current: true },
  { name: "Mis compras", href: "/account/orders", current: false },
];

// Loader function
export async function loader({ request }: ActionFunctionArgs) {
  // Attempt to get user from session
  const userDetails = (await AuthService.isAuthenticated(request)) || null;

  // Redirect to user profile if user is already logged in
  if (!userDetails) {
    return redirect("/login");
  }

  // Return data
  return { userDetails };
}

//
export default function UserSignupPage() {
  
  // Navigation
  const navigate = useNavigate();

  // Return main component
  return (
    <div className="isolate bg-white px-6 py-28 pt-10 lg:px-8">
      {/* NAV CONTAINER */}
      <div className="sm:mx-auto sm:w-full max-w-5xl">
        <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900">
          Mi cuenta
        </h1>

        {/* MOBILE NAVIGATION */}
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">
            Selecciona una opción
          </label>
          
          {/* NAVIGATION TABS */}
          <select
            id="tabs"
            name="tabs"
            className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            defaultValue={tabs.find((tab) => tab.current).name}
            onChange={(e) => {
              const selectedTab = tabs.find((tab) => tab.name === e.target.value);
              selectedTab?.href && navigate(selectedTab.href);
            }}
          >
            {tabs.map((tab) => (
              <option key={tab.name}>{tab.name}</option>
            ))}
          </select>
        </div>

        {/* DESKTOP NAVIGATION */}
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <NavLink
                  end
                  key={tab.name}
                  to={tab.href}
                  className={({ isActive, isPending }) =>
                    classNames(
                      isActive
                        ? "border-indigo-500 text-indigo-600"
                        : isPending
                          ? "text-gray-500 "
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                      "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
                    )
                  }
                >
                  {tab.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* CONTENT CONTAINER */}
      <div className="sm:mx-auto sm:w-full max-w-5xl">
        <Outlet />
      </div>
    </div>
  );
}
