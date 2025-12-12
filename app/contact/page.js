"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { APP_CONFIG_DEFAULTS } from "../../app-config";

export default function ContactPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [formStatus, setFormStatus] = useState({
    loading: false,
    error: null,
    success: false,
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const Navbar = () => (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled || isMenuOpen
          ? 'bg-white shadow-sm border-b border-neutral-100 py-3'
          : 'bg-transparent py-5'
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
          <Link href="/adminlogin" className="px-5 py-2.5 rounded-md bg-[#552483] text-white text-sm font-bold hover:bg-opacity-90 transition-all shadow-sm">
            Admin Portal
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-neutral-900 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} /></svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-white border-b border-neutral-100 overflow-hidden">
            <div className="flex flex-col px-6 py-6 space-y-4 text-center">
              <Link href="/" className="text-neutral-800 font-medium">Home</Link>
              <Link href="/about" className="text-neutral-800 font-medium">About</Link>
              <Link href="/contact" className="text-neutral-800 font-medium">Contact</Link>
              <Link href="/adminlogin" className="text-[#552483] font-bold">Admin Portal</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ loading: true, error: null, success: false });

    const { error } = await supabase
      .from("feedback")
      .insert([{ name: fullName, email, message }]);

    if (error) {
      setFormStatus({ loading: false, error: error.message, success: false });
    } else {
      setFormStatus({ loading: false, error: null, success: true });
      // Clear form on successful submission
      setFullName("");
      setEmail("");
      setMessage("");
      // Optional: Hide success message after a few seconds
      setTimeout(() => {
        setFormStatus((prev) => ({ ...prev, success: false }));
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-neutral-900">
      <Navbar />

      {/* Content */}
      <main className="flex-1 pt-24">
        <div className="py-4 md:py-7 bg-white">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-[#552483] tracking-wide uppercase">Contact Us</h2>
              <p className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
                Get in Touch
              </p>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                Have questions or feedback? We'd love to hear from you.
              </p>
            </div>

            <div className="mt-8 max-w-lg mx-auto text-black">
              {/* The form action and method should be updated to point to your backend API endpoint for handling form submissions. */}
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-6">
                <div>
                  <label htmlFor="full-name" className="sr-only">Full name</label>
                  <input
                    type="text"
                    name="full-name"
                    id="full-name"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full shadow-sm py-3 px-4 placeholder-gray-500 focus:ring-[#552483] focus:border-[#552483] border-gray-300 rounded-md"
                    placeholder="Full name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="sr-only">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full shadow-sm py-3 px-4 placeholder-gray-500 focus:ring-[#552483] focus:border-[#552483] border-gray-300 rounded-md"
                    placeholder="Email"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="sr-only">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="block w-full shadow-sm py-3 px-4 placeholder-gray-500 focus:ring-[#552483] focus:border-[#552483] border border-gray-300 rounded-md"
                    placeholder="Message"
                    required
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={formStatus.loading}
                    className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#552483] hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#552483] disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {formStatus.loading ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
              {formStatus.success && (
                <p className="mt-4 text-center text-green-600">Thank you for your feedback!</p>
              )}
              {formStatus.error && (
                <p className="mt-4 text-center text-red-600">Error: {formStatus.error}</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}