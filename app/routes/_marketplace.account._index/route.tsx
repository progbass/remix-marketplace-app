import { useEffect, useState } from "react";
import {
  Form,
  useActionData,
  useNavigation,
  useLoaderData,
} from "@remix-run/react";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import {
  validateName,
  validateEmail,
  validatePassword,
  validateLastName,
  validateUserProfileForm,
} from "./validators";

import AuthService from "~/services/Auth.service";
import getEnv from "get-env";
import classNames from "~/utils/classNames";
import Fetcher from "~/utils/fetcher";
import { redirect } from "react-router-dom";

// Loader function
export async function loader({ request }: ActionFunctionArgs) {
  // Attempt to get user from session
  const userDetails = (await AuthService.isAuthenticated(request)) || null;

  // Redirect to user profile if user is already logged in
  if (!userDetails) {
    return redirect("/login");
  }

  // Return data
  return { userDetails };
}

// Action function
export async function action({ request }: ActionFunctionArgs) {
  // Attempt to get user from session
  const user = (await AuthService.isAuthenticated(request)) || null;

  // Parse form data
  const clonedRequest = request.clone();
  const formData = await clonedRequest.formData();
  let errors = {};

  // Handle form actions
  const formValues = {};
  formData.forEach((value, key) => {
    formValues[key] = value;
  });

  // Validate form
  errors = validateUserProfileForm(formValues);

  // Check for errors
  if (Object.keys(errors).length > 0) {
    return json({ formErrors: errors });
  }

  // Update shopping cart
  const myFetcher = new Fetcher(user?.token, request);
  const userProfileResponse = await myFetcher
    .fetch(`${getEnv().API_URL}/user/profile`, {
      method: "PUT",
      body: formData,
    })
    .catch((err) => {
      console.log('ERROR ', errors)
      errors = err?.errors || { backendError: "Ocurrió un error al actualizar la información. Intenta de nueva más tarde." };
    });

  // Check for errors and return
  if (Object.keys(errors).length > 0) {
    return json({ formErrors: errors });
  }

  // Redirect to user profile
  return null//redirect("/account");
}

//
export default function UserSignupPage() {
  const { userDetails } = useLoaderData<typeof loader>();

  // Navigation
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();

  // Form state
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [isFormPristine, setIsFormPristine] = useState(true);
  const [formErrors, setFormErrors] = useState(actionData?.formErrors || {});
  const [termsConfirmed, setTermsConfirmed] = useState(false);
  const [returnsPolicyConfirmed, setReturnsPolicyConfirmed] = useState(false);
  const [useTermsConfirmed, setUseTermsConfirmed] = useState(false);

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
    !returnsPolicyConfirmed ||
    !useTermsConfirmed ||
    isFormSubmitting ||
    actionData?.store;

  //
  useEffect(() => {
    console.log("todo chido (a según) ", navigation, actionData);
    if (navigation.state === "idle" && actionData?.store) {
      // Confirm stripe payment
      // handlePaymentConfirmation(actionData?.store);
    }
  }, [navigation, actionData]);

  // Return main component
  return (
    <Form method="POST" className="mx-auto mt-12 max-w-5xl">
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            Información personal
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Usa una dirección de email permanente donde puedas recibir
            comunicación.
          </p>

          {/* <div>
            {actionData?.formErrors}
          </div> */}

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <InputText
                label="Nombre"
                id="name"
                type="text"
                name="name"
                defaultValue={userDetails?.name}
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

            <div className="sm:col-span-3">
              <InputText
                label="Apellidos"
                id="lastname"
                type="text"
                name="lastname"
                defaultValue={userDetails?.lastname}
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

            <div className="sm:col-span-4">
              <InputText
                label="Email"
                id="email"
                type="email"
                name="email"
                defaultValue={userDetails?.email}
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

            {/*               
              <div className="sm:col-span-3">
                <label
                  htmlFor="country"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Country
                </label>
                <div className="mt-2">
                  <select
                    id="country"
                    name="country"
                    autoComplete="country-name"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-secondary-600 sm:max-w-xs sm:text-sm sm:leading-6"
                  >
                    <option>United States</option>
                    <option>Canada</option>
                    <option>Mexico</option>
                  </select>
                </div>
              </div>

              <div className="col-span-full">
                <label
                  htmlFor="street-address"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Street address
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="street-address"
                    id="street-address"
                    autoComplete="street-address"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-secondary-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 sm:col-start-1">
                <label
                  htmlFor="city"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  City
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="city"
                    id="city"
                    autoComplete="address-level2"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-secondary-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="region"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  State / Province
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="region"
                    id="region"
                    autoComplete="address-level1"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-secondary-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="postal-code"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  ZIP / Postal code
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="postal-code"
                    id="postal-code"
                    autoComplete="postal-code"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-secondary-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div> */}
          </div>
        </div>

        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            Cambiar contraseña
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Llena este formulario sólo si quieres cambiar tu contraseña.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8">
            <div className="max-w-80">
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

            <div className="max-w-80">
              <InputText
                label="Confirmar contraseña"
                id="password-confirm"
                type="password"
                name="password-confirm"
                autoComplete="password-confirm"
                onChange={(e: HTMLInputElement) => {
                  validateField(e, validatePassword);
                }}
                onBlur={(e: HTMLInputElement) => {
                  validateField(e, validatePassword);
                }}
                formErrors={formErrors?.password}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="submit"
          className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          Actualizar
        </button>
      </div>
    </Form>
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
              : "text-gray-900 ring-gray-300 placeholder:text-gray-400 border-gray-300",
            "block w-full rounded-md border-0 px-3.5 py-2 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-secondary-600 sm:text-sm sm:leading-6"
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
