import { useState, useEffect, ChangeEvent } from "react";
import { useLoaderData } from "@remix-run/react";
import { FetcherWithComponents } from "@remix-run/react";

import { useShoppingCart } from "~/providers/ShoppingCartContext";
import { useFetcherConfiguration } from "~/providers/FetcherConfigurationContext";
import getEnv from "get-env";
import Fetcher from "~/utils/fetcher";
import SelectBox from "~/components/SelectBox";
import InputText from "~/components/InputText";
import {
  validateAddressNumber,
  validateCity,
  validateEmail,
  validateLastName,
  validateName,
  validateNeighborhood,
  validatePhone,
  validateShippingAddressForm,
  validateState,
  validateStreet,
  validateZip,
} from "./formValidators";

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
  zipCode: string | number,
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

// Define a debounce function
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return function (...args: any) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

// COMPONENT DEFINITION
export default function ShippingForm({
  addressStatesList = [],
  formFetcher,
  formRef,
  onFormCompleted = () => undefined,
}: {
  formRef: React.RefObject<HTMLFormElement> | undefined;
  addressStatesList: State[];
  formFetcher: FetcherWithComponents<any>;
  onFormCompleted: Function;
}) {
  const clientSideFetcher: Fetcher = useFetcherConfiguration() as Fetcher;
  const { currentUser = null, addressCitiesList = [] } =
    useLoaderData<typeof loader>();

  // Shopping Cart
  const ShoppingCartInstance = useShoppingCart();
  const shippingAddress = ShoppingCartInstance.getShipping();

  // City SelectBox state
  const [citiesOptions, setCitiesOptions] = useState(addressCitiesList);
  const [addressCity, setAddressCity] = useState<City>(
    citiesOptions.find(
      (option: City) => option.id === shippingAddress?.town_id
    )
  );
  useEffect((): void => {
    let isSubscribed = true;

    const fetchData = async () => { 
      if (citiesOptions[0]) {
        if (isSubscribed) {
          // Find the city that matches the shipping address's city
          const selectedCity =
            citiesOptions.find(
              (option: City) => option.id === shippingAddress?.town_id
            ) || citiesOptions[0]; // Or set the first city as the default

          setAddressCity(selectedCity);

          // If there is a city selected, validate the form
          if (onFormCompleted) {
            setTimeout(() => onFormCompleted(isFormCompleted()), 50);
          }
        }
        return;
      }
    };

    // call the function
    fetchData().catch(console.error); // make sure to catch any error

    // cancel any future `setData`
    return () => (isSubscribed = false);
  }, [citiesOptions]);

  // Neighborhood state
  const [addressNeighborhood, setAddressNeighborhood] = useState(
    shippingAddress.neighborhood
  );

  // State SelectBox state
  const statesOptions = addressStatesList;
  const [addressState, setAddressState] = useState(
    addressStatesList.find(
      (option: State) => option.id == shippingAddress.state_id
    )
  );
  useEffect(() => {
    let isSubscribed = true;

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
  const onZipCodeChange = debounce(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const zipCode: string = event.target.value;
      // Verify that the zip code is at least 4
      if (zipCode.length < 4) return;

      // fetch address information from zippopotam/mexico based on the zip code
      const formattedNeighborhoods = await getNeighborhoodsByZipCode(
        zipCode,
        clientSideFetcher
      );

      // Find the correct state whithin the statesList array
      const selectedState = addressStatesList.find(
        (state: State) => state.id === formattedNeighborhoods[0].state
      );
      setAddressState(selectedState);
    },
    500
  );

  //
  function handleAddressStateInputChange(option: Option) {
    setAddressState(option);
  }

  //
  function handleAddressCityInputChange(option: Option) {
    setAddressCity(option);
  }

  // Form handlers and validations
  const [isFormPristine, setIsFormPristine] = useState(true);
  const [formErrors, setFormErrors] = useState(
    formFetcher?.data?.formErrors || {}
  );
  function validateField(
    event: {name: string, value: string|number|null},
    validator: Function
  ): void {
    // If the form is pristine, skip validation
    if (isFormPristine) {
      // return;
    }

    // Validate field
    const [isValid, errors] = validator(event.value);

    // Update form errors
    const newErrorsState = isValid
      ? (prev: { [key: string]: [string] }) => {
          // Get all values from the previous state exept the current field
          const { [event.name]: _, ...rest } = prev;
          return rest;
        }
      : (prev: { [key: string]: [string] }) => ({
          ...prev,
          [event.name]: errors,
        });

    // Display the form errors
    setFormErrors(newErrorsState);

    // if there are no formErrors, then the form is completed
    if (onFormCompleted) {
      onFormCompleted(isFormCompleted());
      return;
    }

    return;
  }

  function isFormCompleted(): boolean {
    const formData = new FormData(formRef.current);
    const formValues: { [key: string]: any } = {};
    formData.forEach((value, key) => {
      formValues[key] = value;
    });

    // Check if the form is completed
    const formErrors = validateShippingAddressForm(formValues);
    const isFormValid = Object.keys(formErrors).length === 0;

    return isFormValid;
  }
  useEffect(() => {
    if (onFormCompleted) {
      onFormCompleted(isFormCompleted());
    }
  }, []);

  // Return the component
  return (
    <>
      <div>
        <h2 className="text-lg font-medium text-gray-900">
          Información de contacto
        </h2>

        {/* RECEIVER EMAIL */}
        <div className="mt-4">
          <InputText
            id="email-address"
            name="user[email]"
            type="text"
            label="Email"
            autoComplete="email"
            defaultValue={shippingAddress.email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              validateField({name: e.target.name, value: e.target.value}, validateEmail);
            }}
            onBlur={(e: ChangeEvent<HTMLInputElement>) => {
              validateField({name: e.target.name, value: e.target.value}, validateEmail);
            }}
            errors={formErrors?.["user[email]"]}
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                validateField({name: e.target.name, value: e.target.value}, validateName);
              }}
              onBlur={(e: ChangeEvent<HTMLInputElement>) => {
                validateField({name: e.target.name, value: e.target.value}, validateName);
              }}
              errors={formErrors?.["user[name]"]}
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                validateField({name: e.target.name, value: e.target.value}, validateLastName);
              }}
              onBlur={(e: ChangeEvent<HTMLInputElement>) => {
                validateField({name: e.target.name, value: e.target.value}, validateLastName);
              }}
              errors={formErrors?.["user[lastname]"]}
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                validateField({name: e.target.name, value: e.target.value}, validateStreet);
              }}
              onBlur={(e: ChangeEvent<HTMLInputElement>) => {
                validateField({name: e.target.name, value: e.target.value}, validateStreet);
              }}
              errors={formErrors?.["user[street]"]}
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                validateField({name: e.target.name, value: e.target.value}, validateAddressNumber);
              }}
              onBlur={(e: ChangeEvent<HTMLInputElement>) => {
                validateField({name: e.target.name, value: e.target.value}, validateAddressNumber);
              }}
              errors={formErrors?.["user[num_ext]"]}
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
              // onChange={(e: ChangeEvent<HTMLInputElement>) => {
              //   validateField({name: e.target.name, value: e.target.value}, validateAddressNumber);
              // }}
              // onBlur={(e: ChangeEvent<HTMLInputElement>) => {
              //   validateField({name: e.target.name, value: e.target.value}, validateAddressNumber);
              // }}
              errors={formErrors?.["user[num_int]"]}
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                onZipCodeChange(e);
                validateField({name: e.target.name, value: e.target.value}, validateZip);
              }}
              onBlur={(e: ChangeEvent<HTMLInputElement>) => {
                validateField({name: e.target.name, value: e.target.value}, validateZip);
              }}
              errors={formErrors?.["user[zipcode]"]}
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

          {/* STATE */}
          <div className="col-span-1">
            <SelectBox
              label="Estado"
              value={addressState}
              onChange={(e:Option) => {
                handleAddressStateInputChange(e);
              }}
              optionsList={statesOptions}
            />
            <input
              type="hidden"
              name="user[state_id]"
              value={addressState?.id || ""}
            />
            <input
              type="hidden"
              name="user[stateName]"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                validateField({name: e.target.name, value: e.target.value}, validateState);
              }}
              value={addressState?.name || ""}
            />

            {formErrors?.["user[stateName]"]?.length ? (
              <p className="mt-2 text-sm text-red-600" id="state-error">
                {formErrors?.map((error: string, index: number) => (
                  <span key={index}>
                    {error}
                    <br />
                  </span>
                ))}
              </p>
            ) : null}
          </div>

          {/* CITY */}
          <div className="col-span-1">
            <SelectBox
              label="Delegación / Municipio"
              value={addressCity}
              onChange={(e: Option) => {
                handleAddressCityInputChange(e);
              }}
              optionsList={citiesOptions}
            />
            <input
              type="hidden"
              name="user[town_id]"
              value={addressCity?.id || ""}
            />
            <input
              type="hidden"
              name="user[cityName]"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                validateField({name: e.target.name, value: e.target.value}, validateCity);
              }}
              value={addressCity?.name || ""}
            />

            {formErrors?.["user[cityName]"]?.length ? (
              <p className="mt-2 text-sm text-red-600" id="city-error">
                {formErrors?.map((error: string, index: number) => (
                  <span key={index}>
                    {error}
                    <br />
                  </span>
                ))}
              </p>
            ) : null}
          </div>

          {/* NEIGHBORHOOD */}
          <div className="col-span-full">
            {/* <SelectBox
              label="Colonia"
              value={addressNeighborhood}
              onChange={setAddressNeighborhood}
              optionsList={neighborhoodOptions}
            />
            <input
              type="hidden"
              name="user[neighborhood]"
              value={addressNeighborhood?.name || ""}
            /> */}
            <InputText
              id="phone"
              name="user[neighborhood]"
              type="text"
              label="Colonia"
              autoComplete="neighborhood"
              defaultValue={addressNeighborhood || ""}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                validateField({name: e.target.name, value: e.target.value}, validateNeighborhood);
              }}
              onBlur={(e: ChangeEvent<HTMLInputElement>) => {
                validateField({name: e.target.name, value: e.target.value}, validateNeighborhood);
              }}
              errors={formErrors?.["user[neighborhood]"]}
            />
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                validateField({name: e.target.name, value: e.target.value}, validatePhone);
              }}
              onBlur={(e: ChangeEvent<HTMLInputElement>) => {
                validateField({name: e.target.name, value: e.target.value}, validatePhone);
              }}
              errors={formErrors?.["user[phone]"]}
            />
          </div>
        </div>
      </div>
    </>
  );
}
