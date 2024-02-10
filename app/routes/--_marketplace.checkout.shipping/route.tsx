import { Fragment, useState, useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Form, useLoaderData } from "@remix-run/react";
import { redirect } from "@remix-run/node";

import {
  Dialog,
  Popover,
  RadioGroup,
  Tab,
  Transition,
} from "@headlessui/react";
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  ShoppingBagIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";

import getEnv from "get-env";
import Fetcher from "../../utils/fetcher";
import classNames from "~/utils/classNames";
import SelectBox from "~/components/SelectBox";
import InputText from "~/components/InputText";

//
const steps = [
  { name: "Cart", href: "/cart", status: "complete" },
  {
    name: "Billing Information",
    href: "/checkout/shipping",
    status: "current",
  },
  { name: "Confirmation", href: "/checkout/confirm", status: "upcoming" },
];
const products = [
  {
    id: 1,
    title: "Nomad Tumbler",
    name: "Micro Backpack",
    href: "#",
    price: "$70.00",
    color: "Moss",
    size: "5L",
    imageSrc:
      "https://tailwindui.com/img/ecommerce-images/checkout-page-04-product-01.jpg",
    imageAlt:
      "Moss green canvas compact backpack with double top zipper, zipper front pouch, and matching carry handle and backpack straps.",
  },
  // More products...
];
const deliveryMethods = [
  {
    id: 1,
    title: "Standard",
    turnaround: "4–10 business days",
    price: "$5.00",
  },
  { id: 2, title: "Express", turnaround: "2–5 business days", price: "$16.00" },
];
const paymentMethods = [
  { id: "credit-card", title: "Credit card" },
  { id: "paypal", title: "PayPal" },
  { id: "etransfer", title: "eTransfer" },
];

//
interface Neighborhood {
  id: number;
  name: string;
  state: number;
  municipality: number;
  city: number;
}
interface City {
  id: number;
  name: string;
}
interface State {
  id: number;
  name: string;
}
interface Option {
  id: string | number | null;
  name: string;
}

//
const getCities = function async(state_id: number, user: object): Promise<any> {
  const fetcher = new Fetcher();
  return fetcher
    .fetch(`${getEnv().API_URL}/admin/towns/${state_id}`, {})
    .catch((error) => {
      throw new Error("Error fetching states data");
    });
};

//
const getNeighborhoodsByZipCode = async (
  zipCode: number,
  user: object
): Promise<any> => {
  const fetcher = new Fetcher();
  const addressFromZipCode = await fetcher
    .fetch(
      `https://sepomex.icalialabs.com/api/v1/zip_codes?zip_code=${zipCode}`,
      {}
    )
    .catch((error) => {
      console.log(error);
      throw new Error("Error fetching address data from zip code");
    });

  // Update the neighborhood options
  const formattedNeighborhoods = addressFromZipCode.zip_codes.map(
    (neighborhood) => ({
      id: neighborhood.id,
      name: neighborhood.d_asenta,
      state: parseInt(neighborhood.c_estado),
      state_name: neighborhood.d_estado,
      municipality: parseInt(neighborhood.c_mnpio),
      municipality_name: neighborhood.d_mnpio,
      city: parseInt(neighborhood.c_cve_ciudad),
      city_name: neighborhood.d_ciudad,
    })
  );

  //
  return Promise.resolve(formattedNeighborhoods);
};

const getNeighborhoodsByCityName = async (
  cityName: number,
  user: object
): Promise<any> => {
  const fetcher = new Fetcher();
  const addressFromZipCode = await fetcher
    .fetch(
      `https://sepomex.icalialabs.com/api/v1/zip_codes?city=${cityName}`,
      {}
    )
    .catch((error) => {
      console.log(error);
      throw new Error("Error fetching address neighborhoods by city name");
    });

  // Update the neighborhood options
  const formattedNeighborhoods = addressFromZipCode.zip_codes.map(
    (neighborhood) => ({
      id: neighborhood.id,
      name: neighborhood.d_asenta,
      state: parseInt(neighborhood.c_estado),
      state_name: neighborhood.d_estado,
      municipality: parseInt(neighborhood.c_mnpio),
      municipality_name: neighborhood.d_mnpio,
      city: parseInt(neighborhood.c_cve_ciudad),
      city_name: neighborhood.d_ciudad,
    })
  );

  console.log("formattedNeighborhoods", formattedNeighborhoods);

  //
  return Promise.resolve(formattedNeighborhoods);
};

//
const normalizeString = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

//
// Define a debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

//
export async function loader({ request, params }: LoaderFunctionArgs) {
  return {
    currentUser: {},
    shop: {},
    addressStatesList: [],
    addressCitiesList: [],
    addressNeighborhoodsList: [],
  };
}

//
export default function ShippingForm() {
  const {
    currentUser,
    shop,
    addressStatesList,
    addressCitiesList,
    addressNeighborhoodsList,
  } = useLoaderData<typeof loader>();

  // State SelectBox state
  const [statesOptions, setStatesOptions] = useState(addressStatesList);
  const [addressState, setAddressState] = useState(
    statesOptions.find((option: State) => option.id === shop.state_id) || null
  );
  useEffect(() => {
    if (addressState) {
      // console.log('state effect')
      // Get the cities for the selected state
      getCities(addressState.id, currentUser)
        .then((citiestList) => {
          // If we dont have cities, return empty array
          if (!citiestList) {
            setCitiesOptions([]);
            return;
          }

          // Update the cities options
          setCitiesOptions(citiestList);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [addressState]);

  // City SelectBox state
  const [citiesOptions, setCitiesOptions] = useState(addressCitiesList);
  const [addressCity, setAddressCity] = useState(
    citiesOptions.find((option: City) => option.id === shop.town_id) || null
  );
  useEffect(() => {
    if (citiesOptions) {
      // If we have a neighborhood, we need to search for the neighborhood's city
      // else, we set the first item as the default city
      if (addressNeighborhood) {
        const neighborhoodCity: Neighborhood = citiesOptions.find(
          (option: City) =>
            normalizeString(option.name.toLowerCase()) ===
            normalizeString(addressNeighborhood.municipality_name.toLowerCase())
        );
        // console.log(
        //   'neighborhood effect with neighborhood ',
        //   normalizeString(addressNeighborhood.municipality_name.toLowerCase()),
        //   citiesOptions
        // );

        // If we found the neighborhood city, set it as the default
        if (neighborhoodCity) {
          setAddressCity(neighborhoodCity);
          return;
        }
      } else {
        if (citiesOptions[0]) {
          // Attempt to find neighborhood by name
          getNeighborhoodsByCityName(citiesOptions[0].name, currentUser)
            .then((neighborhoods) => {
              // If we dont have neighborhoods, return empty array
              if (!neighborhoods) {
                setCitiesOptions([]);
                return;
              }

              // Set the neighborhood options
              setNeighborhoodOptions(neighborhoods);
            })
            .catch((error) => {
              console.log(error);
            });
        }
      }

      // Set the first city as the default
      setAddressCity(citiesOptions[0]);
    }
  }, [citiesOptions]);

  // Neighborhood SelectBox state
  const [neighborhoodOptions, setNeighborhoodOptions] = useState(
    addressNeighborhoodsList
  );
  const [addressNeighborhood, setAddressNeighborhood] = useState(
    (() => {
      // Verify that we have neighborhood options
      if (neighborhoodOptions.length) {
        // Note: This is a hack to get the initial neighborhood.
        // Previously, users defined the neighborhood name with an input field, so names are inconsistent and we dont have the neighborhood id.
        // So we need to find the neighborhood by name, and if it doesn't exist, we set the first neighborhood as the default.
        let initialNeighborhood = neighborhoodOptions.find(
          (option: Neighborhood) => option.name === shop.neighborhood
        );
        if (!initialNeighborhood) {
          initialNeighborhood = neighborhoodOptions[0];
        }

        return initialNeighborhood;
      }
      return null;
    })()
  );
  useEffect(() => {
    if (neighborhoodOptions.length) {
      // Set the first neighborhood as the default
      const defaultNeighborhood: Neighborhood = neighborhoodOptions[0];
      setAddressNeighborhood(defaultNeighborhood);

      // Set the state where the neighborhood is located
      setAddressState(
        statesOptions.find(
          (option: State) => option.id === defaultNeighborhood.state
        ) || null
      );

      // console.log('neighborhood effect', defaultNeighborhood)
      return;
    }
    setAddressNeighborhood(null);
  }, [neighborhoodOptions]);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState(
    deliveryMethods[0]
  );

  //
  const onZipCodeChange = debounce(async (event) => {
    const zipCode = event.target.value;
    // Verify that the zip code is at least 4
    if (zipCode.length < 4) return;

    // fetch address information from zippopotam/mexico based on the zip code
    const formattedNeighborhoods = await getNeighborhoodsByZipCode(
      zipCode,
      currentUser
    );

    // Update the neighborhood options
    setNeighborhoodOptions(formattedNeighborhoods);
  }, 500);

  //
  return (
    <div>
      <div>
        <h2 className="text-lg font-medium text-gray-900">
          Información de contacto
        </h2>

        <div className="mt-4">
          <label
            htmlFor="email-address"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <div className="mt-1">
            <input
              type="email"
              id="email-address"
              name="email-address"
              autoComplete="email"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-gray-200 pt-10">
        <h2 className="text-lg font-medium text-gray-900">
          Información de entrega
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
          {/* FIRST NAME */}
          <div className="col-span-full sm:col-span-1">
            <label
              htmlFor="first-name"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="first-name"
                name="first-name"
                autoComplete="given-name"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* LAST NAME */}
          <div className="col-span-full sm:col-span-1">
            <label
              htmlFor="last-name"
              className="block text-sm font-medium text-gray-700"
            >
              Apellidos
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="last-name"
                name="last-name"
                autoComplete="family-name"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* STREET ADDRESS */}
          <div className="col-span-full">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Dirección / Calle
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="address"
                id="address"
                autoComplete="street-address"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* EXTERIOR NUMBER */}
          <div className="col-span-1">
            <label
              htmlFor="num_ext"
              className="block text-sm font-medium text-gray-700"
            >
              Número exterior
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="num_ext"
                id="num_ext"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* APARTMENT, ETC. */}
          <div className="col-span-1">
            <label
              htmlFor="apartment"
              className="block text-sm font-medium text-gray-700"
            >
              Interior, departamento, etc.
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="apartment"
                id="apartment"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* ZIP CODE */}
          <div className="col-span-full sm:col-span-1">
            <label
              htmlFor="zipcode"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Código postal
            </label>
            <div className="mt-2">
              <input
                type="number"
                name="zipcode"
                id="zipcode"
                autoComplete="zipcode"
                onChange={(event) => onZipCodeChange(event)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          {/* COUNTRY */}
          <div className="col-span-full sm:col-span-1">
            <label
              htmlFor="country"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              País
            </label>
            <div className="mt-2">
              <select
                disabled
                id="country"
                name="country"
                autoComplete="country-name"
                defaultValue="MX"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
              >
                <option value="MX">Mexico</option>
              </select>
            </div>
          </div>

          {/* NEIGHBORHOOD */}
          <div className="col-span-full">
            <SelectBox
              label="Colonia"
              value={addressNeighborhood}
              onChange={setAddressNeighborhood}
              optionsList={neighborhoodOptions}
            />
            <input
              type="hidden"
              name="neighborhood"
              value={addressNeighborhood?.name || ""}
            />
          </div>

          {/* CITY */}
          <div className="col-span-1">
            <SelectBox
              label="Delegación / Municipio"
              value={addressCity}
              onChange={setAddressCity}
              optionsList={citiesOptions}
            />
            <input type="hidden" name="town_id" value={addressCity?.id || ""} />
          </div>

          {/* STATE */}
          <div className="col-span-1">
            <SelectBox
              label="Estado"
              value={addressState}
              onChange={setAddressState}
              optionsList={statesOptions}
            />
            <input
              type="hidden"
              name="state_id"
              value={addressState?.id || ""}
            />
          </div>

          {/* PHONE */}
          <div className="col-span-full">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="phone"
                id="phone"
                autoComplete="tel"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
