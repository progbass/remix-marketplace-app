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
import { cssBundleHref } from "@remix-run/css-bundle";
import { renderToString } from "react-dom/server";
import { InstantSearch, InstantSearchSSRProvider } from "react-instantsearch";
import type { InstantSearchServerState } from "react-instantsearch";
import { getServerState } from "react-instantsearch";
import { history } from "instantsearch.js/cjs/lib/routers/index.js";

import "instantsearch.css/themes/satellite.css";
import stylesheet from "../tailwind/tailwind.css";

import getEnv from "get-env";
import {
  algoliaSearchClient,
  algoliaRecommendClient,
  algoliaProductsIndex,
  algoliaAPISearchEndpoint,
} from "~/utils/algoliaClients";
import AuthService from "~/services/Auth.service";
import {
  sessionStorage,
  getSession,
  commitSession,
} from "~/services/session.server";
import authenticator from "~/services/auth.server";
import { FetcherConfigurationProvider } from "~/providers/FetcherConfigurationContext";
import { ShoppingCartProvider } from "~/providers/ShoppingCartContext";
import { MarketplaceCategoriesProvider } from "~/providers/MarketplaceCategoriesContext";
import { Fetcher } from "~/utils/fetcher";
import CookieUtils from "set-cookie-parser";

// Links
export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: stylesheet },
];

// LOADER FUNCTION
export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
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
    // session.set(authenticator.sessionKey, xsrfCookie?.value);

    // commit the session and add the auth cookies to the response
    headers = new Headers({
      "Set-Cookie": await sessionStorage.commitSession(session),
    });
    headers.append(
      "Set-Cookie",
      `${
        getEnv().API_SESSION_NAME
      }=${sessionCookie?.value}; path=/; samesite=lax; SameSite=None; Secure`
    );
    headers.append(
      "Set-Cookie",
      `XSRF-TOKEN=${xsrfCookie?.value}; path=/; samesite=lax; SameSite=None; Secure`
    );
  }

  // Algolia InstantSearch SSR
  const serverUrl = request.url;
  const serverState = await getServerState(
    <InstantSearchProvider serverUrl={serverUrl} />,
    { renderToString }
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

  // Search for categories at algolia
  const algoliaIndex = algoliaSearchClient.initIndex(algoliaProductsIndex);
  const facets = await algoliaIndex
    .search("", {
      facets: ["categories.lvl0"],
      maxFacetHits: 10,
      hitsPerPage: 0,
    })
    .catch((err) => {
      console.error("Error:", err);
    });

  // Process facet values to generate the catgories list
  const facetValues = facets?.facets?.["categories.lvl0"] || {};
  const marketplaceCategories = Object.keys(facetValues).map((key) => {
    return {
      name: key,
      count: facetValues[key],
    };
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
      marketplaceCategories: marketplaceCategories || [],
    },
    { ...(headers ? { headers } : {}) }
  );
};

export async function action({ request, context }: ActionFunctionArgs) {
  console.log("logout action ");
  await AuthService.logout(request);
}

type PageProps = {
  serverState?: InstantSearchServerState;
  serverUrl: string;
  children?: React.ReactNode;
};

// Instant Search Provider
function InstantSearchProvider({
  serverState,
  serverUrl,
  children,
}: PageProps) {
  return (
    <InstantSearchSSRProvider {...serverState}>
      <InstantSearch
        searchClient={algoliaSearchClient}
        indexName={algoliaProductsIndex}
        routing={{
          router: history({
            getLocation() {
              if (typeof window === "undefined") {
                return new URL(serverUrl);
              }

              return window.location;
            },
            // createURL({ qsModule, location, routeState }) {
            //   // current search params 
            //   const indexState = routeState[algoliaProductsIndex] || {};
            //   const { origin, pathname, hash, search } = location;
            //   // grab current query string and convert to object
            //   const queryParameters = qsModule.parse(search.slice(1)) || {};
              
            //   // if there is an active search
            //   if (Object.keys(indexState).length ){
            //     // merge the search params with the current query params
            //     Object.assign(queryParameters, routeState);
            //   }else{
            //     // remove the search params
            //     delete queryParameters[algoliaProductsIndex];
            //   }
            //   if (routeState.query) {
            //     queryParameters.query = encodeURIComponent(routeState.query);
            //   }
            //   if (routeState.page !== 1) {
            //     queryParameters.page = routeState.page;
            //   }
            //   if (routeState.brands) {
            //     queryParameters.brand = routeState.brands.map(encodeURIComponent);
            //   }
            //   if (routeState.categories) {
            //     queryParameters.categories = routeState.categories.map(encodeURIComponent);
            //   }
      
            //   let queryString = qsModule.stringify(queryParameters);
              
            //   if(queryString.length){
            //     queryString = `?${queryString}`;
            //   }
      
            //   return `${origin}${pathname}${queryString}${hash}`;
            // },
          }),
          stateMapping: {
            stateToRoute(uiState) {
              const indexUiState = uiState[algoliaProductsIndex];
              // console.log("indexUiState", indexUiState);
              return {
                q: indexUiState.query,
                categories: indexUiState.hierarchicalMenu?.["categories.lvl0"],
                brand: indexUiState.hierarchicalMenu?.["brand.brand"],
                page: indexUiState.page,
                price: indexUiState.numericMenu?.["price"],
              };
            },
            routeToState(routeState) {
              // console.log("routeState ", routeState);
              return {
                [algoliaProductsIndex]: {
                  query: routeState.q,
                  hierarchicalMenu: {
                    ["categories.lvl0"]: routeState.categories,
                    ["brand.brand"]: routeState.brand,
                  },
                  page: routeState.page,
                  numericMenu: {
                    ["price"]: routeState.price,
                  },
                },
              };
            },
          },
        }}
      >
        {children}
      </InstantSearch>
    </InstantSearchSSRProvider>
  );
}

// MAIN APP COMPONENT
export default function App() {
  const {
    ENV_VARS,
    user,
    serverState,
    serverUrl,
    shoppingCartItems,
    marketplaceCategories,
  } = useLoaderData<typeof loader>();

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
          <InstantSearchProvider
            serverState={serverState}
            serverUrl={serverUrl}
          >
            <MarketplaceCategoriesProvider items={marketplaceCategories}>
              <ShoppingCartProvider items={shoppingCart}>
                <Outlet />
              </ShoppingCartProvider>
            </MarketplaceCategoriesProvider>
          </InstantSearchProvider>
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
