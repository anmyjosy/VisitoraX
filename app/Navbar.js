"use client";

import { useState, useEffect, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserContext } from "./UserContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { loggedIn, openHistory, setLoggedIn } = useContext(UserContext) || {};

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleHistoryClick = (e) => {
    e.preventDefault();
    if (openHistory) {
      openHistory();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("session");
    if (setLoggedIn) {
      setLoggedIn(false);
    }
  };

  const navLinkClasses = (href) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
      pathname === href
        ? "text-white bg-purple-600/30"
        : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
    }`;

  return (
    <nav className="absolute top-0 backdrop-lg w-full z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-white tracking-tight">
              VisitorApp
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {loggedIn ? (
              <>
                <a href="#" onClick={handleHistoryClick} className={navLinkClasses("#")}>
                  History
                </a>
                <Link href="/login" onClick={handleLogout} className={navLinkClasses("/login")}>
                  Logout
                </Link>
              </>
            ) : (
              <>
                <Link href="/" className={navLinkClasses("/")}>
                  Home
                </Link>
                <Link href="/adminlogin" className={navLinkClasses("/adminlogin")}>
                  Manage Reservations
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-48" : "max-h-0"} bg-black/70 backdrop-blur-md`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {loggedIn ? (
            <>
              <a href="#" onClick={handleHistoryClick} className={`block ${navLinkClasses("#")}`}>
                History
              </a>
              <Link href="/login" onClick={handleLogout} className={`block ${navLinkClasses("/login")}`}>
                Logout
              </Link>
            </>
          ) : (
            <>
              <Link href="/" className={`block ${navLinkClasses("/")}`}>Home</Link>
              <Link href="/adminlogin" className={`block ${navLinkClasses("/adminlogin")}`}>Manage Reservations</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
