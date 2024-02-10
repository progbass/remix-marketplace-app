import { useState, useEffect } from "react";
import { Link } from "@remix-run/react";
import {
  RadioGroup,
} from "@headlessui/react";
import {
  CheckCircleIcon,
  CircleStackIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";

import type { ShippingMethod, ShoppingCartProduct, ShoppingCartShop } from "~/utils/ShoppingCart";
import { useShoppingCart } from "~/providers/ShoppingCartContext";
import classNames from "~/utils/classNames";

//
type OrderSummaryProps = {
  cartStep: string | undefined;
  onProductRemove: (product: any) => void;
  onProductQuantityChange: (product: any, quantity: any) => void;
};
export default function OrderSummary({
  cartStep,
  onProductRemove,
  onProductQuantityChange,
}: OrderSummaryProps) {
  // Shopping Cart
  const ShoppingCartInstance = useShoppingCart();
  const [cartItems, setCartItems] = useState<ShoppingCartShop[]>(
    ShoppingCartInstance.getCart()
  );

  // Update the local state when the ShoppingCartInstance changes
  useEffect(() => {
    setCartItems(ShoppingCartInstance.getCart());
  }, [ShoppingCartInstance]);

  // Handle the delivery method change
  const handleDeliveryMethodChange = (shopId:number|string, shippingMethodStringId:string) => {
    // The format of the shippingMethodStringId is `shippingMethod-${shopId}-${courierId}-${serviceType}`;
    // Retrieve the shopId, courierId and serviceType from the shippingMethodStringId
    const [fieldName, shop, courierId, serviceType] = shippingMethodStringId.split("-");

    // Find the selected delivery method whithin the shop
    console.log("shopId", shopId, courierId, serviceType);
    const deliveryMethod = cartItems.find((shop) => shop.id === shopId)
      ?.shippingQuotes
      ?.deliveries.find(
        (delivery:ShippingMethod) => delivery.courierId == courierId && delivery.serviceType == serviceType
      );
    
    // Update shopping cart
    ShoppingCartInstance.setShippingMethod(shopId, deliveryMethod);
  };

  //
  return (
    <div className="mt-10 lg:mt-0">
      <h2 className="text-lg font-medium text-gray-900">Resumen de la orden</h2>

      <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
        <h3 className="sr-only">Productos en tu carrito</h3>
        <ul role="list" className="divide-y divide-gray-200">
          {cartItems.map((shop:ShoppingCartShop) => (
            <li key={shop.id} className="px-4 py-6 sm:px-6">
              <h3 className="font-medium" >{shop.name}</h3>

              {shop.products.map((product:ShoppingCartProduct) => (
                <div key={product.id} className="mt-5 relative">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 rounded-md"
                      />
                    </div>

                    <div className="ml-6 flex flex-1 flex-col">
                      <div className="flex">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm">
                            <Link
                              to={`/product/${product.id}`}
                              className="font-medium text-gray-700 hover:text-gray-800"
                            >
                              {product.name}
                            </Link>
                          </h4>
                          <p className="mt-1 text-sm text-gray-500">
                            {"product.size"}
                          </p>
                        </div>

                        <div className="ml-4 flow-root flex-shrink-0">
                          <button
                            type="button"
                            className="-m-2.5 flex items-center justify-center bg-white p-2.5 text-gray-400 hover:text-gray-500"
                          >
                            <span className="sr-only">Remove</span>
                            <TrashIcon className="h-5 w-5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-1 items-end justify-between pt-2">
                        <p className="mt-1 text-sm font-medium text-gray-900">
                          ${product.price}
                        </p>

                        <div className="ml-4">
                          <label
                            htmlFor={`quantity-${product.id}`}
                            className="sr-only"
                          >
                            Cantidad, {product.name}
                          </label>
                          <select
                            id={`quantity-${product.id}`}
                            name={`quantity-${product.id}`}
                            defaultValue={product.quantity}
                            onChange={(event) =>
                              onProductQuantityChange(product, event)
                            }
                            className="max-w-full rounded-md border border-gray-300 py-1.5 text-left text-base font-medium leading-5 text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((_, index) => (
                              <option value={index} key={index}>
                                {index}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {shop.shippingQuotes?.deliveries?.length > 1 && (
                <div className="mt-5 border-gray-200 ">
                  <RadioGroup
                    defaultValue={`shippingMethod-${shop.id}-${shop?.selectedShippingMethod?.courierId}-${shop?.selectedShippingMethod?.serviceType}`}
                    onChange={(shippingMethodStringId) => handleDeliveryMethodChange(shop.id, shippingMethodStringId)}
                  >
                    <RadioGroup.Label className="text-md text-gray-900">
                      Método de envío
                    </RadioGroup.Label>

                    <div className="mt-4 grid grid-cols-1 gap-y-2 sm:grid-cols-2 lg:grid-cols-1 sm:gap-x-4">
                      {shop.shippingQuotes?.deliveries && shop.shippingQuotes?.deliveries.map((deliveryMethod:ShippingMethod) => (
                        <RadioGroup.Option
                          key={`shippingMethod-${shop.id}-${deliveryMethod.courierId}-${deliveryMethod.serviceType}`}
                          value={`shippingMethod-${shop.id}-${deliveryMethod.courierId}-${deliveryMethod.serviceType}`}
                          className={({ checked, active }) =>
                            classNames(
                              checked ? "border-transparent" : "border-gray-300",
                              active ? "ring-2 ring-indigo-500" : "",
                              "relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none"
                            )
                          }
                        >
                          {({ checked, active }) => (
                            <>
                              {checked ? (
                                <CheckCircleIcon
                                  className="h-6 w-6 text-indigo-600"
                                  aria-hidden="true"
                                />
                              ) : (
                                <CircleStackIcon
                                  className="h-6 w-6 text-gray-300"
                                  aria-hidden="true"
                                />)
                              }

                              <span className="ml-4 flex flex-1">
                                <span className="flex flex-col">
                                  <RadioGroup.Label
                                    as="span"
                                    className="block text-sm font-medium text-gray-900"
                                  >
                                    {deliveryMethod.alias}
                                  </RadioGroup.Label>
                                  
                                  <div className="flex flex-1 mt-1">
                                    <RadioGroup.Description
                                      as="span"
                                      className="text-sm font-medium text-gray-900"
                                    >
                                      ${deliveryMethod.amount}
                                    </RadioGroup.Description>

                                    <RadioGroup.Description
                                      as="span"
                                      className="ml-2 text-sm text-gray-500"
                                    >
                                      {deliveryMethod.serviceName}
                                    </RadioGroup.Description>
                                  </div>
                                </span>
                              </span>
                              
                              <span
                                className={classNames(
                                  active ? "border" : "border-2",
                                  checked
                                    ? "border-indigo-500"
                                    : "border-transparent",
                                  "pointer-events-none absolute -inset-px rounded-lg"
                                )}
                                aria-hidden="true"
                              />
                            </>
                          )}
                        </RadioGroup.Option>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              )}
            </li>
          ))}
        </ul>
        <dl className="space-y-6 border-t border-gray-200 px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <dt className="text-sm">Subtotal</dt>
            <dd className="text-sm font-medium text-gray-900">${ShoppingCartInstance.getSubtotal()}</dd>
            <input type="hidden" name="order[subtotal]" value={ShoppingCartInstance.getSubtotal()} />
          </div>

          {ShoppingCartInstance.getShippingCost() > 1 && (
            <div className="flex items-center justify-between">
              <dt className="text-sm">Costo de envío {`(${ShoppingCartInstance.getCart().length} envíos)`}</dt>
              <dd className="text-sm font-medium text-gray-900">${ShoppingCartInstance.getShippingCost()}</dd>
              <input type="hidden" name="order[envio]" value={ShoppingCartInstance.getShippingCost()} />
            </div>
          )}

          {/* <div className="flex items-center justify-between">
            <dt className="text-sm">Taxes</dt>
            <dd className="text-sm font-medium text-gray-900">$5.52</dd>
          </div> */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-6">
            <dt className="text-base font-medium">Total</dt>
            <dd className="text-base font-medium text-gray-900">${ShoppingCartInstance.getTotal()}</dd>
            <input type="hidden" name="order[total]" value={ShoppingCartInstance.getTotal()} />
          </div>
        </dl>

        <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
          <button
            type="submit"
            className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
          >
            {cartStep == "review" ? "Pagar" : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  );
}
