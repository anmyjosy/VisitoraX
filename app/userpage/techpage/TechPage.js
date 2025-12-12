"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function TechEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(null); // State to hold the user's email

  // form fields
  const [eventName, setEventName] = useState("");
  const [eventDateTime, setEventDateTime] = useState("");
  const [roleOfInterest, setRoleOfInterest] = useState("");
  const [currentEvent, setCurrentEvent] = useState(null);

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

    if (!email) {
      return;
    }

    const fetchCurrentEvent = async () => {
      const { data, error } = await supabase
        .from("tech_events")
        .select("*")
        .eq("user_email", email)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        setCurrentEvent(data[0]);
      } else {
        setCurrentEvent(null);
      }
      setLoading(false);
    };

    fetchCurrentEvent();
  }, [email, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Saving event...");

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

    const creationTime = new Date(); // Create a single timestamp
    const { data, error } = await supabase.from("tech_event").insert([
      {
        user_email: email,
        event_name: eventName,
        event_date_time: eventDateTime,
        role_of_interest: roleOfInterest,
        created_at: creationTime,
        check_in: null,
        check_out: null,
      },
    ]);

    const { error: recentError } = await supabase.from("recent").insert([
      {
        email: email,
        name: userName,
        purpose: "tech",
        status: "Pending",
        created_at: creationTime,
        check_in: null,
        check_out: null,
      },
    ]);

    if (error) {
      setMessage("Error saving event: " + error.message);
    } else {
      setMessage("Event saved successfully!");
      router.push(`/userpage`);
    }
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
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg border border-[#552483]">
        <h2 className="text-3xl font-extrabold text-center text-[#552483]">
          Attend Tech Event
        </h2>
        <p className="text-center text-gray-600">
          Fill out the details to register.
        </p>

        {currentEvent ? (
          <div className="bg-gray-100 text-black p-4 rounded-lg border border-gray-200 space-y-2">
            <p className="text-black">
              <strong>Event:</strong> {currentEvent.event_name}
            </p>
            <p className="text-black">
              <strong>Date & Time:</strong>{" "}
              {new Date(currentEvent.event_date_time).toLocaleString()}
            </p>
            <p className="text-black">
              <strong>Role:</strong> {currentEvent.role_of_interest}
            </p>
            <p className="text-[#552483] font-semibold pt-2">
              You have registered for this event.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Event Name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-black bg-gray-100 border border-gray-300 rounded-md focus:ring-[#552483] focus:border-[#552483] outline-none"
            />
            <input
              type="datetime-local"
              placeholder="Event Date & Time"
              value={eventDateTime}
              onChange={(e) => setEventDateTime(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-black bg-gray-100 border border-gray-300 rounded-md focus:ring-[#552483] focus:border-[#552483] outline-none"
            />
            <input
              type="text"
              placeholder="Role / Interest"
              value={roleOfInterest}
              onChange={(e) => setRoleOfInterest(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-black bg-gray-100 border border-gray-300 rounded-md focus:ring-[#552483] focus:border-[#552483] outline-none"
            />
            <button
              type="submit"
              className="w-full px-4 py-3 text-white bg-[#552483] rounded-md font-semibold hover:bg-black transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-[#552483]"
            >
              Register Event
            </button>
          </form>
        )}

        {message && (
          <p className="text-center text-sm text-[#552483] mt-4">{message}</p>
        )}
      </div>
    </div>
  );
}
