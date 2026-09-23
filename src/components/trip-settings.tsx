"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { normalizeDateToISO, formatDateToDisplay } from "@/lib/date-utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  ChevronDown,
  ArrowLeft,
  Compass,
  Calendar,
  MapPin,
  Lock,
  Plus,
  Trash2,
  AlertTriangle,
  Upload,
  Crop,
  Check,
  X,
  Smile,
  Save,
  RotateCcw,
  Users,
  CreditCard,
  Sliders,
  LogOut,
  Home,
  User,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface TripSettingsProps {
  tripId: string;
}

export default function TripSettings({ tripId }: TripSettingsProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // User Profile
  const [userName, setUserName] = useState<string>("Hoàng Nam");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  // Active Tab in Settings
  const [activeTab, setActiveTab] = useState<"general" | "members" | "notifications" | "wallet">("general");

  // Presets matching mockup
  const presets = [
    {
      id: "preset-1",
      name: "Săn mây đồi Robin",
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: "preset-2",
      name: "Cắm trại đêm",
      url: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "preset-3",
      name: "Đèo Tà Nung",
      url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "preset-4",
      name: "Cà phê sườn đồi",
      url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop",
    },
  ];

  // Form States
  const [coverImage, setCoverImage] = useState<string>(presets[0].url);
  const [selectedPresetName, setSelectedPresetName] = useState<string>("Săn mây đồi Robin Đà Lạt");
  const [tripName, setTripName] = useState<string>("Oanh tạc Đà Lạt 3N2Đ cùng Hội bạn thân 🌲");
  const [destination, setDestination] = useState<string>("Thành phố Đà Lạt, Tỉnh Lâm Đồng, Việt Nam");
  const [startDate, setStartDate] = useState<string>("15/10/2026");
  const [endDate, setEndDate] = useState<string>("18/10/2026");
  const [description, setDescription] = useState<string>(
    "Mục tiêu chuyến đi: Ăn sập chợ đêm Đà Lạt, săn mây đồi Robin lúc bình minh, ghé quán cà phê thung lũng ngắm hoàng hôn và chụp 1000 tấm ảnh sống ảo cùng hội bạn thân!"
  );
  const [isPrivate, setIsPrivate] = useState<boolean>(true);

  // Backup Initial Data for Reset
  const [initialData, setInitialData] = useState({
    coverImage: presets[0].url,
    selectedPresetName: "Săn mây đồi Robin Đà Lạt",
    tripName: "Oanh tạc Đà Lạt 3N2Đ cùng Hội bạn thân 🌲",
    destination: "Thành phố Đà Lạt, Tỉnh Lâm Đồng, Việt Nam",
    startDate: "15/10/2026",
    endDate: "18/10/2026",
    description:
      "Mục tiêu chuyến đi: Ăn sập chợ đêm Đà Lạt, săn mây đồi Robin lúc bình minh, ghé quán cà phê thung lũng ngắm hoàng hôn và chụp 1000 tấm ảnh sống ảo cùng hội bạn thân!",
    isPrivate: true,
  });

  // UI States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState<string>("");
  const [deleteReason, setDeleteReason] = useState<string>("Kế hoạch bị hủy / các thành viên bận");
  const [customReason, setCustomReason] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check if delete input matches "xoa" regardless of accent style (XÓA, XOÁ, xoa, XOA)
  const isDeleteConfirmed = useMemo(() => {
    const raw = deleteConfirmInput.trim().toLowerCase();
    if (!raw) return false;
    const normalized = raw
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return normalized === "xoa";
  }, [deleteConfirmInput]);

  // Calculate Duration Text (e.g. "3 ngày 2 đêm")
  const durationBadge = useMemo(() => {
    try {
      const s = normalizeDateToISO(startDate);
      const e = normalizeDateToISO(endDate);
      if (s && e) {
        const d1 = new Date(s);
        const d2 = new Date(e);
        const diffTime = Math.abs(d2.getTime() - d1.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 0) {
          return `${diffDays} ngày ${Math.max(1, diffDays - 1)} đêm`;
        }
      }
    } catch {
      // fallback
    }
    return "3 ngày 2 đêm";
  }, [startDate, endDate]);

  // Fetch Trip Details from Supabase API
  useEffect(() => {
    const fetchTripData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/trips/${tripId}`);
        if (res.ok) {
          const json = await res.json();
          if (json?.trip) {
            const t = json.trip;
            const updated = {
              coverImage: t.cover_image_url || presets[0].url,
              selectedPresetName: "Săn mây đồi Robin Đà Lạt",
              tripName: t.name || "Oanh tạc Đà Lạt 3N2Đ cùng Hội bạn thân 🌲",
              destination: t.destination || "Thành phố Đà Lạt, Tỉnh Lâm Đồng, Việt Nam",
              startDate: formatDateToDisplay(t.start_date) || "15/10/2026",
              endDate: formatDateToDisplay(t.end_date) || "18/10/2026",
              description:
                description ||
                "Mục tiêu chuyến đi: Ăn sập chợ đêm Đà Lạt, săn mây đồi Robin lúc bình minh, ghé quán cà phê thung lũng ngắm hoàng hôn và chụp 1000 tấm ảnh sống ảo cùng hội bạn thân!",
              isPrivate: true,
            };
            setCoverImage(updated.coverImage);
            setTripName(updated.tripName);
            setDestination(updated.destination);
            setStartDate(updated.startDate);
            setEndDate(updated.endDate);
            setInitialData(updated);
          }
        }
      } catch (err) {
        console.error("Error fetching trip:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTripData();
  }, [tripId]);

  // Trigger Toast Notification
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Handle Cover Image Upload from Computer
  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setCoverImage(reader.result);
          setSelectedPresetName(file.name.replace(/\.[^/.]+$/, ""));
          triggerToast("Đã tải ảnh bìa mới từ máy tính!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Save Trip Changes to Supabase
  const handleSaveChanges = async () => {
    if (!tripName.trim()) {
      triggerToast("Tên chuyến đi không được để trống!");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tripName.trim(),
          destination: destination.trim(),
          start_date: normalizeDateToISO(startDate) || startDate,
          end_date: normalizeDateToISO(endDate) || endDate,
          cover_image_url: coverImage,
          description: description.trim(),
          is_private: isPrivate,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        triggerToast("Đã lưu các thay đổi vào cơ sở dữ liệu thành công!");
        setInitialData({
          coverImage,
          selectedPresetName,
          tripName,
          destination,
          startDate,
          endDate,
          description,
          isPrivate,
        });
      } else {
        triggerToast(data?.error || "Không thể lưu thay đổi");
      }
    } catch {
      triggerToast("Lỗi kết nối máy chủ");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Reset to Initial
  const handleResetForm = () => {
    setCoverImage(initialData.coverImage);
    setSelectedPresetName(initialData.selectedPresetName);
    setTripName(initialData.tripName);
    setDestination(initialData.destination);
    setStartDate(initialData.startDate);
    setEndDate(initialData.endDate);
    setDescription(initialData.description);
    setIsPrivate(initialData.isPrivate);
    triggerToast("Đã khôi phục dữ liệu ban đầu.");
  };

  // Handle Permanent Delete Trip from Supabase (Danger Zone)
  const handleDeleteTrip = async () => {
    setIsDeleting(true);
    try {
      const finalReason =
        deleteReason === "Lý do khác" && customReason.trim()
          ? customReason.trim()
          : deleteReason;

      const res = await fetch(`/api/trips/${tripId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: finalReason }),
      });

      if (res.ok) {
        triggerToast("Đã xóa vĩnh viễn chuyến đi thành công!");
        setShowDeleteModal(false);
        setTimeout(() => {
          router.push("/dashboard");
        }, 1200);
      } else {
        const data = await res.json();
        triggerToast(data?.error || "Không thể xóa chuyến đi");
      }
    } catch {
      triggerToast("Lỗi máy chủ khi xóa chuyến đi");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 font-sans pb-16 antialiased">
      {/* 1. TOP NAVBAR (Trippo Global Header) */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-2xs">
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

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <Link href="/dashboard" className="text-indigo-600 font-bold">
              Chuyến đi của tôi
            </Link>
            <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
              Khám phá địa điểm
            </Link>
            <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
              Lịch trình
            </Link>
            <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
              Chi phí
            </Link>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:opacity-95 shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Tạo chuyến đi mới</span>
            </Link>

            <button
              className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Thông báo"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
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
                    href="/dashboard"
                    className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-700 font-medium"
                  >
                    <Home className="w-3.5 h-3.5 text-slate-400" />
                    <span>Trang tổng quan</span>
                  </Link>
                  <Link
                    href="/profile"
                    className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-700 font-medium"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Hồ sơ cá nhân</span>
                  </Link>
                  <button
                    onClick={async () => {
                      await fetch("/api/auth/logout", { method: "POST" });
                      router.push("/");
                    }}
                    className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-rose-50 text-rose-600 font-medium cursor-pointer"
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

      {/* 2. MAIN CONTAINER */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium flex-wrap">
          <Link
            href="/dashboard"
            className="hover:text-slate-900 transition-colors flex items-center gap-1"
          >
            <span>📁 Chuyến đi của tôi</span>
          </Link>
          <span>›</span>
          <span className="text-slate-600 truncate max-w-xs">{tripName}</span>
          <span>›</span>
          <span className="text-slate-900 font-bold">Cài đặt chuyến đi</span>
        </nav>

        {/* Page Title & Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Cài đặt chuyến đi
              </h1>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                <User className="w-3 h-3" />
                <span>Bạn là Trưởng nhóm</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
              Quản lý thông tin chung, phân quyền thành viên và thiết lập an toàn cho hành trình {destination.split(",")[0] || "Đà Lạt"} của nhóm bạn.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về trang hành trình</span>
          </Link>
        </div>

        {/* 3. SETTINGS NAVIGATION TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
          <button
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "general"
                ? "bg-white text-indigo-600 shadow-xs border border-slate-200/80 font-bold"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Thông tin chung</span>
          </button>

          <button
            onClick={() => setActiveTab("members")}
            className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "members"
                ? "bg-white text-indigo-600 shadow-xs border border-slate-200/80 font-bold"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Thành viên & Quyền hạn</span>
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] flex items-center justify-center font-bold">
              5
            </span>
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "notifications"
                ? "bg-white text-indigo-600 shadow-xs border border-slate-200/80 font-bold"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Thông báo & Lịch</span>
          </button>

          <button
            onClick={() => setActiveTab("wallet")}
            className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "wallet"
                ? "bg-white text-indigo-600 shadow-xs border border-slate-200/80 font-bold"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Ví chung & Tiền tệ</span>
          </button>
        </div>

        {/* 4. CARD 1: THÔNG TIN HÀNH TRÌNH (TRIP DETAILS FORM) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-2xs space-y-6">
          {/* Section Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Thông tin hành trình
                </h3>
                <p className="text-[11px] text-slate-400">
                  Cập nhật hình ảnh nhận diện và các thông số cơ bản
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Đã đồng bộ thời gian thực</span>
            </div>
          </div>

          {/* 1. COVER PHOTO 16:9 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-700">
                <span>Ảnh bìa hành trình </span>
                <span className="text-slate-400 font-normal text-[11px]">(Tỉ lệ 16:9)</span>
              </div>
              <button
                type="button"
                onClick={() => triggerToast("Lịch sử ảnh bìa đã được lưu trữ an toàn.")}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                Xem lịch sử ảnh
              </button>
            </div>

            {/* Big 16:9 Banner */}
            <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden group shadow-xs">
              <img
                src={coverImage}
                alt={tripName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent"></div>

              {/* Top Left Badge */}
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium flex items-center gap-1.5 shadow-sm">
                <span>📷 Ảnh hiện tại: {selectedPresetName}</span>
              </div>

              {/* Bottom Left Buttons & Bottom Right Note */}
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-800 text-xs font-bold backdrop-blur-md shadow-md transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Tải ảnh mới</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerToast("Công cụ căn chỉnh tỉ lệ 16:9 đang mở.")}
                    className="p-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 text-xs backdrop-blur-md shadow-md transition-all cursor-pointer"
                    title="Căn chỉnh khung ảnh"
                  >
                    <Crop className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="text-white/80 text-[10px] hidden sm:inline">
                  Khuyên dùng: Tối thiểu 1920 × 1080 px
                </span>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUploadImage}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
              />
            </div>

            {/* 4 Presets row */}
            <div className="pt-1">
              <span className="block text-[10px] font-bold text-slate-400 tracking-wider mb-2 uppercase">
                Hoặc chọn nhanh từ bộ sưu tập gợi ý:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {presets.map((p) => {
                  const isSelected = coverImage === p.url;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setCoverImage(p.url);
                        setSelectedPresetName(p.name);
                      }}
                      className={`group relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer text-left ${
                        isSelected
                          ? "border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs"
                          : "border-transparent hover:border-slate-300"
                      }`}
                    >
                      <div className="h-14 sm:h-16 w-full relative">
                        <img
                          src={p.url}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-slate-900/25"></div>
                        {isSelected && (
                          <div className="absolute bottom-1 left-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-600 text-white">
                              Đang chọn
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-1.5 bg-[#f8f9fc] border-t border-slate-100">
                        <span
                          className={`text-[10px] font-bold block truncate ${
                            isSelected ? "text-indigo-700" : "text-slate-700"
                          }`}
                        >
                          {p.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. TRIP NAME */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Tên chuyến đi <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {tripName.length}/80 ký tự
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                maxLength={80}
                placeholder="Nhập tên chuyến đi"
                className="w-full bg-[#f8f9fc] border border-slate-200/80 rounded-xl pl-4 pr-10 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setTripName((prev) => prev + " ✈️")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title="Thêm biểu tượng"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3. DESTINATION */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Điểm đến chính <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Nhập địa điểm chính"
                className="w-full bg-[#f8f9fc] border border-slate-200/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            {/* Suggestions */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px]">
              <span className="text-slate-400">Gợi ý địa điểm phụ cận:</span>
              {["Hồ Tuyền Lâm", "Đồi Chè Cầu Đất", "Đèo Prenn"].map((spot) => (
                <button
                  key={spot}
                  type="button"
                  onClick={() => setDestination((prev) => `${prev} (${spot})`)}
                  className="px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  + {spot}
                </button>
              ))}
            </div>
          </div>

          {/* 4. DATES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ngày bắt đầu <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="15/10/2026"
                  className="w-full bg-[#f8f9fc] border border-slate-200/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Ngày kết thúc <span className="text-rose-500">*</span>
                </label>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[11px] font-bold border border-rose-100">
                  ✨ {durationBadge}
                </span>
              </div>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="18/10/2026"
                  className="w-full bg-[#f8f9fc] border border-slate-200/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* 5. DESCRIPTION */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Mô tả & Mục tiêu chuyến đi
              </label>
              <span className="text-[11px] text-slate-400">
                Hiển thị trên bảng tổng quan nhóm
              </span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Nhập mô tả và mục tiêu cho chuyến đi của bạn..."
              className="w-full bg-[#f8f9fc] border border-slate-200/80 rounded-xl p-3.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* 6. PRIVATE TRIP TOGGLE */}
          <div className="bg-[#f8f9fc] rounded-2xl p-4 border border-slate-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100/70 text-indigo-700 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Chuyến đi riêng tư (Private Trip)
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Chỉ những thành viên được mời qua liên kết hoặc mã QR mới có thể xem lịch trình, chi phí và ảnh chung.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsPrivate(!isPrivate)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                isPrivate ? "bg-indigo-600" : "bg-slate-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  isPrivate ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* 7. CARD FOOTER: ACTIONS */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
              <span>Bản nháp tự động lưu lúc 10:45 hôm nay</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleResetForm}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Khôi phục mặc định
              </button>

              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:opacity-95 shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spinner" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Lưu thay đổi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 5. CARD 2: VÙNG NGUY HIỂM (DANGER ZONE - XÓA VĨNH VIỄN CHUYẾN ĐI) */}
        <div className="bg-rose-50/70 border border-rose-200/90 rounded-3xl p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xs">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">
                VÙNG NGUY HIỂM • Hủy bỏ hoặc xóa chuyến đi
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                Xóa vĩnh viễn chuyến đi này
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                Mọi dữ liệu về lịch trình 3N2Đ, hóa đơn chia chi phí, kết quả bình chọn địa điểm và kho ảnh chung sẽ bị xóa vĩnh viễn và không thể khôi phục. Tất cả 5 thành viên trong nhóm sẽ mất quyền truy cập ngay lập tức.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setDeleteConfirmInput("");
              setDeleteReason("Kế hoạch bị hủy / các thành viên bận");
              setCustomReason("");
              setShowDeleteModal(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer shrink-0 self-end md:self-center"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa chuyến đi này</span>
          </button>
        </div>

        {/* 6. CARD 3: BOTTOM MEMBERS STRIP */}
        <div className="bg-[#f0f3ff] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border border-indigo-100/60 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px] font-bold ring-2 ring-white">
                HN
              </div>
              <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-[11px] font-bold ring-2 ring-white">
                MA
              </div>
              <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center text-[11px] font-bold ring-2 ring-white">
                TL
              </div>
              <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center text-[11px] font-bold ring-2 ring-white">
                TA
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[11px] font-bold ring-2 ring-white">
                +2
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-700">
              5 thành viên đang cùng chuẩn bị cho chuyến đi này
            </span>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab("members")}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Quản lý danh sách thành viên</span>
            <span>→</span>
          </button>
        </div>
      </main>

      {/* 7. FOOTER */}
      <footer className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-6 border-t border-slate-200/60 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">Trippo</span>
          <span>— Lên lịch và đồng hành du lịch cùng nhau</span>
        </div>
        <p>© 2025 Trippo Technologies. Bảo lưu mọi quyền.</p>
      </footer>

      {/* 8. TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3 text-xs animate-slideUp">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span className="font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 9. DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-scaleUp">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Xác nhận xóa vĩnh viễn chuyến đi?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Hành động này <strong className="text-rose-600">không thể khôi phục</strong>. Toàn bộ thông tin lịch trình và bảng chia tiền sẽ bị xóa sạch khỏi cơ sở dữ liệu.
                </p>
              </div>
            </div>

            {/* Reason selector */}
            <div className="space-y-1.5 text-xs">
              <label className="block font-semibold text-slate-700">
                Lý do xóa chuyến đi <span className="text-rose-500">*</span>
              </label>
              <select
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full bg-[#f8f9fc] border border-slate-200/90 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 cursor-pointer"
              >
                <option value="Kế hoạch bị hủy / các thành viên bận">Kế hoạch bị hủy / các thành viên bận</option>
                <option value="Tạo chuyến đi nhầm / chuyến đi thử nghiệm">Tạo chuyến đi nhầm / chuyến đi thử nghiệm</option>
                <option value="Đổi kế hoạch sang địa điểm hoặc thời gian khác">Đổi kế hoạch sang địa điểm hoặc thời gian khác</option>
                <option value="Trùng lặp với chuyến đi khác trong nhóm">Trùng lặp với chuyến đi khác trong nhóm</option>
                <option value="Lý do khác">Lý do khác...</option>
              </select>

              {deleteReason === "Lý do khác" && (
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Nhập lý do cụ thể của bạn..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  autoFocus
                />
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
              <span className="text-slate-500 block mb-1">
                Để xác nhận, vui lòng nhập: <strong className="text-slate-800">XÓA</strong> hoặc <strong className="text-slate-800">XOA</strong>
              </span>
              <input
                type="text"
                value={deleteConfirmInput}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isDeleteConfirmed && !isDeleting) {
                    handleDeleteTrip();
                  }
                }}
                autoFocus
                placeholder="Nhập XÓA để xác nhận"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleDeleteTrip}
                disabled={!isDeleteConfirmed || isDeleting}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spinner" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <span>Xác nhận xóa</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

