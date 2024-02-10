import { Link } from "@remix-run/react";
import { Fragment, useState } from "react";
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

const breadcrumbs = [{ id: 1, name: "Men", href: "#" }];
const filters = [
  {
    id: "color",
    name: "Color",
    options: [
      { value: "white", label: "White" },
      { value: "beige", label: "Beige" },
      { value: "blue", label: "Blue" },
      { value: "brown", label: "Brown" },
      { value: "green", label: "Green" },
      { value: "purple", label: "Purple" },
    ],
  },
  {
    id: "category",
    name: "Category",
    options: [
      { value: "new-arrivals", label: "All New Arrivals" },
      { value: "tees", label: "Tees" },
      { value: "crewnecks", label: "Crewnecks" },
      { value: "sweatshirts", label: "Sweatshirts" },
      { value: "pants-shorts", label: "Pants & Shorts" },
    ],
  },
  {
    id: "sizes",
    name: "Sizes",
    options: [
      { value: "xs", label: "XS" },
      { value: "s", label: "S" },
      { value: "m", label: "M" },
      { value: "l", label: "L" },
      { value: "xl", label: "XL" },
      { value: "2xl", label: "2XL" },
    ],
  },
];

function CustomHits(props: UseHitsProps) {
  const { hits, sendEvent } = useHits(props);

  return (
    <>
      {hits.map((product) => (
        <div
          key={product.objectID}
          onClick={() => sendEvent("click", product, "Hit Clicked")}
          onAuxClick={() => sendEvent("click", product, "Hit Clicked")}
          className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white"
        >
          <div className="aspect-h-4 aspect-w-3 bg-gray-200 sm:aspect-none group-hover:opacity-75 sm:h-64">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover object-center sm:h-full sm:w-full"
            />
          </div>
          <div className="flex flex-1 flex-col space-y-2 p-4">
            <h3 className="text-sm font-medium text-gray-900">
              <Link to={`/product/${product.id}`}>
                <span aria-hidden="true" className="absolute inset-0" />
                {product.name}
              </Link>
            </h3>
            <p className="text-sm text-gray-500">{product.brand.brand}</p>
            <div className="flex flex-1 flex-col justify-end">
              <p className="text-sm italic text-gray-500">{product.discount}</p>
              <p className="text-base font-medium text-gray-900">
                {product.price}
              </p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export default function Example() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  //
  return (
    <>
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

      <main className="mx-auto px-4 pb-24 pt-14 sm:px-6 sm:pb-32 sm:pt-16 lg:max-w-7xl lg:px-8">
        <div className="border-b border-gray-200 pb-10">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Resultados
          </h1>
          <p className="mt-4 text-base text-gray-500">
            Checkout out the latest release of Basic Tees, new and improved with
            four openings!
          </p>
        </div>

        <div className="pb-24 pt-12 lg:grid lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-4">
          <aside>
            <h2 className="sr-only">Filters</h2>

            <button
              type="button"
              className="inline-flex items-center lg:hidden"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <span className="text-sm font-medium text-gray-700">Filters</span>
              <PlusIcon
                className="ml-1 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
            </button>

            <div className="hidden lg:block">
              <form className="space-y-10 divide-y divide-gray-200">
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

                <div className="pt-10">
                  <fieldset>
                    <legend className="block text-sm font-medium text-gray-900">
                      Marcas
                    </legend>
                    <HierarchicalMenu
                      attributes={["brand.brand"]}
                      limit={10}
                      show-more-limit={20}
                      sortBy={["count:desc"]}
                      // searchable
                      showMore
                    />
                  </fieldset>
                </div>

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
                        { label: "$500 a $1000", start: 500, end: 1000 },
                        { label: "$1000 a $2000", start: 1000, end: 2000 },
                        { label: "Más de $2000", start: 2000 },
                      ]}
                    />
                  </fieldset>
                </div>
              </form>
            </div>
          </aside>

          <section
            aria-labelledby="product-heading"
            className="mt-6 lg:col-span-2 lg:mt-0 xl:col-span-3"
          >
            <h2 id="product-heading" className="sr-only">
              Products
            </h2>

            <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:gap-x-8 lg:grid-cols-3 xl:grid-cols-4">
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
        <li key={item.value}>
          <input
            type="radio"
            name={item.attribute}
            id={`filter-${item.value}`}
            defaultChecked={item.isRefined}
            onChange={(event) => {
              event.preventDefault();
              refine(item.value);
            }}
            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label 
            htmlFor={`filter-${item.value}`} 
            className="ml-3 text-sm text-gray-600"
            onChange={(event) => {
              event.preventDefault();
              refine(item.value);
            }}
          >
            <span>{item.label}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}
