import { Outlet } from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import AppShield from "../components/AppShield";
import getEnv from "get-env";
import Fetcher from "~/utils/fetcher";
import ShoppingCart from "~/utils/ShoppingCart";
import { getSession } from "~/services/session.server";

export let loader: LoaderFunction = async ({ request, params }) => {
  let session = await getSession(request.headers.get("cookie"));

  //
  const fetcher = new Fetcher(session.get("token"), request);
  const shoppingCart = await fetcher.fetch(`${getEnv().API_URL}/cart`, {
    method: "GET",
  });
  const shoppingCartInstance = new ShoppingCart(shoppingCart);

  //
  const stripeIntentFormData = new FormData();
  stripeIntentFormData.append("payment_method_id", "");
  stripeIntentFormData.append(
    "shipping",
    JSON.stringify(shoppingCartInstance.getShipping())
  );
  stripeIntentFormData.append(
    "total",
    shoppingCartInstance.getTotal().toString()
  );

  const stripePaymentIntent = await fetcher.fetch(
    `${getEnv().API_URL}/stripe/Installments`,
    {
      method: "POST",
      body: stripeIntentFormData,
    }
  );

  // Return the loader data
  return {
    stripe_public_key: getEnv().STRIPE_PUBLIC_KEY,
    paymentIntent: stripePaymentIntent.intent_id,
    stripeConfig: {
      // passing the client secret obtained from the server
      clientSecret: stripePaymentIntent?.client_secret,
      // intentId: stripePaymentIntent.intent_id,
    },
  };
};



export default function () {
  // Get loader data
  const { stripeConfig, paymentIntent, stripe_public_key } = useLoaderData<typeof loader>();

  // Make sure to call `loadStripe` outside of a component’s render to avoid
  // recreating the `Stripe` object on every render.
  const stripePromise = loadStripe(stripe_public_key);

  // Render component
  return (
    <AppShield
      content={
        <div className="mb-24">
          {/* Background color split screen for large screens */}
          <div
            className="fixed left-0 top-0 hidden h-full w-1/2 bg-white lg:block"
            aria-hidden="true"
          />
          <div
            className="fixed right-0 top-0 hidden h-full w-1/2 bg-gray-50 lg:block"
            aria-hidden="true"
          />

          {!stripeConfig?.clientSecret ? (
            <Outlet context={paymentIntent} />
          ) : (
            <Elements stripe={stripePromise} options={stripeConfig}>
              {<Outlet context={paymentIntent} />}
            </Elements>
          )}
        </div>
      }
    />
  );
}
