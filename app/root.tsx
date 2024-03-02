import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  useLoaderData,
  useRouteError,
  ScrollRestoration,
} from "@remix-run/react";
import type {
  LinksFunction,
  LoaderFunctionArgs,
  LoaderFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { renderToString } from "react-dom/server";
import algoliasearch from "algoliasearch";
import { InstantSearch, InstantSearchSSRProvider } from "react-instantsearch";
import type { InstantSearchServerState } from "react-instantsearch";
import { getServerState } from "react-instantsearch";
import { history } from "instantsearch.js/cjs/lib/routers/index.js";
import "instantsearch.css/themes/satellite.css";
import stylesheet from "../tailwind/tailwind.css";

import getEnv from "get-env";
import AuthService from "~/services/Auth.service";
import {
  sessionStorage,
  getSession,
  commitSession,
} from "~/services/session.server";
import authenticator from "~/services/auth.server";
import { FetcherConfigurationProvider } from "~/providers/FetcherConfigurationContext";
import { ShoppingCartProvider } from "~/providers/ShoppingCartContext";
import { Fetcher } from "~/utils/fetcher";
import CookieUtils from "set-cookie-parser";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

//
const searchClient = algoliasearch(
  "A30F39KME9",
  "64e2db4db25b030e512f238fa20dbd90"
);

// LOADER FUNCTION
export const loader: LoaderFunction = async ({ request }:LoaderFunctionArgs) => {
  // If the user is already authenticated redirect to /dashboard directly
  const user = (await AuthService.isAuthenticated(request)) || null;
  let session = await getSession(request.headers.get("cookie"));

  // Set the Cookies sent from the API server for Auth, CSRF, and Session management
  let headers = undefined;
  // Verify if the session is already set
  if (!session.get(getEnv().API_SESSION_NAME)) {
    console.log("---- GETTING THE SESSION COOKIE FROM THE API SERVER ----");
    // Call the API server to get the session cookie
    const cookieResponse = await fetch(
      `${getEnv().API_URL}/sanctum/csrf-cookie`
    );

    // Parse the cookies from the response and put them into an array
    const cookieHeader = cookieResponse.headers.get("Set-Cookie") || undefined;
    var splitCookieHeaders: Array<any> =
      CookieUtils.splitCookiesString(cookieHeader);
    var cookies: Array<any> = CookieUtils.parse(splitCookieHeaders);

    // Search for the getEnv().API_SESSION_NAME cookie 
    // (Note: this needs to be the same as the API server's session name)
    const sessionCookie = cookies.find(
      (cookie) => cookie.name === getEnv().API_SESSION_NAME
    );
    const xsrfCookie = cookies.find((cookie) => cookie.name === "XSRF-TOKEN");

    // Save the sessionId in the session
    session.set(getEnv().API_SESSION_NAME, sessionCookie?.value);
    session.set("XSRF-TOKEN", xsrfCookie.value);
    session.set(authenticator.sessionKey, xsrfCookie?.value);

    // commit the session and add the auth cookies to the response
    headers = new Headers({
      "Set-Cookie": await sessionStorage.commitSession(session),
    });
    headers.append(
      "Set-Cookie",
      `${getEnv().API_SESSION_NAME}=${
        sessionCookie?.value
      }; path=/; samesite=lax; SameSite=None; Secure`
    );
    headers.append(
      "Set-Cookie",
      `XSRF-TOKEN=${xsrfCookie?.value}; path=/; samesite=lax; SameSite=None; Secure`
    );
  }

  // Algolia InstantSearch SSR
  const serverUrl = request.url;
  const serverState = await getServerState(
    <InstanteSearchProvider serverUrl={serverUrl} />,
    {
      renderToString,
    }
  );

  // Fetch the shopping cart items
  const myFetcher = new Fetcher(user?.token, request);
  const shoppingCartItems = await myFetcher
    .fetch(`${getEnv().API_URL}/cart`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })
    .catch((err) => {
      console.log(err);
    });
    
  // Return the loader data including headers
  return json(
    {
      user: user,
      ENV_VARS: {
        API_URL: process.env.API_URL,
        MARKETPLACE_URL: process.env.MARKETPLACE_URL,
      },
      request,
      serverState,
      serverUrl,
      shoppingCartItems,
    },
    { ...(headers ? { headers } : {}) }
  );
};

type PageProps = {
  serverState?: InstantSearchServerState;
  serverUrl: string;
  children?: React.ReactNode;
};

// Instant Search Provider
function InstanteSearchProvider({ serverState, serverUrl, children }: PageProps) {
  return (
    <InstantSearchSSRProvider {...serverState}>
      <InstantSearch
        searchClient={searchClient}
        indexName="products"
        routing={{
          router: history({
            getLocation() {
              if (typeof window === "undefined") {
                return new URL(serverUrl);
              }

              return window.location;
            },
          }),
        }}
      >
        {children}
      </InstantSearch>
    </InstantSearchSSRProvider>
  );
}

// MAIN APP COMPONENT
export default function App() {
  const { ENV_VARS, user, serverState, serverUrl, shoppingCartItems } =
    useLoaderData<typeof loader>();

  // Configure the fetcher
  const fetcher = new Fetcher(user ? user.token : null);

  // Set the shopping cart items
  const shoppingCart = shoppingCartItems;

  //
  return (
    <html lang="es" className="h-full bg-gray-100">
      <head>
        <title>Marketplace</title>
        <meta name="description" content="Marketplace" />
        <meta name="author" content="Marketplace" />
        <meta name="keywords" content="Marketplace" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/x-icon;base64,AA" />
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV_VARS)}`,
          }}
        />
      </head>
      <body className="h-full">
        <FetcherConfigurationProvider fetcher={fetcher}>
          <InstanteSearchProvider serverState={serverState} serverUrl={serverUrl}>
            <ShoppingCartProvider items={shoppingCart}>
              <Outlet />
            </ShoppingCartProvider>
          </InstanteSearchProvider>
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </FetcherConfigurationProvider>
      </body>
    </html>
  );
}

// ERROR BOUNDARY COMPONENT
export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <html lang="es" className="h-full bg-gray-100">
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        {/* <Outlet /> */}
        Se produjo un error desconocido.
        <pre>
          code [{error?.status}] {error?.message}
        </pre>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
