"use client";
import { useState, useEffect, useContext } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { UserContext } from "../../UserContext";

export default function InterviewPage() {
  const router = useRouter();
  const { setLoggedIn } = useContext(UserContext) || {};

  const [email, setEmail] = useState(null); // State to hold the user's email
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sessionData = localStorage.getItem("session");
    if (!sessionData) {
      router.replace("/login");
      return;
    }

    const { email: sessionEmail, timestamp } = JSON.parse(sessionData);
    const tenMinutes = 10 * 60 * 1000;
    if (Date.now() - timestamp > tenMinutes) {
      localStorage.removeItem("session");
      router.replace("/login");
      return;
    }

    setEmail(sessionEmail);

    if (setLoggedIn) {
      setLoggedIn(true);
    }
  }, [router, setLoggedIn]);

  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!company || !position || !dateTime) {
      setMessage("Please fill all fields.");
      return;
    }

    if (!email) {
      setMessage("Session expired. Please log in again.");
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("name")
      .eq("email", email)
      .single();
    if (userError || !userData) {
      setMessage("Error fetching user details: " + (userError?.message || "User not found."));
      return;
    }
    const userName = userData.name;

    setLoading(true);
    const creationTime = new Date();
    const { error } = await supabase.from("interview").insert([
      {
        user_email: email,
        company: company,
        position: position,
        date_time: dateTime, // Supabase can take ISO string from datetime-local
        created_at: creationTime,
        check_in: null,
        check_out: null,
      },
    ]);
    const { error: recentError } = await supabase.from("recent").insert([
      {
        email: email,
        name: userName,
        purpose: "interview",
        status: "Pending",
        created_at: creationTime,
        check_in: null,
        check_out: null,
      },
    ]);

    if (error) {
      setMessage("Error submitting interview: " + error.message);
    } else {
      setMessage("Interview details submitted successfully!");
      router.push(`/userpage`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      {/* Back Arrow */}
      <button
        onClick={() => router.push('/userpage')}
        className="absolute top-6 left-6 z-20 text-[#552483] bg-gray-100 rounded-full p-2 hover:bg-gray-200 transition-colors"
        aria-label="Go back"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Page Content */}
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg border border-[#552483]">
        <h2 className="text-3xl font-extrabold text-center text-[#552483]">
          Schedule Interview
        </h2>
        <p className="text-center text-gray-600">
          Please provide your interview details below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Company Name
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-black bg-gray-100 border border-gray-300 rounded-md focus:ring-[#552483] focus:border-[#552483] outline-none"
              placeholder="Enter company name"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Position
            </label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-black bg-gray-100 border border-gray-300 rounded-md focus:ring-[#552483] focus:border-[#552483] outline-none"
              placeholder="Enter position"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-black bg-gray-100 border border-gray-300 rounded-md focus:ring-[#552483] focus:border-[#552483] outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 text-white bg-[#552483] rounded-md font-semibold hover:bg-black transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-[#552483] disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Interview"}
          </button>
        </form>

        {message && (
          <p className="text-center text-sm text-[#552483] mt-4">{message}</p>
        )}
      </div>
    </div>
  );
}
