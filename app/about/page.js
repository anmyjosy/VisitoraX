"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { APP_CONFIG_DEFAULTS } from "../../app-config";

export default function AboutPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-neutral-900">
      {/* Navbar */}
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
      {/* Content */}
      <main className="flex-1 bg-white pt-10">
        <div className="py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h2 className="text-base font-semibold text-[#552483] tracking-wide uppercase">About Us</h2>
              <p className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
                Streamlining Your Visitor Management
              </p>
              <p className="mt-5 max-w-2xl mx-auto text-xl text-gray-500">
                VisitorApp is dedicated to providing a seamless and efficient way to manage visitor reservations. Our platform is designed for both administrators and users to have a hassle-free experience.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
              <p className="mt-4 text-lg text-gray-500">
                Our mission is to simplify the process of visitor management through modern technology. We aim to create a secure, reliable, and user-friendly environment for businesses and their guests, ensuring every visit is smooth and well-documented.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative h-64 rounded-lg overflow-hidden shadow-lg"
            >
                <Image
                    src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2138&auto=format&fit=crop"
                    alt="Our Mission"
                    fill
                    className="object-cover"
                />
            </motion.div>
          </div>
        </div>

        <div className="py-16 md:py-20">
            <div className="max-w-4xl mx-auto px-6 lg:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="text-center"
                >
                    <h3 className="text-2xl font-bold text-gray-900">Why Choose VisitorApp?</h3>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-500">
                        We focus on delivering a powerful yet simple solution for visitor management. Here’s what makes us different:
                    </p>
                </motion.div>
                <div className="mt-12 grid gap-8 md:grid-cols-3 text-center">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="p-6 bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <div className="flex justify-center items-center h-12 w-12 rounded-full bg-[#552483]/10 mx-auto">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#552483]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-[#552483]">Secure OTP Login</h4>
                        <p className="mt-2 text-gray-500">Passwordless authentication for enhanced security and user convenience.</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="p-6 bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <div className="flex justify-center items-center h-12 w-12 rounded-full bg-[#552483]/10 mx-auto">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#552483]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-[#552483]">Easy Administration</h4>
                        <p className="mt-2 text-gray-500">A dedicated admin panel to manage all visitor reservations effortlessly.</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                      className="p-6 bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <div className="flex justify-center items-center h-12 w-12 rounded-full bg-[#552483]/10 mx-auto">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#552483]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-[#552483]">Responsive Design</h4>
                        <p className="mt-2 text-gray-500">Access and manage the app from any device, whether on desktop or mobile.</p>
                    </motion.div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
