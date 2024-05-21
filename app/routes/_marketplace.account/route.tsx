import { FormEvent, useEffect, useState } from "react";
import {
  Form,
  Link,
  Outlet,
  useActionData,
  useNavigation,
  useNavigate,
  useLoaderData,
} from "@remix-run/react";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { Switch } from "@headlessui/react";
import validator from "validator";
import {
  validateUserRegistrationForm,
  validateName,
  validateEmail,
  validatePassword,
  validateLastName,
} from "./validators";

import AuthService from "~/services/Auth.service";
import getEnv from "get-env";
import classNames from "~/utils/classNames";
import Fetcher from "~/utils/fetcher";
import { redirect } from "react-router-dom";

const tabs = [
  { name: "Mi cuenta", href: "/account", current: true },
  { name: "Compras", href: "/account/orders", current: false },
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
  const { userDetails } = useLoaderData<typeof loader>();
  console.log(userDetails);

  // Return main component
  return (
    <div className="isolate bg-white px-6 py-28 lg:px-8">
      <div className="sm:mx-auto sm:w-full max-w-5xl">
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">
            Select a tab
          </label>
          {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
          <select
            id="tabs"
            name="tabs"
            className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            defaultValue={tabs.find((tab) => tab.current).name}
          >
            {tabs.map((tab) => (
              <option key={tab.name}>{tab.name}</option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <Link
                  key={tab.name}
                  to={tab.href}
                  className={classNames(
                    tab.current
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                    "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
                  )}
                  aria-current={tab.current ? "page" : undefined}
                >
                  {tab.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full max-w-5xl">
        <Outlet />
      </div>
    </div>
  );
}
