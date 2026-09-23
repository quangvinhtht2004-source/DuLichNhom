"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Bell,
  ChevronDown,
  Calendar,
  CheckCircle2,
  DollarSign,
  Grid,
  List,
  MoreVertical,
  MapPin,
  Check,
  X,
  Vote,
  Compass,
  LogOut,
  User,
  Image as ImageIcon,
  Upload,
  Sparkles,
  ArrowRight,
  Code,
  Play,
  RotateCcw,
  ExternalLink,
} from "lucide-react";

interface TripItem {
  id: string;
  title: string;
  role: "Trưởng nhóm" | "Thành viên";
  badgeDays: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  location: string;
  members: { initials: string; bg: string }[];
  extraMembers: number;
  progress: number;
}

export default function TripDashboard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // User State
  const [userName, setUserName] = useState<string>("Hoàng Nam");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  // Tabs & Views
  const [activeFilterTab, setActiveFilterTab] = useState<"upcoming" | "completed" | "invites">("upcoming");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Trips List State
  const [trips, setTrips] = useState<TripItem[]>([
    {
      id: "trip-1",
      title: "Oanh tạc Đà Lạt 3N2Đ cùng Hội bạn thân",
      role: "Trưởng nhóm",
      badgeDays: "Còn 3 ngày nữa",
      coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop",
      startDate: "15/10/2026",
      endDate: "18/10/2026",
      location: "Đà Lạt, Lâm Đồng",
      members: [
        { initials: "HN", bg: "bg-indigo-600" },
        { initials: "MA", bg: "bg-purple-600" },
        { initials: "TK", bg: "bg-rose-600" },
        { initials: "LP", bg: "bg-pink-600" },
      ],
      extraMembers: 2,
      progress: 70,
    },
    {
      id: "trip-2",
      title: "Vitamin Sea Phú Quốc Resort & Sunset Chill",
      role: "Thành viên",
      badgeDays: "Còn 18 ngày nữa",
      coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",
      startDate: "02/11/2026",
      endDate: "05/11/2026",
      location: "Phú Quốc, Kiên Giang",
      members: [
        { initials: "QT", bg: "bg-teal-600" },
        { initials: "HN", bg: "bg-indigo-600" },
        { initials: "VT", bg: "bg-orange-600" },
      ],
      extraMembers: 4,
      progress: 45,
    },
  ]);

  // Invitation State
  const [hasInvite, setHasInvite] = useState<boolean>(true);

  // Voting State
  const [votes, setVotes] = useState<{ option1: number; option2: number; voted: string | null }>({
    option1: 3,
    option2: 2,
    voted: null,
  });
  const [showVoteModal, setShowVoteModal] = useState<boolean>(false);

  // Edit Cover Image Modal
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [newCoverUrl, setNewCoverUrl] = useState<string>("");
  const [customImageUrl, setCustomImageUrl] = useState<string>("");

  // Create Trip Modal
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTripTitle, setNewTripTitle] = useState("");
  const [newTripLocation, setNewTripLocation] = useState("");
  const [newTripStartDate, setNewTripStartDate] = useState("20/12/2026");
  const [newTripEndDate, setNewTripEndDate] = useState("24/12/2026");
  const [newTripCover, setNewTripCover] = useState(
    "https://images.unsplash.com/photo-1511497584788-87676104235f?q=80&w=800&auto=format&fit=crop"
  );

  // API Tester Drawer State (Full 9 APIs testing on UI)
  const [showApiTester, setShowApiTester] = useState<boolean>(false);
  const [apiTestingLoading, setApiTestingLoading] = useState<boolean>(false);
  const [apiResult, setApiResult] = useState<{
    endpoint: string;
    method: string;
    status: number;
    data: any;
    time: string;
  } | null>(null);

  // Load User Profile from Supabase on Mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/profile");
        if (res.ok) {
          const json = await res.json();
          if (json?.profile?.full_name) {
            setUserName(json.profile.full_name);
          }
          if (json?.profile?.avatar_url) {
            setUserAvatar(json.profile.avatar_url);
          }
        }
      } catch {
        // Fallback to default
      }
    };
    fetchProfile();
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/");
      router.refresh();
    }
  };

  // Open Edit Cover Modal
  const openEditCoverModal = (tripId: string) => {
    setEditingTripId(tripId);
    const trip = trips.find((t) => t.id === tripId);
    if (trip) {
      setNewCoverUrl(trip.coverImage);
      setCustomImageUrl("");
    }
  };

  // Handle Change Trip Cover Image
  const handleSaveCoverImage = (url: string) => {
    if (!editingTripId) return;
    setTrips(
      trips.map((t) => (t.id === editingTripId ? { ...t, coverImage: url } : t))
    );
    setEditingTripId(null);
  };

  // Handle Upload Image from Computer
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          handleSaveCoverImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Create Trip
  const handleCreateTripSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTripTitle) return;
    const newTrip: TripItem = {
      id: `trip-${Date.now()}`,
      title: newTripTitle,
      role: "Trưởng nhóm",
      badgeDays: "Mới tạo",
      coverImage: newTripCover,
      startDate: newTripStartDate,
      endDate: newTripEndDate,
      location: newTripLocation || "Việt Nam",
      members: [
        { initials: userName.slice(0, 2).toUpperCase(), bg: "bg-indigo-600" },
      ],
      extraMembers: 0,
      progress: 10,
    };
    setTrips([newTrip, ...trips]);
    setShowCreateModal(false);
    setNewTripTitle("");
    setNewTripLocation("");
  };

  // Preset Cover Photos for Quick Selection
  const presetPhotos = [
    {
      name: "Đà Lạt Sương Mù",
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop",
    },
    {
      name: "Biển Phú Quốc",
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",
    },
    {
      name: "Vịnh Hạ Long",
      url: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800&auto=format&fit=crop",
    },
    {
      name: "Ruộng Bậc Thang Sa Pa",
      url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop",
    },
    {
      name: "Huy hiệu Leo Núi",
      url: "/images/auth/badge-1.jpg",
    },
    {
      name: "Huy hiệu Biển Nhiệt Đới",
      url: "/images/auth/badge-2.jpg",
    },
  ];

  // API Execution Runner for the Tester Console
  const executeApiTest = async (
    endpoint: string,
    method: "GET" | "POST" | "PATCH",
    body?: any
  ) => {
    setApiTestingLoading(true);
    try {
      const options: RequestInit = {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      };
      const res = await fetch(endpoint, options);
      let data: any;
      try {
        data = await res.json();
      } catch {
        data = { message: "Không có JSON trả về" };
      }
      setApiResult({
        endpoint,
        method,
        status: res.status,
        data,
        time: new Date().toLocaleTimeString(),
      });
      // If profile updated, refresh userName
      if (endpoint === "/api/auth/profile" && method === "GET" && data?.profile?.full_name) {
        setUserName(data.profile.full_name);
      }
    } catch (err: any) {
      setApiResult({
        endpoint,
        method,
        status: 500,
        data: { error: err.message || "Lỗi kết nối" },
        time: new Date().toLocaleTimeString(),
      });
    } finally {
      setApiTestingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans pb-16 selection:bg-indigo-500 selection:text-white">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Search */}
          <div className="flex items-center gap-6 flex-1">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[2px] shadow-sm">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 font-extrabold text-[11px] tracking-tight">
                    Trippo
                  </span>
                </div>
              </div>
              <span className="text-base font-extrabold tracking-tight text-slate-900">
                Trippo
              </span>
            </Link>

            {/* Search Bar */}
            <div className="relative max-w-xs w-full hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm chuyến đi, địa điểm..."
                className="w-full bg-slate-100/80 border-none rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <Link href="/dashboard" className="text-indigo-600 font-bold">
              Chuyến đi của tôi
            </Link>
            <a href="#khampha" className="hover:text-slate-900 transition-colors">
              Khám phá địa điểm
            </a>
            <a href="#lichtrinh" className="hover:text-slate-900 transition-colors">
              Lịch trình
            </a>
            <a href="#chiphi" className="hover:text-slate-900 transition-colors">
              Chi phí
            </a>
          </nav>

          {/* Actions: + Tạo chuyến đi & User */}
          <div className="flex items-center gap-3">
            {/* Create Trip Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5235ab] hover:bg-[#432994] text-white text-xs font-semibold shadow-md shadow-indigo-900/10 transition-all active:scale-[0.99] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo chuyến đi mới</span>
            </button>

            {/* Notification Bell */}
            <button className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
              >
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    {userName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-bold text-slate-800 hidden sm:inline">
                  {userName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs animate-fadeIn">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900">{userName}</p>
                    <p className="text-slate-400 text-[11px]">Đang đăng nhập</p>
                  </div>
                  <Link
                    href="/profile"
                    className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-700 font-medium"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Hồ sơ cá nhân</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-rose-50 text-rose-600 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* 2. WELCOME BANNER & 3 METRIC CARDS */}
        <div className="bg-gradient-to-r from-[#f4f3ff] via-[#f7f6fe] to-[#fbfaff] rounded-3xl p-6 sm:p-8 border border-purple-100/70 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Welcome Text Left */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700 tracking-wide mb-2.5">
              <Compass className="w-3 h-3" />
              <span>TRANG TỔNG QUAN DU LỊCH</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Xin chào, {userName}! 🎒
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg">
              Sẵn sàng cho chuyến phiêu lưu tiếp theo cùng hội cạ cứng chưa? Mọi lịch trình đã được đồng bộ hóa.
            </p>
          </div>

          {/* 3 Metric Cards Right */}
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            {/* Metric 1: Upcoming Trips */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm flex items-center gap-3.5 flex-1 sm:flex-none sm:min-w-[150px]">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-extrabold text-slate-900 block leading-tight">
                  {trips.length}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Chuyến đi sắp tới
                </span>
              </div>
            </div>

            {/* Metric 2: Completed */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm flex items-center gap-3.5 flex-1 sm:flex-none sm:min-w-[150px]">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-extrabold text-slate-900 block leading-tight">
                  5
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Đã hoàn thành
                </span>
              </div>
            </div>

            {/* Metric 3: Expense Alert */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm flex-1 sm:flex-none sm:min-w-[170px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500 font-medium">
                  Cần thanh toán
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600">
                  Cần trả sớm
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-extrabold text-rose-600 block leading-tight mt-1">
                150.000đ
              </span>
            </div>
          </div>
        </div>

        {/* 3. TABS BAR & SORT / VIEW CONTROLS */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          {/* Filter Tabs Left */}
          <div className="flex items-center gap-6 border-b sm:border-b-0 border-slate-200 pb-2 sm:pb-0 w-full sm:w-auto text-sm">
            <button
              onClick={() => setActiveFilterTab("upcoming")}
              className={`flex items-center gap-2 pb-1 font-bold transition-all relative ${
                activeFilterTab === "upcoming"
                  ? "text-indigo-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-indigo-600"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>Sắp tới</span>
              <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 text-xs flex items-center justify-center">
                {trips.length}
              </span>
            </button>

            <button
              onClick={() => setActiveFilterTab("completed")}
              className={`flex items-center gap-2 pb-1 font-semibold transition-all relative ${
                activeFilterTab === "completed"
                  ? "text-indigo-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-indigo-600"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>Đã đi</span>
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-xs flex items-center justify-center">
                5
              </span>
            </button>

            <button
              onClick={() => setActiveFilterTab("invites")}
              className={`flex items-center gap-2 pb-1 font-semibold transition-all relative ${
                activeFilterTab === "invites"
                  ? "text-indigo-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-indigo-600"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>Lời mời tham gia</span>
              {hasInvite && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
              )}
            </button>
          </div>

          {/* Sort & View Controls Right */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="relative">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm">
                <span>⇅ Sắp xếp: Gần nhất</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            <div className="flex items-center p-1 rounded-xl bg-slate-100">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 4. MAIN TRIP GRID (TRIP CARDS + INVITATION) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {/* TRIP CARD 1: ĐÀ LẠT */}
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Cover Image Container */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={trip.coverImage}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25" />

                  {/* Top Left: Badge Days */}
                  <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-sm">
                    <Calendar className="w-3 h-3" />
                    <span>{trip.badgeDays}</span>
                  </div>

                  {/* Top Right: Edit Cover Image Button (Requirement: có thể chỉnh sửa được ảnh) */}
                  <button
                    onClick={() => openEditCoverModal(trip.id)}
                    title="Chỉnh sửa ảnh bìa chuyến đi"
                    className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-md transition-all cursor-pointer"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {/* Card Content */}
                <div className="p-5">
                  {/* Role Badge */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      trip.role === "Trưởng nhóm"
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                        : "bg-sky-50 text-sky-700 border border-sky-100"
                    }`}
                  >
                    {trip.role === "Trưởng nhóm" ? "🎯 Trưởng nhóm" : "👥 Thành viên"}
                  </span>

                  {/* Trip Title */}
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-2 line-clamp-2 leading-snug">
                    {trip.title}
                  </h3>

                  {/* Date & Location */}
                  <div className="mt-2.5 space-y-1 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{trip.startDate} - {trip.endDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{trip.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Member Avatars & Progress */}
              <div className="p-5 pt-0 border-t border-slate-100 mt-2">
                <div className="flex items-center justify-between pt-3">
                  {/* Member avatars */}
                  <div className="flex items-center -space-x-1.5">
                    {trip.members.map((m, idx) => (
                      <div
                        key={idx}
                        className={`w-7 h-7 rounded-full ${m.bg} text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-sm`}
                      >
                        {m.initials}
                      </div>
                    ))}
                    {trip.extraMembers > 0 && (
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-sm">
                        +{trip.extraMembers}
                      </div>
                    )}
                  </div>

                  {/* Progress % */}
                  <span className="text-xs font-bold text-indigo-600">
                    {trip.progress}% hoàn thiện
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#4f46e5] to-[#db2777] rounded-full transition-all duration-500"
                    style={{ width: `${trip.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* INVITATION CARD (Lời mời mới - Hạ Long) */}
          {hasInvite && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between relative">
              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    Lời mời mới
                  </span>
                  <span className="text-[11px] text-slate-400">2 giờ trước</span>
                </div>

                {/* Invite Title */}
                <h3 className="text-base font-bold text-slate-900 mt-3 leading-snug">
                  Hạ Long Bay Cruise & Kayaking 2N1Đ
                </h3>

                {/* Sender Info */}
                <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
                    MA
                  </div>
                  <p className="text-xs text-slate-600 leading-tight">
                    <span className="font-bold text-slate-900">Minh Anh</span> vừa gửi lời mời bạn cùng tham gia chuyến đi này.
                  </p>
                </div>

                {/* Date & Location */}
                <div className="mt-3.5 space-y-1.5 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>28/11/2026 - 29/11/2026</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Vịnh Hạ Long, Quảng Ninh</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Chấp nhận & Từ chối */}
              <div className="flex items-center gap-2 pt-5 mt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    // Accept invitation
                    const acceptedTrip: TripItem = {
                      id: "trip-3",
                      title: "Hạ Long Bay Cruise & Kayaking 2N1Đ",
                      role: "Thành viên",
                      badgeDays: "Còn 30 ngày nữa",
                      coverImage: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800&auto=format&fit=crop",
                      startDate: "28/11/2026",
                      endDate: "29/11/2026",
                      location: "Vịnh Hạ Long, Quảng Ninh",
                      members: [
                        { initials: "MA", bg: "bg-purple-600" },
                        { initials: "HN", bg: "bg-indigo-600" },
                      ],
                      extraMembers: 1,
                      progress: 30,
                    };
                    setTrips([...trips, acceptedTrip]);
                    setHasInvite(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#4338ca] hover:bg-[#3730a3] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Chấp nhận</span>
                </button>
                <button
                  onClick={() => setHasInvite(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-all cursor-pointer"
                >
                  Từ chối
                </button>
              </div>
            </div>
          )}

          {/* CREATE TRIP CARD (Lên kế hoạch cho chuyến đi mới) */}
          <div
            onClick={() => setShowCreateModal(true)}
            className="rounded-3xl border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-white/60 hover:bg-white p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer min-h-[300px] group shadow-sm"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6366f1] via-[#8b5cf6] to-[#ec4899] text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform duration-300">
              <Plus className="w-7 h-7" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mt-4">
              Lên kế hoạch cho chuyến đi mới
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 max-w-xs leading-relaxed">
              Tạo lịch trình nhóm thông minh, phân chia chi phí minh bạch và bình chọn điểm check-in hấp dẫn.
            </p>

            <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 mt-4 group-hover:translate-x-1 transition-transform">
              <span>Bắt đầu ngay hôm nay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* 5. VOTING SURVEY BANNER AT BOTTOM */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                Khảo sát ý kiến nhóm đang mở
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Đà Lạt: Chọn điểm ngắm hoàng hôn (Tiệm cà phê Hoàng Hôn hay Đồi Robin?)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                {votes.option1}
              </span>
              <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center">
                {votes.option2}
              </span>
            </div>

            <button
              onClick={() => setShowVoteModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
            >
              Bình chọn ngay
            </button>
          </div>
        </div>
      </main>

      {/* 6. MODAL CHỈNH SỬA ẢNH BÌA CHUYẾN ĐI (REQUIREMENT: CÁC HÌNH ẢNH CÓ THỂ CHỈNH SỬA ĐƯỢC) */}
      {editingTripId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Chỉnh sửa ảnh bìa chuyến đi
                </h3>
              </div>
              <button
                onClick={() => setEditingTripId(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Option 1: Upload from Computer */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  1. Tải ảnh từ máy tính của bạn
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Bấm vào đây để chọn file ảnh từ máy</span>
                </button>
              </div>

              {/* Option 2: Quick Pick from Gallery */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  2. Hoặc chọn nhanh từ bộ sưu tập du lịch
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {presetPhotos.map((photo, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSaveCoverImage(photo.url)}
                      className="group relative h-20 rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-indigo-600 transition-all shadow-sm"
                    >
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                        <span className="text-[10px] text-white font-medium leading-tight line-clamp-1">
                          {photo.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Option 3: Custom URL */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  3. Hoặc nhập đường dẫn link ảnh (URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    className="flex-1 text-xs rounded-xl px-3.5 py-2.5 bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customImageUrl) handleSaveCoverImage(customImageUrl);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL TẠO CHUYẾN ĐI MỚI */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Tạo chuyến đi du lịch mới
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTripSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Tên chuyến đi
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Trekking Tà Năng Phan Dũng"
                  value={newTripTitle}
                  onChange={(e) => setNewTripTitle(e.target.value)}
                  className="w-full rounded-xl px-3.5 py-2.5 bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Điểm đến
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Lâm Đồng - Bình Thuận"
                  value={newTripLocation}
                  onChange={(e) => setNewTripLocation(e.target.value)}
                  className="w-full rounded-xl px-3.5 py-2.5 bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="text"
                    value={newTripStartDate}
                    onChange={(e) => setNewTripStartDate(e.target.value)}
                    className="w-full rounded-xl px-3.5 py-2.5 bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Ngày kết thúc
                  </label>
                  <input
                    type="text"
                    value={newTripEndDate}
                    onChange={(e) => setNewTripEndDate(e.target.value)}
                    className="w-full rounded-xl px-3.5 py-2.5 bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Chọn ảnh bìa mẫu
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {presetPhotos.slice(0, 3).map((p, i) => (
                    <div
                      key={i}
                      onClick={() => setNewTripCover(p.url)}
                      className={`h-16 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                        newTripCover === p.url
                          ? "border-indigo-600 ring-2 ring-indigo-200"
                          : "border-transparent"
                      }`}
                    >
                      <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
                >
                  Tạo chuyến đi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL BÌNH CHỌN KHẢO SÁT */}
      {showVoteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 animate-fadeIn text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Bình chọn điểm ngắm hoàng hôn Đà Lạt
              </h3>
              <button
                onClick={() => setShowVoteModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div
                onClick={() => {
                  setVotes({ ...votes, option1: votes.option1 + 1, voted: "opt1" });
                  setShowVoteModal(false);
                }}
                className="p-4 rounded-2xl border border-indigo-200 hover:bg-indigo-50/50 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Tiệm cà phê Hoàng Hôn ☕
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    View thung lũng, nhiều góc sống ảo cực chill
                  </p>
                </div>
                <span className="font-bold text-indigo-600 text-sm">
                  {votes.option1} phiếu
                </span>
              </div>

              <div
                onClick={() => {
                  setVotes({ ...votes, option2: votes.option2 + 1, voted: "opt2" });
                  setShowVoteModal(false);
                }}
                className="p-4 rounded-2xl border border-rose-200 hover:bg-rose-50/50 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Đồi Robin Đà Lạt 🌲
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Đón gió trên cao, cáp treo ngắm toàn cảnh rừng thông
                  </p>
                </div>
                <span className="font-bold text-rose-600 text-sm">
                  {votes.option2} phiếu
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          9. FLOATING API TESTER CONSOLE (TEST ĐƯỢC HẾT 9 API TRÊN UI)
          ========================================================= */}
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowApiTester(!showApiTester)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-pink-600 text-white text-xs font-bold shadow-2xl shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20"
        >
          <Code className="w-4 h-4" />
          <span>Kiểm thử 9 API Backend</span>
        </button>
      </div>

      {/* API Tester Drawer / Modal */}
      {showApiTester && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-fadeIn">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                API
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  Bảng Điều Khiển Test 9 API
                </h3>
                <p className="text-[10px] text-slate-500">
                  Gửi request thật đến Supabase và xem JSON trả về
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowApiTester(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Test Buttons List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* Group 1: Auth Login & Register */}
            <div>
              <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-2">
                1. Đăng nhập & Đăng ký
              </p>
              <div className="space-y-1.5">
                <button
                  disabled={apiTestingLoading}
                  onClick={() =>
                    executeApiTest("/api/auth/login", "POST", {
                      email: "test@dulichnhom.com",
                      password: "Password123@!",
                    })
                  }
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 flex items-center justify-between font-medium transition-all"
                >
                  <span className="font-mono text-[11px] text-emerald-700 font-bold">
                    POST /api/auth/login
                  </span>
                  <span className="text-[11px] text-slate-500">Test login mẫu</span>
                </button>

                <button
                  disabled={apiTestingLoading}
                  onClick={() =>
                    executeApiTest("/api/auth/register", "POST", {
                      email: `user_${Date.now()}@dulichnhom.com`,
                      password: "Password123@!",
                      full_name: "Tester Auto",
                    })
                  }
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 flex items-center justify-between font-medium transition-all"
                >
                  <span className="font-mono text-[11px] text-indigo-700 font-bold">
                    POST /api/auth/register
                  </span>
                  <span className="text-[11px] text-slate-500">Tạo user ngẫu nhiên</span>
                </button>

                <button
                  disabled={apiTestingLoading}
                  onClick={() => (window.location.href = "/api/auth/google")}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 flex items-center justify-between font-medium transition-all"
                >
                  <span className="font-mono text-[11px] text-purple-700 font-bold">
                    GET /api/auth/google
                  </span>
                  <span className="text-[11px] text-slate-500">Mở Google OAuth ↗</span>
                </button>
              </div>
            </div>

            {/* Group 2: Profile & Logout */}
            <div>
              <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-2">
                2. Hồ sơ cá nhân & Đăng xuất
              </p>
              <div className="space-y-1.5">
                <button
                  disabled={apiTestingLoading}
                  onClick={() => executeApiTest("/api/auth/profile", "GET")}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:bg-sky-50 hover:border-sky-300 flex items-center justify-between font-medium transition-all"
                >
                  <span className="font-mono text-[11px] text-sky-700 font-bold">
                    GET /api/auth/profile
                  </span>
                  <span className="text-[11px] text-slate-500">Lấy profile hiện tại</span>
                </button>

                <button
                  disabled={apiTestingLoading}
                  onClick={() =>
                    executeApiTest("/api/auth/profile", "PATCH", {
                      full_name: "Hoàng Nam (Đã cập nhật)",
                      phone: "0987654321",
                    })
                  }
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:bg-sky-50 hover:border-sky-300 flex items-center justify-between font-medium transition-all"
                >
                  <span className="font-mono text-[11px] text-amber-700 font-bold">
                    PATCH /api/auth/profile
                  </span>
                  <span className="text-[11px] text-slate-500">Đổi họ tên & SĐT</span>
                </button>

                <button
                  disabled={apiTestingLoading}
                  onClick={() => executeApiTest("/api/auth/logout", "POST")}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:border-rose-300 flex items-center justify-between font-medium transition-all"
                >
                  <span className="font-mono text-[11px] text-rose-700 font-bold">
                    POST /api/auth/logout
                  </span>
                  <span className="text-[11px] text-slate-500">Xóa cookie đăng xuất</span>
                </button>
              </div>
            </div>

            {/* Group 3: Password recovery */}
            <div>
              <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-2">
                3. Quên & Đặt lại mật khẩu
              </p>
              <div className="space-y-1.5">
                <button
                  disabled={apiTestingLoading}
                  onClick={() =>
                    executeApiTest("/api/auth/forgot-password", "POST", {
                      email: "test@dulichnhom.com",
                    })
                  }
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:bg-orange-50 hover:border-orange-300 flex items-center justify-between font-medium transition-all"
                >
                  <span className="font-mono text-[11px] text-orange-700 font-bold">
                    POST /api/auth/forgot-password
                  </span>
                  <span className="text-[11px] text-slate-500">Gửi mail reset</span>
                </button>

                <button
                  disabled={apiTestingLoading}
                  onClick={() =>
                    executeApiTest("/api/auth/reset-password", "POST", {
                      password: "NewPassword123@!",
                    })
                  }
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:bg-orange-50 hover:border-orange-300 flex items-center justify-between font-medium transition-all"
                >
                  <span className="font-mono text-[11px] text-orange-700 font-bold">
                    POST /api/auth/reset-password
                  </span>
                  <span className="text-[11px] text-slate-500">Đổi pass mới</span>
                </button>
              </div>
            </div>

            {/* Response Viewer */}
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-700 text-xs">
                  Kết quả phản hồi JSON:
                </span>
                {apiResult && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      apiResult.status < 300
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    HTTP {apiResult.status} ({apiResult.time})
                  </span>
                )}
              </div>

              <div className="bg-slate-900 rounded-2xl p-3 text-slate-200 font-mono text-[11px] h-48 overflow-y-auto border border-slate-800">
                {apiTestingLoading ? (
                  <p className="text-amber-400">Đang gửi request tới API...</p>
                ) : apiResult ? (
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(apiResult.data, null, 2)}
                  </pre>
                ) : (
                  <p className="text-slate-500 italic">
                    Bấm một nút API phía trên để xem kết quả trả về từ Supabase thật...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 mt-12 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">Trippo</span>
          <span>— Lên lịch và đồng hành du lịch cùng nhau</span>
        </div>

        <div>© 2025 Trippo Technologies. Bảo lưu mọi quyền.</div>
      </footer>
    </div>
  );
}
