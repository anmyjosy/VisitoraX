"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Colors,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { supabase } from "../../../lib/supabaseClient";
import { APP_CONFIG_DEFAULTS } from "../../../app-config";

// Register ChartJS
ChartJS.register(ArcElement, Tooltip, Legend, Colors, CategoryScale, LinearScale, PointElement, LineElement, BarElement);

/* -------------------------------------------------------------------------- */
/*                                    ICONS                                   */
/* -------------------------------------------------------------------------- */
const Icons = {
  Dashboard: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Door: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>,
  Tech: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  Mic: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>,
  Chart: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Clock: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Logout: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  Search: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  ArrowLeft: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
};
Icons.ArrowDown = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>;
Icons.ArrowDown.displayName = "ArrowDownIcon";

/* -------------------------------------------------------------------------- */
/*                            ATOMIC UI COMPONENTS                            */
/* -------------------------------------------------------------------------- */

const StatCard = ({ title, value, chip, icon: Icon }) => (
  <div className="flex flex-col p-5 bg-white border border-zinc-200 rounded-xl hover:border-zinc-300 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-zinc-50 border border-zinc-100 rounded-lg text-zinc-500">
        <Icon />
      </div>
      {chip && <span className="text-[10px] font-bold uppercase tracking-wide bg-[#552483] text-white px-2 py-0.5 rounded-full">{chip}</span>}
    </div>
    <div className="mt-auto">
      <span className="text-3xl font-bold text-[#552483] tracking-tight tabular-nums">{value}</span>
      <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mt-1">{title}</p>
    </div>
  </div>
);

const BarChartCard = ({ title, data, icon: Icon }) => (
  <div className="flex flex-col p-5 bg-white border border-zinc-200 rounded-xl hover:border-zinc-300 transition-colors">    
    <div className="flex justify-between items-start mb-2">
      <div className="p-2 bg-zinc-50 border border-zinc-100 rounded-lg text-zinc-500 self-start">
        <Icon />
      </div>
      <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest text-right">{title}</p>
    </div>
    <div className="flex-1 flex flex-col justify-end mt-auto">
      <div className="h-20 -mx-2 -mb-2">
        <Bar 
          data={{
            labels: data.labels,
            datasets: [{
              ...data.datasets[0], // Use data from state
              backgroundColor: "#6b21a8",
              borderRadius: 4,
              minBarLength: 4, // Ensures a tiny bar is drawn even when value is zero
            }]
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: true } },
            scales: {
              x: {
                display: true,
                ticks: { color: "#a1a1aa", font: { size: 9 } },
                grid: { display: false }
              },
              y: { display: false, beginAtZero: true }
            }
          }}
        />
      </div>
    </div>
  </div>
);

const SideNavButton = ({ active, label, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className={`group flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg ${
      active
        ? "bg-[#552483] text-white shadow-sm"
        : "text-zinc-500 hover:bg-zinc-100 hover:text-[#552483]"
    }`}
  >
    <Icon />
    <span>{label}</span>
  </button>
);

const FilterTab = ({ active, label, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all border ${
      active
        ? "bg-[#552483] text-white border-[#552483]"
        : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
    }`}
  >
    {label}
  </button>
);

const StatusBadge = ({ status }) => {
  const styles = {
    "Checked In": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Checked Out": "bg-zinc-100 text-zinc-600 border-zinc-200",
    "Pending": "bg-amber-50 text-amber-700 border-amber-200",
  };
  const style = styles[status] || styles["Pending"];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'Checked In' ? 'bg-emerald-500' : status === 'Checked Out' ? 'bg-zinc-400' : 'bg-amber-500'}`}></span>
      {status || "Pending"}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/*                               TABLE SYSTEM                                 */
/* -------------------------------------------------------------------------- */

// Helper components for perfect alignment
const THead = ({ children }) => (
  <th className="px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-left border-b border-zinc-200 bg-zinc-50/50 whitespace-nowrap">
    {children}
  </th>
);

const TCell = ({ children, className = "", align = "left" }) => (
  <td className={`px-4 py-3 text-sm text-zinc-600 border-b border-zinc-100 align-middle ${align === "right" ? "text-right" : "text-left"} ${className}`}>
    {children}
  </td>
);

const VisitLogRow = ({ row }) => (
  <tr className="hover:bg-zinc-50 transition-colors group">
    <TCell><span className="font-semibold text-[#552483]">{row.user_id}</span></TCell>
    <TCell>{row.company}</TCell>
    <TCell>{row.friend_name}</TCell>
    <TCell>{row.friend_email || <span className="text-zinc-300">-</span>}</TCell>
    <TCell><span className="bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{row.purpose}</span></TCell>
    <TCell className="font-mono text-xs tabular-nums">{row.check_in ? new Date(row.check_in).toLocaleString() : "-"}</TCell>
    <TCell className="font-mono text-xs tabular-nums">{row.check_out ? new Date(row.check_out).toLocaleString() : "-"}</TCell>
  </tr>
);

const TechEventRow = ({ row }) => (
  <tr className="hover:bg-zinc-50 transition-colors">
    <TCell><span className="font-semibold text-[#552483]">{row.user_id}</span></TCell>
    <TCell>{row.event_name}</TCell>
    <TCell>{row.role_of_interest}</TCell>
    <TCell className="font-mono text-xs tabular-nums">{row.event_date_time ? new Date(row.event_date_time).toLocaleString() : "-"}</TCell>
    <TCell className="font-mono text-xs tabular-nums">{row.check_in ? new Date(row.check_in).toLocaleString() : "-"}</TCell>
  </tr>
);

const InterviewRow = ({ row }) => (
  <tr className="hover:bg-zinc-50 transition-colors">
    <TCell><span className="font-semibold text-[#552483]">{row.user_id}</span></TCell>
    <TCell>{row.company}</TCell>
    <TCell>{row.position}</TCell>
    <TCell className="font-mono text-xs tabular-nums">{row.date_time ? new Date(row.date_time).toLocaleString() : "-"}</TCell>
    <TCell className="font-mono text-xs tabular-nums">{row.check_in ? new Date(row.check_in).toLocaleString() : "-"}</TCell>
  </tr>
);

const PitchRow = ({ row }) => (
  <tr className="hover:bg-zinc-50 transition-colors">
    <TCell><span className="font-semibold text-[#552483]">{row.user_id}</span></TCell>
    <TCell>{row.company_name}</TCell>
    <TCell>"{row.pitch_title}"</TCell>
    <TCell><div className="max-w-[200px] truncate text-zinc-400">{row.pitch_description}</div></TCell>
    <TCell className="font-mono text-xs tabular-nums">{row.check_in ? new Date(row.check_in).toLocaleString() : "-"}</TCell>
  </tr>
);

/* -------------------------------------------------------------------------- */
/*                              MAIN DASHBOARD                                */
/* -------------------------------------------------------------------------- */

export default function AdminDashboard() {
  const router = useRouter();
  const [activeView, setActiveView] = useState("dashboard");
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Data
  const [stats, setStats] = useState({ users: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [latestActivity, setLatestActivity] = useState([]);
  const [filteredActivity, setFilteredActivity] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [faceApprovalUsers, setFaceApprovalUsers] = useState([]);

  // Views
  const [viewData, setViewData] = useState([]);
  const [viewLoading, setViewLoading] = useState(false);

  // Filters
  const [searchFilter, setSearchFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [userSearchFilter, setUserSearchFilter] = useState("");
  
  // Charts
  const [donutData, setDonutData] = useState({ labels: [], datasets: [] });
  const [barChartData, setBarChartData] = useState({ labels: [], datasets: [] });

  // Modals
  const [enlargedImageUrl, setEnlargedImageUrl] = useState(null);
  const [userToReject, setUserToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const pendingFacesRef = useRef(null);
  // --- Data Logic (Identical to previous versions) ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    if (typeof window !== "undefined") window.addEventListener("scroll", handleScroll);

    const fetchDashboardData = async () => {
      setLoading(true);
      const { count: userCount, data: usersData } = await supabase.from("users").select("*", { count: "exact" });
      const { data: approvalData } = await supabase.from("users").select("name, user_id, face_image_status, face_image_url").eq("face_image_status", "pending");
      
      if (approvalData) {
        setFaceApprovalUsers(approvalData.filter(u => u.face_image_url).map(u => ({...u, face_image_url: `${u.face_image_url}?t=${Date.now()}`})));
      }

      const { data: recentData } = await supabase.from("recent").select("*").order("id", { ascending: false });
      
      const tableMap = { visit: "visitlogs", pitch: "business_pitch", interview: "interview", tech: "tech_event" };
      const allActivity = recentData || [];
      const detailedActivity = await Promise.all(allActivity.map(async (activity) => {
        const table = tableMap[activity.purpose];
        if (!table) return { ...activity, details: null };
        const identifier = activity.email || activity.phone;
        if (!identifier) return { ...activity, details: null };
        const { data: details } = await supabase.from(table).select("*").eq("user_id", identifier).eq("created_at", activity.created_at).single();
        return { ...activity, details };
      }));

      const latestMap = new Map();
      for (const item of detailedActivity) {
        const key = item.email || item.phone;
        if (key && !latestMap.has(key)) latestMap.set(key, item);
      }
      const latest = Array.from(latestMap.values());
      
      setLatestActivity(latest);
      setFilteredActivity(latest.filter((i) => i.status === statusFilter));

      const statusCounts = latest.reduce((acc, item) => {
        if (item.status) acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {});
      
      setDonutData({
        labels: Object.keys(statusCounts),
        datasets: [{
            data: Object.values(statusCounts),
            backgroundColor: ["#f59e0b", "#10b981", "#3b82f6", "#a1a1aa"],
            borderWidth: 0,
            hoverOffset: 5
        }],
      });

      // --- Prepare Line Chart Data (Last 7 days) ---
      const today = new Date();
      const last7DaysLabels = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - (6 - i));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });

      const dailyCounts = last7DaysLabels.reduce((acc, label) => {
        acc[label] = 0;
        return acc;
      }, {});

      detailedActivity.forEach(activity => {
        if (activity.status === 'Checked In' && activity.check_in) {
          const checkInDate = new Date(activity.check_in);
          const label = checkInDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (dailyCounts.hasOwnProperty(label)) {
            dailyCounts[label]++;
          }
        }
      });

      setBarChartData({
        labels: last7DaysLabels,
        datasets: [{
          label: 'Active Users',
          data: Object.values(dailyCounts),
          backgroundColor: '#552483',
          borderRadius: 2,
        }],
      });

      setStats({ users: userCount || 0 });
      setAllUsers(usersData || []);
      setRecentActivity(detailedActivity);
      setLoading(false);
    };

    fetchDashboardData();
    return () => typeof window !== "undefined" && window.removeEventListener("scroll", handleScroll);
  }, []);

  // This effect now correctly depends on `statusFilter` and `latestActivity`.
  // It will re-run only when the filter or the source data changes.
  useEffect(() => {
    setFilteredActivity(latestActivity.filter((i) => i.status === statusFilter));
  }, [statusFilter, latestActivity]); // Added statusFilter to the dependency array

  useEffect(() => {
    const fetchViewData = async () => {
      if (activeView === "dashboard") return;
      setViewLoading(true);
      let tableName = "";
      if (activeView === "visits") tableName = "visitlogs";
      else if (activeView === "tech") tableName = "tech_event";
      else if (activeView === "interviews") tableName = "interview";
      else if (activeView === "pitches") tableName = "business_pitch";

      if (tableName) {
        const { data } = await supabase.from(tableName).select("*").order("created_at", { ascending: false });
        setViewData(data || []);
      }
      setViewLoading(false);
    };
    fetchViewData();
  }, [activeView]);

  const filteredDisplayActivity = useMemo(() => {
    let filtered = recentActivity;
    if (dateFilter) filtered = filtered.filter((item) => item.created_at && new Date(item.created_at).toLocaleDateString("en-CA") === dateFilter);
    if (searchFilter) filtered = filtered.filter((item) => (item.email || item.phone || '').toLowerCase().includes(searchFilter.toLowerCase()));
    return filtered;
  }, [recentActivity, dateFilter, searchFilter]);

  const filteredUsers = useMemo(() => {
    if (!userSearchFilter) return allUsers;
    const term = userSearchFilter.toLowerCase();
    return allUsers.filter((user) => user.name?.toLowerCase().includes(term) || user.user_id?.toLowerCase().includes(term));
  }, [allUsers, userSearchFilter]);

  const handleApproveFace = async (user) => {
    if (!user.face_image_url) return;
    await supabase.from("users").update({ face_image_status: "approved" }).eq("user_id", user.user_id);
    setFaceApprovalUsers((prev) => prev.filter((u) => u.user_id !== user.user_id));
  };
  const submitRejection = async () => {
    if (!userToReject) return;
    await supabase.from("users").update({ face_image_status: "rejected", admin_say: rejectionReason || "No reason provided." }).eq("user_id", userToReject.user_id);
    setFaceApprovalUsers((prev) => prev.filter((u) => u.user_id !== userToReject.user_id));
    setUserToReject(null);
    setRejectionReason("");
  };
  const handleLogout = useCallback(() => {
    if (typeof window !== "undefined") localStorage.removeItem("admin_session");
    router.push("/adminlogin");
  }, [router]);

  useEffect(() => {
    let inactivityTimer;
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(handleLogout, 5 * 60 * 1000); // 5 minutes
    };
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer(); // Initial call

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [handleLogout]);

  const scrollToPendingFaces = () => {
    if (pendingFacesRef.current) {
      pendingFacesRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                              RENDER CONTENT                              */
  /* -------------------------------------------------------------------------- */

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Overview Cards */}
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Database" value={loading ? "..." : stats.users} chip="All Users" icon={Icons.Users} />
        <StatCard title="Pending Check-In" value={loading ? "..." : latestActivity.filter((i) => i.status === "Pending").length} chip="Today" icon={Icons.Clock} />
        <BarChartCard title="Active Users (7 Days)" data={barChartData} icon={Icons.Chart} />
      </section>

      {/* Main Grid */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Left Col */}
        <div className="space-y-6">
          
          {/* Chart Widget */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 flex flex-col h-[315px]">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Traffic Composition</h3>
            <div className="relative h-48 w-full flex items-center justify-center">
                <Doughnut data={donutData} options={{ cutout: "75%", plugins: { legend: { display: false } } }} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-[#552483]">{latestActivity.length}</span>
                    <span className="text-[10px] uppercase text-zinc-400 font-bold">Total</span>
                </div>
            </div>
            <div className="mt-4 flex justify-center gap-3 flex-wrap">
                {donutData.labels.map((label, i) => (
                    <div key={label} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: donutData.datasets[0].backgroundColor[i] }}></span>
                        <span className="text-[10px] text-zinc-500 font-medium">{label}</span>
                    </div>
                ))}
            </div>
          </div>

          {/* Mini List Widget */}
          <div className="bg-white border border-zinc-200 rounded-xl p-4 md:p-5 flex flex-col h-auto max-h-[380px] lg:h-[500px]">
             <div className="mb-4 flex flex-col gap-2">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Live Feed</h3>
                <div className="flex gap-2">
                  {["Pending", "Checked In", "Checked Out"].map((status) => (
                    <FilterTab key={status} label={status} active={statusFilter === status} onClick={() => setStatusFilter(status)} />
                  ))}
                </div>
             </div>
             <div className="flex-1 overflow-y-auto space-y-2 pr-1">
               {filteredActivity.length > 0 ? filteredActivity.map((item) => (
                 <div key={item.id} className="flex items-center justify-between p-3 rounded border border-zinc-100 bg-zinc-50">
                    <div>
                        <p className="text-xs font-bold text-[#552483] truncate max-w-[150px]">{item.name}</p>
                        <p className="text-[10px] text-zinc-500 truncate max-w-[150px]">{item.email || item.phone}</p>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase bg-white px-2 py-0.5 rounded border border-zinc-200">{item.purpose}</span>
                 </div>
               )) : <div className="text-center py-8 text-xs text-zinc-400">No data available</div>}
             </div>
          </div>
        </div>

        {/* Right Col: Main Table */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl flex flex-col overflow-hidden max-h-[720px]">
           <div className="p-5 border-b border-zinc-100 flex flex-wrap justify-between items-center gap-3">
              <div>
                  <h2 className="text-sm font-bold text-[#552483] uppercase tracking-wide">Activity Logs</h2>
                  <p className="text-xs text-zinc-500">Real-time visitor tracking</p>
              </div>
              <div className="flex gap-2">
                  <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-zinc-400 pointer-events-none"><Icons.Search /></div>
                      <input type="text" placeholder="Search by email or phone..." value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)} className="pl-8 pr-3 py-1.5 text-xs text-zinc-900 bg-zinc-50 border border-zinc-200 rounded focus:border-zinc-400 outline-none w-48 transition-colors" />
                  </div>
                  <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="px-2 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded focus:border-zinc-400 outline-none transition-colors text-zinc-600" />
              </div>
           </div>
           <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-zinc-50">
             <table className="w-full text-left">
               <thead className="sticky top-0 bg-white z-10 shadow-sm">
                 <tr>
                    <THead>Identity</THead>
                    <THead>Type</THead>
                    <THead>Status</THead>
                    <THead>In</THead>
                    <THead>Out</THead>
                 </tr>
               </thead>
               <tbody>
                 {filteredDisplayActivity.map((item) => (
                   <tr key={`${item.id}-${item.created_at}`} className="hover:bg-zinc-50 transition-colors">
                      <TCell>
                          <div>
                              <p className="text-xs font-semibold text-[#552483]">{item.name}</p>
                              <p className="text-[10px] text-zinc-500">{item.email || item.phone}</p>
                          </div>
                      </TCell>
                      <TCell><span className="text-[10px] font-bold uppercase text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">{item.purpose}</span></TCell>
                      <TCell><StatusBadge status={item.status} /></TCell>
                      <TCell className="font-mono text-xs tabular-nums text-zinc-500 whitespace-nowrap">{item.check_in ? new Date(item.check_in).toLocaleString() : "—"}</TCell>
                      <TCell className="font-mono text-xs tabular-nums text-zinc-500 whitespace-nowrap">{item.check_out ? new Date(item.check_out).toLocaleString() : "—"}</TCell>
                   </tr>
                 ))}
                 {!filteredDisplayActivity.length && <tr><td colSpan={5} className="p-8 text-center text-xs text-zinc-400">No records found.</td></tr>}
               </tbody>
             </table>
           </div>
        </div>
      </section>

      {/* Approvals & Users Row */}
      <section className="grid gap-6 lg:grid-cols-3">
          <div ref={pendingFacesRef} className="bg-white border border-zinc-200 rounded-xl p-5 flex flex-col h-[400px] scroll-mt-24">
             <div className="flex justify-between items-center mb-4 border-b border-zinc-100 pb-2">
                 <h3 className="text-xs font-bold text-[#552483] uppercase tracking-widest">Pending Faces</h3>
                 <span className="bg-[#552483] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{faceApprovalUsers.length}</span>
             </div>
             <div className="overflow-y-auto flex-1 space-y-3 pr-1">
               {faceApprovalUsers.length > 0 ? (
                 faceApprovalUsers.map((user) => (
                   <div
                     key={user.user_id}
                     className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 hover:bg-zinc-100 transition"
                   >
                     <div className="flex items-center space-x-3">
                       <Image
                         src={user.face_image_url}
                         alt="face"
                         width={40}
                         height={40}
                         className="w-10 h-10 rounded-md object-cover cursor-pointer"
                         onClick={() => setEnlargedImageUrl(user.face_image_url)}
                       />
           
                       <div className="flex flex-col">
                         <p className="font-semibold text-sm text-[#552483]">{user.name}</p>
                         <p className="text-xs text-zinc-500">{user.user_id}</p>
                       </div>
                     </div>
                     <div className="flex justify-end space-x-2 mt-3">
                       <button onClick={() => setUserToReject(user)} className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-md">Reject</button>
                       <button onClick={() => handleApproveFace(user)} className="bg-[#552483] text-white text-xs font-bold px-3 py-1 rounded-md">Approve</button>
                     </div>
                   </div>
                 ))
               ) : (
                 <p className="py-12 text-center text-xs text-zinc-400 italic">No actions required.</p>
               )}
             </div>
          </div>

          <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl flex flex-col h-[400px]">
             <div className="p-5 border-b border-zinc-100 flex justify-between items-center">
                 <h3 className="text-xs font-bold text-[#552483] uppercase tracking-widest">User Database</h3>
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-zinc-400 pointer-events-none"><Icons.Search /></div>
                    <input type="text" placeholder="Search by name, email or phone..." value={userSearchFilter} onChange={(e) => setUserSearchFilter(e.target.value)} className="pl-8 pr-3 py-1.5 text-xs text-zinc-900 bg-zinc-50 border border-zinc-200 rounded focus:border-zinc-400 outline-none w-48 transition-colors" />
                 </div>
             </div>
             <div className="flex-1 overflow-y-auto">
                 <table className="w-full text-left">
                     <thead className="sticky top-0 bg-white z-10 shadow-sm">
                         <tr>
                             <THead>Name</THead>
                             <THead>Email / Phone</THead>
                             <THead>Company</THead>
                             <THead>Joined</THead>
                         </tr>
                     </thead>
                     <tbody>
                         {filteredUsers.map(u => (
                             <tr key={u.id} className="hover:bg-zinc-50 transition-colors">
                                 <TCell><span className="font-medium text-[#552483]">{u.name}</span></TCell>
                                 <TCell>{u.user_id}</TCell>
                                 <TCell>{u.company || "—"}</TCell>
                                 <TCell className="font-mono text-xs tabular-nums text-zinc-500">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"}</TCell>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
          </div>
      </section>
    </div>
  );

  const renderTableView = (title, columns) => (
    <div className="bg-white border border-zinc-200 rounded-xl flex flex-col h-full animate-in fade-in duration-300">
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/30">
            <div>
                <h2 className="text-lg font-bold text-[#552483] tracking-tight">{title}</h2>
                <p className="text-xs text-zinc-500">Full database view</p>
            </div>
            <button onClick={() => setActiveView("dashboard")} className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-600 text-xs font-bold uppercase rounded hover:bg-zinc-50 transition-colors">
                <Icons.ArrowLeft /> Back
            </button>
        </div>
        {viewLoading ? (
            <div className="flex-1 flex items-center justify-center p-12">
                <div className="w-6 h-6 border-2 border-[#552483] border-t-transparent rounded-full animate-spin"></div>
            </div>
        ) : (
            <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr>{columns.map((col, i) => <THead key={i}>{col}</THead>)}</tr>
                    </thead>
                    <tbody>
                        {viewData.length > 0 ? viewData.map(row => {
                            if (activeView === "visits") return <VisitLogRow key={row.id} row={row} />;
                            if (activeView === "tech") return <TechEventRow key={row.id} row={row} />;
                            if (activeView === "interviews") return <InterviewRow key={row.id} row={row} />;
                            if (activeView === "pitches") return <PitchRow key={row.id} row={row} />;
                            return null;
                        }) : <tr><td colSpan={columns.length} className="p-12 text-center text-xs text-zinc-400">No records.</td></tr>}
                    </tbody>
                </table>
            </div>
        )}
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 font-sans selection:bg-zinc-900 selection:text-white">

      {/* Background Pattern */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      {/* --- MODALS --- */}
      {enlargedImageUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm" onClick={() => setEnlargedImageUrl(null)}>
           <div className="relative max-w-2xl w-full bg-white rounded-lg p-2" onClick={e => e.stopPropagation()}>
               <div className="relative aspect-square w-full bg-zinc-100 rounded overflow-hidden">
                   <Image src={enlargedImageUrl} alt="Enlarged" fill className="object-contain" />
               </div>
               <button onClick={() => setEnlargedImageUrl(null)} className="absolute -top-10 right-0 text-white font-bold">CLOSE</button>
           </div>
        </div>
      )}

      {userToReject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white text-black rounded-xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-[#552483]">Reject Image</h3>
            <p className="text-xs text-zinc-500 mt-1 mb-4">Provide a reason for the user.</p>
            <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={3} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded text-sm outline-none focus:border-zinc-400" placeholder="e.g. Image blurry..." />
            <div className="mt-4 flex text-black justify-end gap-3">
              <button onClick={() => setUserToReject(null)} className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-900">CANCEL</button>
              <button onClick={submitRejection} className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700">CONFIRM REJECT</button>
            </div>
          </div>
        </div>
      )}

      {/* --- NAVBAR --- */}
      <nav className={`fixed inset-x-0 top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200 transition-all ${scrolled ? 'py-2 shadow-sm' : 'py-3'}`}>
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6">
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
           <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1 bg-zinc-50 border border-zinc-100 rounded-full">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">System Active</span>
              </div>
              <button onClick={handleLogout} className="text-xs font-bold text-zinc-500 hover:text-red-600 transition-colors uppercase flex items-center gap-2">
                  <Icons.Logout /> Logout
              </button>
           </div>
           <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-[#552483]"><div className="w-6 h-0.5 bg-current mb-1"></div><div className="w-6 h-0.5 bg-current mb-1"></div><div className="w-6 h-0.5 bg-current"></div></button>
        </div>
      </nav>

      {/* --- LAYOUT --- */}
      <div className="mx-auto flex max-w-[1600px] pt-20 px-4 sm:px-6 pb-10 gap-8 relative z-10">
        
        {/* SIDEBAR (Light, clean) */}
        <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-zinc-200 p-6 transform transition-transform duration-300 md:relative md:translate-x-0 md:bg-transparent md:border-none md:p-0 md:w-56 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
           <div className="sticky top-24">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4 pl-4">Menu</p>
              <div className="space-y-1">
                 <SideNavButton active={activeView === "dashboard"} icon={Icons.Dashboard} label="Dashboard" onClick={() => {setActiveView("dashboard"); setIsMenuOpen(false);}} />
                 <SideNavButton active={activeView === "visits"} icon={Icons.Door} label="Visit Logs" onClick={() => {setActiveView("visits"); setIsMenuOpen(false);}} />
                 <SideNavButton active={activeView === "tech"} icon={Icons.Tech} label="Tech Events" onClick={() => {setActiveView("tech"); setIsMenuOpen(false);}} />
                 <SideNavButton active={activeView === "interviews"} icon={Icons.Mic} label="Interviews" onClick={() => {setActiveView("interviews"); setIsMenuOpen(false);}} />
                 <SideNavButton active={activeView === "pitches"} icon={Icons.Chart} label="Pitch Decks" onClick={() => {setActiveView("pitches"); setIsMenuOpen(false);}} />
              </div>
              
              <div className="relative mt-8 p-4 bg-purple-100 rounded-xl border border-purple-200">
                 <p className="text-xs font-bold mb-1 text-purple-900">Admin Note</p>
                 {faceApprovalUsers.length > 0 ? (
                   <>
                     <p className="text-[10px] leading-relaxed text-red-700">
                       You have <span className="font-bold">{faceApprovalUsers.length}</span> pending face approval
                       {faceApprovalUsers.length > 1 ? 's' : ''} to review.
                     </p>
                     <button onClick={scrollToPendingFaces} className="absolute -right-2 -bottom-2 flex items-center justify-center w-7 h-7 text-white rounded-full shadow-lg bg-red-500 animate-bounce hover:animate-none" aria-label="Go to pending approvals">
                       <Icons.ArrowDown />
                     </button>
                   </>
                 ) : (
                   <p className="text-[10px] leading-relaxed text-emerald-700">All face approvals are cleared. Great job!</p>
                 )}
              </div>
           </div>
        </aside>

        {/* MAIN AREA */}
        <main className="flex-1 min-w-0">
           {activeView === "dashboard" && renderDashboard()}
           {activeView === "visits" && renderTableView("Visit Logs", ["User", "Company", "Visitor", "Visitor Email", "Purpose", "Check In", "Check Out"])}
           {activeView === "tech" && renderTableView("Tech Events", ["User", "Event", "Role", "Time", "Check In"])}
           {activeView === "interviews" && renderTableView("Interviews", ["User", "Company", "Position", "Time", "Check In"])}
           {activeView === "pitches" && renderTableView("Business Pitches", ["User", "Company", "Title", "Description", "Check In"])}
        </main>
      </div>
    </div>
  );
}