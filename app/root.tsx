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
import { FetcherConfigurationProvider } from "~/providers/FetcherConfigurationContext";
import { ShoppingCartProvider } from "~/providers/ShoppingCartContext";
import { Fetcher } from "~/utils/fetcher";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

//
const searchClient = algoliasearch(
  "A30F39KME9",
  "64e2db4db25b030e512f238fa20dbd90"
);

// LOADER FUNCTION
export const loader: LoaderFunction = async ({ request }) => {
  // If the user is already authenticated redirect to /dashboard directly
  const user = (await AuthService.isAuthenticated(request)) || null;

  //
  const serverUrl = request.url;
  const serverState = await getServerState(
    <TestFunction serverUrl={serverUrl} />,
    {
      renderToString,
    }
  );

  return json({
    user: user,
    ENV_VARS: {
      API_URL: process.env.API_URL,
      MARKETPLACE_URL: process.env.MARKETPLACE_URL,
    },
    serverState,
    serverUrl,
  });
};

type PageProps = {
  serverState?: InstantSearchServerState;
  serverUrl: string;
  children?: React.ReactNode;
};
function TestFunction({ serverState, serverUrl, children }: PageProps) {
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
  const { ENV_VARS, user, serverState, serverUrl } =
    useLoaderData<typeof loader>();

  //
  const fetcher = new Fetcher(user ? user.token : null);

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
          <TestFunction serverState={serverState} serverUrl={serverUrl}>
            <ShoppingCartProvider>
              <Outlet />
            </ShoppingCartProvider>
          </TestFunction>
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
