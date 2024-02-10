import { Fragment, useEffect, useState } from "react";
import { useFetcher } from "@remix-run/react";
import { Listbox, Transition, Switch } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/20/solid";

import type { Product } from "~/types/Product";
import type { ProductVariation } from "~/types/ProductVariation";

import InputText from "~/components/InputText";
import TextArea from "~/components/TextArea";
import SelectBox from "~/components/SelectBox";
import InputLabelList from "~/components/InputLabelList";

import classNames from "~/utils/classNames";

//
const PRODUCT_STOCK_TYPES: {
  UNIQUE: string;
  VARIATIONS: string;
} = {
  UNIQUE: "productunique",
  VARIATIONS: "sizes",
};

const elaborationTimeOptions = [
  { id: 1, name: "1 día", value: "1_days" },
  { id: 2, name: "2 días", value: "5_days" },
  { id: 3, name: "3 días", value: "7_days" },
  { id: 6, name: "4 días", value: "15_days" },
  { id: 4, name: "5 días", value: "30_days" },
];

// TYPES
interface VariationProps {
  product: Product;
  categories: Array<{ [key: string]: any }>;
  subcategories: Array<{ [key: string]: any }>;
  onCategoryChange: (categoryId: number) => Promise<any>;

  handleNewVariationRequest: (variation: ProductVariation | null) => {};
}

// COMPONENT
export default function SectionVariations({
  product,
  handleNewVariationRequest,
}: VariationProps) {
  const productForm = useFetcher();

  // Product Type
  const [productStockType, setProductStockType] = useState(
    product.stocktype || PRODUCT_STOCK_TYPES.UNIQUE
  );
  const [productVariations, setProductVariations] = useState(
    product.models || []
  );
  const handleVariationInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: number | null,
    key: string
  ) => {
    const { name, value } = event.target;
    let updatedVariations: Array<ProductVariation> = productVariations.map(
      (variation: ProductVariation) => {
        return variation.id === id ? { ...variation, [key]: value } : variation;
      }
    );
    setProductVariations(updatedVariations);
  };

  //
  const onStockTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProductStockType(event.target.value);
  };

  // Variation Curl
  function addNewProductVariation(): ProductVariation | null {
    handleNewVariationRequest(null);
    return null;
  }
  function editProductVariation(variation: ProductVariation) {
    handleNewVariationRequest(variation);
    return;
  }
  function removeProductVariation(index: number): Array<ProductVariation> {
    const newProductVariations = productVariations.filter(
      (variation: ProductVariation) => variation.id == index
    );
    setProductVariations(newProductVariations);

    //
    return newProductVariations;
  }

  // Elabortion Time
  const [elaborationTime, setElaborationTime] = useState(
    (() => {
      return (
        elaborationTimeOptions.find(
          (option) => option.value == product.delivery_time
        ) || elaborationTimeOptions[0]
      );
    })()
  );

  // Reciclable component
  const addVariationButton = () => {
    return (
      <button
        type="button"
        onClick={() => addNewProductVariation()}
        className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100"
      >
        <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
        Agregar variación
      </button>
    );
  };

  // Render component
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
      {/* SECTION TITLE */}
      <div className="px-4 sm:px-0">
        <h2 className="text-base font-semibold leading-7 text-gray-900">
          Inventario
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
            {/* STOCK TYPE SELECTOR */}
            <div className="col-span-full">
              <label className="text-base font-semibold text-gray-900">
                Tipo de producto
              </label>
              <p className="text-sm text-gray-500">
                How do you prefer to receive notifications?
              </p>

              <fieldset className="mt-4">
                <legend className="sr-only">Tipo de producto</legend>
                <div className="space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
                  <div className="flex items-center">
                    <input
                      id="productunique"
                      name="stocktype"
                      value="productunique"
                      type="radio"
                      onChange={onStockTypeChange}
                      checked={productStockType == PRODUCT_STOCK_TYPES.UNIQUE}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <label
                      htmlFor="productunique"
                      className="ml-3 block text-sm font-medium leading-6 text-gray-900"
                    >
                      Producto único
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="sizes"
                      name="stocktype"
                      value="sizes"
                      type="radio"
                      onChange={onStockTypeChange}
                      checked={
                        productStockType == PRODUCT_STOCK_TYPES.VARIATIONS
                      }
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <label
                      htmlFor="sizes"
                      className="ml-3 block text-sm font-medium leading-6 text-gray-900"
                    >
                      Con variaciones (tallas/modelos)
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>

            {/* VARIATIONS LIST */}
            {productStockType == PRODUCT_STOCK_TYPES.UNIQUE ? (
              <>
                {/* SKU */}
                <div className="sm:col-span-4">
                  <InputText
                    id="sku"
                    name="sku"
                    type="text"
                    label="Sku"
                    autoComplete="sku"
                    defaultValue={product.sku}
                    placeholder="Identificador único"
                    // errors={formErrors?.clabe}
                  />
                </div>

                <div className="col-span-full">
                  <div className="sm:col-span-4 mt-4">
                    <div className="flex items-baseline">
                      <label
                        htmlFor="stock"
                        className="block w-36 mr-2 mb-4 text-sm font-medium leading-6 text-gray-900"
                      >
                        Inventario
                      </label>
                      <div>
                        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                          <input
                            id="stock"
                            name="stock"
                            type="text"
                            autoComplete="stock"
                            defaultValue={product.stock}
                            placeholder="0"
                            className="block flex-1 border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-full">
                  <div className="sm:col-span-4 mt-4">
                    <div className="flex items-baseline">
                      <label
                        htmlFor="weight"
                        className="block w-36 mr-2 mb-4 text-sm font-medium leading-6 text-gray-900"
                      >
                        Peso
                      </label>
                      <div>
                        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                          <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                            Kg.
                          </span>
                          <input
                            type="text"
                            name="weight"
                            id="weight"
                            className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                            placeholder="0.00"
                            defaultValue={product.weight}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-baseline">
                      <label
                        htmlFor="high"
                        className="block w-36 mr-2 mb-4 text-sm font-medium leading-6 text-gray-900"
                      >
                        Alto
                      </label>
                      <div>
                        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                          <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                            Cm.
                          </span>
                          <input
                            type="text"
                            name="high"
                            id="high"
                            className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                            placeholder="0.00"
                            defaultValue={product.high}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-baseline">
                      <label
                        htmlFor="longg"
                        className="block w-36 mr-2 mb-4 text-sm font-medium leading-6 text-gray-900"
                      >
                        Largo
                      </label>
                      <div>
                        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                          <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                            Cm.
                          </span>
                          <input
                            type="text"
                            name="longg"
                            id="longg"
                            className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                            placeholder="0.00"
                            defaultValue={product.longg}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-baseline">
                      <label
                        htmlFor="width"
                        className="block w-36 mr-2 mb-4 text-sm font-medium leading-6 text-gray-900"
                      >
                        Ancho
                      </label>
                      <div>
                        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                          <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                            Cm.
                          </span>
                          <input
                            type="text"
                            name="width"
                            id="width"
                            className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                            placeholder="0.00"
                            defaultValue={product.width}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {!productVariations.length ? (
                  <div className="col-span-full relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">
                      No hay variaciones
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Comienza agregando una nueva variación o modelo a tu
                      producto.
                    </p>
                    <div className="mt-6">{addVariationButton()}</div>
                  </div>
                ) : (
                  <div className="col-span-full">
                    <div className="mt-8 flow-root">
                      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                          <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                              <tr>
                                <th
                                  scope="col"
                                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                                >
                                  Editar
                                </th>
                                <th
                                  scope="col"
                                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                                >
                                  Variación
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                  Sku
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                  Stock
                                </th>

                                {/*
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                      Largo
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                      Ancho
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                      Alto
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                      Peso
                                    </th>
                                    */}

                                <th
                                  scope="col"
                                  className="relative py-3.5 pl-3 pr-4 sm:pr-0"
                                >
                                  <span className="sr-only">Eliminar</span>
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {productVariations.map(
                                (
                                  variation: ProductVariation,
                                  index: number
                                ) => (
                                  <Fragment key={variation.id}>
                                    <tr key={variation.id}>
                                      {/*<td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                                          <div className="flex items-center">
                                            <div className="h-11 w-11 flex-shrink-0">
                                              <img className="h-11 w-11 rounded-full" src={'person.image'} alt="" />
                                            </div>
                                            <div className="ml-4">
                                              <div className="font-medium text-gray-900">{'person.name'}</div>
                                              <div className="mt-1 text-gray-500">{'person.email'}</div>
                                            </div>
                                          </div>
                                        </td>*/}

                                      <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                        <input
                                          name={`models[${index}][position]`}
                                          defaultValue={variation.id}
                                          type="number"
                                          hidden
                                        />
                                        <input
                                          name={`models[${index}][id]`}
                                          defaultValue={variation.id}
                                          type="number"
                                          hidden
                                        />
                                        <input
                                          name={`models[${index}][description]`}
                                          defaultValue={variation.description}
                                          type="text"
                                          hidden
                                        />
                                        <input
                                          name={`models[${index}][width]`}
                                          defaultValue={variation.width}
                                          type="text"
                                          hidden
                                        />
                                        <input
                                          name={`models[${index}][high]`}
                                          defaultValue={variation.high}
                                          type="text"
                                          hidden
                                        />
                                        <input
                                          name={`models[${index}][longg]`}
                                          defaultValue={variation.longg}
                                          type="text"
                                          hidden
                                        />
                                        <input
                                          name={`models[${index}][weight]`}
                                          defaultValue={variation.weight}
                                          type="text"
                                          hidden
                                        />

                                        
                                        <a
                                          href="#"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            editProductVariation(variation);
                                          }}
                                          className="text-indigo-600 hover:text-indigo-900"
                                        >
                                          Editar
                                        </a>
                                      </td>

                                      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                        {/* <div className="text-gray-900">{variation.name}</div> */}
                                        <InputText
                                          name={`models[${index}][size]`}
                                          type="text"
                                          autoComplete="size"
                                          value={variation.size}
                                          onChange={(e) =>
                                            handleVariationInputChange(
                                              e,
                                              variation.id,
                                              "size"
                                            )
                                          }
                                          // errors={formErrors?.clabe}
                                        />
                                        {/* <input 
                                             
                                            value={variation.name}
                                            required
                                          /> */}
                                        {/* <div className="mt-1 text-gray-500">{variation.stock}</div> */}
                                      </td>

                                      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                        {/* <div className="text-gray-900">{variation.sku}</div> */}
                                        <InputText
                                          name={`models[${index}][sku]`}
                                          type="text"
                                          autoComplete="sku"
                                          value={variation.sku}
                                          onChange={(e) =>
                                            handleVariationInputChange(
                                              e,
                                              variation.id,
                                              "sku"
                                            )
                                          }
                                          // errors={formErrors?.clabe}
                                        />
                                      </td>

                                      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                        {/* <div className="text-gray-900">{variation.stock}</div> */}
                                        <InputText
                                          name={`models[${index}][stock]`}
                                          type="text"
                                          autoComplete="stock"
                                          value={variation.stock}
                                          onChange={(e) =>
                                            handleVariationInputChange(
                                              e,
                                              variation.id,
                                              "stock"
                                            )
                                          }
                                          // errors={formErrors?.clabe}
                                        />
                                      </td>

                                      {/*
                                        <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                          <div className="text-gray-900">{variation.width}cm</div>
                                          <input 
                                            name={`models[${index}][width]`} 
                                            value={variation.width}
                                            type="number" 
                                            required
                                          />
                                        </td>

                                        <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                          <div className="text-gray-900">{variation.high}cm</div>
                                          <input 
                                            name={`models[${index}][high]`} 
                                            value={variation.high}
                                            type="number" 
                                            required
                                          />
                                        </td>

                                        <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                          <div className="text-gray-900">{variation.longg}cm</div>
                                          <input 
                                            name={`models[${index}][longg]`} 
                                            value={variation.longg}
                                            type="number" 
                                            required
                                          />
                                        </td>

                                        <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                          <div className="text-gray-900">{variation.weight}kg</div>
                                          <input 
                                            name={`models[${index}][weight]`} 
                                            value={variation.weight}
                                            type="number" 
                                            required
                                          />
                                        </td> */}

                                      <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                        <a
                                          href="#"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            removeProductVariation(
                                              variation.id
                                            );
                                          }}
                                          className="text-indigo-600 hover:text-indigo-900"
                                        >
                                          Eliminar
                                        </a>
                                      </td>
                                    </tr>
                                  </Fragment>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* ADD VARIATION BUTTON */}
                    <div className="mt-4 text-center">
                      {addVariationButton()}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="col-span-full">
              <SelectBox
                label="Tiempo de elaboración"
                value={elaborationTime}
                onChange={setElaborationTime}
                optionsList={elaborationTimeOptions}
                helperText="Selecciona el tiempo de elaboración de tu producto."
              />
              <input
                type="hidden"
                name="delivery_time"
                defaultValue={elaborationTime?.id || ""}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
