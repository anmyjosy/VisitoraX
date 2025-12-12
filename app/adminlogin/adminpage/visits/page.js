"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient"; // Assuming this path is correct

// A row component for the visit log table
const VisitLogRow = ({ log }) => (
  <tr className="border-b border-gray-200 hover:bg-gray-50">
    <td className="p-4 text-gray-700">{log.user_email}</td>
    <td className="p-4 text-gray-700">{log.company}</td>
    <td className="p-4 text-gray-700">{log.friend_name}</td>
    <td className="p-4 text-gray-700">{log.friend_email}</td>
    <td className="p-4 text-gray-700">{log.purpose}</td>
    <td className="p-4 text-gray-500">
      {new Date(log.created_at).toLocaleString()}
    </td>
    <td className="p-4 text-gray-500">
      {log.check_in ? new Date(log.check_in).toLocaleString() : "-"}
    </td>
    <td className="p-4 text-gray-500">
      {log.check_out ? new Date(log.check_out).toLocaleString() : "-"}
    </td>
  </tr>
);

export default function VisitLogsPage() {
  const [visitLogs, setVisitLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchVisitLogs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("visitlogs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching visit logs:", error);
      } else {
        setVisitLogs(data);
      }
      setLoading(false);
    };

    fetchVisitLogs();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    router.push("/adminlogin");
  };

  return (
    <div className="min-h-screen bg-purple-100 text-gray-800">
      <nav className="relative sticky top-0 z-50 flex justify-between items-center px-6 md:px-20 py-5 bg-[#552483] shadow-md text-white">
        <h1 className="text-xl font-bold text-white">VisitorApp - Admin</h1>
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/adminlogin/adminpage"
            className="px-4 py-2 rounded-md text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors"
          >
            &larr; Back to Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-md text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors"
          >
            Logout
          </button>
        </div>
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-[#552483] md:hidden shadow-lg">
            <div className="flex flex-col items-start space-y-2 p-4">
              <Link
                href="/adminlogin/adminpage"
                className="w-full text-left px-3 py-2 rounded-md hover:bg-white/10"
              >
                &larr; Back to Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-white/10"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      <div className="p-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8">
          Visit Logs
        </h1>
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <div className="overflow-x-auto -mx-6 sm:mx-0">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-500 uppercase">
                  <th className="p-4">User Email</th>
                  <th className="p-4">Company</th>
                  <th className="p-4">Friend's Name</th>
                  <th className="p-4">Friend's Email</th>
                  <th className="p-4">Purpose</th>
                  <th className="p-4">Created At</th>
                  <th className="p-4">Check In</th>
                  <th className="p-4">Check Out</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (<tr><td colSpan="8" className="text-center p-8">Loading...</td></tr>) : (visitLogs.map((log) => (<VisitLogRow key={log.id} log={log} />)))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}