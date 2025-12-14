"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import * as faceapi from 'face-api.js';
import Image from "next/image";
import { APP_CONFIG_DEFAULTS } from "../../app-config";

// Simple Icons Components (to avoid installing external libraries)
const MailIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);
const LockIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
const UserIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const CameraIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  
  // ----------------------------------------------------------------
  // AUTH FLOW STATE
  // 'email' -> 'otp' -> 'face_verify' (for returning) OR 'details' (for new)
  // 'email' -> 'otp' -> 'details' -> 'face_capture' (for new)
  const [authStep, setAuthStep] = useState("email"); 
  const [flowType, setFlowType] = useState('register'); // 'register' or 'login'
  const [scrolled, setScrolled] = useState(false);
  
  // Data State
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [formData, setFormData] = useState({
    name: "", company: "", address: "", dob: "",
  });
  const [storedFaceDescriptor, setStoredFaceDescriptor] = useState(null); // The user's face from DB
  
  // System State
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);
  const router = useRouter();
  const brandPurple = "#552483";
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Face Recognition State
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [currentFaceDescriptor, setCurrentFaceDescriptor] = useState(null); // Live face data
  const [capturedImageBlob, setCapturedImageBlob] = useState(null); 
  const [previewFaceUrl, setPreviewFaceUrl] = useState(null);
  const [isFaceCaptured, setIsFaceCaptured] = useState(false); 
  const [recognitionStatus, setRecognitionStatus] = useState("idle"); 
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);

  // ----------------------------------------------------------------
  // 1. Initialization & Models
  // ----------------------------------------------------------------

  useEffect(() => {
    // Scroll Listener for Navbar
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models/weights'; 
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
        console.log("Face API Models Loaded");
      } catch (err) {
        console.error("Error loading face-api models:", err);
        setMessage("Error loading AI models.");
      }
    };
    loadModels();

    // Check for an existing valid session on page load
    const sessionData = localStorage.getItem("session");
    if (sessionData) {
      const session = JSON.parse(sessionData);
      const sessionAge = Date.now() - session.timestamp;
      const TEN_MINUTES = 10 * 60 * 1000;

      if (sessionAge < TEN_MINUTES) {
        // Session is still valid, redirect immediately
        router.push("/userpage");
      } else {
        // Session has expired, clear it
        localStorage.removeItem("session");
      }
    }

  }, [router]); // Added router to dependency array

  // ----------------------------------------------------------------
  // 2. Camera & Detection Loop
  // ----------------------------------------------------------------

  const startVideo = async () => {
    setIsCameraOn(true);
    setRecognitionStatus("scanning");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      setMessage("Error accessing camera.");
    }
  };

  const stopVideo = () => {
    setIsCameraOn(false);
    setRecognitionStatus("idle");
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Main AI Loop
  useEffect(() => {
    let interval;
    if (isCameraOn && modelsLoaded && videoRef.current) {
      interval = setInterval(async () => { 
        if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
          
          const detection = await faceapi.detectSingleFace(videoRef.current)
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (detection) {
            // Draw box
            if (canvasRef.current) {
                const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
                const resized = faceapi.resizeResults(detection, dims);
                const drawOptions = { boxColor: '#22c55e', lineWidth: 2 }; // Green color
                const drawBox = new faceapi.draw.DrawBox(resized.detection.box, drawOptions);
                drawBox.draw(canvasRef.current);
            }

            // --- BRANCH A: VERIFICATION MODE (AuthStep: face_verify) ---
            if (authStep === 'face_verify' && storedFaceDescriptor) {
               verifyFaceMatch(detection.descriptor);
            }

            // --- BRANCH B: REGISTRATION MODE (AuthStep: details) ---
            if ((authStep === 'details' || authStep === 'face_capture') && !isFaceCaptured) {
               setCurrentFaceDescriptor(detection.descriptor); 
            }

          } else {
             if(canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
             }
             if ((authStep === 'details' || authStep === 'face_capture') && !isFaceCaptured) {
                setCurrentFaceDescriptor(null);
             }
          }
        }
      }, 500); 
    }
    return () => clearInterval(interval);
  }, [isCameraOn, modelsLoaded, authStep, storedFaceDescriptor, isFaceCaptured]); // No change, just noting dependency on authStep

  // ----------------------------------------------------------------
  // 3. Logic: Match Live Face vs Stored Face
  // ----------------------------------------------------------------

  const verifyFaceMatch = async (liveDescriptor) => {
    if (recognitionStatus === 'success') return; // Already done

    // Convert stored JSON back to Float32Array
    const storedData = typeof storedFaceDescriptor === 'string' 
        ? JSON.parse(storedFaceDescriptor) 
        : storedFaceDescriptor;
    
    const storedFloat32 = new Float32Array(storedData);
    
    // Calculate distance (lower is better)
    const distance = faceapi.euclideanDistance(liveDescriptor, storedFloat32);
    const THRESHOLD = 0.55; // Strictness

    if (distance < THRESHOLD) {
        setRecognitionStatus('success');
        setMessage("Face Verified! Logging in...");
        stopVideo();
        
        // Log user in
        localStorage.setItem("session", JSON.stringify({ email, timestamp: Date.now() }));
        setTimeout(() => router.push("/userpage"), 1500);
    }
  };

  // ----------------------------------------------------------------
  // 4. Logic: Capture for Registration
  // ----------------------------------------------------------------

  const captureForRegistration = async () => {
    if (!currentFaceDescriptor) {
      setMessage("No face detected. Please look at the camera.");
      return;
    }
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    // Flip the canvas context horizontally to match the mirrored video preview
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      setCapturedImageBlob(blob);
      setPreviewFaceUrl(URL.createObjectURL(blob));
      setIsFaceCaptured(true); 
      stopVideo(); 
    }, "image/png");
  };

  // ----------------------------------------------------------------
  // 5. Form Handlers (Sequential)
  // ----------------------------------------------------------------

  // STEP 1: Send OTP
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage(""); // Clear old messages

    // Check if user exists and is pending approval
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("face_image_status, face_image_url")
      .eq("email", email)
      .single();

    if (existingUser?.face_image_status === 'pending') {
      setIsPendingModalOpen(true);
      setLoading(false);
      return;
    }

    // If user exists and is approved, set flow to login immediately
    if (existingUser?.face_image_status === 'approved' && existingUser?.face_image_url) {
      setFlowType('login');
    } else {
      setFlowType('register'); // Otherwise, it's a registration flow
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { error } = await supabase.from("users").upsert(
      { email, otp_code: otp, otp_expires_at: expiresAt },
      { onConflict: "email" }
    );

    if (error) { 
        setMessage("Error: " + error.message); 
        setLoading(false); 
        return; 
    }

    try {
      await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      // setMessage("OTP sent to email.");
      setAuthStep("otp"); // MOVE TO STEP 2
      setTimeout(() => inputsRef.current[0]?.focus(), 120);
    } catch (err) { setMessage("Error sending OTP"); }
    setLoading(false);
  };

  // STEP 2: Verify OTP -> Check if User Exists
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage("");

    const enteredOtp = digits.join("");
    
    const { data: user, error } = await supabase.from("users").select("*").eq("email", email).single();

    if (error || !user || user.otp_code !== enteredOtp) {
      setMessage("Invalid OTP."); setLoading(false); return;
    }
    
    // OTP IS GOOD. NOW CHECK THEIR FACE STATUS.
    const goToRegistration = (message) => {
      setFormData({ 
        // Reset form data for new/rejected users
        name: user.name || "", 
        company: user.company || "", 
        address: user.address || "", 
        dob: user.dob || "" 
      });
      setAuthStep("details");
      setMessage(message);
      setFlowType('register'); // Explicitly set to registration flow
    };

    if (user.face_image_url) {
      switch (user.face_image_status) {
        case 'pending':
          setIsPendingModalOpen(true);
          break;

        case 'rejected':
          goToRegistration(`Your face ID was rejected. Reason: ${user.admin_say || 'No reason provided.'} Please capture a new photo.`);
          break;

        case 'approved':
          setStoredFaceDescriptor(user.face_descriptor);
          setFlowType('login'); // Set to login flow
          setAuthStep("face_verify");
          // setMessage("OTP Verified. Please scan face to login.");
          setTimeout(() => { if(modelsLoaded) startVideo(); }, 500);
          break;

        default: 
          goToRegistration("OTP Verified. Please complete your profile.");
          break;
      }
    } else {
      goToRegistration("OTP Verified. Please complete your profile.");
    }

    setLoading(false);
  };

  // STEP 3 (New): Handle Details Submission
  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    setAuthStep('face_capture');
    setMessage("Please set up your Face ID to complete registration.");
    setTimeout(() => { if(modelsLoaded) startVideo(); }, 500);
  };

  // STEP 4: Save Face & Finalize Registration
  const handleFaceSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let faceImageUrl = null;
    if (capturedImageBlob) {
      const filePath = `user_faces/${email}/face.png`;
      const { error: uploadError } = await supabase.storage
        .from("user-media")
        .upload(filePath, capturedImageBlob, { upsert: true });

      if (uploadError) {
        setMessage("Image Upload Error: " + uploadError.message);
        setLoading(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from("user-media").getPublicUrl(filePath);
      faceImageUrl = publicUrl;
    }

    const updates = {
      name: formData.name,
      company: formData.company,
      address: formData.address,
      dob: formData.dob,
      created_at: new Date().toISOString(),
      face_image_url: faceImageUrl,
      face_image_status: 'pending', // Set status to pending
    };

    if (currentFaceDescriptor) {
      updates.face_descriptor = Array.from(currentFaceDescriptor);
    }

    const { error } = await supabase.from("users").update(updates).eq("email", email);

    if (error) {
      setMessage("Error saving details: " + error.message);
    } else {
      setMessage("Registration Complete! Redirecting to your page...");
      // Log user in by creating a session
      localStorage.setItem("session", JSON.stringify({ email, timestamp: Date.now() }));
      setTimeout(() => {
        router.push("/userpage");
      }, 1500);
    }
    setLoading(false);
  };

  // ----------------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------------
  const handleDigitChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...digits]; next[idx] = val; setDigits(next);
    if (val && idx < 3) inputsRef.current[idx + 1]?.focus();
  };

  // Helper to determine visual step number (1-4) based on authStep string
  const getVisualStep = () => {
      if (authStep === 'email') return 1;
      if (authStep === 'otp') return 2; 
      if (authStep === 'details') return 3;
      if (authStep === 'face_capture') return 4;
      if (authStep === 'face_verify') return 3; // Login flow remains a 3-step visual
      return 1; // Default
  };


  // ----------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfaff] font-sans text-neutral-900">
      
      {/* ======================= */}
      {/* NAVBAR (UNCHANGED)      */}
      {/* ======================= */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled || isMenuOpen
            ? "bg-[#fcfaff] shadow-sm py-3"
            : "bg-[#fcfaff]/90 backdrop-blur-sm py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          {/* Logo */}
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

          {/* Desktop Links - Dark text, Purple hover */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-neutral-700">
            <Link href="/" className="hover:text-[#552483] transition-colors">Home</Link>
            <Link href="/about" className="hover:text-[#552483] transition-colors">About</Link>
            <Link href="/contact" className="hover:text-[#552483] transition-colors">Contact</Link>
          </div>

          {/* CTA Button - Solid Brand Purple */}
          <div className="hidden md:flex">
            <Link
              href="/adminlogin"
              className="px-5 py-2.5 rounded-md bg-[#552483] text-white text-sm font-bold hover:bg-opacity-90 transition-all shadow-sm"
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
              className="md:hidden bg-[#fcfaff] overflow-hidden"
            >
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

      {/* ======================= */}
      {/* MAIN CONTENT (UPDATED)  */}
      {/* ======================= */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
        
          <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(85,36,131,0.15)] p-8 relative overflow-hidden">
            
            {/* STEPPER INDICATOR */}
            {authStep !== 'email' && (
              <div className="flex items-center justify-center mb-8 relative z-10">
                  {(flowType === 'login' ? [1, 2, 3] : [1, 2, 3, 4]).map((step, index, arr) => {
                      const isActive = getVisualStep() >= step;
                      return (
                          <div key={step} className="flex items-center">
                              <div 
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 
                                  ${isActive ? 'bg-[#552483] border-[#552483] text-white' : 'bg-transparent border-neutral-200 text-neutral-300'}`}
                              >
                                  {step}
                              </div>
                              {index < arr.length - 1 && (
                                  <div className={`w-8 h-0.5 mx-1 transition-colors duration-300 ${getVisualStep() > step ? 'bg-[#552483]' : 'bg-neutral-200'}`}></div>
                              )}
                          </div>
                      )
                  })}
              </div>
            )}

            <AnimatePresence mode="wait">
                
                {/* -------------------- STEP 1: EMAIL -------------------- */}
                {authStep === 'email' && (
                    <motion.div 
                        key="step-email"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-center" // Keep this class for overall alignment
                    >
                        {message && (
                            <div className="mb-6 text-center">
                                <p className={`text-xs font-medium ${
                                    message.toLowerCase().includes('error') || 
                                    message.toLowerCase().includes('invalid') ||
                                    message.toLowerCase().includes('pending') ||
                                    message.toLowerCase().includes('awaiting')
                                    ? 'text-red-500' : 'text-neutral-400'
                                }`}>
                                    {message}
                                </p>
                            </div>
                        )}
                        <h2 className="text-3xl font-bold text-neutral-900 mb-3">Welcome</h2>
                        <p className="text-neutral-500 mb-6 text-sm">Enter your email to receive a secure access code</p>
                        
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-[#552483]">
                                    <MailIcon />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-neutral-50 text-neutral-900 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white focus:border-[#552483]/20 focus:shadow-[0_0_0_4px_rgba(85,36,131,0.1)] transition-all font-medium placeholder:text-neutral-400"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#552483] hover:bg-[#451d6b] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#552483]/20 disabled:opacity-70"
                            >
                                {loading ? "Sending..." : "Continue"}
                                {!loading && <ArrowRightIcon />}
                            </button>
                        </form>
                    </motion.div>
                )}

                {/* -------------------- STEP 2: OTP -------------------- */}
                {authStep === 'otp' && (
                    <motion.div 
                        key="step-otp"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-center" // Keep this class for overall alignment
                    >
                        {message && (
                            <div className="mb-6 text-center">
                                <p className={`text-xs font-medium ${
                                    message.toLowerCase().includes('error') || 
                                    message.toLowerCase().includes('invalid') ||
                                    message.toLowerCase().includes('pending') ||
                                    message.toLowerCase().includes('awaiting')
                                    ? 'text-red-500' : 'text-neutral-400'
                                }`}>
                                    {message}
                                </p>
                            </div>
                        )}
                        <h2 className="text-3xl font-bold text-neutral-900 mb-3">Check Inbox</h2>
                        <p className="text-neutral-500 mb-6 text-sm">We sent a code to <span className="font-semibold text-neutral-800">{email}</span></p>
                        
                        <form onSubmit={handleOtpSubmit} className="space-y-6">
                            <div className="flex justify-center gap-3">
                                {digits.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        ref={(el) => (inputsRef.current[idx] = el)}
                                        type="text"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleDigitChange(e, idx)}
                                        onKeyDown={(e) => e.key === 'Backspace' && !digits[idx] && idx > 0 && inputsRef.current[idx - 1]?.focus()}
                                        className="w-14 h-16 text-center text-2xl font-bold bg-neutral-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#552483] outline-none transition-all"
                                    />
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || digits.join("").length !== 4}
                                className="w-full bg-[#552483] hover:bg-[#451d6b] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#552483]/20 disabled:opacity-70"
                            >
                                {loading ? "Verifying..." : "Verify & Login"}
                            </button>

                            <button onClick={() => setAuthStep('email')} className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors">
                                Change email address
                            </button>
                        </form>
                    </motion.div>
                )}

                {/* -------------------- STEP 3: FACE VERIFICATION -------------------- */}
                {authStep === 'face_verify' && (
                    <motion.div 
                        key="step-verify"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-center" // Keep this class for overall alignment
                    >
                        {message && (
                            <div className="mb-4 text-center">
                                <p className={`text-sm font-medium ${
                                    message.toLowerCase().includes('error') || message.toLowerCase().includes('invalid')
                                    ? 'text-red-500' : 'text-green-600'
                                }`}>
                                    {message}
                                </p>
                            </div>
                        )}
                        <h2 className="text-3xl font-bold text-neutral-900 mb-3">Face Check</h2>
                        <p className="text-neutral-500 mb-6 text-sm">One last step to confirm it's you.</p>

                        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black mb-6 shadow-inner ring-4 ring-neutral-100">
                             <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                             <canvas ref={canvasRef} className="absolute inset-0 w-full h-full transform scale-x-[-1]" />
                             
                             {/* Overlay Status */}
                             <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-white border border-white/20">
                                {recognitionStatus === 'success' ? 'MATCHED' : 'SCANNING'}
                             </div>
                        </div>

                        {!isCameraOn && !loading && recognitionStatus !== 'success' && (
                            <button 
                                onClick={startVideo} 
                                className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all"
                            >
                                <CameraIcon /> Enable Camera
                            </button>
                        )}
                        
                        {recognitionStatus === 'success' && (
                            <div className="p-3 bg-green-50 text-green-700 rounded-xl font-medium text-sm">
                                verified successfully. Redirecting...
                            </div>
                        )}
                    </motion.div>
                )}

                {/* -------------------- STEP 3 (ALT): REGISTRATION DETAILS -------------------- */}
                {authStep === 'details' && (
                    <motion.div 
                        key="step-details"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="" // Keep this class for overall alignment
                    >
                        {message && (
                            <div className="mb-4 text-center">
                                <p className={`text-xs font-medium ${
                                    message.toLowerCase().includes('error') || 
                                    message.toLowerCase().includes('invalid') ||
                                    message.toLowerCase().includes('rejected') ||
                                    message.toLowerCase().includes('awaiting admin approval')
                                    ? 'text-yellow-600'
                                    : message.toLowerCase().includes('registration complete') ? 'text-green-600' // Added for success message
                                    : 'text-neutral-400'
                                }`}>
                                    {message}
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleDetailsSubmit} className="space-y-4">
                            <h2 className="text-2xl font-bold text-neutral-900 mb-1 text-center">Complete Profile</h2>
                            <p className="text-neutral-500 mb-4 text-sm text-center">Finish setting up your account.</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2 relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                                        <UserIcon />
                                    </div>
                                    <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-neutral-50 rounded-xl py-3 pl-12 pr-4 outline-none focus:bg-white focus:ring-2 focus:ring-[#552483]/20 transition-all text-sm" placeholder="Full Name" />
                                </div>
                                
                                <input required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="col-span-1 bg-neutral-50 rounded-xl py-3 px-4 outline-none focus:bg-white focus:ring-2 focus:ring-[#552483]/20 transition-all text-sm" placeholder="Company" />
                                <input type="date" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} className="col-span-1 bg-neutral-50 rounded-xl py-3 px-4 outline-none focus:bg-white focus:ring-2 focus:ring-[#552483]/20 transition-all text-sm text-neutral-500" />
                                <input required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="col-span-2 bg-neutral-50 rounded-xl py-3 px-4 outline-none focus:bg-white focus:ring-2 focus:ring-[#552483]/20 transition-all text-sm" placeholder="Address" />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#552483] hover:bg-[#451d6b] text-white py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-[#552483]/20 disabled:opacity-70 text-sm"
                            >
                                {loading ? "Saving..." : "Continue to Face ID"}
                            </button>
                        </form>
                    </motion.div>
                )}

                {/* -------------------- STEP 4: FACE CAPTURE (NEW) -------------------- */}
                {authStep === 'face_capture' && (
                    <motion.div 
                        key="step-face-capture"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-center"
                    >
                        {message && (
                            <div className="mb-4 text-center">
                                <p className={`text-xs font-medium ${
                                    message.toLowerCase().includes('error') || 
                                    message.toLowerCase().includes('invalid') ||
                                    message.toLowerCase().includes('rejected')
                                    ? 'text-yellow-600'
                                    : 'text-neutral-400'
                                }`}>{message}</p>
                            </div>
                        )}

                        <div className="relative w-full aspect-[4/3] md:aspect-video rounded-2xl overflow-hidden bg-black mb-6 shadow-inner ring-4 ring-neutral-100">
                            {isFaceCaptured ? (
                                <img src={previewFaceUrl} alt="Face Preview" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full transform scale-x-[-1]" />
                                    {!isCameraOn && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white/50">
                                            <CameraIcon />
                                            <span className="text-xs mt-1">Camera is off</span>
                                        </div>
                                    )}
                                    {isCameraOn && !currentFaceDescriptor && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50"><p className="text-white/80 text-xs font-medium">Searching for face...</p></div>
                                    )}
                                </>
                            )}
                        </div>

                        {isFaceCaptured ? (
                            <div className="space-y-3">
                                <button 
                                    onClick={handleFaceSubmit}
                                    disabled={loading}
                                    className="w-full bg-[#552483] text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#451d6b] transition-all disabled:opacity-70"
                                >
                                    {loading ? "Finalizing..." : "Confirm & Complete"}
                                </button>
                                <button onClick={() => { setIsFaceCaptured(false); setCapturedImageBlob(null); startVideo(); }} className="text-sm text-neutral-500 hover:text-neutral-700">
                                    Retake Photo
                                </button>
                            </div>
                        ) : isCameraOn ? (
                            <button 
                                onClick={captureForRegistration} 
                                disabled={!currentFaceDescriptor}
                                className="w-full bg-green-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Capture Photo
                            </button>
                        ) : (
                            <button 
                                onClick={startVideo} 
                                disabled={!modelsLoaded}
                                className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all disabled:opacity-50"
                            >
                                <CameraIcon /> {!modelsLoaded ? "Loading Models..." : "Enable Camera"}
                            </button>
                        )}
                    </motion.div>
                )}

            </AnimatePresence>

            {authStep === 'email' && (
                <div className="mt-8 text-center">
                    <p className="text-xs text-neutral-400">We'll send you a secure access code.</p>
                </div>
            )} 
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
                    Your account is awaiting approval from an administrator. Please check back later. You will not be able to log in until your account is approved.
                  </p>
                  <button
                    onClick={() => setIsPendingModalOpen(false)}
                    className="w-full bg-[#552483] text-white font-bold py-3 rounded-lg hover:bg-[#461e6b] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#552483]"
                  >
                    Okay
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>
    </div>
  );
}