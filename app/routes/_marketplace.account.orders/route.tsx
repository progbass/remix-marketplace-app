import { Fragment, useEffect, useState } from "react";
import {
  Form,
  Link,
  useActionData,
  useNavigation,
  useNavigate,
  useLoaderData,
} from "@remix-run/react";
import { ActionFunctionArgs, json } from "@remix-run/node";
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/20/solid";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import {
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { Switch, Menu, Transition } from "@headlessui/react";
import add from "date-fns/add"

import AuthService from "~/services/Auth.service";
import getEnv from "get-env";
import classNames from "~/utils/classNames";
import Fetcher from "~/utils/fetcher";
import { redirect } from "react-router-dom";
import { Product } from "~/types/Product";
import { formatPrice } from "~/utils/formatPrice";
import { formatDate } from "~/utils/dateUtils";
import { ORDER_STATUS, statusColorPalette, renderOrderStatus } from "~/utils/orderStatusUtils";


//
const addToDate = add;

// Loader function
export async function loader({ request }: ActionFunctionArgs) {
  // Attempt to get user from session
  const userDetails = (await AuthService.isAuthenticated(request)) || null;

  // Redirect to user profile if user is already logged in
  if (!userDetails) {
    return redirect("/login");
  }

  // Create a new fetcher
  const fetcher = new Fetcher(userDetails?.token, request);

  // Get user orders
  const userOrders = await fetcher.fetch(`${getEnv().API_URL}/user/orders`, {
    method: "GET",
  });

  // Return data
  return { userDetails, orders: userOrders || [] };
}

//
export default function UserSignupPage() {
  const { userDetails, orders } = useLoaderData<typeof loader>();
  console.log(userDetails, orders);
  // const orders = [
  //   {
  //     number: "WU88191111",
  //     href: "#",
  //     invoiceHref: "#",
  //     createdDate: "Jul 6, 2021",
  //     createdDatetime: "2021-07-06",
  //     deliveredDate: "July 12, 2021",
  //     deliveredDatetime: "2021-07-12",
  //     total: "$160.00",
  //     products: [
  //       {
  //         id: 1,
  //         name: "Micro Backpack",
  //         description:
  //           "Are you a minimalist looking for a compact carry option? The Micro Backpack is the perfect size for your essential everyday carry items. Wear it like a backpack or carry it like a satchel for all-day use.",
  //         href: "#",
  //         price: "$70.00",
  //         imageSrc:
  //           "https://tailwindui.com/img/ecommerce-images/order-history-page-03-product-01.jpg",
  //         imageAlt:
  //           "Moss green canvas compact backpack with double top zipper, zipper front pouch, and matching carry handle and backpack straps.",
  //       },
  //       // More products...
  //     ],
  //   },
  //   // More orders...
  // ];

  // Return main component
  return (
    <div className="mt-12 mx-auto space-y-8 sm:px-4 lg:px-0">
      {orders.map((order) => (
        <div
          key={order.id}
          className="border-b border-t border-gray-200 bg-white shadow-sm sm:rounded-lg sm:border"
        >
          <h3 className="sr-only">
            Fecha de compra{" "}
            <time dateTime={order.created_at}>{order.created_at}</time>
          </h3>

          <div className="flex items-center border-b border-gray-200 p-4 sm:grid sm:grid-cols-4 sm:gap-x-6 sm:p-6">
            <dl className="grid flex-1 grid-cols-2 gap-x-6 text-sm sm:col-span-3 sm:grid-cols-3 lg:col-span-2">
              <div>
                <dt className="font-medium text-gray-900">Número de orden</dt>
                <dd className="mt-1 text-gray-500">{order.order_number}</dd>
              </div>
              <div className="hidden sm:block">
                <dt className="font-medium text-gray-900">Fecha de compra</dt>
                <dd className="mt-1 text-gray-500">
                  <time dateTime={order.created_at}>
                    {formatDate(order.created_at)}
                  </time>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-900">Total</dt>
                <dd className="mt-1 font-medium text-gray-500">
                  {formatPrice(order.total_amount)}
                </dd>
              </div>
            </dl>

            <Menu as="div" className="relative flex justify-end lg:hidden">
              <div className="flex items-center">
                <Menu.Button className="-m-2 flex items-center p-2 text-gray-400 hover:text-gray-500">
                  <span className="sr-only">
                    Opciones para la orden ML-{order.order_number}
                  </span>
                  <EllipsisVerticalIcon
                    className="h-6 w-6"
                    aria-hidden="true"
                  />
                </Menu.Button>
              </div>

              {/* DROPDOWN MENU */}
              {/* <Transition
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
                          href={'order.href'}
                          className={classNames(
                            active
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700",
                            "block px-4 py-2 text-sm"
                          )}
                        >
                          View
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href={'order.invoiceHref'}
                          className={classNames(
                            active
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700",
                            "block px-4 py-2 text-sm"
                          )}
                        >
                          Invoice
                        </a>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition> */}
            </Menu>

            {/* DROPDOWN MENU MOBILE */}
            {/*<div className="hidden lg:col-span-2 lg:flex lg:items-center lg:justify-end lg:space-x-4">
              <a
                href={'order.href'}
                className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span>Ver order</span>
                <span className="sr-only">ML-{order.id}</span>
              </a>
              <a
                href={'order.invoiceHref'}
                className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span>Ver recibo</span>
                <span className="sr-only">de la orden ML-{order.id}</span>
              </a>
            </div>*/}
          </div>

          {/* Products */}
          <div className="mt-2 px-4">
            <h4 className=" text-sm font-semibold">
              {order.static_store?.brand}
            </h4>
          </div>
          <ul role="list" className="divide-y divide-gray-200">
            {order.static_products.map((product: Product) => (
              <li key={product.id} className="p-4 sm:p-6">
                <div className="flex items-start">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200 sm:h-40 sm:w-40">
                    <img
                      src={product?.image}
                      alt={product?.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="ml-6 flex-1 text-sm">
                    <div className="font-medium text-gray-900 sm:flex sm:justify-between">
                      {/* Product name */}
                      <h5>{product.name}</h5>

                      {/* Model Details */}
                      {product.modelo !== null && (
                        <div style={{ flexDirection: "row" }}>
                          <p className="mt-2 sm:mt-0 text-gray-500">
                            Talla/modelo:{" "}
                            <span>
                              {product.namemodel_size || ""}
                              {product.namemodel_size && product.namemodel_model
                                ? `${product.namemodel_size} / ${product.namemodel_model}`
                                : ""}
                              {product.namemodel || ""}
                            </span>
                          </p>
                        </div>
                      )}

                      {/* Price and quantity */}
                      <div>
                        <p className="mt-2 sm:mt-0">
                          {formatPrice(product.price)}{" "}
                          {product?.quantity > 1 && (
                            <span>x {product?.quantity}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="px-4 pb-4 mt-2 sm:flex sm:justify-between">
            <div className="flex items-center">
              {/* <CheckCircleIcon
                className="h-5 w-5 text-green-500"
                aria-hidden="true"
              /> */}
              {order?.status ? (
                    <p className={`text-sm font-medium ${statusColorPalette[order?.status]} `}>
                      {order?.status 
                        ? order?.status === ORDER_STATUS.PENDING && !order?.paid ? "Procesando pago" : renderOrderStatus(order?.status)
                        : renderOrderStatus(order?.status)
                      }
                    </p>
                  ) : null }
            </div>

            {order?.expected_shipping_date ? (
              <p className="text-sm text-gray-500">
                Entrega aprox.{" "}
                <span>
                  {order?.expected_shipping_date
                    ? `${formatDate(order?.expected_shipping_date, "MMM dd")} - ${formatDate(addToDate(new Date(order?.expected_shipping_date), { days: 2 }).toISOString())}`
                    : "No disponible"}
                </span>
              </p>
            ) : null}

            {/* <div className="mt-6 flex items-center space-x-4 divide-x divide-gray-200 border-t border-gray-200 pt-4 text-sm font-medium sm:ml-4 sm:mt-0 sm:border-none sm:pt-0">
              <div className="flex flex-1 justify-center">
                <a
                  href={'product.href'}
                  className="whitespace-nowrap text-indigo-600 hover:text-indigo-500"
                >
                  Ver producto
                </a>
              </div>
              <div className="flex flex-1 justify-center pl-4">
                <a
                  href="#"
                  className="whitespace-nowrap text-indigo-600 hover:text-indigo-500"
                >
                  Comprar de nuevo
                </a>
              </div>
            </div> */}
          </div>
        </div>
      ))}
    </div>
  );
}
