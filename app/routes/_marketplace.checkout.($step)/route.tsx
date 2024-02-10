import { useState, useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Form, useLoaderData, useNavigate } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import { ChevronRightIcon } from "@heroicons/react/20/solid";

import type {
  ShoppingCartProduct,
  ShoppingCartShop,
} from "~/utils/ShoppingCart";

import { useShoppingCart } from "~/providers/ShoppingCartContext";
import getEnv from "get-env";
import Fetcher from "~/utils/fetcher";
import OrderSummary from "./OrderSummary";
import ShippingForm from "./ShippingForm";
import ReviewForm from "./ReviewForm";
import ShoppingCart from "~/utils/ShoppingCart";
import { useFetcherConfiguration } from "~/providers/FetcherConfigurationContext";

//
export async function loader({ request, params }: LoaderFunctionArgs) {
  const cartStep = params.step;
  let CartStepForm = ShippingForm;

  const fetcher = new Fetcher();

  switch (cartStep) {
    case "shipping":
      console.log("loading shipping step");
      // return redirect("/checkout/review");
      break;
    case "review":
      console.log("loading review step");
      // return redirect("/checkout/thank-you");
      break;
    default:
    // return redirect("/cart");
  }

  // States
  const statesResponse = await fetcher
    .fetch(`${getEnv().API_URL}/states`, {})
    .catch((error) => {
      console.log("error", error);
      throw new Error("Error fetching states data");
    });

  // Return to the cart page
  return {
    statesList: statesResponse,
    cartStep,
  };
}
export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const cartStep = formData.get("step");
  let errors = {};
  console.log("params ", params);

  //log all form values
  for (var pair of formData.entries()) {
    console.log(pair[0] + ", " + pair[1]);
  }

  //
  const fetcher = new Fetcher();

  //
  switch (cartStep) {
    case "shipping":
      // return redirect("/checkout/review");
      break;
    case "review":
      const orderPayment = await fetcher.fetch(
        `${getEnv().API_URL}/stripe/pay`,
        {
          method: "POST",
          body: formData,
        }
      ).catch((error) => {
        console.log("error", error);
        return {error:"Error fetching stripe payment data"}
      });
      console.log(orderPayment);
      return redirect("/checkout/thank-you");
      break;
    default:
      return redirect("/cart");
  }

  return {
    errors,
    currentUser: {},
    shop: {},
    addressStatesList: [],
    addressCitiesList: [],
    addressNeighborhoodsList: [],
  };
}

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

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(
  "pk_test_51LZfLsKgxTsOar06R9CimiLBdaPo3UDbeNrKHXP03bv8JFJDKje6Sn4tQlecYl33igJ6X6sV6NA6jn2yFU0YX4rl00RfSZNH53"
);

//
export default function CheckoutPage() {
  const navigate = useNavigate();

  // Stripe options
  const [stripeOptions, setStripeOptions] = useState();

  // Get clientside fetch
  const clientSideFetcher: Fetcher = useFetcherConfiguration() as Fetcher;

  // Loader data
  const { cartStep, statesList } = useLoaderData<typeof loader>();

  // Shopping Cart
  const ShoppingCartInstance = useShoppingCart();
  const [cartProducts, setCartProducts] = useState<ShoppingCartShop[]>(
    ShoppingCartInstance.getCart() || []
  );

  // Update the local state when the ShoppingCartInstance changes
  useEffect(() => {
    setCartProducts(ShoppingCartInstance.getCart());
  }, [ShoppingCartInstance]);

  // Determine corresponding UI form
  let CartStepForm = ShippingForm;
  switch (cartStep) {
    case "shipping":
      CartStepForm = ShippingForm;
      break;
    case "review":
      CartStepForm = ReviewForm;
      break;
    default:
  }

  // Handle product quantity changes
  const handleProductQuantityChange = (
    product: ShoppingCartProduct,
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const quantity = event.target.value;
    ShoppingCartInstance.updateProductQuantity(product, parseInt(quantity));
  };
  const handleProductRemove = (product: ShoppingCartProduct) => {
    ShoppingCartInstance.removeProductFromCart(product);
  };

  // Handle form submission
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Transform into FormData
    const formData = new FormData(event.currentTarget);
    switch (formData.get("step")) {
      case "shipping":
        event.preventDefault();

        try {
          // Set shipping data to the shopping cart
          ShoppingCartInstance.setShipping({
            address: formData.get("user[street]") as string,
            city: formData.get("user[town_id]")
              ? formData.get("user[town_id]")
              : 0,
            cityName: formData.get("cityName") as string,
            state: formData.get("user[state_id]")
              ? formData.get("user[state_id]")
              : 0,
            stateName: formData.get("stateName") as string,
            zip: formData.get("user[zipcode]")
              ? formData.get("user[zipcode]")
              : 0,
            num_ext: formData.get("user[num_ext]") as string,
            num_int: formData.get("user[num_int]") as string,
            neighborhood: formData.get("user[neighborhood]") as string,
            phone: formData.get("user[phone]") as string,
            email: formData.get("user[email]") as string,
            firstName: formData.get("user[name]") as string,
            lastName: formData.get("user[lastname]") as string,
          });

          // Get shipping quotes
          const shippingQuotes = await clientSideFetcher
            .fetch(`${getEnv().API_URL}/distance`, {
              method: "POST",
              body: formData,
            })
            .catch((error) => {
              console.log("error", error);
              // throw new Error("Error fetching distance data");
              setCartProducts([]);
              return;
            });

          // Update the shipping quotes
          ShoppingCartInstance.setShippingQuotes(shippingQuotes.deliveries);

          // Generate Stripe payment intent
          const stripeIntentFormData = new FormData();
          stripeIntentFormData.append("payment_method_id", "");
          stripeIntentFormData.append(
            "shipping",
            JSON.stringify(ShoppingCartInstance.getShipping())
          );
          stripeIntentFormData.append(
            "total",
            ShoppingCartInstance.getTotal().toString()
          );
          const stripePaymentIntent = await clientSideFetcher.fetch(
            `${getEnv().API_URL}/stripe/Installments`,
            {
              method: "POST",
              body: stripeIntentFormData,
            }
          );

          // setShippingQuotes(shippingQuotes.deliveries)
          console.log("stripePaymentIntent", stripePaymentIntent);
          setCartProducts(ShoppingCartInstance.getCart());
          setStripeOptions({
            // passing the client secret obtained from the server
            clientSecret: stripePaymentIntent.client_secret,
            intentId: stripePaymentIntent.intent_id,
          });

          // Redirect to next step
          navigate("/checkout/review");

          // Catch errors
        } catch (e) {
          console.log(e);
          event.preventDefault();
        }

        // Exit handler
        console.log("Shipping form submitted");
        return;
        break;
      case "review":
        console.log("Review form submitted");
        break;
      default:
    }
  }

  
  function renderCheckoutForm() {
    return (
      <Form
        method="post"
        onSubmit={handleSubmit}
        className="relative mx-auto grid max-w-7xl grid-cols-1 gap-x-16 lg:grid-cols-2 px-8 xl:gap-x-48"
      >
        <input type="hidden" name="step" value={cartStep} />
        <input
          type="hidden"
          name="order[payment_intent_id]"
          value={stripeOptions?.intentId}
        />
        {
          // Include all products in the cart as hidden inputs
          ShoppingCartInstance.getCart().map((shop) => {
            return shop.products.map((product, prodIndx) => {
              return Array.from(Object.keys(product)).map((keyName: string) => {
                return (
                  <input
                    type="hidden"
                    name={`products[${prodIndx}][${keyName}]`}
                    value={product[keyName]}
                  />
                );
              });
            });
          })
        }

        <div>
          <CartStepForm addressStatesList={statesList} />
        </div>
        <OrderSummary
          cartStep={cartStep}
          onProductRemove={handleProductRemove}
          onProductQuantityChange={handleProductQuantityChange}
        />
      </Form>
    );
  }

  // Render component
  return (
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
                  {step.status === "current" || step.status === "complete" ? (
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
          <p className="sm:hidden">Step 2 of 4</p>
        </div>
      </div>

      <div className="mt-12">
        <h1 className="sr-only">Checkout</h1>
        {!stripeOptions?.clientSecret ? (
          renderCheckoutForm()
        ) : (
          <Elements stripe={stripePromise} options={stripeOptions}>
            {renderCheckoutForm()}
          </Elements>
        )}
      </div>
    </>
  );
}
