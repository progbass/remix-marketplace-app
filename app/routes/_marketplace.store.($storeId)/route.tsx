import { Link, useLoaderData, useFetcher } from "@remix-run/react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Fragment, useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import { StarIcon } from "@heroicons/react/20/solid";

import type { ProductVariation } from "~/types/ProductVariation";
import type { Product } from "~/types/Product";

import { useShoppingCart } from "~/providers/ShoppingCartContext";
import classNames from "~/utils/classNames";
import AuthService from "~/services/Auth.service";
import getEnv from "get-env";
import { Fetcher } from "~/utils/fetcher";
import SelectBox from "~/components/SelectBox";
import {
  algoliaSearchClient,
  algoliaProductsIndex,
} from "~/utils/algoliaClients";
import ProductThumbnail from "~/components/ProductThumbnail";

export async function loader({ request, params }: LoaderFunctionArgs) {
  // Attempt to get the user from the session
  const user = await AuthService.getCurrentUser({ request }).catch((err) => {
    console.log(err);
    return null;
  });

  // Create sercer-side fetcher
  const myFetcher = new Fetcher(user?.token, request);

  // Get store details
  let error = null;
  const storeDetails = await myFetcher
    .fetch(`${getEnv().API_URL}/productsentrepreneurs/${params.storeId}`, {
      method: "GET",
    })
    .catch((err) => {
      console.log(err);
      // throw new Error("Error fetching product data");
      error = null;
    });

  // Return 404 if product not found
  if (error || !storeDetails) {
    return redirect("404", 404);
  }

  // Get related products
  // const relatedProducts = await myFetcher
  //   .fetch(`${getEnv().API_URL}/products/related/${params.productId}`, {
  //     method: "GET",
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //     // throw new Error("Error fetching product data");
  //     error = null;
  //   });

  if (!storeDetails?.entrepreneur) {
    return redirect("404", 404);
  }

  // Search for indexed products at algolia
  const algoliaIndex = algoliaSearchClient.initIndex(algoliaProductsIndex);
  const storeCatalog = await algoliaIndex
    .search("", {
      facetFilters: [`brand.brand:${storeDetails.entrepreneur.brand}`],
      hitsPerPage: 20,
    })
    .catch((err) => {
      console.error("Error:", err);
    });

  // Return loader data
  return {
    storeDetails: storeDetails?.entrepreneur,
    storeCatalog: storeCatalog.hits || [], //storeDetails?.products,
    relatedProducts: [],
  };
}

export default function StorePage() {
  // Product details
  const { storeDetails, storeCatalog } =
    useLoaderData<typeof loader>();

    console.log(storeDetails, storeCatalog);

  // Return main component
  return (
    <>
      <div>
        <div className="bg-[length:740px_160px] bg-repeat bg-[url('https://sfo3.digitaloceanspaces.com/com.mexicolimited/production-bucket/managed-content/desktop-content/pattern.png')] h-20" />
        {/* <img
          className="h-32 w-full object-cover lg:h-48"
          src={
            "https://images.unsplash.com/photo-1444628838545-ac4016a5418a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          }
          alt=""
        /> */}
      </div>

      <div className="mx-auto px-4 pb-24 pt-14 sm:px-6 sm:pb-32 sm:pt-16 lg:max-w-7xl lg:px-8">
        <section
          aria-labelledby="features-heading"
          className="mx-auto max-w-7xl sm:px-2 lg:px-8"
        >
          <div className="mx-auto max-w-2xl px-4 lg:max-w-none lg:px-0">
            <div className="max-w-3xl">
              <h2
                id="features-heading"
                className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
              >
                {storeDetails.brand}
              </h2>
              {/* <p className="mt-2 text-sm text-gray-500">
                {storeDetails.neighborhood}
              </p> */}
              <p className="mt-4 text-gray-500">{storeDetails.comments}</p>
            </div>

            <Tab.Group as="div" className="mt-4">
              <div className="-mx-4 flex overflow-x-auto sm:mx-0">
                <div className="flex-auto border-b border-gray-200 px-4 sm:px-0">
                  <Tab.List className="-mb-px flex space-x-10">
                    <Tab
                      className={({ selected }) =>
                        classNames(
                          selected
                            ? "border-indigo-500 text-indigo-600"
                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                          "whitespace-nowrap border-b-2 py-6 text-sm font-medium"
                        )
                      }
                    >
                      Productos
                    </Tab>

                    <Tab
                      className={({ selected }) =>
                        classNames(
                          selected
                            ? "border-indigo-500 text-indigo-600"
                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                          "whitespace-nowrap border-b-2 py-6 text-sm font-medium"
                        )
                      }
                    >
                      Acerca de {storeDetails.brand}
                    </Tab>
                  </Tab.List>
                </div>
              </div>

              <Tab.Panels as={Fragment}>
                <Tab.Panel className="space-y-16 pt-10 lg:pt-16">
                  <section
                    aria-labelledby="product-heading"
                    className="mt-6 lg:col-span-2 lg:mt-0 xl:col-span-3"
                  >
                    <h2 id="product-heading" className="sr-only">
                      Products
                    </h2>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-4 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4 xl:grid-cols-5">
                      {storeCatalog.map((product: Product) => (
                        <ProductThumbnail
                          containerClassName="border-0"
                          key={product.objectID}
                          {...{ product }}
                        />
                      ))}
                    </div>
                  </section>
                </Tab.Panel>

                <Tab.Panel className="space-y-16 pt-10 lg:pt-16">
                  <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:gap-x-8">
                    <div className="mt-6 lg:col-span-7 lg:mt-0">
                      <h3 className="text-lg font-medium text-gray-900">
                        Acerca de nosotros
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
                        {storeDetails.comments}
                      </p>
                    </div>
                    <div className="lg:col-span-5">
                      {/* <div className="aspect-h-1 aspect-w-2 overflow-hidden rounded-lg bg-gray-100 sm:aspect-h-2 sm:aspect-w-5">
                            <img
                              src={feature.imageSrc}
                              alt={feature.imageAlt}
                              className="object-cover object-center"
                            />
                          </div> */}
                    </div>
                  </div>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </section>
      </div>
    </>
  );
}
