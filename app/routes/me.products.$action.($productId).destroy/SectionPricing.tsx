import { useEffect, useState } from "react";
import { useFetcher } from "@remix-run/react";
import { Listbox, Transition, Switch } from "@headlessui/react";

import type { Product } from "~/types/Product";

import InputText from "~/components/InputText";
import TextArea from "~/components/TextArea";
import SelectBox from "~/components/SelectBox";
import InputLabelList from "~/components/InputLabelList";

import classNames from "~/utils/classNames";

// TYPES
interface PricingProps {
  product: Product;
  categories: Array<{ [key: string]: any }>;
  subcategories: Array<{ [key: string]: any }>;
  onCategoryChange: (categoryId: number) => Promise<any>;
}

// COMPONENT
export default function SectionPricing({
  product,
  categories,
  subcategories,
  onCategoryChange = async () => {},
}: PricingProps) {
  const productForm = useFetcher();

  // Discounts
  const [discountsEnabled, setDiscountsEnabled] = useState(
    product.activate_discount || 0
  );
  const discountOptionsList: Array<{ label: string; value: number }> = [
    { label: "5%", value: 5 },
    { label: "10%", value: 10 },
    { label: "15%", value: 15 },
    { label: "20%", value: 20 },
    { label: "25%", value: 25 },
    { label: "30%", value: 30 },
    { label: "40%", value: 40 },
    { label: "50%", value: 50 },
  ];
  const [productDiscount, setProductDiscount] = useState(
    product.discount ? product.discount : 0
  );
  const onDiscountChange = (event): void => {
    const discount = parseFloat((event.target as HTMLInputElement).value);
    setProductDiscount(discount);
  };
  const onDiscountSwitchChange = (isActive: boolean): void => {
    setDiscountsEnabled(isActive ? 1 : 0);
    setProductDiscount(!isActive ? 0 : discountOptionsList[0].value);
  };
  const onPrePriceChange = (event): void => {
    const price = parseFloat((event.target as HTMLInputElement).value);
    setPrePrice(price);
  };

  //
  const TAX_BASE = 1.16;
  const TAKE_RATE = 0.1;
  const [prePrice, setPrePrice] = useState(
    Number(product.pre_price) || 0
  );
  const [prePriceDiscount, setPrePriceDiscount] = useState(
    Number(product.pre_price_discount) || prePrice
  );
  const [iva, setIva] = useState(
    product.iva != null ? Number(product.iva) : TAX_BASE
  );
  const [priceSubtotal, setPriceSubtotal] = useState(
    Number(product.price_subtotal) || 0
  );
  const [commissionPrice, setCommissionPrice] = useState(
    Number(product.commission_price) || 0
  );
  const [price, setPrice] = useState(Number(product.price) || 0);
  const [billing, setBilling] = useState(price - commissionPrice || 0);
  const caluculatePricing = (): void => {
    // Discount calculation
    const calculatedPrePrice = prePrice;
    const calculatedDiscount = productDiscount / 100;
    const calculatedPrePriceDiscount =
      calculatedPrePrice - calculatedPrePrice * calculatedDiscount;

    // // Taxes calculation
    const calculatedTax =
      calculatedPrePriceDiscount - calculatedPrePriceDiscount / TAX_BASE;
    const calculatedPriceSubtotal = calculatedPrePriceDiscount - calculatedTax;

    // // Take rate calculation
    const calculatedTakeRate = calculatedPriceSubtotal * TAKE_RATE;

    // // Seller payout calculation
    const calculatedPrice = calculatedPrePriceDiscount;
    const calculatedBilling = calculatedPrice - calculatedTakeRate;

    // Update the state
    setPrePriceDiscount(Number(calculatedPrePriceDiscount).toFixed(2));
    setIva(Number(calculatedTax).toFixed(2));
    setPriceSubtotal(Number(calculatedPriceSubtotal).toFixed(2));
    setCommissionPrice(Number(calculatedTakeRate).toFixed(2));
    setPrice(Number(calculatedPrice).toFixed(2));
    setBilling(Number(calculatedBilling).toFixed(2));
  };
  useEffect(() => {
    if (typeof productDiscount === "number" && typeof prePrice === "number") {
      caluculatePricing();
    }
  }, [productDiscount, prePrice]);

  // Render component
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
      <div className="px-4 sm:px-0">
        <h2 className="text-base font-semibold leading-7 text-gray-900">
          Precio
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">
          We'll always let you know about important changes, but you pick what
          else you want to hear about.
        </p>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2" >
        {/* Product Id */}
        <input type="hidden" name="id" defaultValue={product.id} />
        <input type="hidden" name="users_id" defaultValue={product.users_id} />

        <div className="px-4 py-6 sm:p-8">
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            {/* CUSTOMER PRICE */}
            <div className="col-span-full">
              <label
                htmlFor="website"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Precio final
              </label>
              <div className="mt-2">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                  <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                    MXN$
                  </span>
                  <input
                    type="text"
                    name="pre_price"
                    id="pre_price"
                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="0.00"
                    onChange={onPrePriceChange}
                    value={prePrice}
                  />
                </div>
              </div>
            </div>

            {/* DISCOUNTS */}
            <div className="col-span-full">
              <Switch.Group
                as="div"
                className="flex items-center justify-between"
              >
                <span className="flex flex-grow flex-col">
                  <Switch.Label
                    as="span"
                    className="text-sm font-medium leading-6 text-gray-900"
                    passive
                  >
                    Descuentos
                  </Switch.Label>
                  <Switch.Description
                    as="span"
                    className="text-sm text-gray-500"
                  >
                    Habilitar descuentos para este producto.
                  </Switch.Description>
                </span>
                <Switch
                  checked={discountsEnabled}
                  onChange={onDiscountSwitchChange}
                  className={classNames(
                    discountsEnabled ? "bg-indigo-600" : "bg-gray-200",
                    " self-end relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                  )}
                >
                  <input
                    type="hidden"
                    name="activate_discount"
                    defaultValue={discountsEnabled}
                  />
                  <span
                    aria-hidden="true"
                    className={classNames(
                      discountsEnabled ? "translate-x-5" : "translate-x-0",
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    )}
                  />
                </Switch>
              </Switch.Group>

              {!!discountsEnabled && (
                <div className="mt-6 space-y-6">
                  {discountOptionsList.map((discount, index) => (
                    <div className="flex items-center gap-x-3">
                      <input
                        type="radio"
                        name="discount"
                        id={`discount-option-${index}`}
                        value={discount.value}
                        checked={productDiscount == discount.value}
                        onChange={onDiscountChange}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                      <label
                        htmlFor={`discount-option-${index}`}
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        {discount.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PRICE BREAKDOWN */}
            <div className="col-span-full">
              <div className="sm:col-span-4 mt-4">
                <div className="flex items-baseline">
                  <label
                    htmlFor="price_subtotal"
                    className="block w-36 mr-2 mb-4 text-sm font-medium leading-6 text-gray-900"
                  >
                    Precio antes de IVA
                  </label>
                  <div>
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                      <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                        MXN$
                      </span>
                      <input
                        type="text"
                        name="price_subtotal"
                        id="price_subtotal"
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder="0.00"
                        defaultValue={priceSubtotal}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-baseline">
                  <label
                    htmlFor="commission_price"
                    className="block w-36 mr-2 mb-4 text-sm font-medium leading-6 text-gray-900"
                  >
                    Comisión
                  </label>
                  <div>
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                      <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                        MXN$
                      </span>
                      <input
                        type="text"
                        name="commission_price"
                        id="commission_price"
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder="0.00"
                        defaultValue={commissionPrice}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-baseline">
                  <label
                    htmlFor="billing"
                    className="block w-36 mr-2 mb-4 text-sm font-medium leading-6 text-gray-900"
                  >
                    Facturación
                  </label>
                  <div>
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                      <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                        MXN$
                      </span>
                      <input
                        type="text"
                        name="billing"
                        id="billing"
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder="0.00"
                        defaultValue={billing}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
