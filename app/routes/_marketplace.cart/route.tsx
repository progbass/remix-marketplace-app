import { Link, Form } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useState, useContext, useEffect } from "react";

import {
  CheckIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  XMarkIcon as XMarkIconMini,
} from "@heroicons/react/20/solid";

import type { Product } from "~/types/Product";
import type { ShoppingCartProduct , ShoppingCartShop} from "~/utils/ShoppingCart";

import classNames from "~/utils/classNames";
import {ShoppingCartContext} from '~/providers/ShoppingCartContext';

const products = [
  {
    id: 1,
    name: "Basic Tee",
    href: "#",
    price: "$32.00",
    color: "Sienna",
    inStock: true,
    size: "Large",
    imageSrc:
      "https://tailwindui.com/img/ecommerce-images/shopping-cart-page-01-product-01.jpg",
    imageAlt: "Front of men's Basic Tee in sienna.",
  },
  {
    id: 2,
    name: "Basic Tee",
    href: "#",
    price: "$32.00",
    color: "Black",
    inStock: false,
    leadTime: "3–4 weeks",
    size: "Large",
    imageSrc:
      "https://tailwindui.com/img/ecommerce-images/shopping-cart-page-01-product-02.jpg",
    imageAlt: "Front of men's Basic Tee in black.",
  },
  {
    id: 3,
    name: "Nomad Tumbler",
    href: "#",
    price: "$35.00",
    color: "White",
    inStock: true,
    imageSrc:
      "https://tailwindui.com/img/ecommerce-images/shopping-cart-page-01-product-03.jpg",
    imageAlt: "Insulated bottle with white base and black snap lid.",
  },
];
const relatedProducts = [
  {
    id: 1,
    name: "Billfold Wallet",
    href: "#",
    imageSrc:
      "https://tailwindui.com/img/ecommerce-images/shopping-cart-page-01-related-product-01.jpg",
    imageAlt: "Front of Billfold Wallet in natural leather.",
    price: "$118",
    color: "Natural",
  },
  // More products...
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  const cartStep = params.step;

  switch(cartStep){
    case 'shipping':
      return {
        CartStepForm: 'shipping'
      };
    default:
  }

  // Return to the cart page
  redirect('/cart');
  return {};
}
export async function action({
  request,
}: ActionFunctionArgs) {
  const formData = await request.formData();
  const formAction = formData.get('action');

  let productId;
  
  //
  switch(formAction){
    case 'update':
      productId = formData.get('productId');
      const quantity = formData.get('quantity');
      console.log('update product', productId, quantity);
      break;
    case 'remove':
      productId = formData.get('productId');
      console.log('remove product', productId);
      break;
    default:
      return redirect('/checkout/shipping');
      break;
  }

  return {};
}

export default function ShoppingCart() {
  const ShoppingCartInstance = useContext(ShoppingCartContext);
  const [cartShops, setCartShops] = useState<ShoppingCartShop[]>(ShoppingCartInstance.getCart() || []);

  // Update the local state when the ShoppingCartInstance changes
  useEffect(() => {
    setCartShops(ShoppingCartInstance.getCart());
  }, [ShoppingCartInstance]);

  console.log(cartShops)


  // Handle product quantity changes
  const handleProductQuantityChange = (product:ShoppingCartProduct, event: React.ChangeEvent<HTMLSelectElement>) => {
    const quantity = event.target.value;
    ShoppingCartInstance.updateProductQuantity(product, parseInt(quantity));
  };
  const handleProductRemove = (product:ShoppingCartProduct) => {
    ShoppingCartInstance.removeProductFromCart(product);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Carrito de compras
      </h1>

      <Form 
        method="post"
        className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16"
      >
        <section aria-labelledby="cart-heading" className="lg:col-span-7">
          <h2 id="cart-heading" className="sr-only">
            Productos dentro de tu carrito
          </h2>

          <ul
            role="list"
            className="divide-y divide-gray-200 border-b border-t border-gray-200"
          >
            {cartShops.map((shop) => (
              <li key={shop.id} className="py-6 sm:py-10 mt-8">
                <h3 
                  className="text-md font-medium text-gray-900"
                >
                  <Link to={`/shop/${shop.id}`}>
                    {shop.name}
                  </Link>
                </h3>
                
                {shop.products.map((product, productIdx) => (
                  <div key={product.id} className="flex mt-8" >
                    <div className="flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-24 w-24 rounded-md object-cover object-center sm:h-48 sm:w-48"
                      />
                    </div>

                    <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                      <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                        <div>
                          <div className="flex justify-between">
                            <h3 className="text-sm">
                              <Link
                                to={`/product/${product.id}`}
                                className="font-medium text-gray-700 hover:text-gray-800"
                              >
                                {product.name}
                              </Link>
                            </h3>
                          </div>
                          <div className="mt-1 flex text-sm">
                            <p className="text-gray-500">{'product.color'}</p>
                            {/* {product.size ? (
                              <p className="ml-4 border-l border-gray-200 pl-4 text-gray-500">
                                {product.size}
                              </p>
                            ) : null} */}
                          </div>
                          <p className="mt-1 text-sm font-medium text-gray-900">
                            {product.price}
                          </p>
                        </div>

                        <div className="mt-4 sm:mt-0 sm:pr-9">
                          <label
                            htmlFor={`quantity-${productIdx}`}
                            className="sr-only"
                          >
                            Cantidad, {product.name}
                          </label>
                          <select
                            id={`quantity-${productIdx}`}
                            name={`quantity-${productIdx}`}
                            defaultValue={product.quantity}
                            onChange={event => handleProductQuantityChange(product, event)}
                            className="max-w-full rounded-md border border-gray-300 py-1.5 text-left text-base font-medium leading-5 text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                          >{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((_, index) => (
                            <option 
                              value={index}
                              key={index}
                            >{index}</option>
                          ))}
                          </select>

                          <div className="absolute right-0 top-0">
                            <button
                              type="button"
                              onClick={() => handleProductRemove(product)}
                              className="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500"
                            >
                              <span className="sr-only">Eliminar</span>
                              <XMarkIconMini
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                        </div>
                      </div>

                      <p className="mt-4 flex space-x-2 text-sm text-gray-700">
                        {product?.stock ? (
                          <CheckIcon
                            className="h-5 w-5 flex-shrink-0 text-green-500"
                            aria-hidden="true"
                          />
                        ) : (
                          <ClockIcon
                            className="h-5 w-5 flex-shrink-0 text-gray-300"
                            aria-hidden="true"
                          />
                        )}

                        <span>
                          {product?.stock
                            ? "In stock"
                            : `Ships in ${'product.leadTime'}`}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </li>
            ))}
          </ul>
        </section>

        {/* Order summary */}
        <section
          aria-labelledby="summary-heading"
          className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
        >
          <h2
            id="summary-heading"
            className="text-lg font-medium text-gray-900"
          >
            Resumen de la orden
          </h2>

          <dl className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-600">Compra</dt>
              <dd className="text-sm font-medium text-gray-900">${ShoppingCartInstance.getSubtotal()}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <dt className="flex items-center text-sm text-gray-600">
                <span>Costo de envío</span>
                <a
                  href="#"
                  className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">
                    Conoce cómo se calcula el costo de envío
                  </span>
                  <QuestionMarkCircleIcon
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </a>
              </dt>
              <dd className="text-sm font-medium text-gray-900">${ShoppingCartInstance.getShippingCost()}</dd>
            </div>
            {/* <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <dt className="flex text-sm text-gray-600">
                <span>Tax estimate</span>
                <a
                  href="#"
                  className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">
                    Learn more about how tax is calculated
                  </span>
                  <QuestionMarkCircleIcon
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </a>
              </dt>
              <dd className="text-sm font-medium text-gray-900">$8.32</dd>
            </div> */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <dt className="text-base font-medium text-gray-900">
                Total
              </dt>
              <dd className="text-base font-medium text-gray-900">${ShoppingCartInstance.getTotal()}</dd>
            </div>
          </dl>

          <div className="mt-6">
            <button
              type="submit"
              className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
            >
              Continuar
            </button>
          </div>
        </section>
      </Form>

      {/* Related products */}
      <section aria-labelledby="related-heading" className="mt-24">
        <h2 id="related-heading" className="text-lg font-medium text-gray-900">
          You may also like&hellip;
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {relatedProducts.map((relatedProduct) => (
            <div key={relatedProduct.id} className="group relative">
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md lg:aspect-none group-hover:opacity-75 lg:h-80">
                <img
                  src={relatedProduct.imageSrc}
                  alt={relatedProduct.imageAlt}
                  className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                />
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm text-gray-700">
                    <a href={relatedProduct.href}>
                      <span aria-hidden="true" className="absolute inset-0" />
                      {relatedProduct.name}
                    </a>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {relatedProduct.color}
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {relatedProduct.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
