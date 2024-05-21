import React, { useState, useEffect } from "react";
import { PaymentElement, useStripe } from "@stripe/react-stripe-js";

export default function CheckoutForm({
  onFormCompleted = () => undefined,
}: {
  onFormCompleted: Function;
}) {
  const [formErrors, setFormErrors] = useState({});

  // Stripe configuration
  const stripe = useStripe();
  const [isPaymentFormComplete, setIsPaymentFormComplete] = useState(false);
  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe]);

  // Handle stripe form changes
  function stripeFormChangeHandler(event){
    setIsPaymentFormComplete(event.complete);
    setFormErrors((prev) => {
      const { payment_errors: _, ...rest } = prev;
      return rest;
    })
  }

  //
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Check if the form is complete
  useEffect(() => {
    if (onFormCompleted) {
      onFormCompleted(isPaymentFormComplete);
    }
  }, [isPaymentFormComplete]);

  

  return (
    <>
      <PaymentElement onChange={stripeFormChangeHandler} id="payment-element" />

      {/* Show any error or success messages */}
      {message && <div id="payment-message">{message}</div>}
    </>
  );
}
