import { Fragment, useState } from "react";
import {
  Outlet, useLoaderData
} from "@remix-run/react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Listbox, Transition, Switch } from "@headlessui/react";
import {
  PhotoIcon,
  UserCircleIcon,
  ChevronUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";

import AuthService from "../../services/Auth.service";


const people = [
  { id: 1, name: "Moda" },
  { id: 2, name: "Tecnología" },
  { id: 3, name: "Deportes" },
  { id: 4, name: "Automotriz" },
  { id: 5, name: "Hogar" },
  { id: 6, name: "Diseño" },
  { id: 7, name: "Salud & Belleza" },
  { id: 8, name: "Educación" },
];
const BASE_URL = 'http://127.0.0.1:8000';


// LOADER FUNCTION
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Attempt to get the user from the session
  const user = await AuthService.getCurrentUser({ request });

  // Return response
  return json({ currentUser: user });
};

// ACTION FUNCTION
export const action = async ({ request }: LoaderFunctionArgs) => {
  const body = await request.formData();
  let token = await AuthService.currentToken(request)
  console.log(body, body.id)
  const loginResponse = await fetch(`${BASE_URL}/api/user/profile`, {
    method: "PUT",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
        
    },
    body: JSON.stringify({ id: 724, name: 'data.email' })
  }).catch(err => {
      console.log('caught it!',err);
  });

  // Verify the response
  console.log(loginResponse.ok)
  console.log(loginResponse.status)
  if(loginResponse.ok) {
      // Get the login response
      const user = await loginResponse.json();
      console.log(user)
      // return await Promise.resolve(user);
  }
  


  return null;
}

// MAIN COMPONENT
export default function Settings() {
  const {currentUser} = useLoaderData<typeof loader>();
  const [selected, setSelected] = useState(people[3]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);

  return (
    <>
      <div className="space-y-10 divide-y divide-gray-900/10">
        {/* GENERAL INFORMATION */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Información General
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              This information will be displayed publicly so be careful what you
              share.
            </p>
          </div>

          <form method="post" id="profile-form" className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
            <input type="hidden" name="id" value={currentUser.id} />

            <div className="px-4 py-6 sm:p-8">
              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                {/* PROFILE PHOTO */}
                <div className="col-span-full flex items-center gap-x-8">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
                    className="h-24 w-24 flex-none rounded-lg bg-gray-800 object-cover"
                  />
                  <div>
                    <button
                      type="button"
                      className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      Cambiar imagen de perfil
                    </button>
                    <p className="mt-2 text-xs leading-5 text-gray-400">
                      JPG, GIF or PNG. 1MB max.
                    </p>
                  </div>
                </div>

                {/* FIRST NAME */}
                <div className="sm:col-span-3">
                  <label
                    htmlFor="first-name"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Nombre
                  </label>
                  <div className="mt-2">
                    <input
                      defaultValue={currentUser.name}
                      type="text"
                      name="name"
                      id="name"
                      autoComplete="given-name"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                {/* LAST NAME */}
                <div className="sm:col-span-3">
                  <label
                    htmlFor="last-name"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Apellido
                  </label>
                  <div className="mt-2">
                    <input
                      defaultValue={currentUser.lastname}
                      type="text"
                      name="lastname"
                      id="lastname"
                      autoComplete="family-name"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                {/* EMAIL ADDRESS */}
                <div className="sm:col-span-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Email
                  </label>
                  <div className="mt-2">
                    <input
                      defaultValue={currentUser.email}
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                {/* TELEPHONE */}
                <div className="sm:col-span-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >Teléfono</label>
                  <div className="mt-2">
                    <input
                      defaultValue={currentUser.phone}
                      id="phone"
                      name="phone"
                      type="phone"
                      autoComplete="phone"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                {/* SHOP DESCRIPTION 
                <div className="col-span-full">
                  <label
                    htmlFor="about"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Descripción completa
                  </label>
                  <div className="mt-2">
                    <textarea
                      id="about"
                      name="about"
                      rows={3}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      defaultValue={""}
                    />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    Write a few sentences about your product.
                  </p>
                </div> */}
              </div>

              <div className="mt-8 flex">
                <button
                  type="submit"
                  className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  Guardar
                </button>
              </div>
            </div>
          </form>
        </div>
        {/* END: GENERAL INFORMATION */}

        {/* PASSWORD */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Información General
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              This information will be displayed publicly so be careful what you
              share.
            </p>
          </div>

          <form className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
            <div className="px-4 py-6 sm:p-8">
              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                {/* CURRENT PASSWORD */}
                <div className="col-span-full sm:col-span-4">
                  <label
                    htmlFor="first-name"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >Contraseña actual</label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="first-name"
                      id="first-name"
                      autoComplete="given-name"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                {/* NEW PASSWORD */}
                <div className="col-span-full sm:col-span-4">
                  <label
                    htmlFor="first-name"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >Nueva contraseña</label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="first-name"
                      id="first-name"
                      autoComplete="given-name"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="col-span-full sm:col-span-4">
                  <label
                    htmlFor="first-name"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >Confirma nueva contraseña</label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="first-name"
                      id="first-name"
                      autoComplete="given-name"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        {/* END: PASSWORD */}

        {/* DELETE ACCOUNT */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Eliminar cuenta
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
            No longer want to use our service? You can delete your account here. This action is not reversible. All information related to this account will be deleted permanently.
            </p>
          </div>

          <form className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
            <div className="px-4 py-6 sm:p-8">
              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label
                    htmlFor="website"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    ¿Estás seguro de querer cerrar tu cuenta?
                  </label>
                  <div className="mt-2">
                    <button
                      type="submit"
                      className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400"
                    >Yes, delete my account</button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        {/* END: DELETE */}
      </div>
    </>
  );
}
