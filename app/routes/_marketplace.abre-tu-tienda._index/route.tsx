import { FormEvent, useEffect, useState } from "react";
import {
  Form,
  Link,
  useActionData,
  useNavigation,
  useOutletContext,
  useFetcher,
  useNavigate
} from "@remix-run/react";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import { useElements, useStripe, PaymentElement } from "@stripe/react-stripe-js";
import { Switch } from "@headlessui/react";
import validator from "validator";
import {
  validateSellerRegistrationForm,
  validateBrandName,
  validateName,
  validateEmail,
  validatePassword,
  comparePasswords,
  validatePhone,
  validateLastName,
} from "./validators";

import getEnv from "get-env";
import classNames from "~/utils/classNames";
import Fetcher from "~/utils/fetcher";

const STRIPE_REDIRECT_URL = "http://localhost:3000";

// Action function
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  let errors = {};

  // Handle form actions
  const formValues = {};
  formData.forEach((value, key) => {
    console.log(key, value);
    formValues[key] = value;
  });

  // Validate form
  errors = validateSellerRegistrationForm(formValues);
  console.log("Form Values", formValues, errors);

  // Check for errors
  if (Object.keys(errors).length > 0) {
    return json({ formErrors: errors });
  }

  console.log("asdlkasd asldkasd asldkjasd ", validator.isEmail("foo@bacom"));

  // Update shopping cart
  const myFetcher = new Fetcher(null, request);
  const storeSignupResponse = await myFetcher
    .fetch(`${getEnv().API_URL}/registerFront`, {
      method: "POST",
      body: formData,
    })
    .catch((err) => {
      errors = err?.errors;
    });

  // Check for errors and return
  if (Object.keys(errors).length > 0) {
    return json({ formErrors: errors });
  }
  console.log("Shopping Cart Items", storeSignupResponse);

  // Return response
  return json({
    store: storeSignupResponse,
    purchase: "success",
  });
}

//
export default function SellersSignupPage() {
  // Navigation
  const navigate = useNavigate();
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();

  // Stripe controls
  const elements = useElements();
  const stripe = useStripe();
  const stripeConfig:{
    paymentIntent: string;
    clientSecret: string;
  } = useOutletContext();
  const [isPaymentFormComplete, setIsPaymentFormComplete] = useState(false);

  // Handle stripe form changes
  function stripeFormChangeHandler(event){
    setFormErrors((prev) => {
      const { payment_errors: _, ...rest } = prev;
      return rest;
    })
    setIsPaymentFormComplete(event.complete);
  }

  // Form state
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [isFormPristine, setIsFormPristine] = useState(true);
  const [formErrors, setFormErrors] = useState(actionData?.formErrors || {});
  const [termsConfirmed, setTermsConfirmed] = useState(false);
  const [privacyPolyConfirmed, setPrivacyPolyConfirmed] = useState(false);
  const [agreementConfirmed, setAgreementConfirmed] = useState(false);

  // Form handlers and validations
  function validateField(event: HTMLInputElement, validator: Function) {
    // If the form is pristine, skip validation
    if (isFormPristine) {
      return;
    }

    // Validate field
    const [isValid, errors] = validator(event.target.value);

    // Update form errors
    if (!isValid) {
      setFormErrors((prev) => ({ ...prev, [event.target.name]: errors }));
      return;
    }
    setFormErrors((prev) => {
      // Get all values from the previous state exept the current field
      const { [event.target.name]: _, ...rest } = prev;
      return rest;
    });

    return;
  }   
  function handleFormSubmit(event: FormEvent) {
    setIsFormSubmitting(true);

    // Get form data
    const formData = new FormData(event.target as HTMLFormElement);
    const formValues = {};
    formData.forEach((value, key) => {
      console.log(key, value);
      formValues[key] = value;
    });

    // Validate form
    const errors = validateSellerRegistrationForm(formValues);

    // Check that the stripe payment element is complete
    if (!isPaymentFormComplete) {
      errors['payment_errors'] = ["Completa los datos de pago"]
    }

    // Check for errors
    if (Object.keys(errors).length > 0) {
      setIsFormPristine(false);
      setFormErrors(errors);

      // Prevent form submission
      event.preventDefault();
      setIsFormSubmitting(false);
      return;
    }
  }
  // Listen to form submission to update form errors
  useEffect(() => {
    if (navigation.state === "loading" && actionData?.formErrors) {
      setIsFormPristine(false);
      setFormErrors(actionData?.formErrors || {});
    }
  }, [actionData, navigation]);

  // Determine submit button state
  const isSubmitDisabled =
    !termsConfirmed ||
    !privacyPolyConfirmed ||
    !agreementConfirmed ||
    (!stripe || !elements) ||
    !isPaymentFormComplete ||
    isFormSubmitting ||
    actionData?.store;

  //
  useEffect(() => {
    if(
      navigation.state === "idle"
      && actionData?.purchase == "success"
      && actionData?.store
    ){
      // Confirm stripe payment
      handlePaymentConfirmation(actionData?.store);
    }
  } , [navigation, actionData]);

  // Confirm payment
  const handlePaymentConfirmation = async (storeDetails) => {
    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${STRIPE_REDIRECT_URL}/abre-tu-tienda/${storeDetails.id}/success`,
      },
    });

    //
    setIsFormSubmitting(false);

    // Redirect to success page
    // If payment fails we'll ask for payment details later
    navigate(`/abre-tu-tienda/${storeDetails.id}/success`);

    return;
  };

  // Return main component
  return (
    <div className="isolate bg-white px-6 py-32 lg:px-8">
      <div
        className="absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]"
        aria-hidden="true"
      >
        <div
          className="relative left-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-40rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Abre tu tienda
        </h2>
        <p className="mt-2 text-lg leading-8 text-gray-600">
          Estás a un paso de aumentar tus posibilidades de venta. Completa el
          registro y comienza a vender tus productos en línea.
        </p>
      </div>

      <Form 
        method="POST"
        onSubmit={handleFormSubmit} 
        className="mx-auto mt-16 max-w-xl sm:mt-20"
      >
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          {/* BRAND */}
          <div className="sm:col-span-2">
            <InputText
              label="Marca"
              id="brand"
              type="text"
              name="brand"
              autoComplete="brand"
              onChange={(e: HTMLInputElement) => {
                validateField(e, validateBrandName);
              }}
              onBlur={(e: HTMLInputElement) => {
                validateField(e, validateBrandName);
              }}
              formErrors={formErrors?.brand}
            />
          </div>

          {/* FIRST NAME */}
          <div>
            <InputText
              label="Nombre"
              id="name"
              type="text"
              name="name"
              autoComplete="name"
              onChange={(e: HTMLInputElement) => {
                validateField(e, validateName);
              }}
              onBlur={(e: HTMLInputElement) => {
                validateField(e, validateName);
              }}
              formErrors={formErrors?.name}
            />
          </div>

          {/* LAST NAME */}
          <div>
            <InputText
              label="Apellidos"
              id="lastname"
              type="text"
              name="lastname"
              autoComplete="lastname"
              onChange={(e: HTMLInputElement) => {
                validateField(e, validateLastName);
              }}
              onBlur={(e: HTMLInputElement) => {
                validateField(e, validateLastName);
              }}
              formErrors={formErrors?.lastname}
            />
          </div>

          {/* EMAIL */}
          <div className="sm:col-span-2">
            <InputText
              label="Email"
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              onChange={(e: HTMLInputElement) => {
                validateField(e, validateEmail);
              }}
              onBlur={(e: HTMLInputElement) => {
                validateField(e, validateEmail);
              }}
              formErrors={formErrors?.email}
            />
          </div>

          {/* PASSWORD */}
          <div>
            <InputText
              label="Contraseña"
              id="password"
              type="password"
              name="password"
              autoComplete="password"
              onChange={(e: HTMLInputElement) => {
                validateField(e, validatePassword);
              }}
              onBlur={(e: HTMLInputElement) => {
                validateField(e, validatePassword);
              }}
              formErrors={formErrors?.password}
            />
          </div>

          {/* PASSWORD CONFIRM */}
          <div>
            <InputText
              label="Confirmar contraseña"
              id="password-confirm"
              type="password"
              name="password-confirm"
              autoComplete="password-confirm"
              formErrors={formErrors?.["password-confirm"]}
            />
          </div>

          {/* TELEPHONE NUMBER */}
          <div className="sm:col-span-2">
            <InputText
              label="Teléfono"
              id="phone"
              type="tel"
              name="phone"
              autoComplete="tel"
              onChange={(e: HTMLInputElement) => {
                validateField(e, validatePhone);
              }}
              onBlur={(e: HTMLInputElement) => {
                validateField(e, validatePhone);
              }}
              formErrors={formErrors?.phone}
            />
          </div>

          {/* PAYMENT FORM */}
          <div className="sm:col-span-2">
            <input
              type="hidden"
              name="payment_intent"
              value={stripeConfig.paymentIntent}
            />

            <PaymentElement onChange={stripeFormChangeHandler} id="payment-element" />

            {formErrors?.payment_intent ? (
              <p className="mt-2 mb-4 text-sm text-red-600" id="payment-error">
                {formErrors?.payment_intent?.map((error: string, index: number) => (
                  <span key={index}>
                    {error}
                    <br />
                  </span>
                ))}
              </p>
            ) : null}

            {formErrors?.payment_errors ? (
              <p className="mt-2 mb-4 text-sm text-red-600" id="payment-error">
                {formErrors?.payment_errors?.map((error: string, index: number) => (
                  <span key={index}>
                    {error}
                    <br />
                  </span>
                ))}
              </p>
            ) : null}
          </div>

          {/* TERMS AND CONDITIONS */}
          <Switch.Group as="div" className="flex gap-x-4 sm:col-span-2">
            <div className="flex h-6 items-center">
              <Switch
                name="agreement_confirmed"
                checked={agreementConfirmed}
                onChange={setAgreementConfirmed}
                className={classNames(
                  agreementConfirmed ? "bg-indigo-600" : "bg-gray-200",
                  "flex w-8 flex-none cursor-pointer rounded-full p-px ring-1 ring-inset ring-gray-900/5 transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                )}
              >
                <span className="sr-only">
                  Aceptar convenio con México Limited
                </span>
                <span
                  aria-hidden="true"
                  className={classNames(
                    agreementConfirmed ? "translate-x-3.5" : "translate-x-0",
                    "h-4 w-4 transform rounded-full bg-white shadow-sm ring-1 ring-gray-900/5 transition duration-200 ease-in-out"
                  )}
                />
              </Switch>
            </div>
            <Switch.Label className="text-sm leading-6 text-gray-600">
              Acepto y autorizo el{" "}
              <Link
                to="/convenio-vendedores"
                className="font-semibold text-indigo-600"
              >
                convenio con México Limited
              </Link>
              .
            </Switch.Label>
          </Switch.Group>
          <Switch.Group as="div" className="flex gap-x-4 sm:col-span-2">
            <div className="flex h-6 items-center">
              <Switch
                name="privacy_confirmed"
                checked={privacyPolyConfirmed}
                onChange={setPrivacyPolyConfirmed}
                className={classNames(
                  privacyPolyConfirmed ? "bg-indigo-600" : "bg-gray-200",
                  "flex w-8 flex-none cursor-pointer rounded-full p-px ring-1 ring-inset ring-gray-900/5 transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                )}
              >
                <span className="sr-only">Aceptar política de privacidad</span>
                <span
                  aria-hidden="true"
                  className={classNames(
                    privacyPolyConfirmed ? "translate-x-3.5" : "translate-x-0",
                    "h-4 w-4 transform rounded-full bg-white shadow-sm ring-1 ring-gray-900/5 transition duration-200 ease-in-out"
                  )}
                />
              </Switch>
            </div>
            <Switch.Label className="text-sm leading-6 text-gray-600">
              Acepto y autorizo la{" "}
              <Link
                to="/declaracion-de-privacidad-confidencialidad"
                className="font-semibold text-indigo-600"
              >
                declaración de privacidad y confidencialidad
              </Link>
              .
            </Switch.Label>
          </Switch.Group>
          <Switch.Group as="div" className="flex gap-x-4 sm:col-span-2">
            <div className="flex h-6 items-center">
              <Switch
                name="terms_confirmed"
                checked={termsConfirmed}
                onChange={setTermsConfirmed}
                className={classNames(
                  termsConfirmed ? "bg-indigo-600" : "bg-gray-200",
                  "flex w-8 flex-none cursor-pointer rounded-full p-px ring-1 ring-inset ring-gray-900/5 transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                )}
              >
                <span className="sr-only">
                  Aceptar los términos y condiciones
                </span>
                <span
                  aria-hidden="true"
                  className={classNames(
                    termsConfirmed ? "translate-x-3.5" : "translate-x-0",
                    "h-4 w-4 transform rounded-full bg-white shadow-sm ring-1 ring-gray-900/5 transition duration-200 ease-in-out"
                  )}
                />
              </Switch>
            </div>
            <Switch.Label className="text-sm leading-6 text-gray-600">
              Acepto y autorizo los{" "}
              <Link
                to="/terminos-y-condiciones-marketplace"
                className="font-semibold text-indigo-600"
              >
                términos y condiciones del marketplace
              </Link>
              .
            </Switch.Label>
          </Switch.Group>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="mt-10">
          <button
            disabled={isSubmitDisabled}
            type="submit"
            className={classNames(
              isSubmitDisabled
                ? " bg-gray-300"
                : "cursor-pointer bg-indigo-600 hover:bg-indigo-500",
              "block w-full rounded-md px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            )}
          >
            {isFormSubmitting
              ? "Creando tienda..."
              : "Completar registro"}
          </button>
        </div>
      </Form>
    </div>
  );
}

//
const InputText = ({
  label,
  id,
  type,
  name,
  autoComplete,
  formErrors = [],
  ...props
}) => {
  return (
    <>
      <label
        htmlFor={id}
        className="block text-sm font-semibold leading-6 text-gray-900"
      >
        {label}
      </label>

      <div className="relative mt-2.5 rounded-md shadow-sm">
        <input
          type={type}
          name={name}
          id={id}
          autoComplete={autoComplete}
          className={classNames(
            formErrors.length
              ? "text-red-900 pr-10 ring-red-300 placeholder:text-red-300 border-red-500 focus:ring-red-500"
              : "text-gray-900 ring-gray-300 placeholder:text-gray-400 border-gray-300 focus:ring-indigo-600",
            "block w-full rounded-md border-0 px-3.5 py-2 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          )}
          {...props}
        />
        {formErrors.length ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ExclamationCircleIcon
              className="h-5 w-5 text-red-500"
              aria-hidden="true"
            />
          </div>
        ) : null}
      </div>
      {formErrors.length ? (
        <p className="mt-2 text-sm text-red-600" id="email-error">
          {formErrors?.map((error: string, index: number) => (
            <span key={index}>
              {error}
              <br />
            </span>
          ))}
        </p>
      ) : null}
    </>
  );
};
