import {
  useActionData
} from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Form } from "@remix-run/react";

import AuthService from "../services/Auth.service";
import Errors from "../components/Errors";

export default function App() {
  const actionData = useActionData<typeof action>();
  const errors = actionData?.errors;
  const hasErrors = errors && errors.length > 0;
  const inputClass = `${hasErrors ? 'ring-red-300 focus:ring-red-600 placeholder:text-red-300' : 'ring-gray-300 focus:ring-indigo-600 placeholder:text-gray-400'} block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`;
  
  // Render component
  return (
    <>
      <div className="flex min-h-full flex-1 bg-white">
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div>
              <img
                className="h-10 w-auto"
                src="https://mexicolimited.com/images/logo.png"
                alt="México Limited"
              />
              <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-900">
                Accesa a tu tienda
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                ¿Aún no tienes vendes en México Limited?{' '}<br/>
                <a href="https:mexicolimited.com/asociarse" target="_blank" className="font-semibold text-indigo-600 hover:text-indigo-500">
                  Abre una tienda ahora
                </a>
              </p>
            </div>

            <div className="mt-10">

              <Errors className="mb-5" errors={errors || []}/>

              <div>
                <Form method="post" className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                      Email
                    </label>
                    <div className="mt-2">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                      Contraseña
                    </label>
                    <div className="mt-2">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                      <label htmlFor="remember-me" className="ml-3 block text-sm leading-6 text-gray-700">
                        Recordarme
                      </label>
                    </div>

                    <div className="text-sm leading-6">
                      <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                        ¿Olvidaste tu contraseña?
                      </a>
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >Entrar</button>
                  </div>
                </Form>
              </div>

              <div className="mt-10">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm font-medium leading-6">
                    <span className="bg-white px-6 text-gray-900">O continúa usando</span>
                  </div>
                </div>

                <div className="mt-6">
                  <a
                    href="#"
                    className="flex w-full items-center justify-center gap-3 rounded-md bg-[#1D9BF0] px-3 py-1.5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9BF0]"
                  >
                    <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                    <span className="text-sm font-semibold leading-6">Google</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative hidden w-0 flex-1 lg:block">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="https://images.unsplash.com/flagged/photo-1572465213253-31b7e7f634ec?q=80&w=2890&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt=""
          />
        </div>
      </div>
    </>
  );
}


export async function action({ request, context }: ActionFunctionArgs) {
  // we call the method with the name of the strategy we want to use and the
  // request object, optionally we pass an object with the URLs we want the user
  // to be redirected to after a success or a failure
  let loginResponse = await AuthService.login({request})
    .catch((error) => {
      const actionData = {
        errors: ['El usuario o contraseña son incorrectos.'],
      }
      return json(actionData);
    });

  return loginResponse || null
};

export async function loader({ request }: LoaderFunctionArgs) {
  // If the user is already authenticated redirect to /dashboard directly
  const user = await AuthService.isAuthenticated(request);
  if (user) {
    return redirect("/me");
  };
  return null;
};