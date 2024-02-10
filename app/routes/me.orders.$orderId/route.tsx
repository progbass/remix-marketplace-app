import {
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
} from "@heroicons/react/20/solid";
import { Fragment } from "react";
import { Link } from "@remix-run/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";

const order = {
  id: Math.round(Math.random() * 1000000),
  name: "ML-000450",
  title: "Israel",
  email: "12 Julio 2023",
  role: "15 Julio 2024",
  quantity: "2",
  total: "MXN$ 750.00",
  status: "En tránsito",
  href: "#",
  invoiceHref: "#",
  createdDate: "Jul 6, 2021",
  createdDatetime: "2021-07-06",
  deliveredDate: "July 12, 2021",
  deliveredDatetime: "2021-07-12",
  products: [
    {
      id: 1,
      name: "Micro Backpack",
      description:
        "Are you a minimalist looking for a compact carry option? The Micro Backpack is the perfect size for your essential everyday carry items. Wear it like a backpack or carry it like a satchel for all-day use.",
      href: "#",
      price: "$70.00",
      imageSrc:
        "https://tailwindui.com/img/ecommerce-images/order-history-page-03-product-01.jpg",
      imageAlt:
        "Moss green canvas compact backpack with double top zipper, zipper front pouch, and matching carry handle and backpack straps.",
    },
    {
      id: 1,
      name: "Micro Backpack",
      description:
        "Are you a minimalist looking for a compact carry option? The Micro Backpack is the perfect size for your essential everyday carry items. Wear it like a backpack or carry it like a satchel for all-day use.",
      href: "#",
      price: "$70.00",
      imageSrc:
        "https://tailwindui.com/img/ecommerce-images/order-history-page-03-product-01.jpg",
      imageAlt:
        "Moss green canvas compact backpack with double top zipper, zipper front pouch, and matching carry handle and backpack straps.",
    },
    {
      id: 1,
      name: "Micro Backpack",
      description:
        "Are you a minimalist looking for a compact carry option? The Micro Backpack is the perfect size for your essential everyday carry items. Wear it like a backpack or carry it like a satchel for all-day use.",
      href: "#",
      price: "$70.00",
      imageSrc:
        "https://tailwindui.com/img/ecommerce-images/order-history-page-03-product-01.jpg",
      imageAlt:
        "Moss green canvas compact backpack with double top zipper, zipper front pouch, and matching carry handle and backpack straps.",
    },
    {
      id: 1,
      name: "Micro Backpack",
      description:
        "Are you a minimalist looking for a compact carry option? The Micro Backpack is the perfect size for your essential everyday carry items. Wear it like a backpack or carry it like a satchel for all-day use.",
      href: "#",
      price: "$70.00",
      imageSrc:
        "https://tailwindui.com/img/ecommerce-images/order-history-page-03-product-01.jpg",
      imageAlt:
        "Moss green canvas compact backpack with double top zipper, zipper front pouch, and matching carry handle and backpack straps.",
    },
    {
      id: 1,
      name: "Micro Backpack",
      description:
        "Are you a minimalist looking for a compact carry option? The Micro Backpack is the perfect size for your essential everyday carry items. Wear it like a backpack or carry it like a satchel for all-day use.",
      href: "#",
      price: "$70.00",
      imageSrc:
        "https://tailwindui.com/img/ecommerce-images/order-history-page-03-product-01.jpg",
      imageAlt:
        "Moss green canvas compact backpack with double top zipper, zipper front pouch, and matching carry handle and backpack straps.",
    },
  ],
};
const steps = [
  { id: "01", name: "Confirma la orden", href: "#", status: "complete" },
  { id: "02", name: "Elabora el pedido", href: "#", status: "complete" },
  { id: "03", name: "Programa la recolección", href: "#", status: "current" },
  { id: "04", name: "Entrega el pedido", href: "#", status: "upcoming" },
];
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Orders() {
  return (
    <>
      {/* HEADER */}
      <div className="bg-white -mx-8 -mt-10 p-5 sticky z-20">
        <div>
          <nav className="sm:hidden" aria-label="Back">
            <a
              href="#"
              className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ChevronLeftIcon
                className="-ml-1 mr-1 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              Regresar
            </a>
          </nav>
          <nav className="hidden sm:flex" aria-label="Breadcrumb">
            <ol role="list" className="flex items-center space-x-4">
              <li>
                <div className="flex">
                  <Link
                    to="/me/orders"
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Órdenes
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRightIcon
                    className="h-5 w-5 flex-shrink-0 text-gray-400"
                    aria-hidden="true"
                  />
                  <Link
                    to="#"
                    className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    ML-000425
                  </Link>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <div className="mt-2 md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Orden ML-000425
            </h2>
          </div>
          <div className="mt-4 flex flex-shrink-0 md:ml-4 md:mt-0">
            <div className="flex items-center">
              <CheckCircleIcon
                className="h-5 w-5 text-green-500"
                aria-hidden="true"
              />
              <p className="ml-2 text-sm font-medium text-gray-500">
                Delivered on{" "}
                <time dateTime={order.deliveredDatetime}>
                  {order.deliveredDate}
                </time>
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* END: HEADER */}

      <div className="">
        <nav aria-label="Progress">
          <ol
            role="list"
            className="bg-white divide-y divide-gray-300 rounded-t-md border border-gray-200 md:flex md:divide-y-0"
          >
            {steps.map((step, stepIdx) => (
              <li key={step.name} className="relative md:flex md:flex-1">
                {step.status === "complete" ? (
                  <a
                    href={step.href}
                    className="group flex w-full items-center"
                  >
                    <span className="flex items-center px-6 py-4 text-sm font-medium">
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 group-hover:bg-indigo-800">
                        <CheckIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </span>
                      <span className="ml-4 text-sm font-medium text-gray-900">
                        {step.name}
                      </span>
                    </span>
                  </a>
                ) : step.status === "current" ? (
                  <a
                    href={step.href}
                    className="flex items-center px-6 py-4 text-sm font-medium"
                    aria-current="step"
                  >
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-indigo-600">
                      <span className="text-indigo-600">{step.id}</span>
                    </span>
                    <span className="ml-4 text-sm font-medium text-indigo-600">
                      {step.name}
                    </span>
                  </a>
                ) : (
                  <a href={step.href} className="group flex items-center">
                    <span className="flex items-center px-6 py-4 text-sm font-medium">
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 group-hover:border-gray-400">
                        <span className="text-gray-500 group-hover:text-gray-900">
                          {step.id}
                        </span>
                      </span>
                      <span className="ml-4 text-sm font-medium text-gray-500 group-hover:text-gray-900">
                        {step.name}
                      </span>
                    </span>
                  </a>
                )}

                {stepIdx !== steps.length - 1 ? (
                  <>
                    {/* Arrow separator for lg screens and up */}
                    <div
                      className="absolute right-0 top-0 hidden h-full w-5 md:block"
                      aria-hidden="true"
                    >
                      <svg
                        className="h-full w-full text-gray-300"
                        viewBox="0 0 22 80"
                        fill="none"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M0 -2L20 40L0 82"
                          vectorEffect="non-scaling-stroke"
                          stroke="currentcolor"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </>
                ) : null}
              </li>
            ))}
          </ol>
        </nav>

        <div className="bg-white rounded-b-lg border-b border-x border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">
              Programa la recolección
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                Cuando termines de preparar los productos de tu order, programa la recolección de tu pedido<br/>
                <span className="text-gray-900">Programar recolección antes de:</span><span>12 Junio 2024</span>
              </p>
            </div>
            <div className="mt-5">
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >Programar Recolección</button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8 sm:px-4 lg:px-0">
        <div
          key={order.number}
          className="border-b border-t border-gray-200 bg-white shadow-sm sm:rounded-lg sm:border"
        >
          <h3 className="sr-only">
            Fecha de venta{" "}
            <time dateTime={order.createdDatetime}>{order.createdDate}</time>
          </h3>

          <div className="flex items-center border-b border-gray-200 p-4 sm:grid sm:grid-cols-4 sm:gap-x-6 sm:p-6">
            <dl className="grid flex-1 grid-cols-2 gap-x-6 text-sm sm:col-span-3 sm:grid-cols-3 lg:col-span-2">
              <div>
                <dt className="font-medium text-gray-900">Orden No.</dt>
                <dd className="mt-1 text-gray-500">{order.number}</dd>
              </div>
              <div className="hidden sm:block">
                <dt className="font-medium text-gray-900">Fecha de venta</dt>
                <dd className="mt-1 text-gray-500">
                  <time dateTime={order.createdDatetime}>
                    {order.createdDate}
                  </time>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-900">Total</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {order.total}
                </dd>
              </div>
            </dl>

            <Menu as="div" className="relative flex justify-end lg:hidden">
              <div className="flex items-center">
                <Menu.Button className="-m-2 flex items-center p-2 text-gray-400 hover:text-gray-500">
                  <span className="sr-only">
                    Opciones para la orden {order.number}
                  </span>
                  <EllipsisVerticalIcon
                    className="h-6 w-6"
                    aria-hidden="true"
                  />
                </Menu.Button>
              </div>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-bottom-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href={order.href}
                          className={classNames(
                            active
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700",
                            "block px-4 py-2 text-sm"
                          )}
                        >
                          Ver
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href={order.invoiceHref}
                          className={classNames(
                            active
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700",
                            "block px-4 py-2 text-sm"
                          )}
                        >
                          Recibo
                        </a>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>

            <div className="hidden lg:col-span-2 lg:flex lg:items-center lg:justify-end lg:space-x-4">
              <a
                href={order.href}
                className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span>Descargar Guías</span>
                <span className="sr-only">{order.number}</span>
              </a>
              <a
                href={order.invoiceHref}
                className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span>Aceptar Orden</span>
                <span className="sr-only">for order {order.number}</span>
              </a>
            </div>
          </div>

          {/* Products */}
          <div className="px-6">
            <table className="mt-4 sm:mt-6 w-full text-gray-500 ">
              <caption className="sr-only">Productos</caption>
              <thead className="sr-only text-left text-sm text-gray-500 sm:not-sr-only">
                <tr>
                  <th
                    scope="col"
                    className="py-3 pr-8 font-normal sm:w-2/5 lg:w-1/3"
                  >
                    Producto
                  </th>
                  <th
                    scope="col"
                    className="hidden w-1/5 py-3 pr-8 font-normal sm:table-cell"
                  >
                    Precio
                  </th>
                  <th
                    scope="col"
                    className="hidden py-3 pr-8 font-normal sm:table-cell"
                  >
                    Estado
                  </th>
                  <th scope="col" className="w-0 py-3 text-right font-normal">
                    Info
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 border-b border-gray-200 text-sm sm:border-t">
                {order.products.map((product) => (
                  <tr key={product.id}>
                    <td className="py-6 pr-8">
                      <div className="flex items-center">
                        <img
                          src={product.imageSrc}
                          alt={product.imageAlt}
                          className="mr-6 h-16 w-16 rounded object-cover object-center"
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="mt-1 sm:hidden">{product.price}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden py-6 pr-8 sm:table-cell">
                      {product.price}
                    </td>
                    <td className="hidden py-6 pr-8 sm:table-cell">
                      {product.status}
                    </td>
                    <td className="whitespace-nowrap py-6 text-right font-medium">
                      <a href={product.href} className="text-indigo-600">
                        Ver
                        <span className="hidden lg:inline"> Producto</span>
                        <span className="sr-only">, {product.name}</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
