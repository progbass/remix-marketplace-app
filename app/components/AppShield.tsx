import { useState, memo } from "react";
import { useNavigate } from "@remix-run/react";
import {
  useHierarchicalMenu,
  UseHierarchicalMenuProps,
} from "react-instantsearch";

import AuthService from "~/services/Auth.service";
import { useAuth } from "~/providers/AuthProvider";
import MobileMenu from "./MobileMenu";
import DesktopMenu from "./DesktopMenu";
import Footer from "./Footer";

import "@algolia/autocomplete-theme-classic/dist/theme.min.css";


// VIRTUAL FILTERS
const VirtualHierarchicalMenu = memo(function (
  props: UseHierarchicalMenuProps
) {
  useHierarchicalMenu(props);
  return null;
});

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
  const currentUser = useAuth();
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
      {/* HEADER / NAVIGATION */}
      <>
        {/* This is a renderless widget required to persis search state even if the menu components get unmounted */}
        <VirtualHierarchicalMenu
          attributes={["categories.lvl0"]}
        />

        {/* MOBILE MENU */}
        <MobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          currentUser={currentUser}
        />

        {/* DESKTOP MENU */}
        <DesktopMenu 
          onSearchSubmit={handleSearchSubmit}
          onMobileMenuOpen={() => setMobileMenuOpen(true)}
          currentUser={currentUser}
        />

        {/* AUTOCOMPLETE RESULTS */}
        {/* <PreviewResults /> */}
      </>

      {/* MAIN CONTENT */}
      <main>{content}</main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default AppShield;