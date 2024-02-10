import { Fragment, useRef, useState } from "react";
import { Link, useLoaderData, useFetcher } from "@remix-run/react";
import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  ActionFunction,
} from "@remix-run/node";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import { collapseTextChangeRangesAcrossMultipleVersions } from "typescript";
import { FaceSmileIcon } from "@heroicons/react/24/solid";

import type { ProductVariation } from "~/types/ProductVariation";
import type { Product } from "~/types/Product";
import AuthService from "../../services/Auth.service";
import getEnv from "get-env";
import fetcher from "../../utils/fetcher";

import Dropzone from "~/components/Dropzone";
import DropzoneSync from "~/components/DropzoneSync";

// TYPES
interface ProductVariationFormProps {
  variation: ProductVariation | null;
  product: { [key: string]: any };
  onCancel?: null | (() => void);
  onSubmit?: null | ((variation: ProductVariation | null) => void);
  onImageAdd?: null | ((imageIndex: number | string) => void);
  onImageDelete?: null | ((imageIndex: number | string) => void);
}

// COMPONENT
export default function ProductVariationForm({
  variation,
  product,
  onImageAdd = null,
  onImageDelete = null,
  onSubmit = null,
  onCancel = null,
}: ProductVariationFormProps) {
  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);
  const productVariationForm = useFetcher();
  const productVariationFormActionData: {} | null =
    productVariationForm.data || null;
  let currentVaritionIndex = 0;
  const [imageUrl, setImageUrl] = useState(variation ? variation.imageUrl : "");
  const [imageUrlTwo, setimageUrlTwo] = useState(
    variation ? variation.imageUrlTwo : ""
  );
  const [imageUrlThree, setimageUrlThree] = useState(
    variation ? variation.imageUrlThree : ""
  );
  const [image3Url, setImage3Url] = useState(
    variation ? variation.image3Url : ""
  );

  console.log("productVariationFormActionData", productVariationFormActionData);

  //
  const [currentVariation, setCurrentVariation] = useState(variation);
  const handleVariationInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name: keyName, value } = event.target;
    if (currentVariation) {
      setCurrentVariation({
        ...currentVariation,
        [keyName]: value,
      });
    }
  };

  // Verify if data has been submitted.
  // If so, send signal to parent component.
  if (
    productVariationForm.state == "idle" &&
    productVariationFormActionData?.product
  ) {
    if (onSubmit) onSubmit(productVariationFormActionData?.product.models);
  }

  // Delete image
  const handleImageDelete = (keyName: string, type: string) => {
    if (onImageDelete) {
      onImageDelete(keyName);
    }
  };

  // Upload image
  const [selectedImage0, setSelectedImage0] = useState();
  const handleAsyncUpload = async (
    imageId: string,
    files: Array<File> | File | null
  ) => {
    // Validate
    if (!imageId) return;
    if (!files) return;
    if (Array.isArray(files) && !files.length) return;

    // Set the value into the hidden input field
    setSelectedImage0(files);
  };

  // Validate form
  const validateVariationsForm = async (variationsForm: ProductVariation) => {
    let hasErrors = false;
    let errors = {};

    // Verify that currentVariation exists
    if (!currentVariation) {
      errors = {
        ...errors,
        generic: "The current variation is not defined",
      };
      hasErrors = true;
    }

    console.log(currentVariation);

    // Validate the form
    if (!currentVariation?.size) {
      errors = {
        ...errors,
        size: "El nombre de la variación es requerido",
      };
      hasErrors = true;
    }
    if (!currentVariation?.sku) {
      errors = {
        ...errors,
        sku: "El sku es requerido",
      };
      hasErrors = true;
    }
    if (!currentVariation?.stock) {
      errors = {
        ...errors,
        stock: "El stock es requerido",
      };
      hasErrors = true;
    }
    if (!currentVariation?.longg) {
      errors = {
        ...errors,
        longg: "El largo del producto es requerido",
      };
      hasErrors = true;
    }
    if (!currentVariation?.high) {
      errors = {
        ...errors,
        high: "La altura del producto es requerida",
      };
      hasErrors = true;
    }
    if (!currentVariation?.width) {
      errors = {
        ...errors,
        width: "El ancho del producto es requerido",
      };
      hasErrors = true;
    }
    if (!currentVariation?.weight) {
      errors = {
        ...errors,
        weight: "El peso del producto es requerido",
      };
      hasErrors = true;
    }
    if (!currentVariation?.position) {
      currentVariation.position = 0;
    }

    // Return the errors
    if (hasErrors) {
      return Promise.reject(errors);
    }

    // Setup the form data
    const formData = new FormData();
    // Add product id and user id to the request
    formData.append("id", productDetails.id);
    formData.append("users_id", productDetails.users_id);
    formData.append("stocktype", "sizes");
    Array.from(Object.keys(currentVariation)).forEach((keyName: string) => {
      formData.append(keyName, currentVariation[keyName]);
    });

    const allVariations = [...productVariations, currentVariation];
    allVariations.forEach((variation: ProductVariation, index: number) => {
      Array.from(Object.keys(variation)).forEach((keyName: string) => {
        formData.append(`models[${index}][${keyName}]`, variation[keyName]);
      });
    });
    const productUpdate = await fetcher(
      `${getEnv().API_URL}/admin/myproducts/${productDetails.id}`,
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
      throw new Error("Failed updating product models");
    });

    console.log("variationsList", productUpdate);
    setProductVariations(productUpdate?.models || []);

    return Promise.resolve(true);
  };

  // Render product variation
  const renderProductVariation = (variation: ProductVariation) => {
    if(currentVariation?.id === variation.id) return null;

    //
    const component = (
      <Fragment key={variation.id}>
        {Object.keys(variation).map((keyName) => (
          <input
            key={keyName}
            type="hidden"
            name={`models[${currentVaritionIndex}][${keyName}]`}
            value={variation[keyName]}
          />
        ))}
      </Fragment>
    );

    currentVaritionIndex++;
    return component;
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    setOpen(false);
  };

  // Render component
  return (
    <productVariationForm.Form
      method="put"
      id="productVariation-form"
      encType="multipart/form-data"
    >
      {/* FORM ACTION  */}
      <input
        type="hidden"
        name="_action"
        value={currentVariation ? "updateVariation" : "createVariation"}
      />
      <input type="hidden" name="stocktype" value={"sizes"} />
      <input type="hidden" name="id" value={product.id} />
      <input type="hidden" name="users_id" value={product.users_id} />
      {/* If we're updating the product, send all current models as hidden fields */}
      {product.models.map((variation: ProductVariation, index: number) => {
        return renderProductVariation(variation)
      })}

        <input type="hidden" name={`models[${currentVaritionIndex}][id]`} value={currentVariation?.id ? currentVariation.id : undefined } />
      <input type="hidden" name={`models[${currentVaritionIndex}][position]`} value={currentVariation?.position ? currentVariation.position : 0} />

      {/* DIALOG TITLE */}
      <div>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
        </div>
        <div className="mt-3 text-center sm:mt-5">
          <Dialog.Title
            as="h3"
            className="text-base font-semibold leading-6 text-gray-900"
          >
            Payment successful
          </Dialog.Title>
          <div className="mt-2">
            {/* Form Errors */}
            {productVariationFormActionData?.errors && (
              <div className="text-red-500">
                {Object.keys(productVariationFormActionData?.errors.errors).map(
                  (keyName) => (
                    <div key={keyName}>
                      {productVariationFormActionData.errors.errors[keyName]}
                    </div>
                  )
                )}
              </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="col-span-full">
                <h3 className="text-base font-semibold leading-7 text-gray-900">
                  Información general
                </h3>
                <div className="sm:col-span-4 mt-4">
                  {/* Variations */}
                  <div className="flex items-baseline">
                    <label
                      htmlFor="size"
                      className="block w-36 mr-2 mb-4 text-sm font-medium leading-6 text-gray-900"
                    >
                      Talla/Variación/Modelo
                    </label>
                    <div>
                      <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                        <input
                          id="size"
                          name={`models[${currentVaritionIndex}][size]`}
                          type="text"
                          autoComplete="size"
                          onChange={handleVariationInputChange}
                          defaultValue={
                            currentVariation ? currentVariation.size : ""
                          }
                          placeholder="Identificador único"
                          className="block flex-1 border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SKU */}
                  <div className="flex items-baseline">
                    <label
                      htmlFor="sku"
                      className="block w-36 mr-2 mb-4 text-sm font-medium leading-6 text-gray-900"
                    >
                      Sku
                    </label>
                    <div>
                      <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                        <input
                          id="sku"
                          name={`models[${currentVaritionIndex}][sku]`}
                          type="text"
                          autoComplete="sku"
                          onChange={handleVariationInputChange}
                          defaultValue={
                            currentVariation ? currentVariation.sku : ""
                          }
                          placeholder="Identificador único"
                          className="block flex-1 border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stock */}
                  <div className="flex items-baseline">
                    <label
                      htmlFor="stock"
                      className="block w-36 mr-2 mb-4 text-sm font-medium leading-6 text-gray-900"
                    >
                      Inventario
                    </label>
                    <div>
                      <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                        <input
                          id="stock"
                          name={`models[${currentVaritionIndex}][stock]`}
                          type="text"
                          autoComplete="stock"
                          onChange={handleVariationInputChange}
                          defaultValue={
                            currentVariation ? currentVariation.stock : ""
                          }
                          placeholder="0"
                          className="block flex-1 border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-full">
                <h3 className="text-base font-semibold leading-7 text-gray-900">
                  Especificaciones
                </h3>
                <div className="sm:col-span-4 mt-4">
                  {/* Length */}
                  <div className="flex items-baseline">
                    <label
                      htmlFor="longg"
                      className="block w-36 mr-2 mb-4 text-sm font-medium leading-6 text-gray-900"
                    >
                      Largo
                    </label>
                    <div>
                      <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                        <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                          Cm.
                        </span>
                        <input
                          type="text"
                          name={`models[${currentVaritionIndex}][longg]`}
                          id="longg"
                          className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                          placeholder="0.00"
                          onChange={handleVariationInputChange}
                          defaultValue={
                            currentVariation ? currentVariation.longg : ""
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Height */}
                  <div className="flex items-baseline">
                    <label
                      htmlFor="high"
                      className="block w-36 mr-2 mb-4 text-sm font-medium leading-6 text-gray-900"
                    >
                      Alto
                    </label>
                    <div>
                      <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                        <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                          Cm.
                        </span>
                        <input
                          type="text"
                          name={`models[${currentVaritionIndex}][high]`}
                          id="high"
                          className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                          placeholder="0.00"
                          onChange={handleVariationInputChange}
                          defaultValue={
                            currentVariation ? currentVariation.high : ""
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Width */}
                  <div className="flex items-baseline">
                    <label
                      htmlFor="width"
                      className="block w-36 mr-2 mb-4 text-sm font-medium leading-6 text-gray-900"
                    >
                      Ancho
                    </label>
                    <div>
                      <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                        <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                          Cm.
                        </span>
                        <input
                          type="text"
                          name={`models[${currentVaritionIndex}][width]`}
                          id="width"
                          className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                          placeholder="0.00"
                          onChange={handleVariationInputChange}
                          defaultValue={
                            currentVariation ? currentVariation.width : ""
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Weight */}
                  <div className="flex items-baseline">
                    <label
                      htmlFor="weight"
                      className="block w-36 mr-2 mb-4 text-sm font-medium leading-6 text-gray-900"
                    >
                      Peso
                    </label>
                    <div>
                      <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                        <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                          Kg.
                        </span>
                        <input
                          type="text"
                          name={`models[${currentVaritionIndex}][weight]`}
                          id="weight"
                          className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                          placeholder="0.00"
                          onChange={handleVariationInputChange}
                          defaultValue={
                            currentVariation ? currentVariation.weight : ""
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-full">
                <h3 className="text-base font-semibold leading-7 text-gray-900">
                  Galería
                </h3>

                <div className="col-span-full">
                  <ul
                    role="list"
                    className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 sm:gap-x-6 xl:gap-x-8"
                  >
                    {/* IMAGE 0 */}
                    <li className="relative">
                      <div className="group relative">
                        {currentVariation?.imageUrl ? (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleImageDelete("imageFile", "image")
                              }
                              className="group absolute z-10 right-0 bg-gray-200 bg-opacity-80 ml-2 h-7 w-7 items-center justify-center sm:flex"
                            >
                              <svg
                                className="h-8 w-8 stroke-slate-400 transition group-hover:stroke-slate-600"
                                fill="none"
                                viewBox="0 0 32 32"
                                xmlns="http://www.w3.org/2000/svg"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              >
                                <path
                                  d="M12.9975 10.7499L11.7475 10.7499C10.6429 10.7499 9.74747 11.6453 9.74747 12.7499L9.74747 21.2499C9.74747 22.3544 10.6429 23.2499 11.7475 23.2499L20.2475 23.2499C21.352 23.2499 22.2475 22.3544 22.2475 21.2499L22.2475 12.7499C22.2475 11.6453 21.352 10.7499 20.2475 10.7499L18.9975 10.7499"
                                  stroke-width="1.5"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                ></path>
                                <path
                                  d="M17.9975 12.2499L13.9975 12.2499C13.4452 12.2499 12.9975 11.8022 12.9975 11.2499L12.9975 9.74988C12.9975 9.19759 13.4452 8.74988 13.9975 8.74988L17.9975 8.74988C18.5498 8.74988 18.9975 9.19759 18.9975 9.74988L18.9975 11.2499C18.9975 11.8022 18.5498 12.2499 17.9975 12.2499Z"
                                  stroke-width="1.5"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                ></path>
                                <path
                                  d="M13.7475 16.2499L18.2475 16.2499"
                                  stroke-width="1.5"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                ></path>
                                <path
                                  d="M13.7475 19.2499L18.2475 19.2499"
                                  stroke-width="1.5"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                ></path>
                                <g className="opacity-0">
                                  <path
                                    d="M15.9975 5.99988L15.9975 3.99988"
                                    stroke-width="1.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  ></path>
                                  <path
                                    d="M19.9975 5.99988L20.9975 4.99988"
                                    stroke-width="1.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  ></path>
                                  <path
                                    d="M11.9975 5.99988L10.9975 4.99988"
                                    stroke-width="1.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  ></path>
                                </g>
                              </svg>
                            </button>
                            <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200">
                              <img
                                src={imageUrl}
                                alt={"productDetails.name"}
                                className="h-full w-full object-cover object-center group-hover:opacity-75"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <DropzoneSync
                              name={`models[${currentVaritionIndex}][imageFile]`}
                            />
                            {/* <input
                              type="hidden"
                              name={`models[${currentVaritionIndex}][imageFile]`}
                              value={selectedImage0}
                            /> */}
                          </>
                        )}
                      </div>
                    </li>

                    {/* IMAGE 1 */}
                    <li className="relative">
                      <div className="group relative">
                        {currentVariation?.imageUrlTwo ? (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleImageDelete("image2File", "image")
                              }
                              className="group absolute z-10 right-0 bg-gray-200 bg-opacity-80 ml-2 h-7 w-7 items-center justify-center sm:flex"
                            >
                              <svg
                                className="h-8 w-8 stroke-slate-400 transition group-hover:stroke-slate-600"
                                fill="none"
                                viewBox="0 0 32 32"
                                xmlns="http://www.w3.org/2000/svg"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              >
                                <path
                                  d="M12.9975 10.7499L11.7475 10.7499C10.6429 10.7499 9.74747 11.6453 9.74747 12.7499L9.74747 21.2499C9.74747 22.3544 10.6429 23.2499 11.7475 23.2499L20.2475 23.2499C21.352 23.2499 22.2475 22.3544 22.2475 21.2499L22.2475 12.7499C22.2475 11.6453 21.352 10.7499 20.2475 10.7499L18.9975 10.7499"
                                  stroke-width="1.5"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                ></path>
                                <path
                                  d="M17.9975 12.2499L13.9975 12.2499C13.4452 12.2499 12.9975 11.8022 12.9975 11.2499L12.9975 9.74988C12.9975 9.19759 13.4452 8.74988 13.9975 8.74988L17.9975 8.74988C18.5498 8.74988 18.9975 9.19759 18.9975 9.74988L18.9975 11.2499C18.9975 11.8022 18.5498 12.2499 17.9975 12.2499Z"
                                  stroke-width="1.5"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                ></path>
                                <path
                                  d="M13.7475 16.2499L18.2475 16.2499"
                                  stroke-width="1.5"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                ></path>
                                <path
                                  d="M13.7475 19.2499L18.2475 19.2499"
                                  stroke-width="1.5"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                ></path>
                                <g className="opacity-0">
                                  <path
                                    d="M15.9975 5.99988L15.9975 3.99988"
                                    stroke-width="1.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  ></path>
                                  <path
                                    d="M19.9975 5.99988L20.9975 4.99988"
                                    stroke-width="1.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  ></path>
                                  <path
                                    d="M11.9975 5.99988L10.9975 4.99988"
                                    stroke-width="1.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  ></path>
                                </g>
                              </svg>
                            </button>
                            <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200">
                              <img
                                src={imageUrlTwo}
                                alt={"productDetails.name"}
                                className="h-full w-full object-cover object-center group-hover:opacity-75"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <DropzoneSync
                                name={`models[${currentVaritionIndex}][image2File]`}
                            />
                          </>
                        )}
                      </div>
                    </li>

                    {/* IMAGE 2 */}
                    <li className="relative">
                      <div className="group relative">
                        {currentVariation?.imageUrlThree ? (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleImageDelete("image3File", "image")
                              }
                              className="group absolute z-10 right-0 bg-gray-200 bg-opacity-80 ml-2 h-7 w-7 items-center justify-center sm:flex"
                            >
                              <svg
                                className="h-8 w-8 stroke-slate-400 transition group-hover:stroke-slate-600"
                                fill="none"
                                viewBox="0 0 32 32"
                                xmlns="http://www.w3.org/2000/svg"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              >
                                <path
                                  d="M12.9975 10.7499L11.7475 10.7499C10.6429 10.7499 9.74747 11.6453 9.74747 12.7499L9.74747 21.2499C9.74747 22.3544 10.6429 23.2499 11.7475 23.2499L20.2475 23.2499C21.352 23.2499 22.2475 22.3544 22.2475 21.2499L22.2475 12.7499C22.2475 11.6453 21.352 10.7499 20.2475 10.7499L18.9975 10.7499"
                                  stroke-width="1.5"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                ></path>
                                <path
                                  d="M17.9975 12.2499L13.9975 12.2499C13.4452 12.2499 12.9975 11.8022 12.9975 11.2499L12.9975 9.74988C12.9975 9.19759 13.4452 8.74988 13.9975 8.74988L17.9975 8.74988C18.5498 8.74988 18.9975 9.19759 18.9975 9.74988L18.9975 11.2499C18.9975 11.8022 18.5498 12.2499 17.9975 12.2499Z"
                                  stroke-width="1.5"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                ></path>
                                <path
                                  d="M13.7475 16.2499L18.2475 16.2499"
                                  stroke-width="1.5"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                ></path>
                                <path
                                  d="M13.7475 19.2499L18.2475 19.2499"
                                  stroke-width="1.5"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                ></path>
                                <g className="opacity-0">
                                  <path
                                    d="M15.9975 5.99988L15.9975 3.99988"
                                    stroke-width="1.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  ></path>
                                  <path
                                    d="M19.9975 5.99988L20.9975 4.99988"
                                    stroke-width="1.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  ></path>
                                  <path
                                    d="M11.9975 5.99988L10.9975 4.99988"
                                    stroke-width="1.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  ></path>
                                </g>
                              </svg>
                            </button>
                            <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200">
                              <img
                                src={imageUrlThree}
                                alt={"productDetails.name"}
                                className="h-full w-full object-cover object-center group-hover:opacity-75"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <DropzoneSync
                              name={`models[${currentVaritionIndex}][image3File]`}
                            />
                          </>
                        )}
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
        {/* ACTION BUTTON */}
        <button
          type="submit"
          className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
        >
          Agregar variación
        </button>

        {/* CANCEL BUTTON */}
        <button
          type="button"
          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
          onClick={handleCancel}
          ref={cancelButtonRef}
        >
          Cancelar
        </button>
      </div>
    </productVariationForm.Form>
  );
}
