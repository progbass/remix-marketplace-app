import { Fragment, useState, useEffect } from "react";
import {
  useLoaderData,
  useFetcher,
} from "@remix-run/react";
import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  ActionFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  PencilIcon,
  LinkIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";

import AuthService from "../../services/Auth.service";
import getEnv from "get-env";
import fetcher from "../../utils/fetcher";
import slugify from "~/utils/slugify";

import Toast from "~/components/Toast";
import SelectBox from "~/components/SelectBox";
import InputText from "~/components/InputText";
import Dropzone from "~/components/Dropzone";

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
interface FiscalRegime {
  id: string | number;
  name: string;
  value: string;
}
interface Option {
  id: string | number | null;
  name: string;
}

//
const fiscalRegmiesOptions:Array<FiscalRegime> = [
  {id:'fisica', name:'Persona física', value: 'fisica'},
  {id:'moral', name:'Persona moral', value: 'moral' },
]

const getCities = function async(state_id: number, user: object): Promise<any> {
  return fetcher(`${getEnv().API_URL}/admin/towns/${state_id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
    },
  }).catch((error) => {
    throw new Error("Error fetching states data");
  });
};

const getNeighborhoodsByZipCode = async(zipCode: number, user: object): Promise<any> => {
  const addressFromZipCode = await fetcher(
    `https://sepomex.icalialabs.com/api/v1/zip_codes?zip_code=${zipCode}`
  ).catch((error) => {
    console.log(error);
    throw new Error("Error fetching address data from zip code");
  });

  // Update the neighborhood options
  const formattedNeighborhoods = addressFromZipCode.zip_codes.map((neighborhood) => ({
    id: neighborhood.id,
    name: neighborhood.d_asenta,
    state: parseInt(neighborhood.c_estado),
    state_name: neighborhood.d_estado,
    municipality: parseInt(neighborhood.c_mnpio),
    municipality_name: neighborhood.d_mnpio,
    city: parseInt(neighborhood.c_cve_ciudad),
    city_name: neighborhood.d_ciudad,
  }))

  //
  return Promise.resolve(formattedNeighborhoods);
};

const getNeighborhoodsByCityName = async(cityName: number, user: object): Promise<any> => {
  const addressFromZipCode = await fetcher(
    `https://sepomex.icalialabs.com/api/v1/zip_codes?city=${cityName}`
  ).catch((error) => {
    console.log(error);
    throw new Error("Error fetching address neighborhoods by city name");
  });

  // Update the neighborhood options
  const formattedNeighborhoods = addressFromZipCode.zip_codes.map((neighborhood) => ({
    id: neighborhood.id,
    name: neighborhood.d_asenta,
    state: parseInt(neighborhood.c_estado),
    state_name: neighborhood.d_estado,
    municipality: parseInt(neighborhood.c_mnpio),
    municipality_name: neighborhood.d_mnpio,
    city: parseInt(neighborhood.c_cve_ciudad),
    city_name: neighborhood.d_ciudad,
  }))


  console.log('formattedNeighborhoods', formattedNeighborhoods);

  //
  return Promise.resolve(formattedNeighborhoods);
};

const normalizeString = (str) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

const validateForm = (form) => {
  const shopForm =  form;
  const errors = {};

  console.log(form)

  // Brand Name validation
  if(shopForm.brand){
    if (shopForm.brand.trim() === '' || shopForm.brand.length < 3) {
      errors.brand = 'Porfavor ingresa un nombre válido.';
    }
  }
  
  /*// Phone validation
  if (shopForm.phone.trim() === '') {
    errors.phone = 'Please enter a valid phone number.';
  }

  // Shop URL validation
  if (shopForm.shopURL.trim() === '') {
    errors.shopURL = 'Please enter a valid shop URL.';
  }

  // Shop Summary validation
  if (shopForm.comments.trim() === '') {
    errors.comments = 'Please enter a valid shop summary.';
  }

  // Zip Code validation
  if (shopForm.zipcode.length >= 4) {
    errors.zipcode = 'Please enter a valid zip code.';
  }

  // Street Address validation
  if (shopForm.street.trim() !== '' ) {
    errors.street = 'Please enter a valid street address.';
  }

  // Exterior Number validation
  if (shopForm.num_ext.trim() !== '' ) {
    errors.num_ext = 'Please enter a valid exterior number.';
  }

  // Interior Number validation
  if (shopForm.num_int.trim() !== '' ) {
    errors.num_int = 'Please enter a valid interior number.';
  }

  // Neighborhood validation
  if (shopForm.neighborhood.trim() !== '' ) {
    errors.neighborhood = 'Please enter a valid neighborhood.';
  }

  // City validation
  if (shopForm.town_id.trim() !== '' ) {
    errors.town_id = 'Please enter a valid city.';
  }

  // State validation
  if (shopForm.state_id.trim() !== '' ) {
    errors.state_id = 'Please enter a valid state.';
  }

  // Fiscal Regime validation
  if (shopForm.person_type.trim() !== '' ) {
    errors.person_type = 'Please enter a valid fiscal regime.';
  }

  // RFC validation
  if (shopForm.rfc.trim() !== '' ) {
    errors.rfc = 'Please enter a valid RFC.';
  }

  // Bank validation
  if (shopForm.bank.trim() !== '' ) {
    errors.bank = 'Please enter a valid bank.';
  }

  // Bank Account validation
  if (shopForm.bank_account.trim() !== '' ) {
    errors.bank_account = 'Please enter a valid bank account.';
  } */

  // Return true if there are no errors, indicating the form is valid
  return Object.keys(errors).length === 0 ? null : errors;
};

// Define a debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

// LOADER FUNCTION
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Attempt to get the user from the session
  const user = await AuthService.getCurrentUser({ request }).catch((err) => {
    console.log(err);
    return null;
  });

  // Get the shop data
  const shopResponse = await fetcher(
    `${getEnv().API_URL}/admin/entrepreneurs/${user.id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    }
  ).catch((err) => {
    throw new Error("Error fetching shop data");
  });

  const statesResponse = await fetcher(`${getEnv().API_URL}/admin/states`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
    },
  }).catch((error) => {
    throw new Error("Error fetching states data");
  });

  const citiesResponse = await getCities(shopResponse.state_id, user).catch(
    (error) => {
      throw new Error("Error fetching cities data");
    }
  );

  const neighborhoodsResponse = await getNeighborhoodsByZipCode(shopResponse.zipcode, user).catch(
    (error) => {
      throw new Error("Error fetching neighborhoods via zipcode");
    }
  );

  // Return response
  return json({
    currentUser: user,
    shop: shopResponse,
    addressStatesList: statesResponse,
    addressCitiesList: citiesResponse,
    addressNeighborhoodsList: neighborhoodsResponse,
  });
};

// ACTION FUNCTION
export const action: ActionFunction = async ({
  request,
}: {
  request: Request;
}) => {
  // Get the shop data
  const formData = await request.formData();
  let object = {};
  formData.forEach((value, key) => (object[key] = value));

  // Validate the form
  const formErrors = validateForm(object);
  if (formErrors) {
    console.log('form is invalid ', formErrors);
    // If there are validation errors, return early
    return json({
      formErrors,
      toastMessage: {
        title: "Problemas en el formulario",
        message: "Por favor revisa los campos marcados en rojo.",
        type: "error",
      },
    });;
  }

  // Attempt to get the user from the session
  const user = await AuthService.getCurrentUser({ request });

  //
  console.log("action function ", formData);
  const shop = await fetcher(
    `${getEnv().API_URL}/admin/entrepreneurs/${user.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
        Accept: "application/json",
      },
      body: JSON.stringify(object),
    }
  );

  // await db.recipes.delete(id);
  return json({
    formErrors: null,
    toastMessage: {
      title: "¡Listo!",
      message: "Tu información se ha actualizado correctamente.",
      type: "success",
    },
  });
};

// MAIN COMPONENT
export default function Shop() {
  const shopForm = useFetcher();
  const isProcessing = shopForm.state !== "idle";
  const { currentUser, shop, addressStatesList, addressCitiesList, addressNeighborhoodsList } =
    useLoaderData<typeof loader>();
  const formErrors = shopForm.data?.formErrors || null;

  // State SelectBox state
  const [statesOptions, setStatesOptions] = useState(addressStatesList);
  const [addressState, setAddressState] = useState(
    statesOptions.find((option:State) => option.id === shop.state_id) || null
  );
  useEffect(() => {
    if (addressState) {
      // console.log('state effect')
      // Get the cities for the selected state
      getCities(addressState.id, currentUser)
      .then(citiestList => {
        // If we dont have cities, return empty array
        if (!citiestList) {
          setCitiesOptions([]);
          return;
        }        

        // Update the cities options
        setCitiesOptions(citiestList);
      }).catch(
        (error) => {
          console.log(error);
        }
      );
    }
  }, [addressState]);

  // City SelectBox state
  const [citiesOptions, setCitiesOptions] = useState(addressCitiesList);
  const [addressCity, setAddressCity] = useState(
    citiesOptions.find((option:City) => option.id === shop.town_id) || null
  );
  useEffect(() => {
    if(citiesOptions){
      // If we have a neighborhood, we need to search for the neighborhood's city
      // else, we set the first item as the default city
      if (addressNeighborhood) {
        const neighborhoodCity:Neighborhood = citiesOptions.find((option:City) => normalizeString(option.name.toLowerCase()) === normalizeString(addressNeighborhood.municipality_name.toLowerCase()));
        // console.log(
        //   'neighborhood effect with neighborhood ', 
        //   normalizeString(addressNeighborhood.municipality_name.toLowerCase()),
        //   citiesOptions
        // );

        // If we found the neighborhood city, set it as the default
        if(neighborhoodCity){
          setAddressCity(neighborhoodCity);
          return
        }
      } else {
        // Attempt to find neighborhood by name
        getNeighborhoodsByCityName(citiesOptions[0].name, currentUser)
          .then(neighborhoods => {
            // If we dont have neighborhoods, return empty array
            if (!neighborhoods) {
              setCitiesOptions([]);
              return;
            }        

            // Set the neighborhood options
            setNeighborhoodOptions(neighborhoods);
          }).catch((error) => {
            console.log(error);
          });
      }

      // Set the first city as the default
      setAddressCity(citiesOptions[0]);
    }
  }, [citiesOptions]);
  /* useEffect(() => {
    if(addressCity){
      setNeighborhoodOptions([]);
      Attempt to find neighborhood by name
      getNeighborhoodsByCityName(addressCity.name, currentUser)
        .then(neighborhoods => {
          // If we dont have neighborhoods, return empty array
          if (!neighborhoods) {
            setNeighborhoodOptions([]);
            return;
          }  
          
          // Only update the neighborhood options if the new list is different from the current one
          if (JSON.stringify(neighborhoods) !== JSON.stringify(neighborhoodOptions)) {
            console.log('acáaaaambaro ',neighborhoods, neighborhoodOptions);
            // Set the neighborhood options
            setNeighborhoodOptions(neighborhoods);
          }


          // Set the neighborhood options
          // setNeighborhoodOptions(neighborhoods);
        }).catch((error) => {
          console.log(error);
        });
    }
  }, [addressCity]); */

  // Neighborhood SelectBox state
  const [neighborhoodOptions, setNeighborhoodOptions] = useState(addressNeighborhoodsList);
  const [addressNeighborhood, setAddressNeighborhood] = useState((() => {
    // Verify that we have neighborhood options
    if(neighborhoodOptions.length){
      // Note: This is a hack to get the initial neighborhood.
      // Previously, users defined the neighborhood name with an input field, so names are inconsistent and we dont have the neighborhood id.
      // So we need to find the neighborhood by name, and if it doesn't exist, we set the first neighborhood as the default.
      let initialNeighborhood = neighborhoodOptions.find((option:Neighborhood) => option.name === shop.neighborhood);
      if (!initialNeighborhood) {
        initialNeighborhood = neighborhoodOptions[0];
      }

      return initialNeighborhood;
    }
    return null;
  })());
  useEffect(() => {
    if (neighborhoodOptions.length) {
      // Set the first neighborhood as the default
      const defaultNeighborhood:Neighborhood = neighborhoodOptions[0];
      setAddressNeighborhood(defaultNeighborhood);
      
      // Set the state where the neighborhood is located
      setAddressState(
        statesOptions.find((option:State) => option.id === defaultNeighborhood.state)
        || null
      );

      // console.log('neighborhood effect', defaultNeighborhood)
      return
    }
    setAddressNeighborhood(null);
  }, [neighborhoodOptions]);

  // Fiscal regime SelectBox state
  const [fiscalRegime, setFiscalRegime] = useState((() => {
    // Note: This is a hack to get the initial state.
    // We have an enum at the database level that holds machine friendly names,
    // but we need to display a human friendly name at the UI level, so we need to find the regime based on the value comparision.
    let initialRegime:FiscalRegime | Option | null = fiscalRegmiesOptions.find((option:FiscalRegime) => option.value === shop.person_type) || null;
    return initialRegime;
  })());
  
  // Toast state
  const [showToast, setShowToast] = useState(false);
  const toastMessage = shopForm.data?.toastMessage || null;
  
  // Avatar state
  const [avatar, setAvatar] = useState(shop.avatar || null);
  const [checkFormState, setCheckFormState] = useState(false);
  useEffect(() => {
    if (checkFormState && shopForm.state === "idle" && shopForm.data) {
      setCheckFormState(false);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    }
  }, [shopForm, checkFormState]);

  // Functions and methods
  const uploadImage = async (file = null) => {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const avatarResponse = await fetcher(
        `${getEnv().API_URL}/admin/entrepreneurs/${currentUser.id}`,
        {
          method: "PUT",
          headers: {
            ["Content-Type"]: "multipart/form-data",
            Authorization: `Bearer ${currentUser.token}`,
            Accept: "application/json",
          },
          body: formData,
        }
      ).catch((error) => {
        console.log(error);
        throw new Error("Image upload failed");
      });

      // Update the avatar
      setAvatar(avatarResponse.avatar);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const setFormSubmittingState = async (form) => {
    setCheckFormState(true);
  };

  const onZipCodeChange = debounce(async (event) => {
    const zipCode = event.target.value;
    // Verify that the zip code is at least 4
    if (zipCode.length < 4) return;

    // fetch address information from zippopotam/mexico based on the zip code
    const formattedNeighborhoods = await getNeighborhoodsByZipCode(zipCode, currentUser);

    // Update the neighborhood options
    setNeighborhoodOptions(formattedNeighborhoods);    
  }, 500);

  const handleAsyncUpload = async (_action:string, files:Array<any> | File | null) => {
    console.log(files);
    if (!_action) return;
    if (!files) return;
    if (Array.isArray(files) && !files.length) return;

    //
    try {
      let fieldName:string | undefined = undefined;
      switch (_action) {
        case "fiscalDocs":
          fieldName = "cedulafiscal";
          // await uploadCedulaFiscal(files);
          break;
        case "impiDocs":
          fieldName = "registro_impi";
          // await uploadRegistroImpi(files);
          break;
        default:
          break;
      }

      // Setup the form data
      const formData = new FormData();
      if (Array.isArray(files)) {
        files.forEach((file) => {

          fieldName && formData.append(fieldName, file);
          //registro_impi
        });
      } else {
        fieldName && formData.append(fieldName, files);
      }

      // Upload the files
      await fetcher(
        `${getEnv().API_URL}/admin/entrepreneurs/${currentUser.id}`,
        {
          method: "PUT",
          headers: {
            ["Content-Type"]: "multipart/form-data",
            Authorization: `Bearer ${currentUser.token}`,
            Accept: "application/json",
          },
          body: formData,
        }
      ).catch((error) => {
        console.log(error);
        throw new Error("Image upload failed");
      });

      console.log("files uploaded for action ", _action);

      // Update the avatar
      // setAvatar(avatarResponse.avatar);
    } catch (error) {
      console.error("Error uploading image:", error);
    }    
  }

  console.log('errors', formErrors)

  // Render JSX
  return (
    <>
      {/* SHOP COVER */}
      <div className="-mt-10 -mx-8 relative">
        <div className="static">
          <img
            className="h-32 w-full object-cover lg:h-48"
            src={
              "https://images.unsplash.com/photo-1444628838545-ac4016a5418a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
            }
            alt=""
          />
          <div className="absolute justify-end bottom-0 left-0 right-0 mb-3 px-8 flex">
            <span className="sm:ml-3">
              <label
                htmlFor="cover"
                // type="button"
                className="inline-flex items-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                <PencilIcon className="-ml-0.5 sm:mr-1.5 h-5 w-5" aria-hidden="true" />
                <span className="hidden sm:inline-block ">Cambiar foto</span>
              </label>
              <input
                type="file"
                id="cover"
                className="hidden"
                onChange={(e) => handleAsyncUpload('cover', e?.target.files && e?.target.files[0])}
              />
            </span>
          </div>
        </div>
      </div>
      {/* END: SHOP COVER */}

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

          <shopForm.Form
            action="/me/shop"
            method="put"
            className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2"
          >
            <div className="px-4 py-6 sm:p-8">
              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                {/* PROFILE PHOTO */}
                <div className="col-span-full flex items-center gap-x-8">
                  <img
                    src={`${avatar}`}
                    alt=""
                    className="h-24 w-24 flex-none rounded-lg bg-gray-800 object-cover"
                  />
                  <div>
                    <label
                      htmlFor="avatar"
                      className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      Cambiar imagen de perfil
                    </label>
                    <input
                      type="file"
                      id="avatar"
                      className="hidden"
                      onChange={(e) => uploadImage(e.target.files[0])}
                    />
                    <p className="mt-2 text-xs leading-5 text-gray-400">
                      JPG, GIF or PNG. 1MB max. y al menos 500px x 500px.
                    </p>
                  </div>
                </div>

                {/* NAME */}
                <div className="col-span-full sm:col-span-4">
                  <InputText 
                    id="brand"
                    name="brand"
                    type="text"
                    label="Nombre de tu tienda"
                    autoComplete="brand"
                    defaultValue={shop.brand}
                    errors={formErrors?.brand}
                  />
                </div>

                {/* SHOP URL */}
                <div className="col-span-full sm:col-span-5">
                  <label
                    htmlFor="shopURL"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    URL de tu tienda
                  </label>
                  <div className="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600">
                    <span className="flex items-center pl-3 text-gray-400 sm:text-sm">
                      mexicolimited.com/emprendedor/
                    </span>
                    <input
                      id="shopURL"
                      name="shopURL"
                      type="text"
                      disabled
                      value={`${slugify(shop.brand)}-${shop.id}`}
                      placeholder="janesmith"
                      className="w-full flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 focus:ring-0 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                {/* TELEPHONE */}
                <div className="col-span-full sm:col-span-4">
                  <InputText 
                    id="phone"
                    name="phone"
                    type="tel"
                    label="Teléfono"
                    autoComplete="phone"
                    defaultValue={shop.phone}
                    errors={formErrors?.phone}
                  />
                </div>

                {/* SHOP SUMMARY */}
                <div className="col-span-full">
                  <label
                    htmlFor="comments"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Resúmen de tu negocio
                  </label>
                  <div className="mt-2">
                    <textarea
                      id="comments"
                      name="comments"
                      rows={3}
                      defaultValue={shop.comments}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    Write a few sentences about your product.
                  </p>
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

              {/* SUBMIT BUTTON */}
              <div className="mt-8 flex">
                <button
                  type="submit"
                  onClick={setFormSubmittingState}
                  disabled={isProcessing}
                  className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  {isProcessing ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </shopForm.Form>
        </div>
        {/* END: GENERAL INFORMATION */}

        {/* ADDRESS */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Dirección
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              This information will be displayed publicly so be careful what you
              share.
            </p>
          </div>

          <shopForm.Form
            action="/me/shop"
            method="put"
            className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2"
          >
            <div className="px-4 py-6 sm:p-8">
              <div className="grid max-w-2xl gap-x-6 gap-y-8 grid-cols-6">
                {/* ZIP CODE */}
                <div className="col-span-full sm:col-span-2">
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
                      defaultValue={shop.zipcode}
                      onChange={event => onZipCodeChange(event)}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                {/* COUNTRY */}
                <div className="col-span-full sm:col-span-4">
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

                {/* STREET NAME */}
                <div className="col-span-full">
                  <InputText 
                    id="street"
                    name="street"
                    type="text"
                    label="Calle"
                    autoComplete="street"
                    defaultValue={shop.street}
                    errors={formErrors?.street}
                  />
                </div>

                {/* EXT. NUMBER */}
                <div className="col-span-3">
                  <InputText 
                    id="num_ext"
                    name="num_ext"
                    type="text"
                    label="Número exterior"
                    autoComplete="num_ext"
                    defaultValue={shop.num_ext}
                    errors={formErrors?.num_ext}
                  />
                </div>

                {/* SUITE / APARTMENT */}
                <div className="col-span-3">
                  <InputText 
                    id="num_int"
                    name="num_int"
                    type="text"
                    label="Interior / Depto."
                    autoComplete="num_int"
                    defaultValue={shop.num_int}
                    errors={formErrors?.num_int}
                  />
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
                <div className="col-span-full sm:col-span-3">
                  <SelectBox
                    label="Delegación / Municipio"
                    value={addressCity}
                    onChange={setAddressCity}
                    optionsList={citiesOptions}
                  />
                  <input
                    type="hidden"
                    name="town_id"
                    value={addressCity?.id || ""}
                  />
                </div>

                {/* STATE */}
                <div className="col-span-full sm:col-span-3">
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

                {/* REFERENCES */}
                <div className="col-span-full">
                  <label
                    htmlFor="addressReferences"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Referencias
                  </label>
                  <div className="mt-2">
                    <textarea
                      id="addressReferences"
                      name="addressReferences"
                      rows={3}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      defaultValue={""}
                    />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    Write a few sentences about your product.
                  </p>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="mt-8 flex">
                <button
                  type="submit"
                  onClick={setFormSubmittingState}
                  disabled={isProcessing}
                  className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  {isProcessing ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </shopForm.Form>
        </div>
        {/* END: ADDRESS */}

        {/* PAYMENTS */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Pagos
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              We'll always let you know about important changes, but you pick
              what else you want to hear about.
            </p>
          </div>

          <shopForm.Form
            action="/me/shop"
            method="put"
            className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2"
          >
            <div className="px-4 py-6 sm:p-8">
              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                {/* BANK ACCOUNT */}
                <div className="col-span-full">
                  <InputText 
                    id="bank"
                    name="bank"
                    type="text"
                    label="Banco"
                    autoComplete="bank"
                    defaultValue={shop.bank}
                    errors={formErrors?.bank}
                    placeholder="Nombre de tu banco"
                  />
                </div>

                {/* CLABE */}
                <div className="col-span-full">
                  <InputText 
                    id="clabe"
                    name="clabe"
                    type="text"
                    label="CLABE"
                    defaultValue={shop.clabe}
                    errors={formErrors?.clabe}
                  />
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="mt-8 flex">
                <button
                  type="submit"
                  onClick={setFormSubmittingState}
                  disabled={isProcessing}
                  className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  {isProcessing ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </shopForm.Form>
        </div>
        {/* END: PAYMENTS */}

        {/* MORE DETAILS */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Información Fiscal
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              We'll always let you know about important changes, but you pick
              what else you want to hear about.
            </p>
          </div>

          <shopForm.Form
            action="/me/shop"
            method="put"
            className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2"
          >
            <div className="px-4 py-6 sm:p-8">
              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                {/* FISCAL REGIME */}
                <div className="col-span-full sm:col-span-4">
                  <SelectBox
                    label="Colonia"
                    value={fiscalRegime}
                    onChange={setFiscalRegime}
                    optionsList={fiscalRegmiesOptions}
                  />
                  <input
                    type="hidden"
                    name="person_type"
                    value={fiscalRegime?.value || ""}
                  />
                </div>

                {/* RFC */}
                <div className="col-span-full sm:col-span-4">
                  <InputText 
                    id="rfc"
                    name="rfc"
                    type="text"
                    label="RFC"
                    autoComplete="rfc"
                    // defaultValue={shop.clabe}
                    // errors={formErrors?.clabe}
                  />
                </div>

                {/* FISCAL DOCS */}
                <div className="col-span-full">
                  <label
                    htmlFor="fiscalDocs"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Cédula Fiscal
                  </label>
                  <Dropzone
                    name="fiscalDocs"
                    onFilesAdded={files => handleAsyncUpload('fiscalDocs', files)}
                  />
                </div>

                {/* IMPI */}
                <div className="col-span-full">
                  <label
                    htmlFor="impiDocs"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Registro IMPI
                  </label>
                  <Dropzone
                    name="impiDocs"
                    onFilesAdded={files => handleAsyncUpload('impiDocs', files)}
                  />
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="mt-8 flex">
                <button
                  type="submit"
                  onClick={setFormSubmittingState}
                  disabled={isProcessing}
                  className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  {isProcessing ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </shopForm.Form>
        </div>
        {/* END: MORE DETAILS */}

        {/* DELETE */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Vacaciones
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              We'll always let you know about important changes, but you pick
              what else you want to hear about.
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
                    ¿Estás seguro de querer eliminar el producto?
                  </label>
                  <div className="mt-2">
                    <button
                      type="submit"
                      className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400"
                    >
                      Eliminar producto
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        {/* END: DELETE */}
      </div>

      {showToast ? (
        <Toast
          key={"message"}
          title={toastMessage.title}
          message={toastMessage.message}
          type={toastMessage.type}
        />
      ) : null}
    </>
  );
}
