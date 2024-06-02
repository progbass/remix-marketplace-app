import React, { useState, useEffect } from "react";
import { es } from "date-fns/locale";
import Stripe from "stripe";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Form, useLoaderData } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import classNames from "../../utils/classNames";
import Fetcher from "~/utils/fetcher";
import { formatDate } from "~/utils/dateUtils";

import getEnv from "get-env";
import { getSession } from "~/services/session.server";
import ShoppingCart from "~/utils/ShoppingCart";
import { formatPrice } from "~/utils/formatPrice";

function convertToFormData(
  object: Object,
  form?: FormData,
  namespace?: string
): FormData {
  const formData = form || new FormData();
  for (let property in object) {
    if (!object.hasOwnProperty(property) || !object[property]) {
      continue;
    }
    const formKey = namespace ? `${namespace}[${property}]` : property;
    if (object[property] instanceof Date) {
      formData.append(formKey, object[property].toISOString());
    } else if (typeof object[property] === "object") {
      // && !(object[property] instanceof File)) {
      convertToFormData(object[property], formData, formKey);
    } else {
      formData.append(formKey, object[property]);
    }
  }
  return formData;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  let session = await getSession(request.headers.get("cookie"));

  // Create custom fetcher
  const fetcher = new Fetcher(session.get("token"), request);

  // Retrieve payment intent status
  const url = new URL(request.url);
  const paymentIntentId: string | null = url.searchParams.get("payment_intent");
  const paymentIntentClientSecret: string | null = url.searchParams.get(
    "payment_intent_client_secret"
  );

  // Redirect if payment information is not found
  if (!paymentIntentId || !paymentIntentClientSecret) {
    return redirect("/");
  }

  // Fetch the shopping cart
  const shoppingCartResponse = await fetcher.fetch(`${getEnv().API_URL}/cart`, {
    method: "GET",
  });
  const shoppingCart = new ShoppingCart();
  shoppingCart.setCart(shoppingCartResponse || {});

  // Redirect if the cart is empty
  if (!shoppingCart.getCart().cart.length) {
    return redirect("/");
  }

  // Create order
  let shoppingOrder = shoppingCart.getOrder();
  shoppingOrder = {
    ...shoppingOrder,
    order: {
      ...shoppingOrder.order,
      payment_intent_id: paymentIntentId, // inject related payment intent id
    },
  };
  let orderCreationError = null;
  const orderPayment = await fetcher
    .fetch(`${getEnv().API_URL}/stripe/pay`, {
      method: "POST",
      body: convertToFormData(shoppingOrder),
    })
    .catch((error) => {
      console.log("error", error);
      orderCreationError = error;
    });

  // Redirect ti checkout if we get errors creating the order
  if (!orderPayment || orderCreationError) {
    return redirect("/checkout/review");
  }

  // Retrieve purchase details
  const purchaseDetails = await fetcher
    .fetch(`${getEnv().API_URL}/purchase/269`, { method: "GET" })
    .catch((error) => {
      console.log("error ", error);
    });

  // Redirect if we had problems retrieving the order details
  if (!purchaseDetails) {
    return redirect("/");
  }

  // Return to the cart page
  return {
    purchase: purchaseDetails?.purchase || null,
    orders: purchaseDetails?.orders || [],
    customer: purchaseDetails?.customer || null,
    labels: purchaseDetails?.labels || null,
  };
}

//
export default function ThankYou() {
  const { purchase, orders, customer, labels } = useLoaderData<typeof loader>();

  //
  return (
    <div className="relative mx-auto max-w-2xl pb-24 pt-8 sm:px-6 sm:pt-16 lg:max-w-7xl lg:px-8">
      <div className="space-y-2 px-4 sm:flex sm:items-baseline sm:justify-between sm:space-y-0 sm:px-0">
        <div className="flex sm:items-baseline sm:space-x-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Gracias por tu compra
            </h1>
            <h2 className="text-xl tracking-tight text-gray-500 sm:text-2xl">
              Orden #ML-{purchase?.id}
            </h2>
          </div>

          {/*           
          <a
            href="#"
            className="hidden text-sm font-medium text-secondary-600 hover:text-secondary-500 sm:block"
          >
            Ver recibo
            <span aria-hidden="true"> &rarr;</span>
          </a> */}
        </div>
        <p className="text-sm text-gray-600">
          Fecha de compra{" "}
          <time dateTime="2021-03-22" className="font-medium text-gray-900">
            {formatDate(purchase?.created_at)}
          </time>
        </p>
        {/*<a
          href="#"
          className="text-sm font-medium text-secondary-600 hover:text-secondary-500 sm:hidden"
        >
          Ver recibo
          <span aria-hidden="true"> &rarr;</span>
        </a>*/}
      </div>

      {/* Products */}
      <section aria-labelledby="products-heading" className="mt-6">
        <h2 id="products-heading" className="sr-only">
          Productos comprados
        </h2>

        <div className="space-y-8">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border-b border-t border-gray-200 bg-white shadow-sm sm:rounded-lg sm:border"
            >
              {/* Order Details */}
              <div className="px-4 py-6 sm:px-6 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:p-8">
                {/* Products list */}
                <div className="flex lg:col-span-7">
                  <div className="flex-shrink-0 overflow-hidden rounded-sm h-14 w-14">
                    <img
                      src={order.static_products[0]?.image}
                      alt={order.static_products[0]?.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  <ul className="mt-0 ml-6 list-outside">
                    {order.static_products.map((product) => (
                      <li key={product.id}>
                        <div className=" ">
                          <h3 className="text-base font-medium text-gray-900">
                            {product.name}
                          </h3>

                          {/* PRODUCT VARIATIONS */}
                          {product?.modelo && (
                            <div className="mt-1 flex text-sm">
                              <p className="text-gray-500">
                                <span>Talla/modelo: </span>

                                <span>
                                  {product.namemodel_size || ""}
                                  {product.namemodel_size &&
                                  product.namemodel_model
                                    ? `${product.namemodel_size} / ${product.namemodel_model}`
                                    : ""}
                                  {product.namemodel || ""}
                                </span>
                              </p>
                            </div>
                          )}

                          <div>
                            <p className="mt-1 text-sm font-medium text-gray-900">
                              {formatPrice(product.price * product.quantity)}
                            </p>

                            {/* UNIT PRICE */}
                            {product.quantity > 1 ? (
                              <p className="pl-1 mt-1 text-sm text-gray-500 font-normal">
                                <span className="text-gray-500">
                                  (x{product.quantity})
                                </span>{" "}
                                <span className="">
                                  {formatPrice(product.price)} c/u
                                </span>
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Customer details */}
                <div className="mt-6 lg:col-span-5 lg:mt-0">
                  <dl className="grid grid-cols-2 gap-x-6 text-sm">
                    <div>
                      <dt className="font-medium text-gray-900">
                        Dirección de entrega
                      </dt>
                      <dd className="mt-3 text-gray-500">
                        <span className="block">{`${customer.street} ${customer.num_ext}${customer?.num_int ? ", " + customer?.num_int : ""} `}</span>
                        <span className="block">{`${customer.neighborhood}, ${customer.zipcode}. ${customer.town.name}, ${customer.state.name}.`}</span>
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-900">
                        Contacto de compra
                      </dt>
                      <dd className="mt-3 space-y-3 text-gray-500">
                        <p>{customer.email}</p>
                        <p>{customer.phone}</p>
                        {/* <button
                          type="button"
                          className="font-medium text-secondary-600 hover:text-secondary-500"
                        >
                          Edit
                        </button> */}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Order Status */}
              <div className="border-t border-gray-200 px-4 py-6 sm:px-6 lg:p-8">
                <h4 className="sr-only">Status</h4>
                <p className="text-sm font-medium text-gray-900">
                  Fecha aproximada de entrega{" "}
                  <time dateTime={order.expected_shipping_date}>
                    {formatDate(order.expected_shipping_date)}
                  </time>
                </p>
                <div className="mt-6" aria-hidden="true">
                  <div className="overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-secondary-600"
                      style={{
                        width: `calc((${0} * 2 + 1) / 8 * 100%)`,
                      }}
                    />
                  </div>
                  <div className="mt-6 hidden grid-cols-4 text-sm font-medium text-gray-600 sm:grid">
                    <div className="text-secondary-600">Order creada</div>
                    <div
                      className={classNames(
                        0 > 0 ? "text-secondary-600" : "",
                        "text-center"
                      )}
                    >
                      Elaborando pedido
                    </div>
                    <div
                      className={classNames(
                        0 > 1 ? "text-secondary-600" : "",
                        "text-center"
                      )}
                    >
                      En camino
                    </div>
                    <div
                      className={classNames(
                        0 > 2 ? "text-secondary-600" : "",
                        "text-right"
                      )}
                    >
                      Entregada
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Billing */}
      <section aria-labelledby="summary-heading" className="mt-16">
        <h2 id="summary-heading" className="sr-only">
          Billing Summary
        </h2>

        <div className="bg-gray-100 px-4 py-6 sm:rounded-lg sm:px-6 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8 lg:py-8">
          {/* 
          <dl className="grid grid-cols-2 gap-6 text-sm sm:grid-cols-2 md:gap-x-8 lg:col-span-7">
            // Billing Information
            <div>
              <dt className="font-medium text-gray-900">Billing address</dt>
              <dd className="mt-3 text-gray-500">
                <span className="block">Floyd Miles</span>
                <span className="block">7363 Cynthia Pass</span>
                <span className="block">Toronto, ON N3Y 4H8</span>
              </dd>
            </div>

            // Payment Information
            <div>
              <dt className="font-medium text-gray-900">Payment information</dt>
              <dd className="-ml-4 -mt-1 flex flex-wrap">
                <div className="ml-4 mt-4 flex-shrink-0">
                  <svg
                    aria-hidden="true"
                    width={36}
                    height={24}
                    viewBox="0 0 36 24"
                    className="h-6 w-auto"
                  >
                    <rect width={36} height={24} rx={4} fill="#224DBA" />
                    <path
                      d="M10.925 15.673H8.874l-1.538-6c-.073-.276-.228-.52-.456-.635A6.575 6.575 0 005 8.403v-.231h3.304c.456 0 .798.347.855.75l.798 4.328 2.05-5.078h1.994l-3.076 7.5zm4.216 0h-1.937L14.8 8.172h1.937l-1.595 7.5zm4.101-5.422c.057-.404.399-.635.798-.635a3.54 3.54 0 011.88.346l.342-1.615A4.808 4.808 0 0020.496 8c-1.88 0-3.248 1.039-3.248 2.481 0 1.097.969 1.673 1.653 2.02.74.346 1.025.577.968.923 0 .519-.57.75-1.139.75a4.795 4.795 0 01-1.994-.462l-.342 1.616a5.48 5.48 0 002.108.404c2.108.057 3.418-.981 3.418-2.539 0-1.962-2.678-2.077-2.678-2.942zm9.457 5.422L27.16 8.172h-1.652a.858.858 0 00-.798.577l-2.848 6.924h1.994l.398-1.096h2.45l.228 1.096h1.766zm-2.905-5.482l.57 2.827h-1.596l1.026-2.827z"
                      fill="#fff"
                    />
                  </svg>
                  <p className="sr-only">Visa</p>
                </div>
                <div className="ml-4 mt-4">
                  <p className="text-gray-900">Ending with 4242</p>
                  <p className="text-gray-600">Expires 02 / 24</p>
                </div>
              </dd>
            </div>
          </dl>
          */}

          {/* Order Summary */}
          <dl className="mt-8 divide-y divide-gray-200 text-sm lg:col-span-5 lg:mt-0">
            <div className="flex items-center justify-between pb-4">
              <dt className="text-gray-600">Subtotal</dt>
              <dd className="font-medium text-gray-900">
                {purchase?.subtotal}
              </dd>
            </div>
            <div className="flex items-center justify-between py-4">
              <dt className="text-gray-600">
                Costo de envío {`(${orders.length} envíos)`}
              </dt>
              <dd className="font-medium text-gray-900">
                {purchase?.shippingCost}
              </dd>
            </div>
            {/* <div className="flex items-center justify-between py-4">
              <dt className="text-gray-600">Tax</dt>
              <dd className="font-medium text-gray-900">$6.16</dd>
            </div> */}
            <div className="flex items-center justify-between pt-4">
              <dt className="font-medium text-gray-900">Total</dt>
              <dd className="font-medium text-secondary-600">{purchase?.total}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Call to Action Container */}
      <section aria-labelledby="summary-heading" className="mt-16">
        <div className="flex flex-col items-center justify-center">
          <h3 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-xl">
            Continúa explorando México Limited
          </h3>

          <Link
            to="/"
            className="mt-4 rounded-md border border-transparent bg-primary-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-50"
          >
            Regresar a la tienda
          </Link>
        </div>
      </section>
    </div>
  );
}
