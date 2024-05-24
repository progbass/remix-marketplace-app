import { Product } from "~/types/Product";
import ProductThumbnail from "./ProductThumbnail";

//
type ProductListingProps = {
    items: Product[];
    title: string;
};
export default function ProductListing({ items = [], title }: ProductListingProps) {

  // Return component
  return (
    <section aria-labelledby="trending-heading" className="bg-white">
      <div className="py-8 lg:mx-auto lg:max-w-7xl lg:px-8 ">
        {/* TITLE CONTAINER */}
        {title ? (
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-0">
            <h2
                id="trending-heading"
                className="text-2xl font-bold tracking-tight text-gray-900"
            >{title}</h2>

            {/* <a
                href="#"
                className="hidden text-sm font-semibold text-indigo-600 hover:text-indigo-500 sm:block"
                >
                Ver más
                <span aria-hidden="true"> &rarr;</span>
                </a> */}
            </div>
        ) : null}

        <div className="relative mt-8">
          <div className="relative w-full overflow-x-auto">
            <ul
              role="list"
              className="mx-4 inline-flex space-x-4 sm:mx-6 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-x-4 lg:space-x-0"
            >
              {items.map((product: Product) => (
                <ProductThumbnail 
                  containerClassName="w-52 flex-col lg:w-auto mb-6 border-0 "
                  key={product.id} 
                  product={product} 
                />
                // <>
                //   <li
                //     key={product.id}
                //     className="inline-flex w-52 flex-col lg:w-auto mb-6"
                //   >
                //     <div className="group relative">
                //       <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200">
                //         <img
                //           src={product.image}
                //           alt={product.name}
                //           className="h-full w-full object-cover object-center group-hover:opacity-75"
                //         />
                //       </div>
                //       <div className="mt-4">
                //         <p className="text-sm text-gray-500">{product?.model}</p>
                //         <h3 className="text-sm font-medium text-gray-900">
                //           <Link to={`/product/${product.id}`}>
                //             <span
                //               aria-hidden="true"
                //               className="absolute inset-0"
                //             />
                //             {product.name}
                //           </Link>
                //         </h3>

                //         <p className="mt-2 text-base font-medium text-gray-900">
                //           {product.price}
                //         </p>
                //         <p className="text-sm text-gray-500">
                //           <Link to={`/store/${product?.users_id}`}>
                //             {product?.user}
                //           </Link>
                //         </p>
                //       </div>
                //     </div>

                //     <div className="mt-2 flex flex-col">
                //       <p className="sr-only">{3} out of 5 stars</p>
                //       <div className="flex">
                //         {[0, 1, 2, 3, 4].map((rating) => (
                //           <StarIcon
                //             key={rating}
                //             className={classNames(
                //               3 > rating ? "text-yellow-400" : "text-gray-200",
                //               "h-5 w-5 flex-shrink-0"
                //             )}
                //             aria-hidden="true"
                //           />
                //         ))}
                //       </div>
                //       <p className="mt-1 text-sm text-gray-500">{3} reviews</p>
                //     </div>
                //   </li>
                // </>
              ))}
            </ul>
          </div>
        </div>

        {/* <div className="mt-6 px-4 sm:hidden">
            <a
              href="#"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Ver más
              <span aria-hidden="true"> &rarr;</span>
            </a>
          </div> */}
      </div>
    </section>
  );
}
