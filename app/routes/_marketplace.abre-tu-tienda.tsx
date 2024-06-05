import {
  Outlet,
  useLoaderData,
} from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import getEnv from "get-env";
import AuthService from "~/services/Auth.service";
import Fetcher from "~/utils/fetcher";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(getEnv().STRIPE_PUBLIC_KEY);

// Loader function
export async function loader({ request, params }: LoaderFunctionArgs) {
  // Attempt to get the user from the session
  const user = await AuthService.getCurrentUser(request).catch((err) => {
    console.log(err);
    return null;
  });

  // Create sercer-side fetcher
  const myFetcher = new Fetcher(user?.token, request);

  // Get payment intent from the backend
  const stripeIntentFormData = new FormData();
  stripeIntentFormData.append("total", "200");
  const stripePaymentIntent = await myFetcher.fetch(
    `${getEnv().API_URL}/payments/stripe/intents/create-seller-payment-intent`,
    {
      method: "POST",
      body: stripeIntentFormData,
    }
  );
  console.log("Stripe Payment Intent Loaded ", stripePaymentIntent);
  return {
    stripeConfig: {
      paymentIntent: stripePaymentIntent.intent_id,
      clientSecret: stripePaymentIntent?.client_secret,
    },
  };
}

//
export default function SellersSignupPage() {
  const { stripeConfig } = useLoaderData<typeof loader>();

  // Return main component
  return (
    <Elements stripe={stripePromise} options={stripeConfig}>
      {<Outlet context={stripeConfig} />}
    </Elements>
  );
}
