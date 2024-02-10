import { useState } from "react";

import type { Product } from "~/types/Product";

import Dropzone from "~/components/Dropzone";

// TYPES
interface GalleryProps {
  product: Product;
  onImageDrop: (fieldName: string, files: File | Array<File>) => Promise<any>;
  onImageDelete: (fieldName: string) => Promise<any>;
}

// COMPONENT
export default function SectionGallery({
  product,
  onImageDrop = async () => {},
  onImageDelete = async () => {},
}: GalleryProps) {
  // Gallery
  const [imageUrl, setImageUrl] = useState(product.imageUrl || "");
  const [image1Url, setImage1Url] = useState(product.image1Url || "");
  const [image2Url, setImage2Url] = useState(product.image2Url || "");
  const [image3Url, setImage3Url] = useState(product.image3Url || "");

  // State related utils
  const updateStateDictionary: { [key: string]: Function } = {
    images_id: setImageUrl,
    images1_id: setImage1Url,
    images2_id: setImage2Url,
    images3_id: setImage3Url,
  };
  function returnMatchingStateKey(name: string = "") {
    let keyReference: string = name;
    switch (name) {
      case "images_id":
        keyReference = `imageUrl`;
        break;
      case "images1_id":
        keyReference = `image1Url`;
        break;
      case "images2_id":
        keyReference = `image2Url`;
        break;
      case "images3_id":
        keyReference = `image3Url`;
        break;
      default:
        break;
    }
    return keyReference;
  }

  // Handle file upload request
  const handleAsyncUpload = async (name: string, files: File[]) => {
    const updatedProduct: Product = await onImageDrop(name, files).catch(
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
    const updatedProduct: Product = await onImageDelete(name).catch((err) => {
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
          Personal Information
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">
          Use a permanent address where you can receive mail.
        </p>
      </div>

      <form className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div className="px-4 py-6 sm:p-8">
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            {/* FIELDSET TITLE */}
            <div className="col-span-full">
              <label
                htmlFor="images1_id"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Galería
              </label>
            </div>

            <div className="col-span-full">
              <ul
                role="list"
                className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8"
              >
                {/* IMAGE 0 */}
                <li className="relative">
                  <div className="group relative">
                    {imageUrl ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAsyncDelete("images_id")}
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
                            alt={product.name}
                            className="h-full w-full object-cover object-center group-hover:opacity-75"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <Dropzone
                          name="images_id"
                          onFilesAdded={(files) =>
                            handleAsyncUpload("images_id", files)
                          }
                        />
                      </>
                    )}
                  </div>
                </li>

                {/* IMAGE 1 */}
                <li className="relative">
                  <div className="group relative">
                    {image1Url ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAsyncDelete("images1_id")}
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
                            src={image1Url}
                            alt={product.name}
                            className="h-full w-full object-cover object-center group-hover:opacity-75"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <Dropzone
                          name="images1_id"
                          onFilesAdded={(files) =>
                            handleAsyncUpload("images1_id", files)
                          }
                        />
                      </>
                    )}
                  </div>
                </li>

                {/* IMAGE 2 */}
                <li className="relative">
                  <div className="group relative">
                    {image2Url ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAsyncDelete("images2_id")}
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
                            src={image2Url}
                            alt={product.name}
                            className="h-full w-full object-cover object-center group-hover:opacity-75"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <Dropzone
                          name="images2_id"
                          onFilesAdded={(files) =>
                            handleAsyncUpload("images2_id", files)
                          }
                        />
                      </>
                    )}
                  </div>
                </li>

                {/* IMAGE 3 */}
                <li className="relative">
                  <div className="group relative">
                    {image3Url ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAsyncDelete("images3_id")}
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
                            src={image3Url}
                            alt={product.name}
                            className="h-full w-full object-cover object-center group-hover:opacity-75"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <Dropzone
                          name="images3_id"
                          onFilesAdded={(files) =>
                            handleAsyncUpload("images3_id", files)
                          }
                        />
                      </>
                    )}
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
