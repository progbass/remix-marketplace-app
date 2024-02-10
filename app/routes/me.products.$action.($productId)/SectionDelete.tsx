import { useFetcher } from "@remix-run/react";

import type { Product } from "~/types/Product";

// TYPES
interface DeleteProps {
  product: Product;
}

// COMPONENT
export default function SectionDelete({ product }: DeleteProps) {

  // Render component
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
      <div className="px-4 sm:px-0">
        <h2 className="text-base font-semibold leading-7 text-gray-900">
          Eliminar
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">
          We'll always let you know about important changes, but you pick what
          else you want to hear about.
        </p>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div className="px-4 py-6 sm:p-8">
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label
                htmlFor="website"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                ¿Estás seguro de querer eliminar el producto?
              </label>
              <div className="mt-2">
                <button
                  type="submit"
                  className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400"
                >
                  Eliminar producto
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
