import { Link } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import Stripe from "stripe";

import {
  MegaphoneIcon,
  PhotoIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";
import { LoaderFunction } from "react-router-dom";

import getEnv from "get-env";

// NEXT STEPS DATA
const steps = [
  {
    name: "Configura tu tienda",
    description:
      "Personaliza los detalles de tu tienda, como el nombre, la descripción, el logo y los colores para reflejar la identidad de tu marca.",
    icon: BuildingStorefrontIcon,
  },
  {
    name: "Sube tus productos",
    description:
      "Agrega tus productos únicos con fotos y descripciones detalladas para que los compradores puedan conocerlos y comprarlos fácilmente.",
    icon: PhotoIcon,
  },
  {
    name: "Comienza a vender",
    description:
      "Promociona tus productos y haz crecer tu negocio con México Limited.",
    icon: MegaphoneIcon,
  },
];

// Loader function
export async function loader({ request }: { request: Request }) {
  // Retrieve payment intent status
  const stripe2 = new Stripe(getEnv().STRIPE_SECRET_KEY);
  const url = new URL(request.url);
  const paymentIntentId:string | null = url.searchParams.get("payment_intent");
  const paymentIntentClientSecret:string | null = url.searchParams.get("payment_intent_client_secret")

  // Redirect if payment information is not found
  if (!paymentIntentId || !paymentIntentClientSecret) {
    // return redirect("/");
    return {}
  }

  // Retrieve payment intent
  const paymentIntent = await stripe2.paymentIntents.retrieve(paymentIntentId, {
    client_secret: paymentIntentClientSecret,
  });
  if (!paymentIntent) {
    // return redirect("/");
  }
  
  return { props: {} };
}

//
export default function SellerSignUpConfirmationPage() {
  // Return main component
  return (
    <div className="isolate relative py-32">
      {/* BACKGROUND */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* HEADER */}
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">
            Tu tienda ha sido creada con éxito.
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Bienvenido a México Limited
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Empieza a compartir tus productos únicos y a conectar con nuevos
            clientes potenciales. ¡Estamos emocionados de ver tu negocio crecer!
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="https://mexicolimited.com/admin"
              target="_blank"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Configura tu tienda
            </a>
          </div>
        </div>

        {/* NEXT STEPS */}
        <div className="mx-auto mt-16 max-w-xl sm:mt-20 lg:mt-24">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:gap-y-16">
            {steps.map((step) => (
              <div key={step.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                    <step.icon
                      className="h-6 w-6 text-white"
                      aria-hidden="true"
                    />
                  </div>
                  {step.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  {step.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* BACKGROUND */}
      <div
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>
    </div>
  );
}
