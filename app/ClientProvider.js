"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import Navbar from "./Navbar";

export default function ClientProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [openHistory, setOpenHistory] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const sessionData = localStorage.getItem("session");
    if (sessionData) {
      // Don't redirect if user is on the details page to complete their profile
      if (pathname === "/details") {
        setLoggedIn(true);
        return;
      }
      const { timestamp } = JSON.parse(sessionData);
      const tenMinutes = 10 * 60 * 1000;
      if (Date.now() - timestamp < tenMinutes) {
        setLoggedIn(true);
      } else {
        localStorage.removeItem("session");
        setLoggedIn(false);
      }
    }
  }, [pathname]); // Re-check session on route change

  const noNavPaths = ["/", "/login", "/about", "/contact", "/details"];
  const showNav = !noNavPaths.includes(pathname) && !pathname.startsWith("/userpage");

  return (
    <UserContext.Provider value={{ loggedIn, setLoggedIn, openHistory, setOpenHistory }}>
      {showNav && <Navbar />}
      {children}
    </UserContext.Provider>
  );
}