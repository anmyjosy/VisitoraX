"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { APP_CONFIG_DEFAULTS } from "../../app-config";
// Icons from user login page for consistency
const MailIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const LockIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const sessionData = localStorage.getItem("admin_session");
    if (sessionData) {
      const { timestamp } = JSON.parse(sessionData);
      const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
      if (Date.now() - timestamp < tenMinutes) {
        // If session is valid, redirect to admin page
        router.replace("/adminlogin/adminpage");
      } else {
        // If session expired, remove it
        localStorage.removeItem("admin_session");
      }
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [router]); // Added router to dependency array
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data: admin, error } = await supabase
      .from("admin")
      .select("email, password")
      .eq("email", email)
      .single();

    if (error || !admin) {
      setMessage("Invalid email or password.");
      setLoading(false);
      return;
    }

    // IMPORTANT: Storing and comparing plain-text passwords is not secure.
    // Consider using a secure method like Supabase Auth with roles or a password hashing library.
    if (admin.password === password) {
      setMessage("Login successful! Redirecting...");
      // Set admin session in local storage
      localStorage.setItem(
        "admin_session",
        JSON.stringify({ email: admin.email, timestamp: Date.now() })
      );
      router.push("/adminlogin/adminpage");
    } else {
      setMessage("Invalid email or password.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfaff] font-sans text-neutral-900">
      {/* Navbar (Styled like user login) */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled || isMenuOpen
            ? "bg-[#fcfaff] py-3"
            : "bg-[#fcfaff]/90 backdrop-blur-sm py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-0">
            <Image
              src={APP_CONFIG_DEFAULTS.logo}
              alt="VisitoraX Logo"
              width={36}
              height={36}
            />
            <span className="text-xl font-extrabold tracking-tight text-black">
              VisitoraX
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-neutral-700">
            <Link href="/" className="hover:text-[#552483] transition-colors">Home</Link>
            <Link href="/about" className="hover:text-[#552483] transition-colors">About</Link>
            <Link href="/contact" className="hover:text-[#552483] transition-colors">Contact</Link>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex">
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-md bg-[#552483] text-white text-sm font-bold hover:bg-opacity-90 transition-all shadow-sm"
            >
              User Portal
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-neutral-900 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#fcfaff] overflow-hidden"
            >
              <div className="flex flex-col px-6 py-6 space-y-4 text-center">
                <Link href="/" className="text-neutral-800 font-medium">Home</Link>
                <Link href="/about" className="text-neutral-800 font-medium">About</Link>
                <Link href="/contact" className="text-neutral-800 font-medium">Contact</Link>
                <Link href="/login" className="text-[#552483] font-bold">User Portal</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(85,36,131,0.15)] p-8 sm:p-10 relative overflow-hidden">
            <h2 className="text-3xl font-bold text-neutral-900 mb-3 text-center">
              Admin Login
            </h2>
            <p className="text-neutral-500 mb-8 text-sm text-center">Access the administrative dashboard</p>
            
            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-[#552483]">
                  <MailIcon />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-neutral-50 text-neutral-900 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white focus:border-[#552483]/20 focus:shadow-[0_0_0_4px_rgba(85,36,131,0.1)] transition-all font-medium placeholder:text-neutral-400"
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-[#552483]">
                  <LockIcon />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-neutral-50 text-neutral-900 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white focus:border-[#552483]/20 focus:shadow-[0_0_0_4px_rgba(85,36,131,0.1)] transition-all font-medium placeholder:text-neutral-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#552483] hover:bg-[#451d6b] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#552483]/20 disabled:opacity-70"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
            {message && (
              <p className={`mt-6 text-center text-sm font-medium ${message.includes('Invalid') ? 'text-red-500' : 'text-green-600'}`}>{message}</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
