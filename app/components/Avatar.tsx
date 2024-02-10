import { Outlet, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { CheckIcon } from "@heroicons/react/20/solid";
import AuthService from "../services/Auth.service";
import { Link } from "react-router-dom";

import getEnv from "get-env";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Attempt to get the user from the session
  const user = await AuthService.getCurrentUser({ request });

  // Get the shop data
  const shopResponse = await fetcher(
    `${getEnv().API_URL}/admin/entrepreneurs/${user.id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    }
  );
  console.log("shopResponse", shopResponse);

  return json({ currentUser: user });
};

export default function Avatar({ src, alt = "", size = "md" }) {
  const { currentUser } = useLoaderData<typeof loader>();

  return (
    <div className="relative">
      <img
        className={classNames("h-16 rounded-full", size || "")}
        src={src || "https://placehold.co/50x50/e91f78/FFF?text=BB"}
        alt={alt}
      />
      <span
        className="absolute inset-0 rounded-full shadow-inner"
        aria-hidden="true"
      />
    </div>
  );
}
