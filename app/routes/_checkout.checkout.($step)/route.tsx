import { useState, useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Link,
  Form,
  useLoaderData,
  useNavigate,
  useActionData,
  useOutletContext
} from "@remix-run/react";
import { redirect } from "@remix-run/node";
import stripe from "stripe";
import { loadStripe } from "@stripe/stripe-js";
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

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
import ThankYou from "./ThankYou";
import ShoppingCart from "~/utils/ShoppingCart";
import { useFetcherConfiguration } from "~/providers/FetcherConfigurationContext";
import DialogOverlay from "~/components/DialogOverlay";
import { useFetcher } from "react-router-dom";

//
const STRIPE_REDIRECT_URL = "http://localhost:3000/purchase";

//
export async function loader({ request, params }: LoaderFunctionArgs) {
  const cartStep = params.step;
  let CartStepForm = ShippingForm;

  const fetcher = new Fetcher(null, request);

  switch (cartStep) {
    case "shipping":
      const shoppingCart = await fetcher.fetch(`${getEnv().API_URL}/cart`, {
        method: "GET",
      });
      console.log("loading shipping step ", shoppingCart);
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

type ActionErrors = {
  payment_error?:
    | {
        message: string;
        type: string;
        error?: any;
      }
    | undefined;
};
export let action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const cartStep = formData.get("step");
  let errors: ActionErrors = {};
  console.log("params ", cartStep);

  //log all form values
  for (var pair of formData.entries()) {
    console.log(pair[0] + ", " + pair[1]);
  }

  //
  const fetcher = new Fetcher(null, request);

  //
  switch (cartStep) {
    case "shipping":
      const updatedCart = await fetcher
        .fetch(`${getEnv().API_URL}/cart/shipping`, {
          method: "POST",
          body: formData,
        })
        .catch((error) => {
          console.log("error", error);
          return (errors.shipping_error = {
            message: "Error updating cart",
            type: "shipping_error",
            error: error,
          });
        });

      console.log("Updated shipping details ", updatedCart);
      return redirect("/checkout/review");
      break;
    case "review":
      // Process payment
      const orderPayment = await fetcher
        .fetch(`${getEnv().API_URL}/stripe/pay`, {
          method: "POST",
          body: formData,
        })
        .catch((error) => {
          console.log("error", error);
          return (errors.payment_error = {
            message: "Error processing payment",
            type: "payment_error",
            error: error,
          });
        });

      // Check if payment was successful
      // if (orderPayment?.type == "success") {
      //   return redirect("/checkout/thank-you");
      // }

      return {
        step: "review",
        errors,
        order: orderPayment,
      }

      // Collect payment errors
      errors.payment_error = {
        message: orderPayment.message,
        type: "payment_error",
      };

      // Exit handler
      break;

    default:
    // return redirect("/cart");
  }

  // If the errors object has any properties, that means the form didn't validate
  if (Object.keys(errors).length) {
    // Return the errors to the browser
    return {
      errors,
    };
  }
};

//
export default function CheckoutPage() {
  const checkoutForm = useFetcher();
  const stripe = useStripe();
  // stripe?.retrievePaymentIntent()
  const myValue = useOutletContext();
  const paymentId = myValue;
  console.log("paymentIntent", paymentId);
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const actionData = useActionData();
  const [errorModalDisplay, setErrorModalDisplay] = useState(
    actionData?.errors.payment_error ? true : false
  );
  useEffect(() => {
    if (actionData?.errors.payment_error) {
      console.log(
        "actionData",
        errorModalDisplay,
        actionData?.errors.payment_error
      );
      setErrorModalDisplay(true);
    }
  }, [actionData?.errors.payment_error]);

  // Loader data
  const { cartStep, statesList } = useLoaderData<typeof loader>();

  // Shopping Cart
  const ShoppingCartInstance = useShoppingCart();
  const [cartProducts, setCartProducts] = useState<ShoppingCartShop[]>(
    ShoppingCartInstance.getCart().cart || []
  );

  // Update the local state when the ShoppingCartInstance changes
  useEffect(() => {
    setCartProducts(ShoppingCartInstance.getCart().cart);
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
    case "thank-you":
      CartStepForm = ThankYou;
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
        try {
          checkoutForm.submit(formData, { method: "POST" });
          return;
          // Catch errors
        } catch (e) {
          console.log(e);
        }

        // Exit handler
        console.log("Shipping form submitted");
        return;

      case "review":
        try {
          checkoutForm.submit(formData, { method: "POST" });
          return;
          // Catch errors
        } catch (e) {
          console.log(e);
        }

        // Exit handler
        console.log("Review form submitted");
        break;
      default:
    }
  }
  useEffect(() => {
    // if (actionData.data.payment_error) {
    //   console.log("actionData", actionData.data.payment_error);
    //   setErrorModalDisplay(true);
    // }
    if(
      checkoutForm.state === "idle" &&
      checkoutForm.data?.step == "review" 
      && checkoutForm.data?.order.type == "success"
    ){
      // Confirm stripe payment
      handleConfirmPayment(checkoutForm.data?.order);
    }
  } , [checkoutForm]);

  // Confirm payment
  const handleConfirmPayment = async (order) => {
    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${STRIPE_REDIRECT_URL}/${order.id}/success`,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message);
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  // Render component
  return (
    <>
      {cartStep === "thank-you" ? (
        <ThankYou />
      ) : (
        <checkoutForm.Form
          method="post"
          onSubmit={handleSubmit}
          className="relative mx-auto grid max-w-7xl grid-cols-1 gap-x-16 lg:grid-cols-2 px-8 xl:gap-x-48"
        >
          <input type="hidden" name="step" defaultValue={cartStep} />
          <input type="hidden" name="order[payment_intent_id]" defaultValue={paymentId || ''} />

          {
            // Include all products in the cart as hidden inputs
            ShoppingCartInstance.getCart().cart.map((shop) => {
              return shop.products.map((product, prodIndx) => {
                return Array.from(Object.keys(product)).map(
                  (keyName: string) => {
                    return (
                      <input
                        type="hidden"
                        name={`products[${prodIndx}][${keyName}]`}
                        value={product[keyName]}
                      />
                    );
                  }
                );
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
        </checkoutForm.Form>
      )}

      {errorModalDisplay && (
        <DialogOverlay
          title="Error"
          message={actionData.errors.payment_error.message}
          display={true}
        />
      )}
    </>
  );
}
