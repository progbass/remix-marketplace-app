import { Fragment, memo, useEffect, useRef } from "react";
import { Form, Link, NavLink } from "@remix-run/react";
import { useNavigate } from "@remix-run/react";
import { Popover, Transition, Menu } from "@headlessui/react";
import { getAlgoliaResults } from "@algolia/autocomplete-js";
import {
  algoliaSearchClient,
  algoliaProductsIndex,
} from "~/utils/algoliaClients";

import {
  Bars3Icon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { MapPinIcon } from "@heroicons/react/20/solid";
import {
  UserIcon as UserIconMini,
  BuildingStorefrontIcon as BuildingStorefrontIconMini,
  ArrowLeftEndOnRectangleIcon as ArrowLeftEndOnRectangleIconMini,
} from "@heroicons/react/16/solid";

import classNames from "~/utils/classNames";
import { useShoppingCart } from "~/providers/ShoppingCartContext";
import { Autocomplete } from "./CustomISAutocomplete";
import logoUrl from "~/statics/logo.svg";
import { useMarketplaceCategories } from "~/providers/MarketplaceCategoriesContext";
import {
  useInstantSearch,
  useHierarchicalMenu,
  UseHierarchicalMenuProps,
} from "react-instantsearch";

const collectionsList = [
  { name: "Everything", href: "#" },
  { name: "Core", href: "#" },
  { name: "New Arrivals", href: "#" },
  { name: "Sale", href: "#" },
];
const navigation = {
  pages: [
    // { name: "Lo mejor del tanque", href: "#" },
    // { name: "Tiendas", href: "#" },
  ],
};

// CATEGORIES MENU
function CategoriesDropdowMenu({ onCategorySelect }) {
  const { uiState, setUiState, setIndexUiState } = useInstantSearch();
  const uiStateRef = useRef(uiState);

  useEffect(() => {
    uiStateRef.current = uiState;
  }, [uiState]);

  useEffect(() => {
    return () => {
      setTimeout(() => {
        setUiState(uiStateRef.current);
      }, 5);
    };
  }, [setIndexUiState]);

  return (
    <CategoriesMenu
      attributes={["categories.lvl0"]}
      limit={30}
      sortBy={["name:asc"]}
      onCategorySelect={onCategorySelect}
    />
  );
}
const CategoriesMenu = function ({
  onCategorySelect = () => {},
  ...props
}: { onCategorySelect: Function } & UseHierarchicalMenuProps) {
  const { refine, createURL } = useHierarchicalMenu(props);
  const marketplaceCategories: Array<any> = useMarketplaceCategories() || [];

  // Divide the marketplaceCategories into 3 columns
  const categoriesMaxColumns = 3;
  const categoriesPerColum = Math.ceil(
    marketplaceCategories.length / categoriesMaxColumns
  );
  const categoriesByColumn: Array<any> = [];
  for (let i = 0; i < categoriesMaxColumns; i++) {
    categoriesByColumn.push([
      ...marketplaceCategories.slice(
        i * categoriesPerColum,
        i * categoriesPerColum + categoriesPerColum
      ),
    ]);
  }

  // Navigate to category
  const navigateToCategory = (value) => {
    // if (isModifierClick(event)) {
    //   return;
    // }
    refine(value);
    onCategorySelect();
  };

  return categoriesByColumn.map((categoryColum, columnIdx) => (
    <div key={columnIdx} className="col-span-2 gap-x-8 gap-y-10">
      {/* <p
        id={`desktop-featured-heading-${columnIdx}`}
        className="font-medium text-gray-900"
      >
        Featured
      </p> */}
      <ul
        role="list"
        aria-labelledby={`desktop-category-heading`}
        className="mt-6 space-y-6 sm:mt-4 sm:space-y-4"
      >
        {categoryColum.map((item) => (
          <li key={item.name} className="flex">
            <NavLink
              end
              to={`${createURL(item.name)}`}
              onClick={(event) => {
                navigateToCategory(item.name);
              }}
              className={
                ({ isActive, isPending }) =>
                  classNames("text-base hover:text-gray-800")
                //item.isRefined
              }
            >
              {item.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  ));
};

//
type DesktopMenuProps = {
  onSearchSubmit?: (query: string) => void;
  onMobileMenuOpen: (isOpen: boolean) => void;
  currentUser: null | object;
};
export default function DesktopMenu({
  onSearchSubmit = () => {},
  onMobileMenuOpen = () => {},
  currentUser = null,
}: DesktopMenuProps) {
  // Shopping Cart
  const ShoppingCartInstance = useShoppingCart();
  const cartTotalProductsCount = ShoppingCartInstance.getProductsCount();

  // Return component
  return (
    <header className="relative z-20">
      <nav aria-label="Top">
        {/* Top navigation */}
        <div className="bg-accent-900">
          <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* USER ZIP LOCATION 
            <form className="hidden lg:block lg:flex-1">
              <div className="flex">
                <label htmlFor="desktop-currency" className="sr-only">
                  Ingresa tu domicilio
                </label>
                <p>
              Conoce el envío a tu ubicación
              Agrega tu código postal para ver costos y tiempos de entrega precisos en tu búsqueda.
              </p> 
                <div className="group relative -ml-2 rounded-md border-transparent bg-accent-900 focus-within:ring-2 focus-within:ring-white">
                  <select
                    id="desktop-currency"
                    name="currency"
                    className="flex items-center rounded-md border-transparent bg-accent-900 bg-none py-0.5 pl-2 pr-5 text-sm font-medium text-white focus:border-transparent focus:outline-none focus:ring-0 group-hover:text-gray-100"
                  >
                    <option>Ingresa tu domicilio</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                    <MapPinIcon
                      className="h-5 w-5 text-gray-600"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
            </form>
            */}

            {/* NOTIFICATION AND ANNOUNCEMENTS */}
            <p className="self-center flex-1 text-center text-sm font-medium text-white lg:flex-none">
              Obtén 15% de descuento en tu primera compra
            </p>

            {/* USER ACCOUNT */}
            <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6">
              {/* LOGIN */}
              {!currentUser ? (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-white hover:text-gray-100"
                  >
                    Accesar
                  </Link>

                  <span className="h-6 w-px bg-gray-600" aria-hidden="true" />
                </>
              ) : currentUser?.brand ? (
                <>
                  <a
                    href="https://tienda.mexicolimited.com"
                    target="_blank"
                    className="text-sm font-medium text-white hover:text-gray-100"
                  >
                    Ir a mi tienda
                  </a>

                  <span className="h-6 w-px bg-gray-600" aria-hidden="true" />
                </>
              ) : null}

              {/* SELLERS ACCESS */}
              <Link
                to="/vende-en-mexico-limited"
                className="text-sm font-medium text-white hover:text-gray-100"
              >
                Vende con nosotros
              </Link>
            </div>
          </div>
        </div>

        {/* Secondary navigation */}
        <div className="bg-white">
          <div className="border-b border-gray-200">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                {/* Logo (lg+) */}
                <div className="hidden lg:flex lg:items-center">
                  <Link to="/">
                    <span className="sr-only">México Limited</span>
                    <img
                      className="h-7 w-auto"
                      src={logoUrl}
                      alt="México Limited Logo"
                    />
                  </Link>
                </div>

                <div className="hidden h-full lg:flex px-4">
                  {/* Mega menus */}
                  <Popover.Group className="ml-8">
                    <div className="flex h-full justify-center space-x-8">
                      {/* CATEGORIES MENU */}
                      <Popover className="flex">
                        {({ open, close }) => (
                          <>
                            <div className="relative flex">
                              <Popover.Button
                                className={classNames(
                                  open
                                    ? "border-primary-600 text-primary-600"
                                    : "border-transparent text-gray-700 hover:text-gray-800",
                                  "relative z-10 -mb-px flex items-center border-b-2 pt-px text-sm font-medium transition-colors duration-200 ease-out"
                                )}
                              >
                                Categorías
                              </Popover.Button>
                            </div>

                            <Transition
                              as={Fragment}
                              enter="transition ease-out duration-100"
                              enterFrom="opacity-0"
                              enterTo="opacity-100"
                              leave="transition ease-in duration-50"
                              leaveFrom="opacity-100"
                              leaveTo="opacity-0"
                            >
                              <Popover.Panel
                                className="absolute inset-x-0 top-full text-gray-500 sm:text-sm"
                                unmount={false}
                              >
                                {/* Presentational element used to render the bottom shadow, if we put the shadow on the actual panel it pokes out the top, so we use this shorter element to hide the top of the shadow */}
                                <div
                                  className="absolute inset-0 top-1/2 bg-white shadow"
                                  aria-hidden="true"
                                />

                                <div className="relative bg-white">
                                  <div className="mx-auto max-w-7xl px-8">
                                    <div className="grid grid-cols-8 items-start gap-x-8 gap-y-10 pb-12 pt-3">
                                      <CategoriesDropdowMenu
                                        onCategorySelect={close}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </Popover.Panel>
                            </Transition>
                          </>
                        )}
                      </Popover>

                      {/* COLLECTIONS MENU */}
                      <Popover className="flex">
                        {({ open }) => (
                          <>
                            <div className="relative flex">
                              <Popover.Button
                                className={classNames(
                                  open
                                    ? "border-primary-600 text-primary-600"
                                    : "border-transparent text-gray-700 hover:text-gray-800",
                                  "relative z-10 -mb-px flex items-center border-b-2 pt-px text-sm font-medium transition-colors duration-200 ease-out"
                                )}
                              >
                                Colecciones
                              </Popover.Button>

                              <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="transition ease-in duration-50"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                              >
                                <Popover.Panel className="absolute w-64 inset-x-0 top-full text-gray-500 sm:text-sm">
                                  {/* Presentational element used to render the bottom shadow, if we put the shadow on the actual panel it pokes out the top, so we use this shorter element to hide the top of the shadow */}
                                  <div
                                    className="absolute inset-0 top-1/2 bg-white shadow"
                                    aria-hidden="true"
                                  />

                                  <div className="relative bg-white mx-auto w-64 px-8">
                                    <div className="grid grid-cols-2 items-start gap-x-8 gap-y-10 pb-12 pt-3">
                                      <div className="col-span-full gap-x-8 gap-y-10">
                                        {/* <p
                                      id={`desktop-featured-heading-${columnIdx}`}
                                      className="font-medium text-gray-900"
                                    >
                                      Featured
                                    </p> */}
                                        <ul
                                          role="list"
                                          aria-labelledby={`desktop-collections-heading`}
                                          className="mt-6 space-y-6 sm:mt-4 sm:space-y-4"
                                        >
                                          {collectionsList.map((collection) => (
                                            <li
                                              key={collection.name}
                                              className="flex"
                                            >
                                              <Link
                                                to={collection.href}
                                                className="hover:text-gray-800"
                                              >
                                                {collection.name}
                                              </Link>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </Popover.Panel>
                              </Transition>
                            </div>
                          </>
                        )}
                      </Popover>

                      {navigation.pages.map((page) => (
                        <Link
                          key={page.name}
                          to={page.href}
                          className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800"
                        >
                          {page.name}
                        </Link>
                      ))}
                    </div>
                  </Popover.Group>
                </div>

                {/* Mobile menu and search (lg-) */}
                <div className="flex flex-1 items-center lg:hidden">
                  <button
                    type="button"
                    className="-ml-2 rounded-md bg-white p-2 text-gray-400"
                    onClick={() => onMobileMenuOpen(true)}
                  >
                    <span className="sr-only">Abrir menu</span>
                    <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                  </button>

                  {/* Search */}
                  <div className=" text-gray-400 hover:text-gray-500">
                    <span className="sr-only">Buscar</span>
                    <Autocomplete
                      placeholder="¿Qué estás buscando?"
                      detachedMediaQuery=""
                      onSubmit={onSearchSubmit}
                      classNames={{
                        // clearButton: "hidden",
                        detachedSearchButtonPlaceholder: "hidden",
                        detachedSearchButton: "mx-0 px-0 border-0",
                        detachedSearchButtonIcon: "text-gray-400",
                        // input: "hidden",
                      }}
                      getSources={({ query }) => [
                        {
                          sourceId: "products",
                          getItems() {
                            return getAlgoliaResults({
                              searchClient: algoliaSearchClient,
                              queries: [
                                {
                                  indexName: algoliaProductsIndex,
                                  query,
                                  params: {
                                    hitsPerPage: 6,
                                  },
                                },
                              ],
                            });
                          },
                          templates: {
                            noResults() {
                              return "No se encontraron resultados.";
                            },
                            item({ item, components }) {
                              return (
                                <ProductItem
                                  hit={item}
                                  components={components}
                                />
                              );
                            },
                          },
                        },
                      ]}
                    />
                  </div>
                </div>

                {/* Logo (lg-) */}
                <Link to="/" className="lg:hidden">
                  <span className="sr-only">México Limited</span>
                  <img
                    src={logoUrl}
                    alt="México Limited Logo"
                    className="h-8 w-full max-w-36 sm:max-w-40 md:max-w-48"
                  />
                </Link>

                <div className="flex flex-1 items-center justify-end">
                  {/* Search Desktop */}
                  <Autocomplete
                    placeholder="¿Qué estás buscando?"
                    detachedMediaQuery="none"
                    className="w-full px-6 hidden lg:block"
                    debug={true}
                    onSubmit={onSearchSubmit}
                    getSources={({ query }) => [
                      {
                        sourceId: "products",
                        getItems() {
                          return getAlgoliaResults({
                            searchClient: algoliaSearchClient,
                            queries: [
                              {
                                indexName: algoliaProductsIndex,
                                query,
                                params: {
                                  hitsPerPage: 6,
                                },
                              },
                            ],
                          });
                        },
                        templates: {
                          noResults() {
                            return "No se encontraron resultados.";
                          },
                          item({ item, components }) {
                            return (
                              <ProductItem hit={item} components={components} />
                            );
                          },
                        },
                      },
                    ]}
                  />

                  <div className="flex items-center">
                    {/* Profile dropdown */}
                    <div className="hidden lg:flex ">
                      <div className="flex">
                        <a
                          href="#"
                          className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                        >
                          <span className="sr-only">Cuenta</span>

                          {/* Profile dropdown */}
                          <Menu as="div" className="relative">
                            {/* Profile Avatar */}
                            <div>
                              <Menu.Button className="relative flex p-1 rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-secondary-400">
                                <span className="absolute -inset-1.5" />
                                <span className="sr-only">
                                  Abrir menu mi cuenta
                                </span>
                                <UserIcon
                                  className="h-6 w-6"
                                  aria-hidden="true"
                                />
                              </Menu.Button>
                            </div>

                            {/* Profile dropdown */}
                            <Transition
                              as={Fragment}
                              enter="transition ease-out duration-100"
                              enterFrom="transform opacity-0 scale-95"
                              enterTo="transform opacity-100 scale-100"
                              leave="transition ease-in duration-75"
                              leaveFrom="transform opacity-100 scale-100"
                              leaveTo="transform opacity-0 scale-95"
                            >
                              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-secondary-600 ring-opacity-5 focus:outline-none">
                                <Menu.Item>
                                  {({ active }) => {
                                    return !currentUser ? (
                                      <Link
                                        to="/login"
                                        className={classNames(
                                          active ? "bg-gray-100" : "",
                                          "block px-4 py-2 text-sm text-gray-700"
                                        )}
                                      >
                                        Iniciar sesión
                                      </Link>
                                    ) : (
                                      <Link
                                        to="/account"
                                        className={classNames(
                                          active ? "bg-gray-100" : "",
                                          "flex items-center px-4 py-2 text-sm text-gray-700"
                                        )}
                                      >
                                        Mi cuenta
                                      </Link>
                                    );
                                  }}
                                </Menu.Item>

                                {/* SELLERS ACCESS */}
                                <Menu.Item>
                                  {({ active }) => {
                                    return currentUser && currentUser?.brand ? (
                                      <a
                                        href="https://tienda.mexicolimited.com"
                                        target="_blank"
                                        className={classNames(
                                          active ? "bg-gray-100" : "",
                                          "flex items-center px-4 py-2 text-sm text-gray-700"
                                        )}
                                      >
                                        Ir a mi tienda
                                      </a>
                                    ) : (
                                      <Link
                                        to="/vende-en-mexico-limited"
                                        className={classNames(
                                          active ? "bg-gray-100" : "",
                                          "flex items-center px-4 py-2 text-sm text-gray-700"
                                        )}
                                      >
                                        Vende con nosotros
                                      </Link>
                                    );
                                  }}
                                </Menu.Item>

                                {/* LOGOUT BUTTON */}
                                {currentUser ? (
                                  <Menu.Item>
                                    {({ active }) => (
                                      <Form method="post" action="/logout">
                                        <button
                                          type="submit"
                                          className={classNames(
                                            active ? "bg-gray-100" : "",
                                            "w-full flex items-center text-left px-4 py-2 text-sm text-error-600"
                                          )}
                                        >
                                          <ArrowLeftEndOnRectangleIconMini className="h-4 w-4 mr-2" />{" "}
                                          Cerrar sesión
                                        </button>
                                      </Form>
                                    )}
                                  </Menu.Item>
                                ) : null}
                              </Menu.Items>
                            </Transition>
                          </Menu>
                        </a>
                      </div>

                      {/* Divider */}
                      <span
                        className="mx-4 h-6 w-px bg-gray-200 lg:mx-6"
                        aria-hidden="true"
                      />
                    </div>

                    {/* Shopping Cart */}
                    <div className="flow-root">
                      <Link
                        to="/cart"
                        className="relative group -m-2 flex items-center p-2 pr-3"
                      >
                        <ShoppingCartIcon
                          className="h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                          aria-hidden="true"
                        />
                        <span className="absolute top-0 right-0 rounded-lg bg-primary-600 py-[2px] px-[6px] font-semibold text-[.625em] text-white">
                          {cartTotalProductsCount}
                        </span>
                        <span className="sr-only">productos, ver carrito</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

// PRODUCT ITEM COMPONENT
export function ProductItem({ hit, components }) {
  return (
    <a href={`/product/${hit.id}`} className="aa-ItemLink">
      <div className="aa-ItemContent">
        <div className="aa-ItemIcon">
          <img src={hit.image} alt={hit.name} />
        </div>
        <div className="aa-ItemTitle">
          <components.Highlight hit={hit} attribute="name" />
        </div>
      </div>
    </a>
  );
}
