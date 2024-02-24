import { Outlet } from "@remix-run/react";
import { useState, useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  Link,
  Form,
  useLoaderData,
  useNavigate,
  useActionData,
} from "@remix-run/react";
import { Elements } from "@stripe/react-stripe-js";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { loadStripe } from "@stripe/stripe-js";
import Stripe from "stripe";

import AppShield from "../components/AppShield";
import getEnv from "get-env";
import Fetcher from "~/utils/fetcher";
import { useFetcherConfiguration } from "~/providers/FetcherConfigurationContext";
import { useShoppingCart } from "~/providers/ShoppingCartContext";
import ShoppingCart, { ShoppingCartType } from "~/utils/ShoppingCart";

//
const steps = [
  { name: "Carrito", href: "/cart", status: "complete" },
  {
    name: "Dirección de envío",
    href: "/checkout/shipping",
    status: "current",
  },
  { name: "Confirmación", href: "/checkout/review", status: "upcoming" },
];

export let loader: LoaderFunction = async ({ request }) => {
  const fetcher = new Fetcher(null, request);
  const shoppingCart = await fetcher.fetch(`${getEnv().API_URL}/cart`, {
    method: "GET",
  });
  const shoppingCartInstance = new ShoppingCart(shoppingCart);

  const stripeIntentFormData = new FormData();
  stripeIntentFormData.append("payment_method_id", "");
  stripeIntentFormData.append(
    "shipping",
    JSON.stringify(shoppingCartInstance.getShipping())
  );
  stripeIntentFormData.append("total", shoppingCartInstance.getTotal().toString());

  const stripePaymentIntent = await fetcher.fetch(
    `${getEnv().API_URL}/stripe/Installments`,
    {
      method: "POST",
      body: stripeIntentFormData,
    }
  );
  console.log("Stripe Payment Intent Loaded ", stripePaymentIntent);
  return {
    paymentIntent: stripePaymentIntent.intent_id,
    stripeConfig: {
      // passing the client secret obtained from the server
      clientSecret: stripePaymentIntent?.client_secret,
      // intentId: stripePaymentIntent.intent_id,
    },
  };
};

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe("pk_test_51LZfLsKgxTsOar06R9CimiLBdaPo3UDbeNrKHXP03bv8JFJDKje6Sn4tQlecYl33igJ6X6sV6NA6jn2yFU0YX4rl00RfSZNH53");

export default function () {
  // Get loader data
  const { stripeConfig, paymentIntent } = useLoaderData<typeof loader>();

  // Shopping Cart
  const ShoppingCartInstance = useShoppingCart();

  // Render component
  return (
    <AppShield
      content={
        <>
          {/* Background color split screen for large screens */}
          <div
            className="fixed left-0 top-0 hidden h-full w-1/2 bg-white lg:block"
            aria-hidden="true"
          />
          <div
            className="fixed right-0 top-0 hidden h-full w-1/2 bg-gray-50 lg:block"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-white">
            <div className="flex justify-end sm:justify-center">
              <nav aria-label="Progress" className="hidden sm:block">
                <ol role="list" className="flex space-x-4">
                  {steps.map((step, stepIdx) => (
                    <li key={step.name} className="flex items-center">
                      {step.status === "current" ||
                      step.status === "complete" ? (
                        <Link
                          to={step.href}
                          aria-current="page"
                          className="text-indigo-600"
                        >
                          {step.name}
                        </Link>
                      ) : (
                        <Link to={step.href}>{step.name}</Link>
                      )}

                      {stepIdx !== steps.length - 1 ? (
                        <ChevronRightIcon
                          className="ml-4 h-5 w-5 text-gray-300"
                          aria-hidden="true"
                        />
                      ) : null}
                    </li>
                  ))}
                </ol>
              </nav>
              <p className="sm:hidden">Paso 2 de 4</p>
            </div>
          </div>

          <div className="mt-12">
            <h1 className="sr-only">Checkout</h1>
            {!stripeConfig?.clientSecret
              ? <Outlet context={paymentIntent} />
              : 
                <Elements stripe={stripePromise} options={stripeConfig}>
                   {<Outlet context={paymentIntent} />}
                </Elements>
            }
          </div>
        </>
      }
    />
  );
}
