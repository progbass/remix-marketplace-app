import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { CheckIcon } from "@heroicons/react/20/solid";
import AuthService from "../services/Auth.service";
import { Link } from "react-router-dom";

import getEnv from "get-env";
import Avatar from "../components/Avatar";

// DUMMY DATA
const stats = [
  // { name: "Vistas totales", stat: "71,897" },
  { name: "Órdenes", stat: "10" },
  { name: "Ventas", stat: "MXN$ 2,800" },
];
const steps = [
  {
    name: "Create account",
    description: "Vitae sed mi luctus laoreet.",
    href: "#",
    status: "complete",
  },
  {
    name: "Profile information",
    description: "Cursus semper viverra facilisis et et some more.",
    href: "#",
    status: "current",
  },
  {
    name: "Business information",
    description: "Penatibus eu quis ante.",
    href: "#",
    status: "upcoming",
  },
  {
    name: "Theme",
    description: "Faucibus nec enim leo et.",
    href: "#",
    status: "upcoming",
  },
  {
    name: "Preview",
    description: "Iusto et officia maiores porro ad non quas.",
    href: "#",
    status: "upcoming",
  },
];
const people = [
  {
    name: "Lindsay Walton",
    title: "Front-end Developer",
    email: "lindsay.walton@example.com",
    role: "Member",
  },
  // More people...
];
const orders = [];


// UTITLIY FUNCTIONS
function slugify(stringToSlugify: string): string {
  // Slugify a string
  return stringToSlugify
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
}

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function fetcher(url: string, options?: RequestInit): Promise<any>{
  console.log(url, options)
  return fetch(url, options)
    .then((res) => {
      if (res.error) {
        throw new Error(res.error);
      }
      return Promise.resolve(res.json());
    })
    .catch((err) => {
      console.error(err);
      throw new Error(err);
    });
}

// LOADER FUNCTION
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Attempt to get the user from the session
  const user = await AuthService.getCurrentUser({ request });

  // Get the shop data
  const shopResponse = await fetcher(`${getEnv().API_URL}/admin/entrepreneurs/${user.id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
    },
  });
  console.log('shopResponse', shopResponse);



  return json({ currentUser: user });
};

// MAIN COMPONENT
export default function Dashboard() {
  const { currentUser } = useLoaderData<typeof loader>();
  const MARKETPLACE_URL = getEnv().MARKETPLACE_URL;

  return (
    <div className="space-y-16 xl:space-y-20">
      {/* HEADER */}
      <div className="md:flex md:items-center md:justify-between md:space-x-5">
        <div className="flex items-start space-x-5">
          <div className="flex-shrink-0">
            <Avatar 
              src={currentUser.imageUrlLogo 
                ? `${MARKETPLACE_URL}/${currentUser.imageUrlLogo}` 
                : undefined
              }
              size="w-16" 
            />
          </div>

          {/*
            Use vertical padding to simulate center alignment when both lines of text are one line,
            but preserve the same layout if the text wraps without making the image jump around.
          */}
          <div className="pt-1.5">
            <h1 className="text-2xl font-bold text-gray-900">
              {currentUser.brand}
            </h1>
            <p className="text-sm font-medium text-gray-500">
              Hola {currentUser.name}
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-3 sm:space-y-0 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
          <a
            href={`${MARKETPLACE_URL}/emprendedor/${slugify(
              currentUser.brand
            )}-${currentUser.id}`}
            target="_blank"
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Ir a mi tienda
          </a>
        </div>
      </div>

      {/* STATS */}
      <div>
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Últimos 30 días
        </h3>
        <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {stats.map((item) => (
            <div
              key={item.name}
              className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
            >
              <dt className="truncate text-sm font-medium text-gray-500">
                {item.name}
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {item.stat}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* ONBOARDING PROGRESS */}
      <div>
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Completa el perfil de tu tienda
        </h3>
        <div className="mt-5 overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <nav aria-label="Progress">
            <ol role="list" className="overflow-hidden">
              {steps.map((step, stepIdx) => (
                <li
                  key={step.name}
                  className={classNames(
                    stepIdx !== steps.length - 1 ? "pb-10" : "",
                    "relative"
                  )}
                >
                  {step.status === "complete" ? (
                    <>
                      {stepIdx !== steps.length - 1 ? (
                        <div
                          className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-indigo-600"
                          aria-hidden="true"
                        />
                      ) : null}
                      <a
                        href={step.href}
                        className="group relative flex items-start"
                      >
                        <span className="flex h-9 items-center">
                          <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 group-hover:bg-indigo-800">
                            <CheckIcon
                              className="h-5 w-5 text-white"
                              aria-hidden="true"
                            />
                          </span>
                        </span>
                        <span className="ml-4 flex min-w-0 flex-col">
                          <span className="text-sm font-medium">{step.name}</span>
                          <span className="text-sm text-gray-500">
                            {step.description}
                          </span>
                        </span>
                      </a>
                    </>
                  ) : step.status === "current" ? (
                    <>
                      {stepIdx !== steps.length - 1 ? (
                        <div
                          className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300"
                          aria-hidden="true"
                        />
                      ) : null}
                      <a
                        href={step.href}
                        className="group relative flex items-start"
                        aria-current="step"
                      >
                        <span
                          className="flex h-9 items-center"
                          aria-hidden="true"
                        >
                          <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-indigo-600 bg-white">
                            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                          </span>
                        </span>
                        <span className="ml-4 flex min-w-0 flex-col">
                          <span className="text-sm font-medium text-indigo-600">
                            {step.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {step.description}
                          </span>
                        </span>
                      </a>
                    </>
                  ) : (
                    <>
                      {stepIdx !== steps.length - 1 ? (
                        <div
                          className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300"
                          aria-hidden="true"
                        />
                      ) : null}
                      <a
                        href={step.href}
                        className="group relative flex items-start"
                      >
                        <span
                          className="flex h-9 items-center"
                          aria-hidden="true"
                        >
                          <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white group-hover:border-gray-400">
                            <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300" />
                          </span>
                        </span>
                        <span className="ml-4 flex min-w-0 flex-col">
                          <span className="text-sm font-medium text-gray-500">
                            {step.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {step.description}
                          </span>
                        </span>
                      </a>
                    </>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      {/* RECENT ORDERS */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            Órdenes recientes
          </h3>
          <Link to="/me/orders" className="text-sm font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
            Ver todas<span className="sr-only"> las órdenes</span>
          </Link>
        </div>
          
        {orders.length > 0 ? (  
          <div className="mt-5 flow-root overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 text-center">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Title
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Role
                      </th>
                      <th
                        scope="col"
                        className="relative py-3.5 pl-3 pr-4 sm:pr-3"
                      >
                        <span className="sr-only">Edit</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {people.map((person) => (
                      <tr key={person.email} className="even:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">
                          {person.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {person.title}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {person.email}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {person.role}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                          <a
                            href="#"
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit<span className="sr-only">, {person.name}</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>

            <h3 className="mt-2 text-sm font-semibold text-gray-900">Aún no tienes órdenes</h3>
            <p className="mt-1 text-sm text-gray-500">Promociona tu tienda para comenzar a vender.</p>
          </div>
        )}
      </div>
    </div>
  );
}
