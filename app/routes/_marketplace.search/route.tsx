import { Fragment, useState, useEffect } from "react";
import type {
  LinksFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData, useParams, useSearchParams } from "@remix-run/react";
import {
  Dialog,
  Disclosure,
  Popover,
  Tab,
  Transition,
} from "@headlessui/react";
import {
  Hits,
  useHits,
  UseHitsProps,
  useNumericMenu,
  UseNumericMenuProps,
  HierarchicalMenu as AlgoliaHierarchicalMenu,
  useCurrentRefinements,
  useConfigure,
  SortBy,
  HitsPerPage,
} from "react-instantsearch";

import { ChevronDownIcon, PlusIcon } from "@heroicons/react/20/solid";
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import type { Product } from "../../types/Product";

import Pagination from "../../components/Pagination";
import HierarchicalMenu from "../../components/HierarchicalMenu";
import ProductThumbnail from "~/components/ProductThumbnail";

const breadcrumbs = [{ id: 1, name: "Men", href: "#" }];

function CustomHits(props: UseHitsProps) {
  const { hits, sendEvent } = useHits(props);

  return (
    <>
      {hits.map((product) => (
        <ProductThumbnail key={product.objectID} {...{ product }} />
      ))}
    </>
  );
}

const PAGE_MODES = {
  SEARCH: "search",
  CATEGORY: "category",
};

// export const loader = async ({
//   request,
// }: LoaderFunctionArgs) => {
//   const url = new URL(request.url);
//   const pageMode = url.searchParams.get("pageMode") || PAGE_MODES.SEARCH;
//   const query = url.searchParams.get("query") || PAGE_MODES.SEARCH;
//   const filters = url.searchParams.get("filters") || PAGE_MODES.SEARCH;

//   console.log(pageMode)
//   return json({ pageMode, query, filters });
// };

export default function SearchResultsPage({ ...props }) {
  // const { pageMode: requestPageMode } = useLoaderData<typeof loader>();
  const [pageMode, setPageMode] = useState(PAGE_MODES.SEARCH);

  //
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { items, canRefine, refine } = useCurrentRefinements(props);

  // const pageMode: string = PAGE_MODES.SEARCH;

  //
  return (
    <>
    {pageMode === PAGE_MODES.CATEGORY ? (
      <div className="border-b border-gray-200">
        <nav
          aria-label="Breadcrumb"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <ol role="list" className="flex items-center space-x-4 py-4">
            {breadcrumbs.map((breadcrumb) => (
              <li key={breadcrumb.id}>
                <div className="flex items-center">
                  <a
                    href={breadcrumb.href}
                    className="mr-4 text-sm font-medium text-gray-900"
                  >
                    {breadcrumb.name}
                  </a>
                  <svg
                    viewBox="0 0 6 20"
                    aria-hidden="true"
                    className="h-5 w-auto text-gray-300"
                  >
                    <path
                      d="M4.878 4.34H3.551L.27 16.532h1.327l3.281-12.19z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </li>
            ))}
            <li className="text-sm">
              <a
                href="#"
                aria-current="page"
                className="font-medium text-gray-500 hover:text-gray-600"
              >
                New Arrivals
              </a>
            </li>
          </ol>
        </nav>
      </div>
    ) : null}
      <main className="mx-auto px-4 pb-24 pt-10 sm:px-6 sm:pb-32 lg:max-w-7xl lg:px-8">
        {pageMode === PAGE_MODES.SEARCH ? (
          <div className="border-b border-gray-200 pb-6">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Resultados
            </h1>
            {/* <p className="mt-4 text-base text-gray-500">
              Checkout out the latest release of Basic Tees, new and improved with
              four openings!
            </p> */}
            <div className="flex flex-col-reverse lg:flex-row justify-between">
              <div className="flex">
                <CustomCurrentRefinements {...{}} />
              </div>

              <div className="grid grid-cols-1 gap-y-4 md:gap-y-0 md:gap-x-4 md:flex align-middle mt-6 md:mt-0" >
                <div className="align-middle" >
                  <span className="text-sm text-neutral-600" >Ordenar por{" "}</span>
                  <SortBy
                    className="inline-flex items-center text-sm text-neutral-600 max-w-32"
                    items={[
                      { value: "products", label: "Relevancia" },
                      { value: "products_price_asc", label: "Precio ascendente" },
                      { value: "products_price_desc", label: "Precio descendente" },
                    ]}
                  />
                </div>

                <div className="align-middle" >
                  <span className="text-sm text-neutral-600">Resultados por página{" "}</span>
                  <HitsPerPage 
                    className="inline-flex items-center text-sm text-neutral-600"
                    items={[
                      { value: 16, label: "16" },
                      { value: 24, label: "24", default: true },
                      { value: 36, label: "36" },
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="pb-24 pt-12 lg:grid lg:grid-cols-4 lg:gap-x-8">
          {/* ASIDE / FILTERS */}
          <aside>
            <h2 className="sr-only">Filtros</h2>

            {/* OPEN/CLOSE TOGGLE */}
            <button
              type="button"
              className="inline-flex items-center lg:hidden"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <span className="text-sm font-medium text-gray-700">Filtros</span>
              <PlusIcon
                className="ml-1 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
            </button>

            {/* FILTERS LIST */}
            <div className="hidden lg:block">
              <form className="space-y-10 divide-y divide-gray-200">
                {/* FILTERY BY CATEGORIES */}
                <div>
                  <fieldset>
                    <legend className="block text-sm font-medium text-gray-900">
                      Categorías
                    </legend>
                    <HierarchicalMenu
                      attributes={["categories.lvl0", "categories.lvl1"]}
                      limit={100}
                      sortBy={["name:asc"]}
                    />
                  </fieldset>
                </div>

                {/* FILTERY BY BRAND */}
                <div className="pt-10">
                  <fieldset>
                    <legend className="block text-sm font-medium text-gray-900">
                      Marcas
                    </legend>
                    <HierarchicalMenu
                      attributes={["brand.brand"]}
                      limit={10}
                      showMoreLimit={100}
                      sortBy={["count:desc"]}
                      showMore
                    />
                  </fieldset>
                </div>

                {/* FILTERY BY PRICE */}
                <div className="pt-10">
                  <fieldset>
                    <legend className="block text-sm font-medium text-gray-900">
                      Precio
                    </legend>
                    <NumericMenu
                      attribute="price"
                      items={[
                        { label: "Cualquier precio" },
                        { label: "Menos de $500", end: 500 },
                        { label: "$500 a $1,000", start: 500, end: 1000 },
                        { label: "$1,000 a $2,000", start: 1000, end: 2000 },
                        { label: "Más de $2,000", start: 2000 },
                      ]}
                    />
                  </fieldset>
                </div>
              </form>
            </div>
          </aside>

          {/* MAIN CONTENT WRAPPER */}
          <section
            aria-labelledby="product-heading"
            className="mt-6 lg:mt-0 lg:col-span-3"
          >
            <h2 id="product-heading" className="sr-only">
              Productos
            </h2>

            <div className="grid grid-cols-2 gap-y-4 gap-x-4 md:grid-cols-3 xl:grid-cols-4">
              <CustomHits {...{}} />
            </div>

            <Pagination {...{}} />
          </section>
        </div>
      </main>
    </>
  );
}

//
function NumericMenu(props: UseNumericMenuProps) {
  const { items, refine } = useNumericMenu(props);

  return (
    <ul>
      {items.map((item) => (
        <li 
          key={item.value}
          className="mb-2"
        >
          <input
            type="radio"
            name={'fitler-price'}
            id={`filter-${item.label}`}
            defaultChecked={item.isRefined}
            onChange={(event) => {
              // event.preventDefault();
              refine(item.value);
            }}
            className="h-4 w-4 border-gray-300 text-secondary-600 focus:ring-secondary-500"
          />
          <label
            htmlFor={`filter-${item.label}`}
            className="ml-3 text-sm text-gray-600"
          >
            <span>{item.label}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

function CustomCurrentRefinements(props) {
  const { items, refine } = useCurrentRefinements(props);

  return (
    <ul className="mt-2">
      {items.map((item) => (
        <li
          key={[item.indexName, item.label].join("/")}
          className="inline-flex items-center gap-x-0.5 rounded-md bg-secondary-100 mr-2 px-2 py-1 text-xs font-medium text-secondary-700"
        >
          {/* <span>{item.label}</span> */}

          {item.refinements.map((refinement) => (
            <span 
              key={refinement.label}
              className="inline-flex items-center"
            >
              <span>{refinement.label}</span>

              <button
                type="button"
                className="group relative ml-1 h-3.5 w-3.5 rounded-sm hover:bg-secondary-600/20"
                onClick={(event) => {
                  if (isModifierClick(event)) {
                    return;
                  }

                  refine(refinement);
                }}
              >
                <span className="sr-only">Remover</span>
                <svg
                  viewBox="0 0 14 14"
                  className="h-3.5 w-3.5 stroke-secondary-700/50 group-hover:stroke-secondary-700/75"
                >
                  <path d="M4 4l6 6m0-6l-6 6" />
                </svg>
                <span className="absolute -inset-1" />
              </button>
            </span>
          ))}
        </li>
      ))}
    </ul>
  );
}

function isModifierClick(event) {
  const isMiddleClick = event.button === 1;

  return Boolean(
    isMiddleClick ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
  );
}
