"use client";
import { useState, useEffect, useContext, useRef, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { UserContext } from "../UserContext";
import Image from "next/image";
import Link from "next/link";
import { APP_CONFIG_DEFAULTS } from "../../app-config";
import { AnimatePresence, motion } from "framer-motion";

// --- Icons ---
const VisitFriendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.963A3.686 3.686 0 0110.5 9.533A3.686 3.686 0 017.5 6s-1.153 2.118-1.153 2.651c0 .533.52 1.651 1.153 1.651z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75a9.086 9.086 0 00-3.741-.479 3 3 0 00-4.682-2.72M12 12.75c0 3.228 4.5 5.654 4.5 5.654" />
  </svg>
);
const BusinessPitchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.07a2.25 2.25 0 01-2.25 2.25H5.998a2.25 2.25 0 01-2.25-2.25v-4.07a2.25 2.25 0 01.521-1.438l3.686-4.112a2.25 2.25 0 013.542 0l3.686 4.112a2.25 2.25 0 01.521 1.438z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 1.5v2.25" />
  </svg>
);
const InterviewIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25" />
  </svg>
);
const TechEventIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

export default function Userpage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [currentReservation, setCurrentReservation] = useState(null);
  const [pastReservations, setPastReservations] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);

  const router = useRouter();
  const { setLoggedIn, setOpenHistory } = useContext(UserContext);
  const profileMenuRef = useRef(null);

  // --- Initializers & Effects ---
  useEffect(() => {
    setOpenHistory(() => fetchPastReservations);
  }, [setOpenHistory]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("session");
    if (setLoggedIn) setLoggedIn(false);
    router.push("/login");
  }, [router, setLoggedIn]);

  useEffect(() => {
    let inactivityTimer;
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => handleLogout(), 5 * 60 * 1000);
    };
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetInactivityTimer));
    resetInactivityTimer();
    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => window.removeEventListener(event, resetInactivityTimer));
    };
  }, [handleLogout]);

  useEffect(() => {
    const sessionData = localStorage.getItem("session");
    if (!sessionData) { router.push("/login"); return; }

    const { identifier: sessionUserId, timestamp } = JSON.parse(sessionData);
    if (Date.now() - timestamp > 10 * 60 * 1000) {
      localStorage.removeItem("session"); router.push("/login"); return;
    }

    setUserId(sessionUserId);
    if (setLoggedIn) setLoggedIn(true);

    const fetchData = async () => {
      // UPDATED: Added face_image_status to query
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("name, company, address, dob, face_image_url, face_image_status") 
        .eq("user_id", sessionUserId)
        .single();

      if (userError || !user) { setMessage("Could not retrieve user information."); setLoading(false); return; }

      // Check for pending face approval and show a message
      if (user.face_image_status === 'pending') { setIsPendingModalOpen(true); }

      setUserDetails(user);
      if (!user.name || !user.company || !user.address || !user.dob) {
        router.push(`/login`); return;
      }

      const tables = ["visitlogs", "business_pitch", "interview", "tech_event"];
      let active = null;

      for (let table of tables) {
        const { data } = await supabase.from(table).select("*").eq("user_id", sessionUserId).is("check_out", null).order("created_at", { ascending: false }).limit(1);
        if (data && data.length > 0) {
          const typeMap = { visitlogs: "visit", business_pitch: "pitch", interview: "interview", tech_event: "tech" };
          active = { type: typeMap[table], data: data[0] };
          break;
        }
      }
      setCurrentReservation(active);
      setLoading(false);
    };

    if (sessionUserId) fetchData();
  }, [router, setLoggedIn]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileMenuRef]);

  // --- Logic Handlers ---
  const handleCheckIn = async () => {
    if (!currentReservation) return;
    const tableMap = { visit: "visitlogs", pitch: "business_pitch", interview: "interview", tech: "tech_event" };
    const table = tableMap[currentReservation.type];
    
    const now = new Date();
    const { data: userData } = await supabase.from("users").select("name").eq("user_id", userId).single();
    
    await supabase.from(table).update({ check_in: now }).eq("id", currentReservation.data.id);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userId);
    await supabase.from("recent").insert({
      ...(isEmail ? { email: userId } : { phone: userId }),
      name: userData.name, check_in: now, status: "Checked In", purpose: currentReservation.type, created_at: currentReservation.data.created_at,
    });

    setMessage("Checked in successfully!");
    setCurrentReservation({ ...currentReservation, data: { ...currentReservation.data, check_in: now } });
  };

  const handleCheckOut = async () => {
    if (!currentReservation) return;
    const tableMap = { visit: "visitlogs", pitch: "business_pitch", interview: "interview", tech: "tech_event" };
    const table = tableMap[currentReservation.type];
    const now = new Date();
    const { data: userData } = await supabase.from("users").select("name").eq("user_id", userId).single();

    await supabase.from(table).update({ check_out: now }).eq("id", currentReservation.data.id);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userId);
    await supabase.from("recent").insert({
      ...(isEmail ? { email: userId } : { phone: userId }),
      name: userData.name, check_in: currentReservation.data.check_in, check_out: now, status: "Checked Out", purpose: currentReservation.type, created_at: currentReservation.data.created_at,
    });

    setMessage("Checked out successfully!");
    setCurrentReservation(null);
  };

  const fetchPastReservations = async () => {
    if (!userId) return;
    const tables = [{ name: "visitlogs", type: "Visit" }, { name: "business_pitch", type: "Pitch" }, { name: "interview", type: "Interview" }, { name: "tech_event", type: "Tech Event" }];
    
    try {
      const promises = tables.map((table) =>
        supabase.from(table.name).select("*").eq("user_id", userId).not("check_out", "is", null)
          .then(({ data }) => data.map((item) => ({ ...item, type: table.type })))
      );
      const results = await Promise.all(promises);
      const allPast = results.flat().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setPastReservations(allPast);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); setIsSidebarOpen(true); }
  };

  const handleVisitClick = (type) => {
    const routes = { friend: "/userpage/visitpage", official: "/userpage/pitch", interview: "/userpage/interviewpage", tech: "/userpage/techpage" };
    router.push(routes[type] || "/userpage");
  };

  // --- Render Helpers ---
  const formatKey = (key) => key.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const formatValue = (key, value) => {
    if (value === true) return "Yes"; if (value === false) return "No";
    if ((key.includes("_at") || key.includes("date")) && value && !isNaN(new Date(value))) {
      return new Date(value).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: 'medium', timeStyle: 'short' });
    }
    return String(value);
  };

  const visitOptions = [
    { label: "Visit a Friend", value: "friend", icon: <VisitFriendIcon /> },
    { label: "Business Pitch", value: "official", icon: <BusinessPitchIcon /> },
    { label: "Interview", value: "interview", icon: <InterviewIcon /> },
    { label: "Tech Event", value: "tech", icon: <TechEventIcon /> },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans relative overflow-x-hidden">
      
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10 opacity-30">
         <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
         <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      {/* Navbar */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled || isMobileMenuOpen
            ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-purple-100 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <div className="flex items-center gap-0">
            <Image
              src={APP_CONFIG_DEFAULTS.logo} // Assuming APP_CONFIG_DEFAULTS.logo points to a path like this.
              alt="VisitoraX Logo"
              width={36}
              height={36}
            />
            <span className="text-xl font-extrabold tracking-tight text-black">
              VisitoraX
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-neutral-600">
            <Link href="/" className="hover:text-[#552483] transition-colors">Home</Link>
            {!isSidebarOpen && (
              <button onClick={fetchPastReservations} className="hover:text-[#552483] transition-colors">History</button>
            )}
            <Link href="/about" className="hover:text-[#552483] transition-colors">About</Link>
            <Link href="/contact" className="hover:text-[#552483] transition-colors">Contact</Link>
          </div>

          {/* Profile */}
          <div className="relative hidden md:block" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 rounded-full bg-white border-2 border-purple-100 flex items-center justify-center overflow-hidden hover:border-[#552483] transition-all shadow-sm"
            >
              {/* UPDATED: Profile Picture Logic */}
              {userDetails?.face_image_url ? (
                <img src={userDetails.face_image_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-lg text-[#552483]">{userDetails?.name?.charAt(0).toUpperCase()}</span>
              )}
            </button>

            <AnimatePresence>
                {isProfileOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-72 origin-top-right bg-white rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden"
                >
                    <div className="bg-[#552483]/5 p-4 border-b border-purple-100">
                        <p className="text-base font-bold text-[#552483]">{userDetails?.name}</p>
                        <p className="text-xs text-gray-500">{userId}</p>
                    </div>
                    <div className="p-4 space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                            <span className="font-medium">Company</span>
                            <span>{userDetails?.company}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">DOB</span>
                            <span>{userDetails?.dob}</span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full text-left block px-4 py-3 text-sm text-red-600 bg-red-50 hover:bg-red-100 font-medium transition-colors">
                    Logout
                    </button>
                </motion.div>
                )}
            </AnimatePresence>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-10 h-10 rounded-full bg-white border-2 border-purple-100 flex items-center justify-center overflow-hidden hover:border-[#552483] transition-all shadow-sm"
            >
              {userDetails?.face_image_url ? (
                <img src={userDetails.face_image_url} alt="Profile" className="w-full h-full object-cover" />
              ) : userDetails?.name ? (
                <span className="font-bold text-lg text-[#552483]">{userDetails.name.charAt(0).toUpperCase()}</span>
              ) : (
                <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-white/95 backdrop-blur-md border-t border-purple-100 overflow-hidden">
              <div className="flex flex-col px-6 py-6">
                <div className="flex flex-col space-y-4 text-center text-base font-medium text-neutral-700">
                  <Link href="/" className="block py-2 hover:text-[#552483] transition-colors">Home</Link>
                  <button onClick={() => { fetchPastReservations(); setIsMobileMenuOpen(false); }} className="block w-full py-2 hover:text-[#552483] transition-colors">History</button>
                  <Link href="/about" className="block py-2 hover:text-[#552483] transition-colors">About</Link>
                  <Link href="/contact" className="block py-2 hover:text-[#552483] transition-colors">Contact</Link>
                </div>
                <div className="mt-4 p-4 rounded-xl bg-[#552483]/5 border border-purple-100">
                    <p className="text-base font-bold text-[#552483] text-center">{userDetails?.name}</p>
                    <p className="text-xs text-gray-500 text-center">{userId}</p>
                    <div className="mt-4 border-t border-purple-100 pt-4">
                        <button onClick={handleLogout} className="w-full text-center block py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 font-medium transition-colors rounded-lg">
                            Logout
                        </button>
                    </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- Main Content --- */}
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center p-6 pt-20 pb-12">
        
        {/* Toast Message */}
        <AnimatePresence>
            {message && (
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-24 left-1/2 transform -translate-x-1/2 z-40 bg-white/80 backdrop-blur border border-purple-200 text-[#552483] px-6 py-3 rounded-full shadow-lg text-sm font-semibold"
            >
                {message}
            </motion.div>
            )}
        </AnimatePresence>

        {currentReservation ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl md:mt-6"
          >

            {/* --- TICKET DESIGN --- */}
            <div className="relative w-full bg-white rounded-2xl shadow-xl shadow-purple-900/10 flex flex-col md:flex-row overflow-hidden border-2 border-[#552483]">
              
              {/* Left Section (Ticket Body) */}
              <div className="flex-1 p-6">
                 <div className="flex justify-between items-start mb-4 border-b border-gray-200 pb-3">
                    <div>
                      <h2 className="text-2xl font-extrabold text-[#552483] tracking-tight">VISITOR PASS</h2>
                      <p className="font-mono text-xs text-gray-400 uppercase tracking-widest mt-1">Authorized Entry</p>
                    </div>
                    <div className="text-right">
                       <span className="font-mono text-sm font-bold text-[#552483] bg-purple-50 px-2 py-1 rounded">
                         ID: {String(currentReservation.data.id).padStart(6, '0')}
                       </span>
                    </div>
                 </div>

                 {/* Details Grid */}
                 <div className="grid grid-cols-1 gap-y-3 font-mono text-sm">
                    {Object.entries(currentReservation.data).map(([key, value]) => {
                       if (value === null || value === "" || key === "id" || key === "user_email" || key === "user_id" || key === "created_at" || key === "check_in" || key === "check_out") return null;
                       return (
                         <div key={key} className="flex justify-between border-b border-dashed border-gray-200/80 pb-2">
                            <span className="text-gray-500 font-medium uppercase text-xs pt-1">{formatKey(key)}</span>
                            <span className="font-bold text-neutral-800">{formatValue(key, value)}</span>
                         </div>
                       );
                    })}
                    <div className="flex justify-between pt-2">
                        <span className="text-gray-500 font-medium uppercase text-xs pt-1">Issued</span>
                        <span className="font-bold text-neutral-800">{formatValue("created_at", currentReservation.data.created_at)}</span>
                    </div>
                 </div>

                 {/* Status Badge */}
                 <div className="mt-4 flex items-center">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                        !currentReservation.data.check_in 
                        ? "bg-yellow-100 text-yellow-700" 
                        : !currentReservation.data.check_out 
                        ? "bg-green-100 text-green-700" 
                        : "bg-gray-200 text-gray-600"
                    }`}>
                        {!currentReservation.data.check_in ? "Pending Arrival" : !currentReservation.data.check_out ? "Active • Checked In" : "Completed"}
                    </span>
                 </div>
              </div>

              {/* Separator (The Dashed Line & Holes) */}
              <div className="hidden md:flex flex-col items-center justify-between relative bg-[#fcfaff] w-2 border-l-2 border-dashed border-gray-300/50">
                 <div className="absolute top-[-16px] left-[-16px] w-8 h-8 bg-neutral-50 rounded-full border-2 border-[#552483] z-10"></div>
                 <div className="absolute bottom-[-16px] left-[-16px] w-8 h-8 bg-neutral-50 rounded-full border-2 border-[#552483] z-10"></div>
              </div>

              {/* Right Section (QR & Actions) */}
              <div className="w-full md:w-72 bg-[#fcfaff] p-6 flex flex-col justify-center items-center border-t-2 md:border-t-0 border-dashed border-gray-300">
                 <p className="font-mono text-xs font-bold text-[#552483] mb-3 tracking-widest">SCAN QR CODE</p>
                 
                 <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 mb-4">
                    <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=VISITOR-${currentReservation.data.id}`}
                        alt="QR Code"
                        className="w-36 h-36 md:w-32 md:h-32"
                    />
                 </div>

                 <div className="w-full max-w-xs md:max-w-none">
                    {!currentReservation.data.check_in ? <button onClick={handleCheckIn} className="w-full py-3 md:py-2 bg-[#552483] text-white font-bold rounded-lg shadow hover:bg-[#461e6b] transition-colors text-sm">Check In &gt;&gt;</button>
                    : !currentReservation.data.check_out ? <button onClick={handleCheckOut} className="w-full py-3 md:py-2 bg-neutral-900 text-white font-bold rounded-lg shadow hover:bg-black transition-colors text-sm">Check Out &gt;&gt;</button>
                    : <div className="w-full py-3 md:py-2 text-center bg-gray-200 rounded-lg text-gray-500 font-bold text-xs uppercase">Expired</div>}
                 </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-5xl"
          > 
            {/* --- NEW DASHBOARD DESIGN --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              
              {/* Left Column: Greeting */}
              <div className="text-center md:text-left">
                  <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                      {getGreeting()}, <span className="text-[#552483]">{userDetails?.name?.split(' ')[0]}</span>.
                  </h1>
                  <p className="text-gray-500 text-lg">Ready to get started? Select a purpose for your visit to begin the registration process.</p>
              </div>

              {/* Right Column: Options List */}
              <div className="bg-white/60 p-2 rounded-2xl shadow-sm border border-gray-100">
                <div className="space-y-2">
                  {visitOptions.map((option, index) => (
                    <motion.button
                      key={option.value}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleVisitClick(option.value)}
                      className="group w-full flex items-center text-left p-4 rounded-xl hover:bg-[#552483]/5 transition-colors duration-200"
                    >
                        <div className="mr-5 p-3 rounded-lg bg-[#552483] text-white shadow-md shadow-purple-500/20">
                            {option.icon}
                        </div>
                        <div className="flex-grow">
                            <h3 className="font-bold text-neutral-800 group-hover:text-[#552483] transition-colors">{option.label}</h3>
                            <p className="text-sm text-gray-500">Start new application</p>
                        </div>
                        <div className="ml-4 text-gray-300 group-hover:text-[#552483] group-hover:translate-x-1 transition-all">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-out z-50 flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#552483] text-white">
          <h3 className="text-xl font-bold">Visit History</h3>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-6 bg-gray-50">
          {loading ? (
            <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#552483]"></div></div>
          ) : pastReservations.length > 0 ? (
            <div className="space-y-4">
              {pastReservations.map((res, index) => (
                <div key={`${res.id}-${index}`} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-purple-200 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-1 bg-purple-50 text-[#552483] text-xs font-bold uppercase rounded tracking-wide">{res.type}</span>
                    <span className="text-xs text-gray-400 font-mono">#{res.id}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-500 mb-4">{new Date(res.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-gray-100 pt-3">
                    <div>
                        <p className="text-gray-400 mb-0.5">Checked In</p>
                        <p className="font-semibold text-gray-700">{res.check_in ? new Date(res.check_in).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '—'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-400 mb-0.5">Checked Out</p>
                        <p className="font-semibold text-gray-700">{res.check_out ? new Date(res.check_out).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '—'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p>No history found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Pending Approval Modal */}
      <AnimatePresence>
        {isPendingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center"
            >
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-neutral-800">Approval Pending</h3>
              <p className="text-sm text-neutral-500 mt-2 mb-6">
                Your Face ID is currently under review by an administrator. You can still access and use all features of the app in the meantime.
              </p>
              <button
                onClick={() => setIsPendingModalOpen(false)}
                className="w-full bg-[#552483] text-white font-bold py-3 rounded-lg hover:bg-[#461e6b] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#552483]"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}