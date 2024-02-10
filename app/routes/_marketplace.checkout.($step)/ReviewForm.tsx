import { Fragment, useState, useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Form, useLoaderData } from "@remix-run/react";
import { redirect } from "@remix-run/node";

import {
  Dialog,
  Popover,
  RadioGroup,
  Tab,
  Transition,
} from "@headlessui/react";
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  ShoppingBagIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";

import type { ShippingMethod, ShoppingCartProduct, ShoppingCartShop } from "~/utils/ShoppingCart";
import { useShoppingCart } from "~/providers/ShoppingCartContext";
import getEnv from "get-env";
import Fetcher from "../../utils/fetcher";
import classNames from "~/utils/classNames";
import SelectBox from "~/components/SelectBox";
import InputText from "~/components/InputText";
import PaymentForm from "./PaymentForm";

//

//
export default function ReviewForm() {
  // Shopping Cart
  const ShoppingCartInstance = useShoppingCart();
  const [shippingInformation, setShippingInformation] = useState(
    ShoppingCartInstance.getShipping()
  );

  // Update the local state when the ShoppingCartInstance changes
  useEffect(() => {
    setShippingInformation(ShoppingCartInstance.getShipping());
  }, [ShoppingCartInstance]);

  //
  return (
    <>
      {/* Shipping Information */}
      <div>
        <input type="hidden" name="user[name]" value={shippingInformation.firstName} />
        <input type="hidden" name="user[lastname]" value={shippingInformation.lastName} />
        <input type="hidden" name="user[email]" value={shippingInformation.email} />
        <input type="hidden" name="user[phone]" value={shippingInformation.phone} />
        <input type="hidden" name="user[address]" value={shippingInformation.address} />
        <input type="hidden" name="user[num_ext]" value={shippingInformation.num_ext} />
        <input type="hidden" name="user[num_int]" value={shippingInformation.num_int} />
        <input type="hidden" name="user[neighborhood]" value={shippingInformation.neighborhood} />
        <input type="hidden" name="user[zipcode]" value={shippingInformation.zip} />
        <input type="hidden" name="user[town_id]" value={shippingInformation.city} />
        <input type="hidden" name="user[state_id]" value={shippingInformation.state} />

        <h2 className="text-lg font-medium text-gray-900">Datos de entrega</h2>
      
        <div className="mt-4 col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow">
          <div className="flex w-full items-center justify-between space-x-6 p-6">
            <div className="flex-1 truncate">
              <div className="flex items-center space-x-3">
                <h3 className="truncate text-sm font-medium text-gray-900">{shippingInformation.firstName} {shippingInformation.lastName}</h3>
              </div>
              <p className="mt-1 truncate text-sm text-gray-500">{shippingInformation.address} {shippingInformation.num_ext}, {shippingInformation.num_int ? `Int. ${shippingInformation.num_int}` : ''}</p>
              <p className="mt-1 truncate text-sm text-gray-500">{shippingInformation.neighborhood} {shippingInformation.zip}, {shippingInformation.cityName}, {shippingInformation.stateName}</p>
            </div>
            
            <Link
              to="/checkout/shipping"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              <span className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                Editar
              </span>
            </Link>
          </div>

          <div>
            <div className="-mt-px flex divide-x divide-gray-200">
              <div className="flex w-0 flex-1">
                <div
                  className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                >
                  {/* <EnvelopeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" /> */}
                  {shippingInformation.email}
                </div>
              </div>
              <div className="-ml-px flex w-0 flex-1">
                <div
                  className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                >
                  {/* <PhoneIcon className="h-5 w-5 text-gray-400" aria-hidden="true" /> */}
                  {shippingInformation.phone}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="mt-10 border-t border-gray-200 pt-10">
        <h2 className="text-lg font-medium text-gray-900">Información de pago</h2>

        <fieldset className="mt-4">
          <div className="">
            <PaymentForm />
          </div>
        </fieldset>
      </div>
    </>
  );
}
