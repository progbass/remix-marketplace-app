import { useState, useEffect, useRef } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  useLoaderData,
  useActionData,
  useOutletContext,
  Link,
} from "@remix-run/react";
import { redirect } from "@remix-run/node";
import { useStripe, useElements } from "@stripe/react-stripe-js";

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
import DialogOverlay from "~/components/DialogOverlay";
import { useFetcher } from "@remix-run/react";
import { getSession } from "~/services/session.server";
import Spinner from "~/components/Spinner";

//
const STRIPE_REDIRECT_URL = "";

//
const checkoutStepsModel = [
  { name: "Carrito", href: "/cart", status: "upcoming", slug: "cart" },
  {
    name: "Dirección de envío",
    href: "/checkout/shipping",
    status: "upcoming",
    slug: "shipping",
  },
  {
    name: "Confirmación",
    href: "/checkout/review",
    status: "upcoming",
    slug: "review",
  },
];

//
export async function loader({ request, params }: LoaderFunctionArgs) {
  const cartStep = params.step;
  let checkoutSteps = checkoutStepsModel;
  let session = await getSession(request.headers.get("cookie"));

  // Config custom data fetcher
  const fetcher = new Fetcher(session.get("token"), request);

  // Fetch the shopping cart
  const shoppingCart = await fetcher.fetch(`${getEnv().API_URL}/cart`, {
    method: "GET",
  });
  let shippingQuotes = [];

  // If the shopping cart is empty, redirect to the cart page
  if (shoppingCart?.cart && shoppingCart?.cart.length === 0) {
    return redirect("/cart");
  }

  // If there's no shipping address information, redirect to the shipping page
  if (cartStep === "review" && !shoppingCart?.shipping) {
    return redirect("/checkout/shipping");
  }

  // Control behavior based on the current cart/checkout step
  switch (cartStep) {
    case "shipping":
      checkoutSteps = checkoutStepsModel.map((step) => {
        if (step.slug === "shipping") {
          return {
            ...step,
            status: "current",
          };
        }
        if (step.slug === "review") {
          return {
            ...step,
            status: "upcoming",
          };
        }
        return {
          ...step,
          status: "complete",
        };
      });

      console.log("loading shipping step ", shoppingCart);
      break;
    case "review":
      const ShoppingCartInstance = new ShoppingCart(shoppingCart);

      // Define necessary data to request shipping quotes
      const formData = new FormData();
      formData.append("user[name]", shoppingCart.shipping.name);
      formData.append("user[lastname]", shoppingCart.shipping.lastname);
      formData.append("user[email]", shoppingCart.shipping.email);
      formData.append("user[phone]", shoppingCart.shipping.phone);
      formData.append("user[street]", shoppingCart.shipping.street);
      formData.append("user[num_ext]", shoppingCart.shipping.num_ext);
      formData.append("user[num_int]", shoppingCart.shipping.num_int);
      formData.append("user[town_id]", shoppingCart.shipping.town_id);
      formData.append("user[state_id]", shoppingCart.shipping.state_id);
      formData.append("user[zipcode]", shoppingCart.shipping.zipcode);
      formData.append("user[neighborhood]", shoppingCart.shipping.neighborhood);
      formData.append(
        "products",
        JSON.stringify(ShoppingCartInstance.getProducts())
      );

      // Get shipping quotes
      const shippingQuotesResponse = await fetcher
        .fetch(`${getEnv().API_URL}/distance`, {
          method: "POST",
          body: formData,
        })
        .catch((error) => {
          console.log("error getting shipping quotes ", error);
          // throw new Error("Error fetching distance data");
          return;
        });
      shippingQuotes = shippingQuotesResponse;

      console.log("shippingQuotesResponse ", shippingQuotesResponse);

      // Redirect to shipping page if there are no shipping quotes
      if (
        !shippingQuotesResponse ||
        !shippingQuotesResponse?.deliveries.length
      ) {
        return redirect("/checkout/shipping");
      }

      checkoutSteps = checkoutStepsModel.map((step) => {
        if (step.slug === "review") {
          return {
            ...step,
            status: "current",
          };
        }
        return {
          ...step,
          status: "complete",
        };
      });
      break;

    default:
  }

  // Get the states list
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
    checkoutSteps,
    shippingQuotes,
    shoppingCart,
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
export let action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  let errors: ActionErrors = {};
  let session = await getSession(request.headers.get("cookie"));

  //log all form values
  for (var pair of formData.entries()) {
    console.log(pair[0] + ", " + pair[1]);
  }

  // Create a new fetcher instance
  const fetcher = new Fetcher(session.get("token"), request);

  // Handle the form actions
  const formAction = formData.get("action");
  let cart;
  switch (formAction) {
    case "updateProduct":
      // Add/Update product to the shopping cart
      cart = await fetcher
        .fetch(`${getEnv().API_URL}/cart/add`, {
          method: "POST",
          body: formData,
        })
        .catch((err) => {
          console.log(err);
        });

      //
      return {
        cart,
      };
      break;

    case "removeProduct":
      // Remove the product
      cart = await fetcher
        .fetch(`${getEnv().API_URL}/cart/remove`, {
          method: "DELETE",
          body: formData,
        })
        .catch((err) => {
          console.log(err);
        });

      //
      return {
        cart,
      };
      break;

    case "shipping":
      // Update shipping details in the cart
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

      // Redirect users to the review page
      console.log("Updated shipping details ", updatedCart);
      return redirect("/checkout/review");

    case "setShippingMethod":
      // Set shipping method
      const updatedShoppingCart = await fetcher
        .fetch(`${getEnv().API_URL}/cart`, {
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

      // Return data
      updatedShoppingCart.cart.map((item) => {
        console.log("Updated shipping method ", item.selectedShippingMethod);
      });
      return {
        cart: updatedShoppingCart,
      };

    case "review":
      // Process payment
      const updatedShoppingCart2 = await fetcher
        .fetch(`${getEnv().API_URL}/cart`, {
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
      // const orderPayment = await fetcher
      //   .fetch(`${getEnv().API_URL}/stripe/pay`, {
      //     method: "POST",
      //     body: formData,
      //   })
      //   .catch((error) => {
      //     console.log("error", error);
      //     return (errors.payment_error = {
      //       message: "Error processing payment",
      //       type: "payment_error",
      //       error: error,
      //     });
      //   });

      console.log("ORDER PAYMENT REFERENCE ", updatedShoppingCart2);

      // Return data
      // return redirect("/checkout/purchase_confirmation");
      return {
        step: "purchase_confirmation",
        errors
      };

    default:
      return redirect("/cart");
  }

  // If the errors object has any properties, that means the form didn't validate
  if (Object.keys(errors).length) {
    // Return the errors to the browser
    return {
      errors,
    };
  }
};

// MAIN LAYOUT
export default function CheckoutPage() {
  const formReference = useRef(null);

  // Loader data
  const { cartStep, checkoutSteps, statesList, shippingQuotes, shoppingCart } =
    useLoaderData<typeof loader>();

  // Form fetcher
  const checkoutForm = useFetcher();

  // Stripe Elements
  const stripe = useStripe();
  const myValue = useOutletContext();
  const paymentId = myValue;
  const elements = useElements();

  const [message, setMessage] = useState(null);

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

  // Display a progress bar based on the current step and action data state
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const formData = checkoutForm.formData;

    // Determine the current step
    let currentStep: string|null = "cart";
    if (formData) {
      currentStep = formData.get("action");
    }

    // Show loading modal
    if (
      checkoutForm.state === "loading"
      && !(
        currentStep?.includes("setShippingMethod")
        || currentStep?.includes("removeProduct")
        || currentStep?.includes("updateProduct")
      )
    ) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [checkoutForm.state]);

  // Shopping Cart
  const ShoppingCartInstance = useShoppingCart();
  ShoppingCartInstance.setShippingQuotes(shippingQuotes?.deliveries || []);

  // Handle product quantity changes
  const handleProductQuantityChange = async (
    product: ShoppingCartProduct,
    event: React.FormEvent<HTMLFormElement>
  ) => {
    // Optimistic UI update
    ShoppingCartInstance.updateProductQuantity(
      product,
      Number(event.currentTarget.value)
    );

    // Update product quantity
    const item = {
      action: "updateProduct",
      ...product,
      quantity: event.currentTarget.value,
    };

    // Submit the form
    var form_data = new FormData();
    for (var key in item) {
      // Exclude empty values
      if (item[key]) {
        console.log(key, item[key]);
        form_data.append(key, item[key]);
      }
    }

    // Submit form
    checkoutForm.submit(form_data, { method: "post" });

    //
    return;
  };

  // Handle remove product
  const handleProductRemove = (product: ShoppingCartProduct) => {
    // Optimistic UI update
    ShoppingCartInstance.removeFromCart(product);

    // Submit form asynchronously
    checkoutForm.submit(
      {
        ...product,
        action: "removeProduct",
      },
      { method: "post" }
    );

    //
    return;
  };

  // Handle form submission
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    
    // Transform into FormData
    const formData = new FormData(event.currentTarget);
    switch (formData.get("action")) {
      case "shipping":
        try {
          checkoutForm.submit(formData, { method: "POST" });
          // return;
          // Catch errors
        } catch (e) {
          console.log(e);
        }

        // Exit handler
        console.log("Shipping form submitted");
        return;

      //
      case "review":
        event.preventDefault();
        
        try {
          // handlePaymentConfirmation();
          checkoutForm.submit(formData, { method: "POST" });
          // return;
          // Catch errors
        } catch (e) {
          console.log(e);
        }

        // Exit handler
        console.log("Review form submitted");
        return;
      
      //
      default:
        return;
    }
  }
  useEffect(() => {
    if (
      checkoutForm.state === "idle" &&
      checkoutForm.data?.step == "purchase_confirmation"
    ) {
      // Confirm stripe payment
      handlePaymentConfirmation();
    }
  }, [checkoutForm]);

  // Confirm payment
  const handlePaymentConfirmation = async () => {
    setIsLoading(true);

    console.log("__CONFIRMING_PAYMENT__  ");
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${getEnv().MARKETPLACE_URL}/purchase/success`,
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

  // Determine form completion
  const [isFormCompleted, setIsFormCompleted] = useState(false);
  const handleFormComplete = (formCompleted: boolean) => {
    setIsFormCompleted(formCompleted);
  };

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

  // Render component
  return (
    <>
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-white">
        <div className="flex justify-end sm:justify-center">
          <nav aria-label="Progress" className="hidden sm:block">
            <ol role="list" className="flex space-x-4">
              {checkoutSteps.map((step, stepIdx) => (
                <li key={step.name} className="flex items-center">
                  {step.status === "current" || step.status === "complete" ? (
                    <Link
                      to={step.href}
                      aria-current="page"
                      className={
                        step.status === "current"
                          ? "text-secondary-600"
                          : "text-gray-400 hover:text-secondary-600"
                      }
                    >
                      {step.name}
                    </Link>
                  ) : (
                    step.name
                  )}

                  {stepIdx !== checkoutSteps.length - 1 ? (
                    <ChevronRightIcon
                      className="ml-4 h-5 w-5 text-gray-300"
                      aria-hidden="true"
                    />
                  ) : null}
                </li>
              ))}
            </ol>
          </nav>
          <p className="sm:hidden">Paso 2 de 3</p>
        </div>
      </div>

      <div className="mt-10">
        <h1 className="sr-only">Checkout</h1>
        {/* Checkout Step */}
        <checkoutForm.Form
          ref={formReference}
          method="post"
          onSubmit={handleSubmit}
          className="relative mx-auto grid max-w-7xl grid-cols-1 gap-x-16 lg:grid-cols-2 px-8 xl:gap-x-48"
        >
          <input type="hidden" name="action" defaultValue={cartStep} />
          <input
            type="hidden"
            name="order[payment_intent_id]"
            defaultValue={paymentId || ""}
          />

          <div>
            <CartStepForm
              formRef={formReference}
              formFetcher={checkoutForm}
              addressStatesList={statesList}
              onFormCompleted={handleFormComplete}
            />
          </div>

          <OrderSummary
            cartStep={cartStep}
            checkoutForm={checkoutForm}
            checkoutFormRef={formReference}
            isFormCompleted={isFormCompleted}
            onProductRemove={handleProductRemove}
            onProductQuantityChange={handleProductQuantityChange}
          />
        </checkoutForm.Form>
      </div>

      {/* LOADING MODAL */}
      {isLoading && (
        <>
          <DialogOverlay
            closeOnOverlayClick={false}
            title="Cargando..."
            message={""}
            display={true}
          >
            <div className="flex items-center flex-col">
              <Spinner />
              <div className="mt-4">
                {cartStep === "shipping" ? (
                  <p>Obteniendo información de envío...</p>
                ) : (
                  <p>Procesando pago...</p>
                )}
              </div>
            </div>
          </DialogOverlay>
        </>
      )}

      {/* Error Modal */}
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



