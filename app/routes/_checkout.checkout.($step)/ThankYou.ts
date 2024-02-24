import { Fragment, useState, useEffect, EffectCallback } from "react";
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

import type { ShippingInformation } from "~/utils/ShoppingCart";

import {
  ShoppingCartContext,
  useShoppingCart,
} from "~/providers/ShoppingCartContext";
import { useFetcherConfiguration } from "~/providers/FetcherConfigurationContext";
import getEnv from "get-env";
import Fetcher from "~/utils/fetcher";
import classNames from "~/utils/classNames";
import SelectBox from "~/components/SelectBox";
import InputText from "~/components/InputText";

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
const getCities = function async(stateId: number, user: object): Promise<any> {
  const fetcher = new Fetcher();
  return fetcher
    .fetch(`${getEnv().API_URL}/towns/${stateId}`, {})
    .catch((error) => {
      throw new Error("Error fetching states data");
    });
};

//
const getNeighborhoodsByZipCode = async (
  zipCode: number,
  fetcher: Fetcher
): Promise<any> => {
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
  const addressesAccumulator = [];
  const addressFromZipCode = await fetcher
    .fetch(
      `https://sepomex.icalialabs.com/api/v1/zip_codes?city=${cityName}`,
      {}
    )
    .catch((error) => {
      console.log(error);
      throw new Error("Error fetching address neighborhoods by city name");
    });

  // Check if there are multiple pages
  const totalPages = addressFromZipCode.meta.pagination.total_pages;
  console.log("addressFromZipCode", addressFromZipCode.meta.pagination, totalPages);
  // If there are multiple pages, fetch the rest of the pages
  // by calling this function recursively
  if (false){  //totalPages > 1) {
    const promises = [];
    for (let i = 2; i <= totalPages; i++) {
      promises.push(
        fetcher
          .fetch(
            `https://sepomex.icalialabs.com/api/v1/zip_codes?city=${cityName}&page=${i}`,
            {}
          )
          .catch((error) => {
            console.log(error);
            throw new Error("Error fetching address neighborhoods by city name [pagination]");
          })
      );
    }

    // Wait for all the promises to resolve
    const additionalPages = await Promise.all(promises).catch((error) => {
      console.log(error);
      throw new Error("Error fetching address data from zip code");
    });

    // Concatenate the results
    additionalPages.forEach((page) => {
      addressesAccumulator.push(...page.zip_codes);
    });
  }

  // Update the neighborhood options
  addressesAccumulator.push(...addressFromZipCode.zip_codes);
  const formattedNeighborhoods = addressesAccumulator.map(
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
export default function ShippingForm({ addressStatesList = [] }) {
  const clientSideFetcher: Fetcher = useFetcherConfiguration() as Fetcher;
  const {
    currentUser = null,
    addressCitiesList = [],
    addressNeighborhoodsList = [],
  } = useLoaderData<typeof loader>();

  // Shopping Cart
  const ShoppingCartInstance = useShoppingCart();
  const [shippingAddress, setShippingAddress] = useState<ShippingInformation>(
    ShoppingCartInstance.getShipping()
  );

  // Update the local state when the ShoppingCartInstance changes
  useEffect(() => {
    const updatedAddress = ShoppingCartInstance.getShipping();
    setShippingAddress(updatedAddress);
  }, [ShoppingCartInstance]);

  useEffect(() => {
    let isSubscribed = true;

    const fetchData = async () => {
      // fetch address information from zippopotam/mexico based on the zip code
      const formattedNeighborhoods = await getNeighborhoodsByZipCode(
        shippingAddress.zip,
        clientSideFetcher
      );

      if (isSubscribed) {
        // Update the neighborhood options
        setNeighborhoodOptions(formattedNeighborhoods);
      }
    };

    // call the function
    fetchData()
      // make sure to catch any error
      .catch(console.error);

    // cancel any future `setData`
    return () => (isSubscribed = false);
  }, [shippingAddress]);

  // City SelectBox state
  const [citiesOptions, setCitiesOptions] = useState(addressCitiesList);
  const [addressCity, setAddressCity] = useState<City>(
    citiesOptions.find((option: City) => option.id === shippingAddress?.city) ||
      null
  );
  useEffect(() => {
    let isSubscribed = true;

    const fetchData = async () => {
      console.log("citiesOptions", addressNeighborhood);
      if (addressNeighborhood) {
        const neighborhoodCity: Neighborhood = citiesOptions.find(
          (option: City) =>
            normalizeString(option.name.toLowerCase()) ===
            normalizeString(addressNeighborhood.municipality_name.toLowerCase())
        );

        // If we found the neighborhood city, set it as the default
        if (isSubscribed) {
          //neighborhoodCity) {
          setAddressCity(neighborhoodCity);
          return
        }
      } else {
        if (citiesOptions[0]) {
          // Attempt to find neighborhood by name
          const neighborhoods = await getNeighborhoodsByCityName(
            citiesOptions[0].name,
            currentUser
          ).catch((error) => {
            console.log(error);
          });


          if (isSubscribed) {
            // If we dont have neighborhoods, return empty array
            if (!neighborhoods) {
              setNeighborhoodOptions([]);
              return;
            }

            // Set the neighborhood options
            // setNeighborhoodOptions(neighborhoods);

            // Set the first city as the default
            setAddressCity(citiesOptions[0]);
          }
        }
        return
      }
    };

    // call the function
    fetchData()
      // make sure to catch any error
      .catch(console.error);

    // cancel any future `setData`
    return () => (isSubscribed = false);
  }, [citiesOptions]);
  useEffect(() => {
    if(addressCity){  
      let isSubscribed = true;

      const fetchData = async () => {
        console.log("cambio la opción de delegación ", addressCity);
        
          // Attempt to find neighborhood by name
          const neighborhoods = await getNeighborhoodsByCityName(
            addressCity.name,
            currentUser
          ).catch((error) => {
            console.log(error);
          });


          if (isSubscribed) {
            // If we dont have neighborhoods, return empty array
            if (!neighborhoods) {
              setNeighborhoodOptions([]);
              return;
            }
            console.log("neighborhoods", addressConfigFlow, neighborhoods  )
            // Set the neighborhood options
            if(addressConfigFlow === 'STATE_CONTROLLED'){
              setNeighborhoodOptions(neighborhoods);
            }
            return; 
          }

        return;
      };

      // call the function
      fetchData()
        // make sure to catch any error
        .catch(console.error);

      // cancel any future `setData`
      return () => (isSubscribed = false);
    }
  }, [addressCity]);

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
          (option: Neighborhood) =>
            option.name === shippingAddress?.neighborhood
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
      let defaultNeighborhood = neighborhoodOptions.find(
        (option: Neighborhood) => option.name === shippingAddress?.neighborhood
      );
      console.log(
        "ELIGIENDO EL BARRIO ",
        shippingAddress,
        neighborhoodOptions,
        defaultNeighborhood
      );
      if (!defaultNeighborhood) {
        defaultNeighborhood = neighborhoodOptions[0];
      }
      setAddressNeighborhood(defaultNeighborhood);

      // Set the state where the neighborhood is located
      if(addressConfigFlow === 'ZIP_CODE_CONTROLLED'){
        setAddressState(
          statesOptions.find(
            (option: State) => option.id === defaultNeighborhood.state
          )
        );
      }

      // Exit function
      return;
    }

    // Default value
    setAddressNeighborhood(null);
  }, [neighborhoodOptions]);

  // State SelectBox state
  const statesOptions = addressStatesList;
  const [addressState, setAddressState] = useState(
    addressStatesList.find(
      (option: State) => option.id == shippingAddress.state
    )
  );
  useEffect(() => {
    let isSubscribed = true;
    // addressConfigFlow = 'STATE_CONTROLLED';

    if (addressState) {
      const handler = async () => {
        // Get the cities for the selected state
        const citiestList = await getCities(addressState.id, currentUser).catch(
          (error) => {
            console.log(error);
          }
        );
        if (isSubscribed) {
          // If we dont have cities, return empty array
          if (!citiestList) {
            setCitiesOptions([]);
            return;
          }
          // Update the cities options
          setCitiesOptions(citiestList);
        }
      };

      handler().catch((error) => {
        console.log(error);
      });
    }

    // cancel any future `setData`
    return () => (isSubscribed = false);
  }, [addressState]);

  //
  const [addressConfigFlow, setAddressConfigFlow] = useState('ZIP_CODE_CONTROLLED');
  const onZipCodeChange = debounce(async (event) => {
    console.log("onZipCodeChange");
    const zipCode = event.target.value;
    // Verify that the zip code is at least 4
    if (zipCode.length < 4) return;

    // fetch address information from zippopotam/mexico based on the zip code
    const formattedNeighborhoods = await getNeighborhoodsByZipCode(
      zipCode,
      clientSideFetcher
    );

    // Update the neighborhood options
    setAddressConfigFlow('ZIP_CODE_CONTROLLED');
    setNeighborhoodOptions(formattedNeighborhoods);
  }, 500);


  function handleAddressStateInputChange (option:Option) {
    setAddressConfigFlow('STATE_CONTROLLED');
    setAddressNeighborhood(null);
    setAddressState(option);
  }
  function handleAddressCityInputChange (option:Option) {
    setAddressConfigFlow('STATE_CONTROLLED');
    setAddressNeighborhood(null);
    setAddressCity(option);
  }

  //
  return (
    <>
      <div>
        <h2 className="text-lg font-medium text-gray-900">
          Información de contacto
        </h2>

        <div className="mt-4">
          <InputText
              id="email-address"
              name="user[email]"
              type="text"
              label="Email"
              autoComplete="email"
              defaultValue={shippingAddress.email}
              // errors={formErrors?.brand}
          />
        </div>
      </div>

      <div className="mt-10 border-t border-gray-200 pt-10">
        <h2 className="text-lg font-medium text-gray-900">
          Información de entrega
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
          {/* FIRST NAME */}
          <div className="col-span-full sm:col-span-1">
            <InputText
              id="first-name"
              name="user[name]"
              type="text"
              label="Nombre"
              autoComplete="name"
              defaultValue={shippingAddress.name}
              // errors={formErrors?.brand}
            />
          </div>

          {/* LAST NAME */}
          <div className="col-span-full sm:col-span-1">
            <InputText
              id="last-name"
              name="user[lastname]"
              type="text"
              label="Apellidos"
              autoComplete="lastname"
              defaultValue={shippingAddress.lastname}
              // errors={formErrors?.brand}
            />
          </div>

          {/* STREET ADDRESS */}
          <div className="col-span-full">
            <InputText
              id="address"
              name="user[street]"
              type="text"
              label="Dirección / Calle"
              autoComplete="street"
              defaultValue={shippingAddress.street}
              // errors={formErrors?.brand}
            />
          </div>

          {/* EXTERIOR NUMBER */}
          <div className="col-span-1">
            <InputText
              id="num_ext"
              name="user[num_ext]"
              type="text"
              label="Número exterior"
              autoComplete="num_ext"
              defaultValue={shippingAddress.num_ext}
              // errors={formErrors?.brand}
            />
          </div>

          {/* APARTMENT, ETC. */}
          <div className="col-span-1">
            <InputText
              id="num_int"
              name="user[num_int]"
              type="text"
              label="Interior, departamento, etc."
              autoComplete="num_int"
              defaultValue={shippingAddress.num_int}
              // errors={formErrors?.brand}
            />
          </div>

          {/* ZIP CODE */}
          <div className="col-span-full sm:col-span-1">
            <InputText
              id="zipcode"
              name="user[zipcode]"
              type="text"
              label="Código postal"
              autoComplete="zipcode"
              defaultValue={shippingAddress.zipcode}
              onChange={(event) => onZipCodeChange(event)}
              // errors={formErrors?.brand}
            />
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
                name="user[country]"
                autoComplete="country"
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
              name="user[neighborhood]"
              value={addressNeighborhood?.name || ""}
            />
          </div>

          {/* CITY */}
          <div className="col-span-1">
            <SelectBox
              label="Delegación / Municipio"
              value={addressCity}
              onChange={handleAddressCityInputChange}
              optionsList={citiesOptions}
            />
            <input type="hidden" name="user[town_id]" value={addressCity?.id || ""} />
            <input type="hidden" name="cityName" value={addressCity?.name || ""} />
          </div>

          {/* STATE */}
          <div className="col-span-1">
            <SelectBox
              label="Estado"
              value={addressState}
              onChange={handleAddressStateInputChange}
              optionsList={statesOptions}
            />
            <input type="hidden" name="user[state_id]" value={addressState?.id || ""} />
            <input type="hidden" name="stateName" value={addressState?.name || ""} />
          </div>

          {/* PHONE */}
          <div className="col-span-full">
            <InputText
              id="phone"
              name="user[phone]"
              type="text"
              label="Teléfono"
              autoComplete="phone"
              defaultValue={shippingAddress.phone}
              // errors={formErrors?.brand}
            />
          </div>
        </div>
      </div>
    </>
  );
}
