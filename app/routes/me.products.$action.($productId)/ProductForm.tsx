import { useState } from "react";
import { Form, Link, useLoaderData } from "@remix-run/react";
import {Switch } from "@headlessui/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";

import type { ProductVariation } from "~/types/ProductVariation";

import { useFetcherConfiguration } from '../../providers/FetcherConfigurationContext';
import getEnv from "get-env";
import { Fetcher } from "../../utils/fetcher";
import classNames from "~/utils/classNames";

import Toast from "~/components/Toast";
import DialogOverlay from "~/components/DialogOverlay";
import ProductVariationForm from "./ProductVariationForm";
import SectionGeneralInfo from "./SectionGeneralInfo";
import SectionGallery from "./SectionGallery";
import SectionExtras from "./SectionExtras";
import SectionPricing from "./SectionPricing";
import SectionVariations from "./SectionVariations";
import SectionDelete from "./SectionDelete";

const PRODUCT_ACTION_MODE = {
  NEW: "new",
  EDIT: "edit",
};

// 
export default function ProductDetails() {
  const clientSideFetcher = useFetcherConfiguration();
  const { productDetails, categories, subcategories, currentUser } =
    useLoaderData<typeof loader>();
  const actionMode = productDetails.id ? PRODUCT_ACTION_MODE.EDIT : PRODUCT_ACTION_MODE.NEW;

  // Dialog/Modal
  const [displayVariationsDialog, setDisplayVariationsDialog] = useState(false);

  // Categories
  async function handleCategoryChange (categoryId:number):Promise<any>{
    if (categoryId) {
      // Get subcategories
      let subcategories = await clientSideFetcher.fetch(
        `${getEnv().API_URL}/admin/getSubcategories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            categories: [categoryId],
          }),
        }
      ).catch((err) => {
        throw new Error("Error fetching subcategories");
      });

      return Promise.resolve(subcategories);
    }
    return Promise.resolve([]);
  }

  // Gallery
  const handleAsyncUpload = async (
    field: string,
    files: Array<any> | File | null
  ):Promise<any> => {
    if (!field) return;
    if (!files) return;
    if (Array.isArray(files) && !files.length) return;

    //
    try {
      let fieldName: string | undefined = field;
      
      // Exit if no field name was found
      if (!fieldName) return Promise.reject("No field name found");

      // Setup the form data and add required fields
      const formData = new FormData();
      formData.append("id", productDetails.id);
      formData.append("users_id", currentUser.id);

      // Add the files to the form data
      if (Array.isArray(files)) {
        files.forEach((file) => {
          fieldName && formData.append(fieldName, file);
        });
      } else {
        fieldName && formData.append(fieldName, files);
      }

      // Upload the files
      const updatedProduct = await clientSideFetcher.fetch(
        `${getEnv().API_URL}/admin/myproducts/${productDetails.id}`,
        {
          method: "PUT",
          body: formData,
        }
      ).catch((error) => {
        console.log(error);
        throw new Error("Image upload failed");
      });

      // Send updated object to the caller
      return Promise.resolve(updatedProduct);
    } catch (error) {
      console.error("Error uploading image:", error);
      return Promise.reject(error);
    }
  };
  const handleAsyncDeletion = async (field: string):Promise<any> => {
    // Validations
    if (!field) return;
    let index: string | undefined = "undefined";
    let endpoint = "";
    let keyReference = "";
    switch (field) {
      case "images_id":
        index = "";
        endpoint = `${getEnv().API_URL}/admin/myproducts_deleteimage/${
          productDetails.id
        }/${1}`;
        keyReference = `imageUrl`;
        break;
      case "images1_id":
        index = "1";
        endpoint = `${getEnv().API_URL}/admin/myproducts_deleteimage/${
          productDetails.id
        }/${2}`;
        keyReference = `image1Url`;
        break;
      case "images2_id":
        index = "2";
        endpoint = `${getEnv().API_URL}/admin/myproducts_deleteimage/${
          productDetails.id
        }/${3}`;
        keyReference = `image2Url`;
        break;
      case "images3_id":
        index = "3";
        endpoint = `${getEnv().API_URL}/admin/myproducts_deleteimage/${
          productDetails.id
        }/${4}`;
        keyReference = `image3Url`;
        break;
      case "document":
        index = "";
        endpoint = `${getEnv().API_URL}/admin/myproducts_deletedocument/${
          productDetails.id
        }/document`;
        keyReference = `document`;
        break;
      case "instructive":
        index = "";
        endpoint = `${getEnv().API_URL}/admin/myproducts_deletedocument/${
          productDetails.id
        }/instructive`;
        keyReference = `instructive`;
        break;
      case "handbook":
        index = "";
        endpoint = `${getEnv().API_URL}/admin/myproducts_deletedocument/${
          productDetails.id
        }/handbook`;
        keyReference = `handbook`;
        break;
      default:
        break;
    }

    // Request image deletion
    const updatedProduct = await clientSideFetcher.fetch(endpoint, {
      method: "DELETE",
    }).catch((error) => {
      console.log(error);
      throw new Error("Image deletion failed");
    });

    // Send updated object to the caller
    return Promise.resolve(updatedProduct);
  }

  //
  const [enabled, setEnabled] = useState(productDetails.status === "activo");

  // Product Type
  const [currentVariation, setCurrentVariation] = useState(null);
  const handleProductVariationSubmit = async (
    productVariations: Array<ProductVariation>
  ) => {
    closeDialog();
  };
  const handleNewVariationRequest = (variation:ProductVariation|null) => {
    // Open the dialog
    openDialog();
    setCurrentVariation(variation);
  }
  const openDialog = () => {
    // Open the dialog
    console.log("openDialog");
    setDisplayVariationsDialog(true);
  };
  const closeDialog = () => {
    setDisplayVariationsDialog(false);
  };
  
  /*
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
    formData.append("users_id", currentUser.id);
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
    const productUpdate = await clientSideFetcher.fetch(
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
  };*/

  // Return JSX
  return (
    <>
      <Form
        method={actionMode === PRODUCT_ACTION_MODE.EDIT ? "PUT" : "POST"}
        id="product-form"
      >
        {/* Product Id */}
        <input type="hidden" name="id" defaultValue={productDetails.id} />
        <input type="hidden" name="users_id" defaultValue={currentUser.id} />

        {/* HEADER */}
        <div className="bg-white -mx-8 -mt-10 p-5 sticky mb-8 z-20">
          <div>
            <nav className="sm:hidden" aria-label="Back">
              <a
                href="#"
                className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                <ChevronLeftIcon
                  className="-ml-1 mr-1 h-5 w-5 flex-shrink-0 text-gray-400"
                  aria-hidden="true"
                />
                Back
              </a>
            </nav>

            <nav className="hidden sm:flex" aria-label="Breadcrumb">
              <ol role="list" className="flex items-center space-x-4">
                <li>
                  <div className="flex">
                    <Link
                      to="/me/products"
                      className="text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                      Productos
                    </Link>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <ChevronRightIcon
                      className="h-5 w-5 flex-shrink-0 text-gray-400"
                      aria-hidden="true"
                    />
                    <Link
                      to="#"
                      className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                      {productDetails.name}
                    </Link>
                  </div>
                </li>
              </ol>
            </nav>
          </div>

          <div className="mt-2 md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                {productDetails.name}
              </h2>
            </div>

            <div className="mt-4 flex flex-shrink-0 md:ml-4 md:mt-0">
              <Switch.Group
                as="div"
                className="flex items-center justify-between"
              >
                <span className="flex flex-grow flex-col">
                  <Switch.Label
                    as="div"
                    className="text-sm font-medium leading-6 text-gray-900"
                    passive
                  >
                    Publicar
                  </Switch.Label>
                </span>
                <Switch
                  checked={enabled}
                  onChange={setEnabled}
                  className={classNames(
                    enabled ? "bg-indigo-600" : "bg-gray-200",
                    " self-end relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                  )}
                >
                  <span className="sr-only">Use setting</span>
                  <span
                    className={classNames(
                      enabled ? "translate-x-5" : "translate-x-0",
                      "pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    )}
                  >
                    <span
                      className={classNames(
                        enabled
                          ? "opacity-0 duration-100 ease-out"
                          : "opacity-100 duration-200 ease-in",
                        "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity"
                      )}
                      aria-hidden="true"
                    >
                      <svg
                        className="h-3 w-3 text-gray-400"
                        fill="none"
                        viewBox="0 0 12 12"
                      >
                        <path
                          d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span
                      className={classNames(
                        enabled
                          ? "opacity-100 duration-200 ease-in"
                          : "opacity-0 duration-100 ease-out",
                        "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity"
                      )}
                      aria-hidden="true"
                    >
                      <svg
                        className="h-3 w-3 text-indigo-600"
                        fill="currentColor"
                        viewBox="0 0 12 12"
                      >
                        <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                      </svg>
                    </span>
                  </span>
                </Switch>
              </Switch.Group>

              <button
                type="submit"
                className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {actionMode == PRODUCT_ACTION_MODE.EDIT ? 'Guardar' : 'Crear Producto'}
              </button>
            </div>
          </div>
        </div>
        {/* END: HEADER */}

        <div className="space-y-10 divide-y divide-gray-900/10">
          {/* GENERAL INFORMATION */}
          <SectionGeneralInfo 
            product={productDetails} 
            categories={categories}
            subcategories={subcategories}
            onCategoryChange={handleCategoryChange}
          />
          {/* END: GENERAL INFORMATION */}

          {/* GALLERY */}
          <SectionGallery 
            product={productDetails} 
            onImageDrop={handleAsyncUpload}
            onImageDelete={handleAsyncDeletion}
          />
          {/* END: GALLERY */}

          {/* PRICE */}
          <SectionPricing
            product={productDetails} 
          />
          {/* END: PRICE */}

          {/* VARIATIONS */}
          <SectionVariations 
            product={productDetails}
            handleNewVariationRequest={handleNewVariationRequest}
          />
          {/* END: VARIATIONS */}

          {/* EXTRAS */}
          <SectionExtras 
            product={productDetails} 
            onFileDrop={handleAsyncUpload}
            onFileDelete={handleAsyncDeletion}
          />
          {/* END: EXTRAS */}

          
          
          
        </div> 
      </Form>
      
      {/* DELETE */}
      <Form 
        action="destroy" 
        method="post"
        onSubmit={(event) => {
          const response = confirm(
            "Please confirm you want to delete this record."
          );
          if (!response) {
            event.preventDefault();
          }
        }}
      >
        <div className="space-y-10 divide-y divide-gray-900/10">
          <SectionDelete 
            product={productDetails} 
          />
        </div>
      </Form>
      {/* END: DELETE */} 

      {displayVariationsDialog && (
        <DialogOverlay
          isOpen={true}
          onSubmit={() => {}}
          onClose={closeDialog}
          labelActionButton="Agregar variación"
        >
          {/* Dynamically pass different child components */}
          <ProductVariationForm
            variation={currentVariation}
            product={productDetails}
            onSubmit={handleProductVariationSubmit}
            onCancel={closeDialog}
          />
        </DialogOverlay>
      )}
    </>
  );
}
