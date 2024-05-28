import { Fragment, useEffect, useRef } from "react";
import { Link, Form } from "@remix-run/react";
import { Dialog, Tab, Transition } from "@headlessui/react";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { MapPinIcon } from "@heroicons/react/20/solid";

import classNames from "~/utils/classNames";
import { useMarketplaceCategories } from "~/providers/MarketplaceCategoriesContext";
import { useInstantSearch, useHierarchicalMenu } from "react-instantsearch";

const navigation = {
  pages: [
    { name: "Lo mejor del tanque", href: "#" },
    { name: "Tiendas", href: "#" },
  ],
};
const collections = [
  {
    name: "Las ofertas más hot",
    description: "Productos con descuentos increíbles",
    imageSrc:
      "https://buckets.mexicolimited.com/production-bucket/managed-content/desktop-content/desktop-collections-hot-sale-2024.png",
    imageAlt: "Descubre descuentos increíbles",
    href: "/collections/ofertas-hot-2024",
  },
  {
    name: "Día de las madres",
    description: "Regálale algo extraordinario",
    imageSrc:
      "https://buckets.mexicolimited.com/production-bucket/managed-content/desktop-content/desktop-collections-dia-madres-2024.png",
    imageAlt: "Regálale algo extraordinario",
    href: "/collections/dia-madres-2024",
  },
  {
    name: "Productos de primavera",
    description: "Artículos para disfrutar la temporada",
    imageSrc:
      "https://buckets.mexicolimited.com/production-bucket/managed-content/desktop-content/desktop-collections-spring-2025.png",
    imageAlt: "Artículos para disfrutar la temporada",
    href: "/collections/primavera-2024",
  },
];

//
type MobileMenuProps = {
  isOpen: boolean;
  onClose: (isOpen: boolean) => void;
  currentUser: null | object;
};
export default function MobileMenu({
  isOpen,
  onClose,
  currentUser = null,
}: MobileMenuProps) {
  //
  const marketplaceCategories: Array<any> = useMarketplaceCategories() || [];

  // Navigate to category
  const { refine, createURL } = useHierarchicalMenu({
    attributes: ["categories.lvl0"],
    limit: 30,
    sortBy: ["name:asc"],
  });
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

  const navigateToCategory = (categoryName: string) => {
    refine(categoryName);
  //   // Update Algolia index state
  //   setIndexUiState((prevIndexUiState) => ({
  //     ...prevIndexUiState,
  //     hierarchicalMenu: {
  //       ...prevIndexUiState.hierarchicalMenu,
  //       ["categories.lvl0"]: [categoryName],
  //     },
  //   }));

    // Close the menu panel
    closeMenu();
  };

  // Close menu
  function closeMenu() {
    onClose();
  }

  // Return component
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-40 lg:hidden" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 z-40 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-white pb-12 shadow-xl">
              {/* CLOSE MOBILE NAVIGATION */}
              <div className="flex px-4 pb-2 pt-5">
                <button
                  type="button"
                  className="-m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
                  onClick={() => onClose(false)}
                >
                  <span className="sr-only">Cerrar menu</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              {/* FACET NAVIGATION */}
              <Tab.Group as="div" className="mt-2">
                <div className="border-b border-gray-200">
                  <Tab.List className="-mb-px flex space-x-8 px-4">
                    <Tab
                      className={({ selected }) =>
                        classNames(
                          selected
                            ? "border-indigo-600 text-indigo-600"
                            : "border-transparent text-gray-900",
                          "flex-1 whitespace-nowrap border-b-2 px-1 py-4 text-base font-medium"
                        )
                      }
                    >
                      Categorías
                    </Tab>

                    <Tab
                      className={({ selected }) =>
                        classNames(
                          selected
                            ? "border-indigo-600 text-indigo-600"
                            : "border-transparent text-gray-900",
                          "flex-1 whitespace-nowrap border-b-2 px-1 py-4 text-base font-medium"
                        )
                      }
                    >
                      Colecciones
                    </Tab>
                  </Tab.List>
                </div>

                <Tab.Panels as={Fragment}>
                  <Tab.Panel className="space-y-12 px-4 pb-6 pt-10">
                    <div className="grid grid-cols-1 items-start gap-x-6 gap-y-10">
                      <div className="grid grid-cols-1 gap-x-6 gap-y-10">
                        <div>
                          <p
                            id="mobile-categories-heading"
                            className="font-medium text-gray-900"
                          >
                            Categorías
                          </p>
                          <ul
                            role="list"
                            aria-labelledby="mobile-categories-heading"
                            className="mt-6 space-y-6"
                          >
                            {marketplaceCategories.map((category) => (
                              <li key={category.name} className="flex">
                                <Link
                                  to={createURL(category.name)}
                                  onClick={(event) => {
                                    navigateToCategory(category.name);
                                  }}
                                  className="text-gray-500"
                                >
                                  {category.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Tab.Panel>

                  <Tab.Panel className="space-y-12 px-4 pb-6 pt-10">
                    <div className="grid grid-cols-1 items-start gap-x-6 gap-y-10">
                      <div className="grid grid-cols-1 gap-x-6 gap-y-10">
                        <div>
                          <p
                            id={`mobile-featured-heading-${0}`}
                            className="font-medium text-gray-900"
                          >
                            Colecciones
                          </p>
                          <ul
                            role="list"
                            aria-labelledby={`mobile-featured-heading-${0}`}
                            className="mt-6 space-y-6"
                          >
                            {collections.map((item) => (
                              <li key={item.name} className="flex">
                                <Link
                                  to={item.href}
                                  onClick={closeMenu}
                                  className="text-gray-500"
                                >
                                  {item.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>

              {/* PAGES NAVIGATION 
              <div className="space-y-6 border-t border-gray-200 px-4 py-6">
                {navigation.pages.map((page) => (
                  <div key={page.name} className="flow-root">
                    <Link
                      to={page.href}
                      className="-m-2 block p-2 font-medium text-gray-900"
                    >
                      {page.name}
                    </Link>
                  </div>
                ))}
              </div> */}

              {/* ACCOUNT NAVIGATION */}
              <div className="space-y-6 border-t border-gray-200 px-4 py-6">
                {/* ACCOUNT ACCESS */}
                <div className="flow-root">
                  {!currentUser ? (
                    <Link
                      to="/login"
                      onClick={closeMenu}
                      className="-m-2 block p-2 font-medium text-gray-900"
                    >
                      Ingresa a tu cuenta
                    </Link>
                  ) : (
                    <Link
                      to="/account"
                      onClick={closeMenu}
                      className="-m-2 block p-2 font-medium text-gray-900"
                    >
                      Mi cuenta
                    </Link>
                  )}
                </div>

                {/* SELLERS ACCESS */}
                <div className="flow-root">
                  {currentUser && currentUser?.brand ? (
                    <Link
                      to="/admin"
                      onClick={closeMenu}
                      className="-m-2 block p-2 font-medium text-gray-900"
                    >
                      Ir a mi tienda
                    </Link>
                  ) : (
                    <Link
                      to="/vende-en-mexico-limited"
                      onClick={closeMenu}
                      className="-m-2 block p-2 font-medium text-gray-900"
                    >
                      Vende con nosotros
                    </Link>
                  )}
                </div>

                {/* LOGOUT BUTTON */}
                {currentUser ? (
                  <div className="flow-root">
                    <Form method="post" action="/logout">
                      <button
                        type="submit"
                        onClick={closeMenu}
                        className="-m-2 block p-2 font-medium text-error-600"
                      >
                        Cerrar sesión
                      </button>
                    </Form>
                  </div>
                ) : null}
              </div>

              {/* USER ZIP LOCATION
              <div className="space-y-6 border-t border-gray-200 px-4 py-6">
                <form>
                  <div className="inline-block">
                    <label htmlFor="mobile-currency" className="sr-only">
                      Ingresa tu domicilio
                    </label>
                    <div className="group relative -ml-2 rounded-md border-transparent focus-within:ring-2 focus-within:ring-white">
                      <select
                        id="mobile-currency"
                        name="currency"
                        className="flex items-center rounded-md border-transparent bg-none py-0.5 pl-2 pr-5 text-sm font-medium text-gray-700 focus:border-transparent focus:outline-none focus:ring-0 group-hover:text-gray-800"
                      >
                        <option>Ingresa tu domicilio</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                        <MapPinIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              */}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
