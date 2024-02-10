import { useState } from "react";
import { useFetcher } from "@remix-run/react";

import type { Product } from "~/types/Product";

import InputText from "~/components/InputText";
import Dropzone from "~/components/Dropzone";

// TYPES
interface ExtrasProps {
  product: Product;
  onFileDrop: (fieldName: string, files: File | Array<File>) => Promise<any>;
  onFileDelete: (fieldName: string) => Promise<any>;
}

// COMPONENT
export default function SectionExtras({
  product,
  onFileDrop = async () => {},
  onFileDelete = async () => {},
}: ExtrasProps) {
  const productForm = useFetcher();

  // Documents
  const [documentUrl, setDocumentUrl] = useState(product.documentUrl || "");
  const [instructiveUrl, setInstructiveUrl] = useState(
    product.instructiveDocumentsUrl || ""
  );
  const [handbookUrl, setHandbookUrl] = useState(
    product.handbookDocumentsUrl || ""
  );

  // State related utils
  const updateStateDictionary: { [key: string]: Function } = {
    document: setDocumentUrl,
    instructive: setInstructiveUrl,
    handbook: setHandbookUrl,
  };
  function returnMatchingStateKey(name: string = "") {
    let keyReference: string = name;
    switch (name) {
      case "document":
        keyReference = `documentUrl`;
        break;
      case "instructive":
        keyReference = `instructiveUrl`;
        break;
      case "handbook":
        keyReference = `handbookUrl`;
        break;
      default:
        break;
    }
    return keyReference;
  }

  // Handle file upload request
  const handleAsyncUpload = async (name: string, files: File[]) => {
    const updatedProduct: Product = await onFileDrop(name, files).catch(
      (err) => {
        console.error(err);
        return;
      }
    );

    // Search for the corresponding key with the new values
    let keyReference: string = returnMatchingStateKey(name);

    // Update state
    updateStateDictionary[name](updatedProduct[keyReference]);
    return;
  };

  // Handle file deletion request
  const handleAsyncDelete = async (name: string) => {
    const updatedProduct: Product = await onFileDelete(name).catch((err) => {
      console.error(err);
      return;
    });

    // Search for the corresponding key with the new values
    let keyReference: string = returnMatchingStateKey(name);

    // Update state
    updateStateDictionary[name](updatedProduct[keyReference]);
    return;
  };

  // Render component
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
      {/* SECTION TITLE */}
      <div className="px-4 sm:px-0">
        <h2 className="text-base font-semibold leading-7 text-gray-900">
          Especificaciones
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">
          We'll always let you know about important changes, but you pick what
          else you want to hear about.
        </p>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        {/* Product Id */}
        <input type="hidden" name="id" defaultValue={product.id} />
        <input type="hidden" name="users_id" defaultValue={product.users_id} />

        <div className="px-4 py-6 sm:p-8">
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            {/* YOUTUBE */}
            <div className="sm:col-span-4">
              <label
                htmlFor="video_url"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Youtube
              </label>

              <div className="mt-2">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                  <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                    http://
                  </span>
                  <input
                    type="text"
                    name="video_url"
                    id="video_url"
                    defaultValue={product.video_url}
                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="www.youtube.com/mi-producto"
                  />
                </div>
              </div>
            </div>

            {/* SPECS */}
            <div className="col-span-full">
              <label
                htmlFor="document"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Detalles y especificaciones
              </label>
              {documentUrl ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleAsyncDelete("document")}
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
                      src={documentUrl}
                      alt={product.name}
                      className="h-full w-full object-cover object-center group-hover:opacity-75"
                    />
                  </div>
                </>
              ) : (
                <>
                  <Dropzone
                    name="document"
                    onFilesAdded={(files) =>
                      handleAsyncUpload("document", files)
                    }
                  />
                </>
              )}
            </div>

            {/* INSTRUCTIVE */}
            <div className="col-span-full">
              <label
                htmlFor="instructive"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Instructivo
              </label>
              {instructiveUrl ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleAsyncDelete("instructive")}
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
                      src={instructiveUrl}
                      alt={product.name}
                      className="h-full w-full object-cover object-center group-hover:opacity-75"
                    />
                  </div>
                </>
              ) : (
                <>
                  <Dropzone
                    name="instructive"
                    onFilesAdded={(files) =>
                      handleAsyncUpload("instructive", files)
                    }
                  />
                </>
              )}
            </div>

            {/* HANDBOOK */}
            <div className="col-span-full">
              <label
                htmlFor="cover-photo"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Ficha técnica
              </label>
              {handbookUrl ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleAsyncDelete("handbook")}
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
                      src={handbookUrl}
                      alt={product.name}
                      className="h-full w-full object-cover object-center group-hover:opacity-75"
                    />
                  </div>
                </>
              ) : (
                <>
                  <Dropzone
                    name="handbook"
                    onFilesAdded={(files) =>
                      handleAsyncUpload("handbook", files)
                    }
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
