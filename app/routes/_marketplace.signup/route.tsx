import { FormEvent, useEffect, useState } from "react";
import {
  Form,
  Link,
  useActionData,
  useNavigation,
  useNavigate,
} from "@remix-run/react";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import { Switch } from "@headlessui/react";
import validator from "validator";
import {
  validateUserRegistrationForm,
  validateName,
  validateEmail,
  validatePassword,
} from "./validators";

import AuthService from "~/services/Auth.service";
import getEnv from "get-env";
import classNames from "~/utils/classNames";
import Fetcher from "~/utils/fetcher";
import { redirect } from "react-router-dom";

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
    console.log(key, value);
    formValues[key] = value;
  });

  // Validate form
  errors = validateUserRegistrationForm(formValues);

  // Check for errors
  if (Object.keys(errors).length > 0) {
    return json({ formErrors: errors });
  }

  // // Update shopping cart
  const myFetcher = new Fetcher(user?.token, request);
  const userSignupResponse = await myFetcher
    .fetch(`${getEnv().API_URL}/user/register`, {
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

  await fetch(`${getEnv().API_URL}/sanctum/csrf-cookie`);

  // Attempt to login user
  let [loginResponse, headers] = await AuthService.login({ request, autoRedirect: false }).catch((error) => {
    console.log("error", error);
    const actionData = {
      errors: ["El usuario o contraseña son incorrectos."],
    };
    return json(actionData);
  });

  // If login was unsuccessful, take users to login page
  if (!loginResponse) {
    return redirect("/login");
  }
  console.log("loginResponse", loginResponse);

  // Redirect to user profile
  return redirect("/account", { headers });
}

//
export default function UserSignupPage() {
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
    <div className="isolate bg-white px-6 py-28 lg:px-8">
      <div className="sm:mx-auto sm:w-full max-w-xl">
        <h2 className="text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Crea una cuenta
        </h2>
      </div>

      {/* FORM */}
      <Form method="POST" className="mx-auto mt-12 max-w-xl">
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          {/* FIRST NAME */}
          <div className="sm:col-span-2">
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

          {/* EMAIL */}
          <div>
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

          {/* EMAIL CONFIRM */}
          <div>
            <InputText
              label="Confirmar email"
              id="email-confirm"
              type="email"
              name="email-confirm"
              autoComplete="email-confirm"
              onChange={(e: HTMLInputElement) => {
                validateField(e, validateEmail);
              }}
              onBlur={(e: HTMLInputElement) => {
                validateField(e, validateEmail);
              }}
              formErrors={formErrors?.["email-confirm"]}
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

          {/* TERMS AND CONDITIONS */}
          <Switch.Group as="div" className="flex gap-x-4 sm:col-span-2">
            <div className="flex h-6 items-center">
              <Switch
                name="use-terms_confirmed"
                checked={useTermsConfirmed}
                onChange={setUseTermsConfirmed}
                className={classNames(
                  useTermsConfirmed ? "bg-indigo-600" : "bg-gray-200",
                  "flex w-8 flex-none cursor-pointer rounded-full p-px ring-1 ring-inset ring-gray-900/5 transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                )}
              >
                <span className="sr-only">
                  Acepto los términos y condiciones de uso
                </span>
                <span
                  aria-hidden="true"
                  className={classNames(
                    useTermsConfirmed ? "translate-x-3.5" : "translate-x-0",
                    "h-4 w-4 transform rounded-full bg-white shadow-sm ring-1 ring-gray-900/5 transition duration-200 ease-in-out"
                  )}
                />
              </Switch>
            </div>
            <div className="text-sm leading-6 text-gray-600">
              <Switch.Label>Acepto los </Switch.Label>
              <a
                target="_blank"
                href="/terminos-y-condiciones-de-uso"
                className="font-semibold text-indigo-600"
              >
                términos y condiciones de uso de México Limited
              </a>
              .
            </div>
          </Switch.Group>
          <Switch.Group as="div" className="flex gap-x-4 sm:col-span-2">
            <div className="flex h-6 items-center">
              <Switch
                name="returns-privacy_confirmed"
                checked={returnsPolicyConfirmed}
                onChange={setReturnsPolicyConfirmed}
                className={classNames(
                  returnsPolicyConfirmed ? "bg-indigo-600" : "bg-gray-200",
                  "flex w-8 flex-none cursor-pointer rounded-full p-px ring-1 ring-inset ring-gray-900/5 transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                )}
              >
                <span className="sr-only">
                  Aceptar políticas de envío y devoluciones
                </span>
                <span
                  aria-hidden="true"
                  className={classNames(
                    returnsPolicyConfirmed
                      ? "translate-x-3.5"
                      : "translate-x-0",
                    "h-4 w-4 transform rounded-full bg-white shadow-sm ring-1 ring-gray-900/5 transition duration-200 ease-in-out"
                  )}
                />
              </Switch>
            </div>
            <div className="text-sm leading-6 text-gray-600">
              <Switch.Label>Acepto las </Switch.Label>
              <a
                target="_blank"
                href="/politica-envios-devoluciones"
                className="font-semibold text-indigo-600"
              >
                política de envíos y devoluciones
              </a>
              .
            </div>
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

            <div className="text-sm leading-6 text-gray-600">
              <Switch.Label>Acepto y autorizo los </Switch.Label>
              <a
                target="_blank"
                href="/terminos-y-condiciones-marketplace"
                className="font-semibold text-indigo-600"
              >
                términos y condiciones del marketplace
              </a>
              .
            </div>
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
            {isFormSubmitting ? "Creando tienda..." : "Completar registro"}
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
