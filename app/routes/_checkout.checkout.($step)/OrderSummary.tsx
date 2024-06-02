import { Link } from "@remix-run/react";
import { memo, useState } from "react";
import { FetcherWithComponents } from "@remix-run/react";
import { RadioGroup } from "@headlessui/react";
import {
  CheckCircleIcon,
  CircleStackIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";

import type {
  ShippingMethod,
  ShippingQuote,
  ShoppingCartProduct,
  ShoppingCartShop,
  ShoppingCartType,
} from "~/utils/ShoppingCart";
import { useShoppingCart } from "~/providers/ShoppingCartContext";
import classNames from "~/utils/classNames";
import { formatPrice } from "~/utils/formatPrice";

//
type OrderSummaryProps = {
  cartStep: string | undefined;
  checkoutForm: FetcherWithComponents<any>;
  checkoutFormRef: HTMLFormElement | undefined;
  isFormCompleted: boolean;
  onProductRemove: (product: any) => void;
  onProductQuantityChange: (product: any, quantity: any) => void;
};
export default memo(function ({
  cartStep,
  checkoutForm,
  checkoutFormRef,
  isFormCompleted,
  onProductRemove,
  onProductQuantityChange,
}: OrderSummaryProps) {
  // Shopping Cart
  const ShoppingCartInstance = useShoppingCart();
  const localShoppingCart = ShoppingCartInstance;
  const storesList = localShoppingCart.getCart().cart;

  // Handle the delivery method change
  const handleDeliveryMethodChange = (
    storeId: number,
    deliveryMethod: ShippingMethod
  ) => {
    // Save the selected delivery method to the server
    // The form has a delay to allow the DOM to update the hidden inputs
    setTimeout(() => {
      // Submit the form asynchronously
      const formData = new FormData(checkoutFormRef.current);
      formData.set("action", "setShippingMethod"); // Set the action handler
      checkoutForm.submit(formData, {
        method: "POST",
      });
    }, 50);
  };

  // Determine submit button disabled state
  function isSubmitDisabled() {
    // Disable if the form is not present
    if (!checkoutFormRef) return true;

    // Disable if the form is being submitted
    if (checkoutForm.state === "submitting" || checkoutForm.state === "loading")
      return true;

    //
    if (cartStep === "shipping") {
      // Disable if the corresponding form is not comleted
      if (!isFormCompleted) return true;

      // The form can be submitted
      return false;
    }
    if (cartStep === "review") {
      // Disable if the corresponding form is not comleted
      if (!isFormCompleted) return true;

      // The form can be submitted
      return false;
    }

    return true;
  }

  // Render the component
  return (
    <aside className="mt-10 lg:mt-0">
      <h2 className="text-lg font-medium text-gray-900">Resumen de la orden</h2>

      <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
        <h3 className="sr-only">Productos en tu carrito</h3>
        <ul role="list" className="divide-y divide-gray-200">
          {storesList.map((store: ShoppingCartShop, index) => (
            <li key={store.id} className="px-4 py-6 sm:px-6">
              <h3 className="font-medium">{store.name}</h3>

              {/* HIDDEN INPUTS */}
              {
                // Include all products in the cart as hidden inputs
                store.products.map((product, productIndex) => {
                  return Array.from(Object.keys(product)).map(
                    (keyName: string) => {
                      return (
                        <input
                          type="hidden"
                          name={`stores[${store.id}][products][${productIndex}][${keyName}]`}
                          value={product[keyName]}
                        />
                      );
                    }
                  );
                })
              }
              <input
                type="hidden"
                name={`stores[${store.id}][id]`}
                defaultValue={`${store?.id}`}
              />
              <input
                type="hidden"
                name={`stores[${store.id}][name]`}
                defaultValue={`${store?.name}`}
              />
              <input
                type="hidden"
                name={`stores[${store.id}][image]`}
                defaultValue={`${store?.image}`}
              />
              <input
                type="hidden"
                name={`stores[${store.id}][user_id]`}
                defaultValue={`${store?.id}`}
              />
              <input
                type="hidden"
                name={`stores[${store.id}][location]`}
                defaultValue={`${store?.location}`}
              />

              {/* PRODUCTS LIST */}
              {store.products.map((product: ShoppingCartProduct) => (
                <div key={product.id} className="mt-5 relative">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Link
                        to={`/product/${product.id}`}
                        className="font-medium text-gray-700 hover:text-gray-800"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-14 w-14 rounded-md object-cover object-center"
                        />
                      </Link>
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

                          {/* PRODUCT VARIATIONS */}
                          {product.modelo !== null && (
                            <div className="mt-1 flex text-sm">
                              <p className="text-gray-500">
                                <span>Talla/modelo: </span>

                                <span>
                                  {product.namemodel_size || ""}
                                  {product.namemodel_size &&
                                  product.namemodel_model
                                    ? `${product.namemodel_size} / ${product.namemodel_model}`
                                    : ""}
                                  {product.namemodel || ""}
                                </span>
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="ml-4 flow-root flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => onProductRemove(product)}
                            className="-m-2.5 flex items-center justify-center bg-white p-2.5 text-gray-400 hover:text-gray-500"
                          >
                            <span className="sr-only">Remove</span>
                            <TrashIcon className="h-5 w-5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-1 justify-between pt-2">
                        <div>
                          <p className="mt-1 text-sm font-medium text-gray-900">
                            {formatPrice(product.price * product.quantity)}
                          </p>
                        </div>

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
                            className="max-w-full rounded-md border border-gray-300 py-1.5 text-left text-base font-medium leading-5 text-gray-700 shadow-sm focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500 sm:text-sm"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                              .slice(0, product.stock)
                              .map((value) => (
                                <option value={value} key={value}>
                                  {value}
                                </option>
                              ))}
                          </select>

                          {/* UNIT PRICE */}
                          {product.quantity > 1 ? (
                            <p className="pl-1 mt-1 text-xs font-medium text-gray-900">
                              <span className="text-gray-500 font-normal">
                                {formatPrice(product.price)} c/u
                              </span>
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* SHIPPING QUOTES */}
              <ShippingQuotesList
                store={store}
                handleDeliveryMethodChange={handleDeliveryMethodChange}
              />
            </li>
          ))}
        </ul>

        <dl className="space-y-6 border-t border-gray-200 px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <dt className="text-sm">Subtotal {}</dt>
            <dd className="text-sm font-medium text-gray-900">
              {formatPrice(localShoppingCart.getSubtotal())}
            </dd>
            <input
              type="hidden"
              name="order[subtotal]"
              value={localShoppingCart.getSubtotal()}
            />
          </div>

          {cartStep === "review" && (
            <div className="flex items-center justify-between">
              <dt className="text-sm">
                Costo de envío{" "}
                {`(${localShoppingCart.getCart().cart.length} envío${localShoppingCart.getCart().cart.length > 1 ? "s" : ""})`}
              </dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatPrice(localShoppingCart.getShippingCost())}
              </dd>
              <input
                type="hidden"
                name="order[envio]"
                value={localShoppingCart.getShippingCost()}
              />
            </div>
          )}

          {/* <div className="flex items-center justify-between">
            <dt className="text-sm">Taxes</dt>
            <dd className="text-sm font-medium text-gray-900">$5.52</dd>
          </div> */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-6">
            <dt className="text-base font-medium">Total</dt>
            <dd className="text-base font-medium text-gray-900">
              {cartStep === "review"
                ? formatPrice(localShoppingCart.getTotal())
                : formatPrice(localShoppingCart.getSubtotal())}
            </dd>
            <input
              type="hidden"
              name="order[total]"
              value={
                cartStep === "review"
                  ? localShoppingCart.getTotal()
                  : formatPrice(localShoppingCart.getSubtotal())
              }
            />
          </div>
        </dl>

        <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
          <button
            disabled={isSubmitDisabled()}
            type="submit"
            className={classNames(
              isSubmitDisabled()
                ? "cursor-not-allowed opacity-50 bg-gray-400"
                : "cursor-pointer bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 ",
              "w-full rounded-md border border-transparent px-4 py-3 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50"
            )}
          >
            {cartStep == "review" ? "Pagar" : "Continuar"}
          </button>
        </div>
      </div>
    </aside>
  );
});

//
type ShippingQuotesList = {
  store: ShoppingCartShop;
  handleDeliveryMethodChange: (
    storeId: number,
    deliveryMethod: ShippingMethod
  ) => void;
};
const ShippingQuotesList = ({
  store,
  handleDeliveryMethodChange,
}: ShippingQuotesList) => {
  // store selectedShippingMethod in local state
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(
    store?.selectedShippingMethod
  );

  // Handle the delivery method change
  const onShippingMethodChange = (shippingMethodStringId: string) => {
    // The format of the shippingMethodStringId is `shippingMethod-${storeId}-${courierId}-${serviceType}`;
    // Retrieve the storeId, courierId and serviceType from the shippingMethodStringId
    const [fieldName, storeIdString, courierId, serviceType] =
      shippingMethodStringId.split("-");
    const storeId = parseInt(storeIdString);

    // Find the selected delivery method whithin the shop
    const deliveryMethod = store?.shippingQuote?.deliveries.find(
      (delivery: ShippingMethod) =>
        delivery.courierId == courierId && delivery.serviceType == serviceType
    );

    // Update the local state
    setSelectedShippingMethod(deliveryMethod || null);

    // Call the parent handler
    deliveryMethod && handleDeliveryMethodChange(storeId, deliveryMethod);
  };

  // Render component
  return (
    <>
      {store.shippingQuote?.deliveries &&
        store.shippingQuote?.deliveries?.length > 0 && (
          <div className="mt-5 border-gray-200 ">
            <input
              type="hidden"
              name={`stores[${store.id}][selectedShippingMethod][courier]`}
              defaultValue={`${selectedShippingMethod?.courier}`}
            />
            <input
              type="hidden"
              name={`stores[${store.id}][selectedShippingMethod][courierId]`}
              defaultValue={`${selectedShippingMethod?.courierId}`}
            />
            <input
              type="hidden"
              name={`stores[${store.id}][selectedShippingMethod][serviceType]`}
              defaultValue={`${selectedShippingMethod?.serviceType}`}
            />
            <input
              type="hidden"
              name={`stores[${store.id}][selectedShippingMethod][serviceName]`}
              defaultValue={`${selectedShippingMethod?.serviceName}`}
            />
            <input
              type="hidden"
              name={`stores[${store.id}][selectedShippingMethod][deliveryTimestamp]`}
              defaultValue={`${selectedShippingMethod?.deliveryTimestamp}`}
            />
            <input
              type="hidden"
              name={`stores[${store.id}][selectedShippingMethod][amount]`}
              defaultValue={`${selectedShippingMethod?.amount}`}
            />

            <RadioGroup
              defaultValue={`shippingMethod-${store.id}-${selectedShippingMethod?.courierId}-${selectedShippingMethod?.serviceType}`}
              onChange={onShippingMethodChange}
            >
              <RadioGroup.Label className="text-md text-gray-900">
                Método de envío
              </RadioGroup.Label>

              <div className="mt-4 grid grid-cols-1 gap-y-2 sm:grid-cols-2 lg:grid-cols-1 sm:gap-x-4">
                {store.shippingQuote?.deliveries &&
                  store.shippingQuote?.deliveries.map(
                    (deliveryMethod: ShippingMethod) => (
                      <RadioGroup.Option
                        key={`shippingMethod-${store.id}-${deliveryMethod?.courierId}-${deliveryMethod?.serviceType}`}
                        value={`shippingMethod-${store.id}-${deliveryMethod?.courierId}-${deliveryMethod?.serviceType}`}
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
                              />
                            )}

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
                    )
                  )}
              </div>
            </RadioGroup>
          </div>
        )}
    </>
  );
};
