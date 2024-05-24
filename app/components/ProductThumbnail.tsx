import { memo } from "react";
import { Outlet, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { CheckIcon } from "@heroicons/react/20/solid";
import AuthService from "../services/Auth.service";
import { Link } from "react-router-dom";
import { Product } from "~/types/Product";
import { trimWithEllipsis } from "~/utils/stringUtilities";
import { formatPrice } from "~/utils/formatPrice";
import classNames from "~/utils/classNames";
import { TruckIcon } from "@heroicons/react/20/solid";

// COMPONENT PROPS
type ProductThumbnailProps = {
  product: Product;
  containerClassName?: string;
};

// MAIN COMPONENT
export default memo(function ProductThumbnail({
  product,
  containerClassName = "",
}: ProductThumbnailProps) {
  // Discount settings
  const hasDiscount = product?.discount || product?.discount > 0;

  // Render component
  return (
    <div
      key={product.objectID}
      onClick={() => sendEvent("click", product, "Hit Clicked")}
      onAuxClick={() => sendEvent("click", product, "Hit Clicked")}
      className={classNames(
        "group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white",
        containerClassName
      )}
    >
      {/* DISCOUNT BADGE */}
      <div
        className={classNames(
          "z-10 right-0 top-0 text-xs font-medium bg-success-900 px-2 py-1 ",
          hasDiscount
            ? "absolute inline-block text-white"
            : "hidden text-gray-900"
        )}
      >{`-${product.discount} %`}</div>

      {/* IMAGE */}
      <div className="aspect-h-3 aspect-w-3 bg-gray-200 group-hover:opacity-75 ">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain object-center sm:h-full sm:w-full bg-white"
          />
        </Link>
      </div>

      {/* INFO */}
      <div className="flex flex-1 flex-col space-y-1 p-4">
        <div>
          {/* NAME */}
          <h3 className="text-sm font-medium text-gray-900">
            <Link to={`/product/${product.id}`}>
              {/* <span aria-hidden="true" className="absolute inset-0" /> */}
              {trimWithEllipsis(product.name)}
            </Link>
          </h3>

          {/* BRAND */}
          <Link
            to={`/store/${product.users_id}`}
            className="text-sm text-gray-500"
          >
            {trimWithEllipsis(product?.brand?.brand, 26) ||
              trimWithEllipsis(product?.user, 26) ||
              ""}
          </Link>
        </div>

        <div>
          {/* FREE SHIPPING */}
          {product?.free_shipping > 0 && (
            <div className="text-warning-900 flex items-center">
              <div className="inlin-block">
                <TruckIcon className="h-4 w-4" aria-hidden="true" />
              </div>
              <span className="text-sm ml-1">Envío gratis</span>
            </div>
          )}

          {/* PRICE & DISCOUNT */}
          <div className="flex items-center align-middle">
            {hasDiscount && (
              <span className="text-sm font-medium line-through text-gray-500 mr-1">
                {formatPrice(product.pre_price)}
              </span>
            )}

            <span
              className={classNames(
                "text-sm font-medium",
                hasDiscount ? "text-success-900" : "text-gray-900"
              )}
            >
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
