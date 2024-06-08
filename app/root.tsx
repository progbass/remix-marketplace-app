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
} from "~/utils/algoliaClients";
import AuthService from "~/services/Auth.service";
import { getSession } from "~/services/session.server";
import { FetcherConfigurationProvider } from "~/providers/FetcherConfigurationContext";
import { ShoppingCartProvider } from "~/providers/ShoppingCartContext";
import { MarketplaceCategoriesProvider } from "~/providers/MarketplaceCategoriesContext";
import AuthProvider from "~/providers/AuthProvider";
import { Fetcher } from "~/utils/fetcher";

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
  let userFetchError = false;
  const user = await AuthService.getCurrentUser(request).catch((err) => {
    console.error(err);
    userFetchError = true;
    return null;
  });
  let session = await getSession(request.headers.get("cookie"));

  // Set the Cookies sent from the API server for Auth, CSRF, and Session management
  let headers = undefined;
  let shouldSetCookies = false;
  // Verify if the session is already set
  if (!session.get(getEnv().API_SESSION_NAME)) {
    shouldSetCookies = true;
  }
  if(session.get("token") && !user){
    shouldSetCookies = true;
  }
  if(!session.get("XSRF-TOKEN")){
    shouldSetCookies = true;
  }
  if(userFetchError){
    shouldSetCookies = true;
  }
  console.log("SESSION EXISTS? ", session.get(getEnv().API_SESSION_NAME));
  console.log("TOKEN EXISTS? ", session.get("token"));
  console.log("USER EXISTS? ", user);
  console.log("USER ERROR? ", userFetchError);
  if(shouldSetCookies){
    console.log("Cookie remix session: ", session.get(getEnv().API_SESSION_NAME));
    console.log("Cookie user value: ", user);
    headers = await AuthService.getCSRFCookie(request);
  }

  // Algolia InstantSearch SSR
  const serverUrl = request.url;
  const serverState = await getServerState(
    <InstantSearchProvider serverUrl={serverUrl} />,
    { renderToString }
  );

  // Fetch the shopping cart items
  const myFetcher = new Fetcher(session.get("token"), request);
  const shoppingCartItems = await myFetcher
    .fetch(`${getEnv().API_URL}/cart`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
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
      maxFacetHits: 15,
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
    headers ? { headers } : {}
  );
};

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

  console.log(user)

  //
  return (
    <html lang="es" className="h-full bg-gray-100">
      <head>
        <title>Marketplace</title>
        <meta
          name="description"
          content="México Limited es más que un marketplace, es un movimiento que impulsa el talento, la creatividad y la innovación mexicanos. 
          Puedes explorar y adquirir productos únicos directamente de emprendedores y PyMes de todo México. 
          Desde artesanías tradicionales hasta productos innovadores, cada compra en México Limited es un voto a favor del crecimiento de la economía local y el apoyo al talento mexicano."
        />
        <meta name="author" content="México Limited" />
        <meta
          name="keywords"
          content="emprendimiento México creadores artesanías"
        />
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
                <AuthProvider currentUser={user}>
                  <Outlet />
                </AuthProvider>
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
        Se produjo un error en la aplicación. Por favor intenta de nuevo.
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

// Instant Search Provider
// Returns a slug from the category name.
// Spaces are replaced by "+" to make
// the URL easier to read and other
// characters are encoded.
function getCategorySlug(name) {
  return name.split(" ").map(encodeURIComponent).join("+");
}

// Returns a name from the category slug.
// The "+" are replaced by spaces and other
// characters are decoded.
function getCategoryName(slug) {
  return slug.split("+").map(decodeURIComponent).join(" ");
}
type PageProps = {
  serverState?: InstantSearchServerState;
  serverUrl: string;
  children?: React.ReactNode;
};
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
            createURL({ qsModule, location, routeState }) {
              // current search params
              const indexState = routeState[algoliaProductsIndex] || {};
              const { origin, pathname, hash, search } = location;

              // grab current query string and convert to object
              const queryParameters = qsModule.parse(search.slice(1)) || {};
              let queryString = qsModule.stringify(queryParameters);

              // if there is an active search
              if (Object.keys(indexState).length) {
                // merge the search params with the current query params
                Object.assign(queryParameters, routeState);
              } else {
                // remove the search params
                delete queryParameters[algoliaProductsIndex];
              }
              if (routeState.query) {
                queryParameters.query = encodeURIComponent(routeState.query);
              }
              if (routeState.page !== 1) {
                queryParameters.page = routeState.page;
              }
              if (routeState.brands) {
                queryParameters.brand =
                  routeState.brands.map(encodeURIComponent);
              }
              if (routeState.categories) {
                queryParameters.categories =
                  routeState.categories.map(encodeURIComponent);
              }

              // convert the query params back to a string
              queryString = qsModule.stringify(queryParameters);
              if (queryString.length) {
                queryString = `?${queryString}`;
              }

              // Your existing code for parsing and modifying query parameters
              queryString = qsModule.stringify(queryParameters);
              if (queryString.length) {
                queryString = `?${queryString}`;
              }

              // Redirect to the search page if there are search parameters
              let targetPathname = pathname;
              if (Object.keys(indexState).length) {
                targetPathname = "/search";
              }

              // return the new URL
              return `${origin}${targetPathname}${queryString}${hash}`;
            },
          }),
          // stateMapping: {
          // stateToRoute(uiState) {
          //   const indexUiState = uiState[algoliaProductsIndex];
          //   return {
          //     query: indexUiState.query,
          //     categories: indexUiState.hierarchicalMenu?.["categories.lvl0"],
          //     brand: indexUiState.hierarchicalMenu?.["brand.brand"],
          //     page: indexUiState.page,
          //     price: indexUiState.numericMenu?.["price"],
          //   };
          // },
          // routeToState(routeState) {
          //   return {
          //     [algoliaProductsIndex]: {
          //       query: routeState.query,
          //       hierarchicalMenu: {
          //         ["categories.lvl0"]:
          //           routeState.categories?.map(decodeURIComponent),
          //         ["brand.brand"]: routeState.brand,
          //       },
          //       page: routeState.page,
          //       numericMenu: {
          //         ["price"]: routeState.price,
          //       },
          //     },
          //   };
          // },
          // },
        }}
      >
        {children}
      </InstantSearch>
    </InstantSearchSSRProvider>
  );
}
