"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { APP_CONFIG_DEFAULTS } from "../app-config";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Define brand color for easy reuse
  const brandPurple = "#552483";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    // Set base background to white and text to near-black for elegance
    <div className="bg-white min-h-screen flex flex-col font-sans overflow-x-hidden selection:bg-[#552483] selection:text-white text-neutral-900">

      {/* NAVBAR */}
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

          {/* Desktop Links - Dark text, Purple hover */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-neutral-700">
            <Link href="/" className={`hover:text-[${brandPurple}] transition-colors`}>Home</Link>
            <Link href="/about" className={`hover:text-[${brandPurple}] transition-colors`}>About</Link>
            <Link href="/contact" className={`hover:text-[${brandPurple}] transition-colors`}>Contact</Link>
          </div>

          {/* CTA Button - Solid Brand Purple */}
          <div className="hidden md:flex">
            <Link
              href="/adminlogin"
              className={`px-5 py-2.5 rounded-md bg-[${brandPurple}] text-white text-sm font-bold hover:bg-opacity-90 transition-all shadow-sm`}
            >
              Admin Portal
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
              className="md:hidden bg-white border-b border-neutral-100 overflow-hidden"
            >
              <div className="flex flex-col px-6 py-6 space-y-4 text-center">
                <Link href="/" className="text-neutral-800 font-medium">Home</Link>
                <Link href="/about" className="text-neutral-800 font-medium">About</Link>
                <Link href="/contact" className="text-neutral-800 font-medium">Contact</Link>
                <Link href="/adminlogin" className={`text-[${brandPurple}] font-bold`}>Admin Portal</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO SECTION */}
      <div className="relative z-10 flex-grow flex items-center justify-center pt-28 md:pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto w-full">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-50 via-white to-white animate-gradient-xy"></div>
        </div>

        <div className="flex flex-col lg:flex-row items-center w-full gap-16 lg:gap-24">

          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2 text-center lg:text-left lg:pl-4"
          >
            {/* Subtle purple badge */}
            <div className={`inline-block mb-4 px-3 py-1 rounded-full bg-[${brandPurple}]/10 text-[${brandPurple}] text-xs font-bold tracking-wide uppercase`}>
              Secure Visitor Management
            </div>
            
            {/* Reduced Font Size for professionalism */}
            <h1 className="text-[2.5rem] sm:text-5xl lg:text-5xl font-extrabold leading-[1.1] tracking-tight text-black">
              Reinventing the <br />
              {/* Solid Purple Accent */}
              <span className={`text-[${brandPurple}]`}>
                Visitor Experience.
              </span>
            </h1>
            
            {/* Reduced Body Text Size */}
            <p className="mt-6 text-base text-neutral-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Eliminate paper logs. Secure your workplace with a digital, contactless check-in system designed for modern business.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/login"
                className={`inline-flex justify-center items-center px-8 sm:px-6 py-3 rounded-lg bg-gradient-to-r from-[#6b21a8] to-[#552483] text-white font-bold text-base hover:shadow-xl hover:scale-105 transition-all shadow-lg shadow-purple-500/30`}
              >
                Make Reservation
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
            </div>
          </motion.div>

          {/* Right: Creative Visual (Digital Pass Card Animation) - Recolored */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:w-1/2 w-full flex justify-center perspective-1000 lg:mt-6"
          >
            {/* The "Card" Container with gentle float */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="relative w-full max-w-sm"
            >
              {/* Abstract subtle shadow behind card */}
              <div className={`absolute top-4 -right-4 w-full h-full bg-[${brandPurple}]/5 rounded-3xl -z-10`}></div>

              {/* The Visitor Pass UI - Clean White aesthetic */}
              <div className="relative bg-white border border-neutral-100 p-6 rounded-3xl shadow-2xl overflow-hidden">
                 {/* Top purple stripe */}
                 <div className={`absolute top-0 left-0 w-full h-3 bg-[${brandPurple}]`}></div>

                 <div className="flex justify-between items-start mb-8 mt-4">
                   <div>
                     <p className="text-xs text-neutral-400 uppercase font-bold tracking-wider">Digital Pass</p>
                     <h3 className="text-2xl font-extrabold text-black">Sarah Jenkins</h3>
                     <p className={`text-sm text-[${brandPurple}] font-bold mt-1`}>Tech Interview</p>
                   </div>
                   {/* Placeholder Photo area */}
                   <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center text-2xl overflow-hidden border-2 border-white shadow-inner">
                      👤
                   </div>
                 </div>

                 {/* QR Code Placeholder - Dark theme */}
                 <div className="bg-neutral-900 rounded-xl p-6 flex flex-col items-center justify-center text-white relative overflow-hidden group">
                    <svg className="w-20 h-20 text-white opacity-90" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 13h6v6H3v-6zm2 2v2h2v-2H5zm13-2h3v2h-3v-2zm-3 0h2v2h-2v-2zm-3 4h3v2h-3v-2zm3 0h2v2h-2v-2zm-3 2h2v2h-2v-2zm3 0h3v2h-3v-2z"/></svg>
                    <p className="mt-4 text-xs font-mono text-neutral-400 tracking-widest">SCAN FOR ENTRY</p>

                    {/* Scanning Line Animation - Now Purple */}
                    <motion.div
                       animate={{ top: ["-10%", "110%"] }}
                       transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                       className={`absolute left-0 w-full h-0.5 bg-[${brandPurple}] shadow-[0_0_10px_${brandPurple}] opacity-80`}
                    />
                 </div>

                 <div className="mt-6 flex justify-between text-xs text-neutral-500 font-mono font-medium">
                    <span>ID: #V-8392</span>
                    <span>VALID: TODAY</span>
                 </div>
              </div>

              {/* Floating Status Badge - Recolored */}
              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: -10, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="absolute -right-6 top-[70%] bg-white px-4 py-2 rounded-full shadow-lg border border-neutral-100 flex items-center gap-2 z-20"
              >
                <div className={`w-2.5 h-2.5 rounded-full bg-[${brandPurple}] animate-pulse`}></div>
                <span className="text-xs font-bold text-neutral-900">Authorized</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* STATS STRIP - Clean High Contrast */}
      <div className={`w-full border-y border-neutral-100 bg-[${brandPurple}]/5 py-12 sm:py-16 relative z-10`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
             {[
               { label: "Check-ins", val: "10k+" },
               { label: "Clients", val: "500+" },
               { label: "Uptime", val: "99.9%" },
               { label: "Security", val: "AES-256" }
             ].map((stat, i) => (
               <div key={i}>
                 <h4 className={`text-3xl font-extrabold text-[${brandPurple}]`}>{stat.val}</h4>
                 <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mt-1">{stat.label}</p>
               </div>
             ))}
        </div>
      </div>

      {/* FEATURES SECTION */}
      <section className="relative z-10 py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          {/* Reduced Heading Size */}
          <h2 className="text-2xl md:text-3xl font-extrabold text-black">
            Intelligent Workflow
          </h2>
          <p className="mt-4 text-base text-neutral-600 max-w-2xl mx-auto">
            We removed the friction from the front desk. Simple, secure, and fast.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Instant Verify", desc: "No passwords. Just a secure OTP sent directly to email.", icon: (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )},
            {
              title: "Smart Booking", desc: "Pre-register guests. They get a pass before they even arrive.", icon: (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            )},
            {
              title: "Express Check-in", desc: "Scan QR code for immediate access.", icon: (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
            )},
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-8 rounded-xl shadow-sm border border-neutral-100 hover:border-[${brandPurple}]/30 hover:shadow-md transition-all"
            >
              <div className={`w-10 h-10 rounded-lg bg-[${brandPurple}] flex items-center justify-center shadow-sm mb-6`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-black">{feature.title}</h3>
              <p className="mt-3 text-sm text-neutral-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FOOTER - Solid Purple Background */}
      <footer className={`bg-[${brandPurple}] text-white py-12`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-6">
           <div className="text-center md:text-left">
              <h3 className="text-white font-extrabold text-xl tracking-tight">VisitoraX</h3>
              <p className="text-sm mt-2 text-white/70">© 2024. Enterprise Grade Security.</p>
           </div>
           <div className="flex gap-8 text-sm font-medium">
              <Link href="#" className="text-white/80 hover:text-white transition">Privacy Policy</Link>
              <Link href="#" className="text-white/80 hover:text-white transition">Terms of Service</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}