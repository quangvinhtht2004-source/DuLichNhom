"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDateToDisplay } from "@/lib/date-utils";
import CreateTripModal from "./create-trip-modal";
import InviteFriendsModal from "./invite-friends-modal";
import TripInviteModal from "./trip-invite-modal";
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
  Play,
  RotateCcw,
  ExternalLink,
  Sliders,
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

interface TripDashboardProps {
  initialProfile?: {
    full_name?: string;
    avatar_url?: string | null;
    email?: string;
  } | null;
}

export default function TripDashboard({ initialProfile }: TripDashboardProps = {}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper: Get user initials
  const getInitials = (name: string) => {
    if (!name || name === "Bạn") return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // User State with instant client-side cache fallback
  const [userName, setUserName] = useState<string>(() => {
    if (initialProfile?.full_name) return initialProfile.full_name;
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("user_full_name");
      if (saved) return saved;
    }
    return "Hoàng Nam";
  });
  const [userAvatar, setUserAvatar] = useState<string | null>(() => {
    if (initialProfile !== undefined && initialProfile !== null) {
      return initialProfile.avatar_url || null;
    }
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("user_avatar_url");
      if (saved) return saved;
    }
    return null;
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    if (initialProfile?.email) return initialProfile.email;
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("user_email");
      if (saved) return saved;
    }
    return "";
  });
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  // Tabs & Views
  const [activeFilterTab, setActiveFilterTab] = useState<"upcoming" | "completed" | "invites">("upcoming");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Trips List State (Real Data from Supabase)
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState<boolean>(true);
  const [openMenuTripId, setOpenMenuTripId] = useState<string | null>(null);

  // Invitation States & Modals
  const [hasInvite, setHasInvite] = useState<boolean>(true);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [showInviteFriendsModal, setShowInviteFriendsModal] = useState<boolean>(false);
  const [showAlertBanner, setShowAlertBanner] = useState<boolean>(true);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

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

  // Fetch Trips directly from Supabase Database
  const fetchTrips = async () => {
    try {
      setIsLoadingTrips(true);
      const res = await fetch("/api/trips");
      if (res.ok) {
        const json = await res.json();
        if (json?.trips && Array.isArray(json.trips)) {
          const mappedTrips: TripItem[] = json.trips.map((t: any) => ({
            id: t.id,
            title: t.name,
            role: t.trip_members?.some((m: any) => m.role === "owner")
              ? "Trưởng nhóm"
              : "Thành viên",
            badgeDays: "Sắp diễn ra",
            coverImage:
              t.cover_image_url ||
              "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop",
            startDate: formatDateToDisplay(t.start_date) || "15/10/2026",
            endDate: formatDateToDisplay(t.end_date) || "18/10/2026",
            location: t.destination || "Việt Nam",
            members: [
              { initials: "HN", bg: "bg-indigo-600" },
              { initials: "MA", bg: "bg-purple-600" },
              { initials: "TK", bg: "bg-rose-600" },
            ],
            extraMembers:
              t.trip_members && t.trip_members.length > 3
                ? t.trip_members.length - 3
                : 2,
            progress: 60,
          }));
          setTrips(mappedTrips);
        }
      }
    } catch (err) {
      console.error("Error fetching trips from database:", err);
    } finally {
      setIsLoadingTrips(false);
    }
  };

  // Load User Profile and Real Trips from Supabase on Mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/profile");
        if (res.ok) {
          const json = await res.json();
          if (json?.profile?.full_name) {
            setUserName(json.profile.full_name);
            if (typeof window !== "undefined") {
              sessionStorage.setItem("user_full_name", json.profile.full_name);
            }
          }
          if (json?.profile?.avatar_url) {
            setUserAvatar(json.profile.avatar_url);
            if (typeof window !== "undefined") {
              sessionStorage.setItem("user_avatar_url", json.profile.avatar_url);
            }
          } else if (json?.profile && json.profile.avatar_url === null) {
            setUserAvatar(null);
            if (typeof window !== "undefined") {
              sessionStorage.removeItem("user_avatar_url");
            }
          }
          if (json?.profile?.email) {
            setUserEmail(json.profile.email);
            if (typeof window !== "undefined") {
              sessionStorage.setItem("user_email", json.profile.email);
            }
          }
        }
      } catch {
        // Fallback to default
      }
    };
    fetchProfile();
    fetchTrips();
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("user_full_name");
        sessionStorage.removeItem("user_avatar_url");
        sessionStorage.removeItem("user_email");
      }
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

  // Handle Change Trip Cover Image (Syncs directly to Supabase DB)
  const handleSaveCoverImage = async (url: string) => {
    if (!editingTripId) return;
    setTrips(
      trips.map((t) => (t.id === editingTripId ? { ...t, coverImage: url } : t))
    );
    try {
      await fetch("/api/trips", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingTripId,
          cover_image_url: url,
        }),
      });
    } catch (err) {
      console.error("Error updating cover image in database:", err);
    }
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

  // Callback when a new trip is successfully saved to Supabase Database
  const handleTripCreated = (newTrip: any) => {
    fetchTrips();
  };

  // Handle Accept Trip Invitation
  const handleAcceptInvite = () => {
    const newAcceptedTrip: TripItem = {
      id: `trip-dalat-${Date.now()}`,
      title: "Oanh tạc Đà Lạt 3N2Đ cùng Hội bạn thân 🌲",
      role: "Thành viên",
      badgeDays: "Sắp khởi hành",
      coverImage:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop",
      startDate: "15/10/2026",
      endDate: "18/10/2026",
      location: "Đà Lạt, Lâm Đồng",
      members: [
        { initials: "MA", bg: "bg-purple-600" },
        { initials: getInitials(userName), bg: "bg-indigo-600" },
        { initials: "TL", bg: "bg-rose-600" },
        { initials: "HM", bg: "bg-amber-600" },
      ],
      extraMembers: 1,
      progress: 20,
    };
    setTrips([newAcceptedTrip, ...trips]);
    setHasInvite(false);
    setShowAlertBanner(false);
  };

  // Handle Decline Trip Invitation
  const handleDeclineInvite = () => {
    setHasInvite(false);
    setShowAlertBanner(false);
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

            {/* Notification Bell (Vị trí 3: Quả chuông thông báo) */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
                title="Thông báo"
              >
                <Bell className="w-4 h-4" />
                {hasInvite && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-84 sm:w-88 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 text-xs animate-fadeIn">
                  <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between gap-2">
                    <span className="font-extrabold text-slate-900 shrink-0">
                      Thông báo {hasInvite ? "(1)" : "(0)"}
                    </span>
                    {hasInvite && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setHasInvite(false);
                        }}
                        className="text-[11px] font-semibold text-[#5235ab] hover:text-[#3e2487] hover:bg-[#eeedfd] px-2 py-0.5 rounded-lg transition-all cursor-pointer truncate"
                      >
                        Đánh dấu tất cả là đã đọc
                      </button>
                    )}
                  </div>

                  {hasInvite ? (
                    <div
                      onClick={() => {
                        setShowNotifications(false);
                        setShowInviteModal(true);
                      }}
                      className="p-3.5 hover:bg-indigo-50/50 transition-colors cursor-pointer border-b border-slate-50 flex items-start gap-3"
                    >
                      <div className="relative shrink-0">
                        <img
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120&auto=format&fit=crop"
                          alt="Minh Anh"
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[8px]">
                          ❤
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-800 leading-snug">
                          <strong className="text-slate-900">Minh Anh</strong> đã gửi lời mời tham gia chuyến đi{" "}
                          <strong className="text-indigo-600">"Oanh tạc Đà Lạt 3N2Đ"</strong>.
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[10px] text-slate-400">2 giờ trước</span>
                          <span className="text-[11px] font-bold text-indigo-600 hover:underline">
                            Xem ngay →
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      Bạn không có thông báo mới nào
                    </div>
                  )}
                </div>
              )}
            </div>

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
                    {getInitials(userName)}
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
                    <p className="text-slate-400 text-[11px] truncate">{userEmail || "Đang đăng nhập"}</p>
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
        {/* VỊ TRÍ 2: THANH BANNER NỔI BẬT DƯỚI HEADER (ALERT / INVITATION BANNER) */}
        {hasInvite && showAlertBanner && (
          <div className="bg-gradient-to-r from-purple-100/90 via-pink-100/80 to-indigo-100/80 border border-purple-200/90 rounded-2xl p-4 sm:px-6 sm:py-3.5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-purple-600/25">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-500 text-white uppercase tracking-wider">
                    Lời mời mới
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    Minh Anh vừa gửi lời mời bạn tham gia: Oanh tạc Đà Lạt 3N2Đ cùng Hội bạn thân 🌲
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 hidden md:block">
                  Khởi hành 15/10/2026. Lên lịch trình sống ảo, phân chia chi phí minh bạch và bình chọn điểm check-in hấp dẫn!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 shadow-sm transition-all cursor-pointer"
              >
                Xem chi tiết & Tham gia
              </button>
              <button
                type="button"
                onClick={() => setShowAlertBanner(false)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-white/60 transition-colors cursor-pointer"
              >
                Để sau
              </button>
              <button
                type="button"
                onClick={() => setShowAlertBanner(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-colors cursor-pointer"
                title="Ẩn thông báo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
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
          {isLoadingTrips && trips.length === 0 && (
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={`skeleton-${i}`}
                  className={`bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden animate-fadeInUp stagger-${i}`}
                >
                  {/* Cover image skeleton */}
                  <div className="h-48 w-full animate-shimmer" />
                  {/* Content skeleton */}
                  <div className="p-5 space-y-3">
                    <div className="w-24 h-5 rounded-full animate-shimmer" />
                    <div className="w-3/4 h-4 rounded-lg animate-shimmer" />
                    <div className="space-y-1.5">
                      <div className="w-40 h-3 rounded-md animate-shimmer" />
                      <div className="w-32 h-3 rounded-md animate-shimmer" />
                    </div>
                  </div>
                  {/* Bottom skeleton */}
                  <div className="p-5 pt-0 border-t border-slate-100 mt-2">
                    <div className="flex items-center justify-between pt-3">
                      <div className="flex -space-x-1.5">
                        {[1, 2, 3].map((j) => (
                          <div key={j} className="w-7 h-7 rounded-full animate-shimmer ring-2 ring-white" />
                        ))}
                      </div>
                      <div className="w-20 h-3 rounded-md animate-shimmer" />
                    </div>
                    <div className="w-full h-1.5 rounded-full animate-shimmer mt-2.5" />
                  </div>
                </div>
              ))}
            </>
          )}

          {activeFilterTab === "upcoming" && trips.map((trip, index) => (
            <div
              key={trip.id}
              className={`bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between group animate-fadeInUp`}
              style={{ animationDelay: `${index * 0.08}s` }}
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

                  {/* Top Right: Options Menu Button */}
                  <div className="absolute top-3.5 right-3.5 z-20">
                    <button
                      onClick={() =>
                        setOpenMenuTripId(openMenuTripId === trip.id ? null : trip.id)
                      }
                      title="Tùy chọn chuyến đi"
                      className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-md transition-all cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openMenuTripId === trip.id && (
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30 text-xs animate-fadeIn">
                        <Link
                          href={`/trips/${trip.id}/settings`}
                          className="w-full text-left px-3.5 py-2 flex items-center gap-2 hover:bg-indigo-50 text-indigo-700 font-bold"
                        >
                          <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Cài đặt & Xóa chuyến đi</span>
                        </Link>
                        <button
                          onClick={() => {
                            setOpenMenuTripId(null);
                            setShowInviteFriendsModal(true);
                          }}
                          className="w-full text-left px-3.5 py-2 flex items-center gap-2 hover:bg-purple-50 text-purple-700 font-medium cursor-pointer"
                        >
                          <User className="w-3.5 h-3.5 text-purple-600" />
                          <span>Mời bạn bè vào chuyến</span>
                        </button>
                        <button
                          onClick={() => {
                            setOpenMenuTripId(null);
                            openEditCoverModal(trip.id);
                          }}
                          className="w-full text-left px-3.5 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>Đổi ảnh bìa nhanh</span>
                        </button>
                      </div>
                    )}
                  </div>
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
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowInviteFriendsModal(true);
                      }}
                      title="Mời bạn bè vào chuyến đi"
                      className="w-7 h-7 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-sm transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
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

          {/* CREATE TRIP CARD (Chỉ hiện khi ở tab Sắp tới) */}
          {activeFilterTab === "upcoming" && (
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
          )}

          {/* VỊ TRÍ 1: DANH SÁCH LỜI MỜI THAM GIA ĐANG CHỜ DUYỆT (TAB LỜI MỜI THAM GIA) */}
          {activeFilterTab === "invites" && hasInvite && (
            <div
              onClick={() => setShowInviteModal(true)}
              className="bg-white rounded-3xl border-2 border-dashed border-purple-300 hover:border-purple-500 shadow-sm hover:shadow-md p-5 flex flex-col justify-between relative transition-all cursor-pointer group"
            >
              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    Lời mời đang chờ duyệt
                  </span>
                  <span className="text-[11px] text-slate-400">2 giờ trước</span>
                </div>

                {/* Invite Title */}
                <h3 className="text-base font-bold text-slate-900 mt-3 leading-snug group-hover:text-indigo-600 transition-colors">
                  Oanh tạc Đà Lạt 3N2Đ 🌲
                </h3>

                {/* Sender Info */}
                <div className="mt-3 p-3 rounded-2xl bg-purple-50/50 border border-purple-100 flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120&auto=format&fit=crop"
                    alt="Minh Anh"
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-200 shrink-0"
                  />
                  <p className="text-xs text-slate-700 leading-tight">
                    <strong className="text-slate-900">Minh Anh</strong> rủ bạn tham gia chuyến đi
                  </p>
                </div>

                {/* Date & Location */}
                <div className="mt-3.5 space-y-1.5 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-500" />
                    <span>15/10/2026 — 18/10/2026</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>Đồi Đa Phú & Hồ Tuyền Lâm, Đà Lạt</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
                  <span>Nhấp vào thẻ để xem chi tiết thiệp mời</span>
                  <span>→</span>
                </div>
              </div>

              {/* Action Buttons: Chấp nhận (Màu tím) & Từ chối (Màu xám) */}
              <div
                className="flex items-center gap-2 pt-4 mt-3 border-t border-slate-100"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={handleAcceptInvite}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm shadow-purple-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Chấp nhận</span>
                </button>
                <button
                  type="button"
                  onClick={handleDeclineInvite}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                >
                  Từ chối
                </button>
              </div>
            </div>
          )}

          {activeFilterTab === "invites" && !hasInvite && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Không có lời mời nào đang chờ duyệt
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Khi bạn bè rủ bạn tham gia chuyến đi, lời mời sẽ hiển thị tại đây kèm thiệp mời chi tiết.
              </p>
            </div>
          )}

          {/* TAB ĐÃ ĐI */}
          {activeFilterTab === "completed" && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Chưa có chuyến đi nào hoàn thành
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Những chuyến đi bạn đã hoàn thành sẽ được lưu giữ tại đây để bạn cùng bạn bè ôn lại kỷ niệm.
              </p>
            </div>
          )}
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

      {/* 7. MODAL TẠO CHUYẾN ĐI MỚI (CHÍNH THỨC THEO MOCKUP TRIPPO MỚI 100%) */}
      <CreateTripModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onTripCreated={handleTripCreated}
      />

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


      {/* 9. MODAL LỜI MỜI DU LỊCH ĐẶC BIỆT (THEO MOCKUP 100%) */}
      <TripInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onAccept={handleAcceptInvite}
        onDecline={handleDeclineInvite}
      />

      {/* 10. MODAL MỜI BẠN BÈ VÀO CHUYẾN ĐI (THEO MOCKUP 100%) */}
      <InviteFriendsModal
        isOpen={showInviteFriendsModal}
        onClose={() => setShowInviteFriendsModal(false)}
      />

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
