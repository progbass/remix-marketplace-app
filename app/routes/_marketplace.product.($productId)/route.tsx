import { Link, useLoaderData, useFetcher } from "@remix-run/react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Fragment, useState, useEffect } from "react";
import { StarIcon, CheckCircleIcon } from "@heroicons/react/20/solid";
import {
  Dialog,
  Popover,
  RadioGroup,
  Tab,
  Transition,
} from "@headlessui/react";
// import parse from 'html-react-parser';

import type { ProductVariation } from "~/types/ProductVariation";
import type { Product } from "~/types/Product";

import { useShoppingCart } from "~/providers/ShoppingCartContext";
import classNames from "~/utils/classNames";
import AuthService from "~/services/Auth.service";
import getEnv from "get-env";
import { Fetcher } from "~/utils/fetcher";
import SelectBox from "~/components/SelectBox";
import DialogOverlay from "~/components/DialogOverlay";
import ProductThumbnail from "~/components/ProductThumbnail";
import { formatPrice } from "~/utils/formatPrice";

const reviews = {
  average: 4,
  featured: [
    {
      id: 1,
      rating: 5,
      content: `
          <p>This icon pack is just what I need for my latest project. There's an icon for just about anything I could ever need. Love the playful look!</p>
        `,
      date: "July 16, 2021",
      datetime: "2021-07-16",
      author: "Emily Selman",
      avatarSrc:
        "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80",
    },
    {
      id: 2,
      rating: 5,
      content: `
          <p>Blown away by how polished this icon pack is. Everything looks so consistent and each SVG is optimized out of the box so I can use it directly with confidence. It would take me several hours to create a single icon this good, so it's a steal at this price.</p>
        `,
      date: "July 12, 2021",
      datetime: "2021-07-12",
      author: "Hector Gibbons",
      avatarSrc:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80",
    },
    // More reviews...
  ],
};
const faqs = [
  {
    question: "What format are these icons?",
    answer:
      "The icons are in SVG (Scalable Vector Graphic) format. They can be imported into your design tool of choice and used directly in code.",
  },
  {
    question: "Can I use the icons at different sizes?",
    answer:
      "Yes. The icons are drawn on a 24 x 24 pixel grid, but the icons can be scaled to different sizes as needed. We don't recommend going smaller than 20 x 20 or larger than 64 x 64 to retain legibility and visual balance.",
  },
  // More FAQs...
];
const MAX_STOCK_ITEMS = 10;

// Loader function
export async function loader({ request, params }: LoaderFunctionArgs) {
  // Attempt to get the user from the session
  const user = await AuthService.getCurrentUser({ request }).catch((err) => {
    console.log(err);
    return null;
  });

  // Create sercer-side fetcher
  const myFetcher = new Fetcher(user?.token, request);

  // Get product
  let error = null;
  const productDetails = await myFetcher
    .fetch(`${getEnv().API_URL}/product/${params.productId}`, { method: "GET" })
    .catch((err) => {
      console.log(err);
      // throw new Error("Error fetching product data");
      error = err;
    });

  // Return 404 if product not found
  if (!productDetails || error) {
    throw new Response(null, {
      status: 404,
      statusText: "Producto no encontrado",
    });
  }

  // Get related products
  const relatedProducts = await myFetcher
    .fetch(`${getEnv().API_URL}/products/related/${params.productId}`, {
      method: "GET",
    })
    .catch((err) => {
      console.log(err);
      // throw new Error("Error fetching product data");
      error = err;
    });

  // Return loader data
  return {
    cart: {
      products: [],
    },
    product: productDetails,
    relatedProducts: relatedProducts || [],
  };
}

// Action function
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("action");

  // Handle form actions
  switch (action) {
    case "addToCart": {
      const formValues = {};
      formData.forEach((value, key) => {
        console.log(key, value);
        formValues[key] = value;
      });

      // Update shopping cart
      const myFetcher = new Fetcher(null, request);
      const shoppingCartItems = await myFetcher
        .fetch(`${getEnv().API_URL}/cart/add`, {
          method: "POST",
          body: formData,
        })
        .catch((err) => {
          console.log(err);
        });

      // Return response
      return json({
        errors: null,
        cart: shoppingCartItems,
      });
    }

    // Handle other actions
    default: {
      throw new Response("Bad Request", { status: 400 });
    }
  }
}

// Main component
export default function ProductPage() {
  // Shopping cart
  const ShoppingCart = useShoppingCart();

  // Confirmation modal
  const [modalDisplay, setModalDisplay] = useState(false);

  // Add-To-Cart Form
  const addToCartForm = useFetcher<typeof action>();
  // Update shopping cart when form has changed
  useEffect(() => {
    if (addToCartForm.state === "idle" && addToCartForm.data) {
      // Update shopping cart
      ShoppingCart.setCart(addToCartForm.data.cart);

      // Display confirmation modal
      setModalDisplay(true);
    }
  }, [addToCartForm]);

  // Product details
  const { product, relatedProducts } = useLoaderData<typeof loader>();

  // Product type
  const PRODUCT_VARIATION_TYPES = {
    UNIQUE: "productunique",
    SIZE_MODELS: "sizesmodels",
    MODELS: "models",
  };
  const productVariationType = product.stocktype;

  // Update selected product variation when product changes
  useEffect(() => {
    console.log("Product has changed");
    setSelectedProductVariation(
      productVariationType !== PRODUCT_VARIATION_TYPES.UNIQUE
        ? product.models[0]
        : null
    );
  }, [product]);

  // Selected product variation
  const [selectedProductVariation, setSelectedProductVariation] = useState(
    productVariationType !== PRODUCT_VARIATION_TYPES.UNIQUE
      ? product.models[0]
      : null
  );
  function selectedProductVariationChangeHandler(
    selectedVariation: ProductVariation
  ) {
    setSelectedQuantity({ id: 1, name: "1" });
    setSelectedProductVariation(selectedVariation);
  }

  // Selected product gallery
  const selectedProductVariationGallery = selectedProductVariation
    ? [selectedProductVariation.imageUrl]
    : product.gallery;

  // Selected product description
  const selectedProductVariationDescription = selectedProductVariation
    ? selectedProductVariation.description
    : product.short_description;

  // Selected product stock
  const selectedProductVariationMaxStock = selectedProductVariation
    ? selectedProductVariation.stock
    : product.stock;

  // Form state
  let stockOptionsList = [];
  for (
    let i = 1;
    i <= selectedProductVariationMaxStock && i <= MAX_STOCK_ITEMS;
    i++
  ) {
    stockOptionsList.push({ id: i, name: i.toString() });
  }
  const [selectedQuantity, setSelectedQuantity] = useState<{
    id: string | number | null;
    name: string;
  }>({ id: 1, name: "1" });

  // Validate form
  function validateForm(e) {
    console.log("Validating form");
    console.log("selectedProductVariation", selectedProductVariation);
    console.log("selectedQuantity", selectedQuantity);
    console.log(
      "selectedProductVariationMaxStock",
      selectedProductVariationMaxStock
    );
    console.log("productVariationType", productVariationType);

    // If the product has models, validate that a model has been selected
    if (
      productVariationType !== PRODUCT_VARIATION_TYPES.UNIQUE &&
      !selectedProductVariation
    ) {
      alert("Por favor selecciona un modelo");
      e.preventDefault();
      return;
    }

    if (!selectedQuantity?.id || parseInt(`${selectedQuantity?.id}`) < 1) {
      alert("Selecciona una cantidad válida");
      e.preventDefault();
      return;
    }

    // If the product has a greater quantity than the max available stock
    if (selectedQuantity?.id > selectedProductVariationMaxStock) {
      alert("No hay suficiente stock para el modelo seleccionado");
      e.preventDefault();
      return;
    }
  }

  console.log("product", selectedProductVariationGallery);

  // Return main component
  return (
    <div className="mx-auto px-4 pb-24 pt-14 sm:px-6 sm:pb-32 sm:pt-16 lg:max-w-7xl lg:px-8">
      {/* Product */}
      <div className="lg:grid lg:grid-cols-7 lg:grid-rows-1 lg:gap-x-8 lg:gap-y-10 xl:gap-x-16">
        {/* IMAGE GALLERY */}
        <div className="lg:col-span-4 lg:row-end-1">
          <Tab.Group as="div" className="flex flex-col-reverse">
            {/* Image selector */}
            <div className="mx-auto mt-6 w-full max-w-2xl lg:max-w-none">
              <Tab.List className="grid grid-cols-4 gap-6">
                {selectedProductVariationGallery.map((image, imageIndex) => (
                  <Tab
                    key={imageIndex}
                    className="relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium uppercase text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-offset-4"
                  >
                    {({ selected }) => (
                      <>
                        {/* <span className="sr-only">{image.name}</span> */}
                        <span className="absolute inset-0 overflow-hidden rounded-md">
                          <img
                            src={image}
                            alt=""
                            className="h-full w-full object-cover object-center"
                          />
                        </span>
                        <span
                          className={classNames(
                            selected
                              ? "ring-secondary-500"
                              : "ring-transparent",
                            "pointer-events-none absolute inset-0 rounded-md ring-2 ring-offset-2"
                          )}
                          aria-hidden="true"
                        />
                      </>
                    )}
                  </Tab>
                ))}
              </Tab.List>
            </div>

            <Tab.Panels className="aspect-h-1 aspect-w-1 w-full">
              {selectedProductVariationGallery.map((image, imageIndex) => (
                <Tab.Panel key={imageIndex}>
                  <img
                    src={image}
                    alt={product.name}
                    className="h-full w-full object-contain object-center sm:rounded-lg"
                  />
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>

        {/* PRODUCT DETAILS */}
        <div className="mx-auto mt-14 max-w-2xl sm:mt-16 lg:col-span-3 lg:row-span-2 lg:row-end-2 lg:mt-0 lg:max-w-none">
          <div className="flex flex-col-reverse">
            <div className="mt-2">
              <Link
                to={`/store/${product.users_id}`}
                className="text-sm text-gray-500"
              >
                {product.entrepreneur}
              </Link>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                {product.name}
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                {product.entrepreneur_state}
              </p>

              <p className="mt-4 text-3xl tracking-tight text-gray-900">
                MXN {formatPrice(product.price)}
              </p>
            </div>

            {/* <div>
              <h3 className="sr-only">Reviews</h3>
              <div className="flex items-center">
                {[0, 1, 2, 3, 4].map((rating) => (
                  <StarIcon
                    key={rating}
                    className={classNames(
                      reviews.average > rating
                        ? "text-yellow-400"
                        : "text-gray-300",
                      "h-5 w-5 flex-shrink-0"
                    )}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="sr-only">{reviews.average} de 5 estrellas</p>
            </div> */}
          </div>

          {/* SIZE & MODELS */}
          {productVariationType != PRODUCT_VARIATION_TYPES.UNIQUE && (
            <div className="mt-8">
              <h2 className="text-sm font-medium text-gray-900">
                Tallas / Modelos
              </h2>

              <RadioGroup
                defaultValue={selectedProductVariation}
                onChange={selectedProductVariationChangeHandler}
                className="mt-2"
              >
                <RadioGroup.Label className="sr-only">
                  Elige un modelo
                </RadioGroup.Label>
                <div className="grid grid-cols-3 gap-3">
                  {product.models.map((size) => (
                    <RadioGroup.Option
                      key={size.id}
                      value={size}
                      className={({ active, checked }) =>
                        classNames(
                          size.stock
                            ? "cursor-pointer focus:outline-none"
                            : "cursor-not-allowed opacity-25",
                          active ? "ring-2 ring-primary-500 ring-offset-2" : "",
                          checked
                            ? "border-transparent bg-primary-600 text-white hover:bg-primary-700"
                            : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50",
                          "flex sm:flex-1 items-center justify-center rounded-md border py-3 px-3 text-sm font-medium uppercase "
                        )
                      }
                      disabled={!size.stock}
                    >
                      <RadioGroup.Label as="span">
                        {size.size || ""}
                        {size.size && size.model ? " / " : ""}
                        {size.model || ""}
                      </RadioGroup.Label>
                    </RadioGroup.Option>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}

          {/* PRODUCT SHORT DESCRIPTION */}
          {product.short_description != null && (
            <div className="mt-10">
              <h2 className="text-sm font-medium text-gray-900">Descripción</h2>
              <p className="mt-2 text-gray-500">
                {(selectedProductVariationDescription)}
              </p>
            </div>
          )}

          {/* ADD TO CART FORM */}
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <addToCartForm.Form method="post">
              <input
                type="hidden"
                name="users_id"
                defaultValue={String(product.users_id)}
              />
              <input
                type="hidden"
                name="id"
                defaultValue={String(product.id)}
              />
              {productVariationType != PRODUCT_VARIATION_TYPES.UNIQUE && (
                <input
                  type="hidden"
                  name="modelo"
                  defaultValue={String(selectedProductVariation?.id)}
                />
              )}

              <div>
                <SelectBox
                  label="Cantidad"
                  value={selectedQuantity}
                  onChange={setSelectedQuantity}
                  optionsList={stockOptionsList}
                />
                <input
                  type="hidden"
                  name="quantity"
                  defaultValue={selectedQuantity?.id || "1"}
                />
              </div>
              <button
                onClick={validateForm}
                name="action"
                value="addToCart"
                className="mt-5 flex w-full items-center justify-center rounded-md border border-transparent bg-primary-600 px-8 py-3 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-50"
              >
                Agregar al carrito
              </button>
              {/* 
                <button
                  name="action"
                  value="addToCart"
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-primary-50 px-8 py-3 text-base font-medium text-primary-700 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                >
                  Preview
                </button> */}
            </addToCartForm.Form>
          </div>

          {/* TECHNICAL SPECS */}
          {product.documentUrl != null && (
            <div className="mt-10 border-t border-gray-200 pt-10">
              <h3 className="text-sm font-medium text-gray-900">
                Especificaciones
              </h3>
              <div className="prose prose-sm mt-4 text-gray-500">
                <a
                  target="_blank"
                  href={product.documentUrl}
                  className="mt-2 items-center justify-center rounded-md border border-gray-300 bg-white px-8 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 "
                >
                  Descargar especificaciones
                </a>
              </div>
            </div>
          )}

          {/* INSTRUCTIVE DOCUMENT */}
          {product.instructive_documents_id != null && (
            <div className="mt-10 border-t border-gray-200 pt-10">
              <h3 className="text-sm font-medium text-gray-900">Instructivo</h3>
              <div className="prose prose-sm mt-4 text-gray-500">
                <a
                  target="_blank"
                  href={product.instructive_documents_id}
                  className="mt-2 items-center justify-center rounded-md border border-gray-300 bg-white px-8 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 "
                >
                  Descargar instructivo
                </a>
              </div>
            </div>
          )}

          {/* <div className="mt-10 border-t border-gray-200 pt-10">
            <h3 className="text-sm font-medium text-gray-900">Share</h3>
            <ul role="list" className="mt-4 flex items-center space-x-6">
              <li>
                <a
                  href="#"
                  className="flex h-6 w-6 items-center justify-center text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Share on Facebook</span>
                  <svg
                    className="h-5 w-5"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex h-6 w-6 items-center justify-center text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Share on Instagram</span>
                  <svg
                    className="h-6 w-6"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex h-6 w-6 items-center justify-center text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Share on X</span>
                  <svg
                    className="h-5 w-5"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M11.4678 8.77491L17.2961 2H15.915L10.8543 7.88256L6.81232 2H2.15039L8.26263 10.8955L2.15039 18H3.53159L8.87581 11.7878L13.1444 18H17.8063L11.4675 8.77491H11.4678ZM9.57608 10.9738L8.95678 10.0881L4.02925 3.03974H6.15068L10.1273 8.72795L10.7466 9.61374L15.9156 17.0075H13.7942L9.57608 10.9742V10.9738Z" />
                  </svg>
                </a>
              </li>
            </ul>
          </div> */}
        </div>

        <div className="mx-auto mt-16 w-full max-w-2xl lg:col-span-4 lg:mt-0 lg:max-w-none">
          <Tab.Group as="div">
            <div className="border-b border-gray-200">
              <Tab.List className="-mb-px flex space-x-8">
                <Tab
                  className={({ selected }) =>
                    classNames(
                      selected
                        ? "border-secondary-600 text-secondary-600"
                        : "border-transparent text-gray-700 hover:border-gray-300 hover:text-gray-800",
                      "whitespace-nowrap border-b-2 py-6 text-sm font-medium"
                    )
                  }
                >
                  Descripción
                </Tab>

                {/* <Tab
                  className={({ selected }) =>
                    classNames(
                      selected
                        ? "border-secondary-600 text-secondary-600"
                        : "border-transparent text-gray-700 hover:border-gray-300 hover:text-gray-800",
                      "whitespace-nowrap border-b-2 py-6 text-sm font-medium"
                    )
                  }
                >
                  Preguntas frecuentes
                </Tab> */}
                {/* <Tab
                  className={({ selected }) =>
                    classNames(
                      selected
                        ? "border-secondary-600 text-secondary-600"
                        : "border-transparent text-gray-700 hover:border-gray-300 hover:text-gray-800",
                      "whitespace-nowrap border-b-2 py-6 text-sm font-medium"
                    )
                  }
                >
                  Reseñas
                </Tab> */}
              </Tab.List>
            </div>
            <Tab.Panels as={Fragment}>
              <Tab.Panel className="pt-10">
                <h3 className="sr-only">Descripción</h3>

                <div
                  className="prose prose-sm max-w-none text-gray-500"
                >{(product.description)}</div>
              </Tab.Panel>

              {/* <Tab.Panel className="-mb-10">
                <h3 className="sr-only">Customer Reviews</h3>

                {reviews.featured.map((review, reviewIdx) => (
                  <div
                    key={review.id}
                    className="flex space-x-4 text-sm text-gray-500"
                  >
                    <div className="flex-none py-10">
                      <img
                        src={review.avatarSrc}
                        alt=""
                        className="h-10 w-10 rounded-full bg-gray-100"
                      />
                    </div>
                    <div
                      className={classNames(
                        reviewIdx === 0 ? "" : "border-t border-gray-200",
                        "flex-1 py-10"
                      )}
                    >
                      <h3 className="font-medium text-gray-900">
                        {review.author}
                      </h3>
                      <p>
                        <time dateTime={review.datetime}>{review.date}</time>
                      </p>

                      <div className="mt-4 flex items-center">
                        {[0, 1, 2, 3, 4].map((rating) => (
                          <StarIcon
                            key={rating}
                            className={classNames(
                              review.rating > rating
                                ? "text-yellow-400"
                                : "text-gray-300",
                              "h-5 w-5 flex-shrink-0"
                            )}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                      <p className="sr-only">{review.rating} out of 5 stars</p>

                      <div
                        className="prose prose-sm mt-4 max-w-none text-gray-500"
                        dangerouslySetInnerHTML={{ __html: review.content }}
                      />
                    </div>
                  </div>
                ))}
              </Tab.Panel> */}

              {/* <Tab.Panel className="text-sm text-gray-500">
                <h3 className="sr-only">Frequently Asked Questions</h3>

                <dl>
                  {faqs.map((faq) => (
                    <Fragment key={faq.question}>
                      <dt className="mt-10 font-medium text-gray-900">
                        {faq.question}
                      </dt>
                      <dd className="prose prose-sm mt-2 max-w-none text-gray-500">
                        <p>{faq.answer}</p>
                      </dd>
                    </Fragment>
                  ))}
                </dl>
              </Tab.Panel> */}

              {/* <Tab.Panel className="pt-10">
                <h3 className="sr-only">License</h3>

                <div
                  className="prose prose-sm max-w-none text-gray-500"
                  dangerouslySetInnerHTML={{ __html: license.content }}
                />
              </Tab.Panel> */}
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>

      {/* Related products */}
      <div className="mx-auto mt-24 max-w-2xl sm:mt-32 lg:max-w-none">
        <div className="flex items-center justify-between space-x-4">
          <h2 className="text-lg font-medium text-gray-900">
            Productos relacionados
          </h2>
          {/* <a
            href="#"
            className="whitespace-nowrap text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            View all
            <span aria-hidden="true"> &rarr;</span>
          </a> */}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 lg:grid-cols-5">
          {relatedProducts.map((product: Product) => (
            <ProductThumbnail containerClassName="border-0" key={product.id} product={product} />
            // <div key={product.id} className="group relative">
            //   <div className="aspect-h-3 aspect-w-4 overflow-hidden rounded-lg bg-gray-100">
            //     <img
            //       src={product.image}
            //       alt={product.name}
            //       className="object-cover object-center"
            //     />
            //     <div
            //       className="flex items-end p-4 opacity-0 group-hover:opacity-100"
            //       aria-hidden="true"
            //     >
            //       <div className="w-full rounded-md bg-white bg-opacity-75 px-4 py-2 text-center text-sm font-medium text-gray-900 backdrop-blur backdrop-filter">
            //         Ver Producto
            //       </div>
            //     </div>
            //   </div>
            //   <div className="mt-4 flex items-center justify-between space-x-8 text-base font-medium text-gray-900">
            //     <h3>
            //       <Link to={`/product/${product.id}`}>
            //         <span aria-hidden="true" className="absolute inset-0" />
            //         {product.name}
            //       </Link>
            //     </h3>
            //     <p>{product.price}</p>
            //   </div>
            //   <p className="mt-1 text-sm text-gray-500">{product.user}</p>
            // </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalDisplay && (
        <DialogOverlay
          onClose={() => setModalDisplay(false)}
          message={"actionData.errors.payment_error.message"}
          display={true}
        >
          <div>
            <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto" />
            <h3 className="text-lg text-center font-medium text-gray-900 mt-1">
              Producto agregado al carrito
            </h3>
          </div>
          <div className="flex justify-around align-middle mt-5">
            <button
              onClick={() => setModalDisplay(false)}
              className="text-sm font-medium text-gray-600 hover:text-gray-500"
              className="flex items-center justify-center rounded-md border bg-transparent px-8 py-3 text-base font-medium text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 focus:ring-offset-gray-50"
            >
              Continuar comprando
            </button>

            <Link
              to="/cart"
              className="flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-8 py-3 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-50"
            >
              Ir al carrito
            </Link>
          </div>
          
        </DialogOverlay>
      )}
    </div>
  );
}
