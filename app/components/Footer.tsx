import { Fragment, useState, useEffect } from "react";
import { Link, NavLink } from "@remix-run/react";
import { useNavigate } from "@remix-run/react";
import { Dialog, Tab, Transition, Menu } from "@headlessui/react";

import {
  Bars3Icon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { MapPinIcon } from "@heroicons/react/20/solid";

import classNames from "~/utils/classNames";
import { useShoppingCart } from "~/providers/ShoppingCartContext";
import { Autocomplete } from "./CustomISAutocomplete";
import logoUrl from "~/statics/logo.svg";
import { useMarketplaceCategories } from "~/providers/MarketplaceCategoriesContext";


const footerNavigation = {
    about: [
      { name: "Sobre nosotros", href: "/nosotros" },
      { name: "Devoluciones", href: "/devoluciones" },
      {
        name: "Quejas y sugerencias",
        href: "/quejas-sugerencias",
      },
      {
        name: "Preguntas frecuentes clientes",
        href: "/preguntas-frecuentes-clientes",
      },
    ],
    sellers: [
      { name: "Vende con nosotros", href: "/vende-en-mexico-limited" },
      {
        name: "Convenio para vendedores",
        href: "/convenio-vendedores",
      },
      {
        name: "Preguntas frecuentes tiendas",
        href: "/preguntas-frecuentes-afiliados",
      },
    ],
    account: [
      {
        name: "Política de envío y devoluciones",
        href: "/politica-envios-devoluciones",
      },
      {
        name: "Privacidad y confidencialidad",
        href: "/declaracion-de-privacidad-confidencialidad",
      },
      {
        name: "Términos y condiciones del marketplace",
        href: "/terminos-y-condiciones-marketplace",
      },
      {
        name: "Términos y condiciones de uso de México Limited",
        href: "/terminos-y-condiciones-de-uso",
      },
    ],
    connect: [
      { name: "Contáctanos", href: "mailto:contacto@mexicolimited.com" },
      { name: "Instagram", href: "https://www.instagram.com/mexico.limited" },
      { name: "Facebook", href: "https://web.facebook.com/MexicoLimited" },
    ],
  };

//
type FooterProps = {};
export default function Footer({}: FooterProps) {
  //
  const navigate = useNavigate();

  // Return component
  return (
    <footer aria-labelledby="footer-heading" className="bg-accent-900 mt-12">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-20 xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="grid grid-cols-2 gap-8 xl:col-span-2">
            <div className="space-y-12 md:grid md:grid-cols-2 md:gap-8 md:space-y-0">
              <div>
                <h3 className="text-sm font-medium text-white">
                  México Limited
                </h3>
                <ul role="list" className="mt-6 space-y-6">
                  {footerNavigation.about.map((item) => (
                    <li key={item.name} className="text-sm">
                      <Link
                        to={item.href}
                        className="text-gray-300 hover:text-primary-600"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white">Vendedores</h3>
                <ul role="list" className="mt-6 space-y-6">
                  {footerNavigation.sellers.map((item) => (
                    <li key={item.name} className="text-sm">
                      <Link
                        to={item.href}
                        className="text-gray-300 hover:text-primary-600"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-12 md:grid md:grid-cols-2 md:gap-8 md:space-y-0">
              <div>
                <h3 className="text-sm font-medium text-white">Información</h3>
                <ul role="list" className="mt-6 space-y-6">
                  {footerNavigation.account.map((item) => (
                    <li key={item.name} className="text-sm">
                      <Link
                        to={item.href}
                        className="text-gray-300 hover:text-primary-600"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">Conecta</h3>
                <ul role="list" className="mt-6 space-y-6">
                  {footerNavigation.connect.map((item) => (
                    <li key={item.name} className="text-sm">
                      <Link
                        to={item.href}
                        className="text-gray-300 hover:text-primary-600"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* <div className="mt-12 md:mt-16 xl:mt-0">
              <h3 className="text-sm font-medium text-white">
                Sign up for our newsletter
              </h3>
              <p className="mt-6 text-sm text-gray-300">
                The latest deals and savings, sent to your inbox weekly.
              </p>
              <form className="mt-2 flex sm:max-w-md">
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  type="text"
                  autoComplete="email"
                  required
                  className="w-full min-w-0 appearance-none rounded-md border border-white bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 shadow-sm focus:border-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
                />
                <div className="ml-4 flex-shrink-0">
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                  >
                    Sign up
                  </button>
                </div>
              </form>
            </div> */}
        </div>

        <div className="border-t border-accent-800 py-6">
          <p className="text-sm text-gray-400">
            Derechos reservados &copy; 2024 México Limited | Hecho en México con
            amor
          </p>
        </div>
      </div>

      <div className="bg-[length:600px_130px] bg-repeat bg-[url('https://sfo3.digitaloceanspaces.com/com.mexicolimited/production-bucket/managed-content/desktop-content/pattern.png')] h-6" />
    </footer>
  );
}
