"use client";
import { useState, useEffect, useContext } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UserContext } from "../../UserContext";

export default function VisitPage() {
  const [company, setCompany] = useState("");
  const [friendName, setFriendName] = useState("");
  const [friendEmail, setFriendEmail] = useState("");
  const [purpose, setPurpose] = useState("");
  const [message, setMessage] = useState("");
  const { setLoggedIn } = useContext(UserContext) || {};
  const router = useRouter();
  const [email, setEmail] = useState(null); // State to hold the user's email

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!company || !friendName || !friendEmail || !purpose) {
      setMessage("Please fill in all fields.");
      return;
    }

    setMessage("Saving visit details...");

    if (!email) {
      setMessage("Session expired. Please log in again.");
      return;
    }

    // 1. Fetch user's name for the 'recent' table
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

    const creationTime = new Date();

    // 2. Insert into visitlogs table
    const { error } = await supabase.from("visitlogs").insert([
      {
        user_email: email,   // the logged-in user's email
        company: company,
        friend_name: friendName,
        friend_email: friendEmail,
        purpose: purpose, // fixed purpose
        created_at: creationTime,
        check_in: null,
        check_out: null,
      },
    ]);

    // 3. Insert into recent table
    const { error: recentError } = await supabase.from("recent").insert([
      {
        email: email,
        name: userName,
        purpose: "visit",
        status: "Pending",
        created_at: creationTime,
        check_in: null,
        check_out: null,
      },
    ]);

    if (error || recentError) {
      setMessage("Error saving visit: " + error.message);
      return;
    }

    setMessage("Visit logged successfully!");
    router.push(`/userpage`);
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
          Visit a Friend
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
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
            <label className="block text-sm font-medium text-gray-700">
              Friend's Name
            </label>
            <input
              type="text"
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-black bg-gray-100 border border-gray-300 rounded-md focus:ring-[#552483] focus:border-[#552483] outline-none"
              placeholder="Enter friend's name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Friend's Email
            </label>
            <input
              type="email"
              value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-black bg-gray-100 border border-gray-300 rounded-md focus:ring-[#552483] focus:border-[#552483] outline-none"
              placeholder="Enter friend's email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Purpose
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-black bg-gray-100 border border-gray-300 rounded-md focus:ring-[#552483] focus:border-[#552483] outline-none"
              placeholder="Enter Purpose of Visit"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 text-white bg-[#552483] rounded-md font-semibold hover:bg-black transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-[#552483]"
          >
            Log Visit
          </button>
        </form>
        {message && (
          <p className="text-center text-sm text-[#552483] mt-4">{message}</p>
        )}
      </div>
    </div>
  );
}
