import {
  HomeIcon,
  BuildingStorefrontIcon,
  InboxArrowDownIcon,
  LifebuoyIcon,
  RectangleGroupIcon,
  WalletIcon,
  ArrowLeftEndOnRectangleIcon
} from "@heroicons/react/24/outline";
import { Link, Form, NavLink } from "@remix-run/react";

const navigation = [
  { name: "Dashboard", href: "/", icon: HomeIcon, current: true },
  {
    name: "Productos",
    href: "/me/products",
    icon: RectangleGroupIcon,
    current: false,
  },
  {
    name: "Órdenes",
    href: "/me/orders",
    icon: InboxArrowDownIcon,
    current: false,
  },
  { name: "Pagos", href: "/me/payments", icon: WalletIcon, current: false },
  {
    name: "Tienda",
    href: "/me/shop",
    icon: BuildingStorefrontIcon,
    current: false,
  },
  { name: "Ayuda", href: "/me/support", icon: LifebuoyIcon, current: false },
];
const teams = [
  { id: 1, name: "Heroicons", href: "#", initial: "H", current: false },
  { id: 2, name: "Tailwind Labs", href: "#", initial: "T", current: false },
  { id: 3, name: "Workcation", href: "#", initial: "W", current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function({}: Props) {
  return (
    <>
      {/* Sidebar component, swap this element with another sidebar if you like */}
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <Link to="/">
            <img
              className="h-8 w-auto max-w-44"
              src="https://mexicolimited.com/images/logo-white.svg"
              alt="México Limited"
            />
          </Link>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={({ isActive, isPending }) =>
                        classNames(
                          isActive
                          ? "bg-gray-800 text-white"
                          : "text-gray-400 hover:text-white hover:bg-gray-800",
                          "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                        )
                      }
                    >
                      <item.icon
                        className="h-6 w-6 shrink-0"
                        aria-hidden="true"
                      />
                      {item.name}
                    </NavLink>
                  </li>
                ))}
                <li>
                  <Form method="post">
                    <button
                      className={classNames(
                        "w-full text-gray-400 hover:text-white hover:bg-gray-800",
                        "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                      )}
                    >
                      <ArrowLeftEndOnRectangleIcon
                        className="h-6 w-6 shrink-0"
                        aria-hidden="true"
                      />
                      Salir
                    </button>
                  </Form>
                </li>
              </ul>
            </li>
            {/* <li>
              <div className="text-xs font-semibold leading-6 text-gray-400">
                Your teams
              </div>
              <ul role="list" className="-mx-2 mt-2 space-y-1">
                {teams.map((team) => (
                  <li key={team.name}>
                    <a
                      href={team.href}
                      className={classNames(
                        team.current
                          ? "bg-gray-800 text-white"
                          : "text-gray-400 hover:text-white hover:bg-gray-800",
                        "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                      )}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">
                        {team.initial}
                      </span>
                      <span className="truncate">{team.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </li> */}
            <li className="-mx-6 mt-auto">
              <Link
                to="/me/settings"
                className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-gray-800"
              >
                <img
                  className="h-8 w-8 rounded-full bg-gray-800"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt=""
                />
                <span className="sr-only">Tu perfil</span>
                <span aria-hidden="true">Tom Cook</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};
