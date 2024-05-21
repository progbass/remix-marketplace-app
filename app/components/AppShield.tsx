import { useState, useEffect } from "react";
import { Link } from "@remix-run/react";
import { useNavigate } from "@remix-run/react";
import { Transition } from "@headlessui/react";
import { useHits } from "react-instantsearch-core";
import type { Hit } from "instantsearch.js";

import MobileMenu from "./MobileMenu";
import DesktopMenu from "./DesktopMenu";
import Footer from "./Footer";

import "@algolia/autocomplete-theme-classic/dist/theme.min.css";

// TYPES
interface Props {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  content: React.ReactNode;
  currentUser?: Object;
  variant?: "default" | "full-content";
}

// MAIN COMPONENT
const AppShield = ({ header, sidebar, content, variant }: Props) => {
  const navigate = useNavigate();
  // const { currentUser } = useLoaderData<typeof loader>();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  
  // Handle search submit
  const handleSearchSubmit = (query: string) => {
    return navigate({
      pathname: "/search",
      search: `?query=${query}`,
    });
  };

  // Return the main component
  return (
    <div className="bg-white">
      {/* MOBILE MENU */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        // currentUser={currentUser}
      />

      {/* DESKTOP MENU */}
      <DesktopMenu 
        onSearchSubmit={handleSearchSubmit}
        onMobileMenuOpen={() => setMobileMenuOpen(true)}
      />

      {/* AUTOCOMPLETE RESULTS */}
      {/* <PreviewResults /> */}

      {/* MAIN CONTENT */}
      <main>{content}</main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default AppShield;