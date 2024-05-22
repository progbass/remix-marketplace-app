import { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { StarIcon } from '@heroicons/react/20/solid'

import AuthService from "~/services/Auth.service";
import { Fetcher } from "~/utils/fetcher";
import getEnv from "get-env";
import { Product } from "~/types/Product";
import classNames from "~/utils/classNames";

import ProductListing from "~/components/ProductListing";
import heroBannerImage from "~/statics/hero-banner1.png";

const collections = [
  {
    name: "Desk and Office",
    description: "Work from home accessories",
    imageSrc:
      "https://tailwindui.com/img/ecommerce-images/home-page-02-edition-01.jpg",
    imageAlt:
      "Desk with leather desk pad, walnut desk organizer, wireless keyboard and mouse, and porcelain mug.",
    href: "#",
  },
  {
    name: "Self-Improvement",
    description: "Journals and note-taking",
    imageSrc:
      "https://tailwindui.com/img/ecommerce-images/home-page-02-edition-02.jpg",
    imageAlt:
      "Wood table with porcelain mug, leather journal, brass pen, leather key ring, and a houseplant.",
    href: "#",
  },
  {
    name: "Travel",
    description: "Daily commute essentials",
    imageSrc:
      "https://tailwindui.com/img/ecommerce-images/home-page-02-edition-03.jpg",
    imageAlt: "Collection of four insulated travel bottles on wooden shelf.",
    href: "#",
  },
];
const categories = [
  {
    name: "Moda",
    href: "#",
    imageSrc:
      "https://sfo3.digitaloceanspaces.com/com.mexicolimited/production-bucket/user-uploads/photos/6570d3629ab6e.jpg",
  },
  {
    name: "Vinos",
    href: "#",
    imageSrc:
      "https://sfo3.digitaloceanspaces.com/com.mexicolimited/production-bucket/user-uploads/photos/65bd256ea8128.jpg",
  },
  {
    name: "Hogar",
    href: "#",
    imageSrc:
      "https://sfo3.digitaloceanspaces.com/com.mexicolimited/production-bucket/user-uploads/photos/4ZcrIle6ph8aUozVDjYcxcU7BetDsC0Aq4BAgyVS.jpg",
  },
  {
    name: "Alimentos y Bebidas",
    href: "#",
    imageSrc:
      "https://sfo3.digitaloceanspaces.com/com.mexicolimited/production-bucket/user-uploads/photos/q9g9H1c86xQ8EtgZXwGgcGZ5ZddbbAqLLuJbESaG.jpg",
  },
  {
    name: "Artesanías",
    href: "#",
    imageSrc:
      "https://sfo3.digitaloceanspaces.com/com.mexicolimited/production-bucket/user-uploads/photos/CXu36SwSMQleNu98PxuxYYqqYQDEgdYtoKELUIdQ.png",
  },
];

export const loader: LoaderFunction = async ({ request }:LoaderFunctionArgs) => {
  // If the user is already authenticated redirect to /dashboard directly
  const user = (await AuthService.isAuthenticated(request)) || null;
  const myFetcher = new Fetcher(user?.token, request);

  // Get featured products
  const featuredProducts = await myFetcher.fetch(`${getEnv().API_URL}/productsRandom`, {
    method: "GET"
  });

  return {
    featuredProducts: featuredProducts?.one || [],
    trendyProducts: featuredProducts?.two || [],
    discounts: featuredProducts?.three || [],
  };
}

export default function HomePage() {
  const { featuredProducts, trendyProducts, discounts } = useLoaderData<typeof loader>();
  console.log("featuredProducts", featuredProducts);
  // Return component
  return (
    <>
      {/* Hero */}
      <div className="flex flex-col border-b border-gray-200 lg:border-0">
        {/* <nav aria-label="Offers" className="order-last lg:order-first">
            <div className="mx-auto max-w-7xl lg:px-8">
              <ul
                role="list"
                className="grid grid-cols-1 divide-y divide-gray-200 lg:grid-cols-3 lg:divide-x lg:divide-y-0"
              >
                {offers.map((offer) => (
                  <li key={offer.name} className="flex flex-col">
                    <Link
                      to={offer.href}
                      className="relative flex flex-1 flex-col justify-center bg-white px-4 py-6 text-center focus:z-10"
                    >
                      <p className="text-sm text-gray-500">{offer.name}</p>
                      <p className="font-semibold text-gray-900">
                        {offer.description}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav> */}

        {/*
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute hidden h-full w-1/2 bg-gray-100 lg:block"
          />
          <div className="relative bg-gray-100 lg:bg-transparent">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:grid lg:grid-cols-2 lg:px-8">
              <div className="mx-auto max-w-2xl py-24 lg:max-w-none lg:py-64">
                <div className="lg:pr-16">
                  <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl xl:text-6xl">
                    Focus on what matters
                  </h1>
                  <p className="mt-4 text-xl text-gray-600">
                    All the charts, datepickers, and notifications in the world
                    can't beat checking off some items on a paper card.
                  </p>
                  <div className="mt-6">
                    <a
                      href="#"
                      className="inline-block rounded-md border border-transparent bg-indigo-600 px-8 py-3 font-medium text-white hover:bg-indigo-700"
                    >
                      Shop Productivity
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="h-48 w-full sm:h-64 lg:absolute lg:right-0 lg:top-0 lg:h-full lg:w-1/2">
            <img
              src="https://tailwindui.com/img/ecommerce-images/home-page-02-hero-half-width.jpg"
              alt=""
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>
        */}
      </div>

      <section
        aria-labelledby="featured-heading"
        className="hidden lg:block"
      >
        <div className="overflow-hidden md:mx-auto md:max-w-7xl md:px-8 md:py-12">
          <div className="relative overflow-hidden rounded-md md:h-40 py-16 md:py-52">
            <div className="absolute inset-0">
              <img
                src={heroBannerImage}
                // src="https://sfo3.digitaloceanspaces.com/com.mexicolimited/production-bucket/user-uploads/photos/65b2c89d0eb5d.jpg"
                alt=""
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div aria-hidden="true" className="relative h-40 w-full md:hidden" />
            <div aria-hidden="true" className="relative h-52 w-full md:hidden" />
            <div className="absolute inset-x-0 bottom-0 rounded-bl-lg rounded-br-lg bg-black bg-opacity-75 p-6 backdrop-blur backdrop-filter sm:flex sm:items-center sm:justify-between md:inset-x-auto md:inset-y-0 md:w-72 md:flex-col md:items-start md:rounded-bl-none md:rounded-tr-lg md:right-0">
              <div>
                <h2 id="featured-heading" className="text-xl font-bold text-white">
                  Diseño en moda mexicanos
                </h2>
                <p className="mt-1 text-sm text-gray-300">
                  Upgrade your desk with objects that keep you organized and
                  clear-minded.
                </p>
              </div>
              <a
                href="#"
                className="mt-6 flex flex-shrink-0 items-center justify-center rounded-md border border-white border-opacity-25 bg-white bg-opacity-0 px-4 py-3 text-base font-medium text-white hover:bg-opacity-10 sm:ml-8 sm:mt-0 lg:ml-0 lg:w-full"
              >
                Descúbrelo aquí
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* TRENDING PRODUCTS */}
      <ProductListing items={featuredProducts} title="Productos destacados" />

      {/* POPULAR PRODUCTS 2 */}
      <ProductListing items={trendyProducts} title="Productos populares" />

      {/* DISCOUNTS AND PROMOTIONS */}
      <ProductListing items={discounts} title="Ofertas y descuentos" />
      {/* COLLECTIONS */}
      <section aria-labelledby="collections-heading" className="bg-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl py-16 sm:py-24 lg:max-w-none lg:py-32">
            <h2
              id="collections-heading"
              className="text-2xl font-bold text-gray-900"
            >
              Colecciones
            </h2>

            <div className="mt-6 space-y-12 lg:grid lg:grid-cols-3 lg:gap-x-6 lg:space-y-0">
              {collections.map((collection) => (
                <div key={collection.name} className="group relative">
                  <div className="relative h-80 w-full overflow-hidden rounded-lg bg-white sm:aspect-h-1 sm:aspect-w-2 lg:aspect-h-1 lg:aspect-w-1 group-hover:opacity-75 sm:h-64">
                    <img
                      src={collection.imageSrc}
                      alt={collection.imageAlt}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <h3 className="mt-6 text-sm text-gray-500">
                    <Link to={collection.href}>
                      <span className="absolute inset-0" />
                      {collection.name}
                    </Link>
                  </h3>
                  <p className="text-base font-semibold text-gray-900">
                    {collection.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section
        aria-labelledby="category-heading"
        className="pt-24 sm:pt-32 xl:mx-auto xl:max-w-7xl xl:px-8"
      >
        <div className="px-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8 xl:px-0">
          <h2
            id="category-heading"
            className="text-2xl font-bold tracking-tight text-gray-900"
          >
            Explora por categoría
          </h2>
          <a
            href="#"
            className="hidden text-sm font-semibold text-indigo-600 hover:text-indigo-500 sm:block"
          >
            Todas las categorías
            <span aria-hidden="true"> &rarr;</span>
          </a>
        </div>

        <div className="mt-4 flow-root">
          <div className="-my-2">
            <div className="relative box-content h-80 overflow-x-auto py-2 xl:overflow-visible">
              <div className="absolute flex space-x-8 px-4 sm:px-6 lg:px-8 xl:relative xl:grid xl:grid-cols-5 xl:gap-x-8 xl:space-x-0 xl:px-0">
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    to={category.href}
                    className="relative flex h-80 w-56 flex-col overflow-hidden rounded-lg p-6 hover:opacity-75 xl:w-auto"
                  >
                    <span aria-hidden="true" className="absolute inset-0">
                      <img
                        src={category.imageSrc}
                        alt=""
                        className="h-full w-full object-cover object-center"
                      />
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-gray-800 opacity-50"
                    />
                    <span className="relative mt-auto text-center text-xl font-bold text-white">
                      {category.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 px-4 sm:hidden">
          <a
            href="#"
            className="block text-sm font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Todas las categorías
            <span aria-hidden="true"> &rarr;</span>
          </a>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="mx-auto mt-32 max-w-7xl px-6 sm:mt-40 lg:px-8">
        <div className="mx-auto max-w-4xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Lo mejor de México</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          México Limited
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
          Impulsamos el talento y la innovación mexicanos para fomentar y reflejar la riqueza cultural, la creatividad y el talento del país. 
          Conectamos a vendedores y compradores que valoran la autenticidad, la calidad y la innovación del emprendimiento mexicano, fomentando el desarrollo del comercio local y nacional.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {[].map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <feature.icon className="h-5 w-5 flex-none text-indigo-600" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                  <p className="mt-6">
                    <a href={feature.href} className="text-sm font-semibold leading-6 text-indigo-600">
                      Learn more <span aria-hidden="true">→</span>
                    </a>
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* SELLERS CALL TO ACTION */}
      <section
        aria-labelledby="extras-heading"
        // className="border-t border-gray-200 bg-gray-50"
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="relative flex items-center px-6 py-12 sm:px-10 sm:py-16 sm:mt-0">
              <div className="absolute inset-0 overflow-hidden rounded-lg">
                <img
                  src="https://tailwindui.com/img/ecommerce-images/footer-02-exclusive-sale.jpg"
                  alt=""
                  className="h-full w-full object-cover object-center saturate-0 filter"
                />
                <div className="absolute inset-0 bg-indigo-600 bg-opacity-90" />
              </div>
              <div className="relative mx-auto max-w-2xl text-center">
                <h3 className="text-2xl font-bold tracking-tight text-white">
                  ¿Eres creador o emprendes con productos increíbles?
                </h3>
                <p className="mt-2 text-gray-200">
                   Únete a México Limited y lleva tu negocio al siguiente nivel. Conecta con potenciales clientes, expande tu alcance y aumenta tu probabilidad de ventas.{" "}
                  <a
                    href="#"
                    className="whitespace-nowrap font-bold text-white hover:text-gray-200"
                  >
                    Conoce más<span aria-hidden="true"> &rarr;</span>
                  </a>
                </p>
              </div>
            </div>
        </div>
      </section>

      {/* Testimonials */}
      {/* <section
        aria-labelledby="perks-heading"
        className="border-t border-gray-200 bg-gray-50"
      >
        <h2 id="perks-heading" className="sr-only">
          Our perks
        </h2>

        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-0">
            {perks.map((perk) => (
              <div
                key={perk.name}
                className="text-center md:flex md:items-start md:text-left lg:block lg:text-center"
              >
                <div className="md:flex-shrink-0">
                  <div className="flow-root">
                    <img
                      className="-my-1 mx-auto h-24 w-auto"
                      src={perk.imageUrl}
                      alt=""
                    />
                  </div>
                </div>
                <div className="mt-6 md:ml-4 md:mt-0 lg:ml-0 lg:mt-6">
                  <h3 className="text-base font-medium text-gray-900">
                    {perk.name}
                  </h3>
                  <p className="mt-3 text-sm text-gray-500">
                    {perk.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}
    </>
  );
}
