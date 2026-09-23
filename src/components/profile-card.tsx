"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Search,
  Bell,
  ChevronDown,
  Camera,
  Upload,
  Trash2,
  CreditCard,
  Tag,
  Phone,
  AtSign,
  CheckCircle2,
  Briefcase,
  MapPin,
  Award,
  Save,
  LogOut,
  Check,
  X,
  Compass,
  Plus,
} from "lucide-react";

interface ProfileCardProps {
  initialProfile?: {
    full_name?: string;
    avatar_url?: string | null;
    phone?: string;
    email?: string;
    created_at?: string;
  } | null;
}

export default function ProfileCard({ initialProfile: serverProfile }: ProfileCardProps = {}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // User menu dropdown
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  // Profile Form States
  const [fullName, setFullName] = useState<string>(() => {
    if (serverProfile?.full_name) return serverProfile.full_name;
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("user_full_name");
      if (saved) return saved;
    }
    return "Nguyễn Hoàng Nam";
  });

  const [nickname, setNickname] = useState<string>("Nam Balo 🎒");

  const [phone, setPhone] = useState<string>(() => {
    return serverProfile?.phone || "0912 345 678";
  });

  const [email, setEmail] = useState<string>(() => {
    if (serverProfile?.email) return serverProfile.email;
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("user_email");
      if (saved) return saved;
    }
    return "hoangnam.travel@trippo.vn";
  });

  const [avatarSrc, setAvatarSrc] = useState<string | null>(() => {
    if (serverProfile?.avatar_url) return serverProfile.avatar_url;
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("user_avatar_url");
      if (saved) return saved;
    }
    return "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop";
  });

  const [bio, setBio] = useState<string>(
    "Đam mê trekking săn mây, thích chụp ảnh flycam và luôn đúng giờ trong mọi lịch trình nhóm. Phương châm: 'Đi là phải hết mình!' ⛰️📸"
  );

  const [initialData, setInitialData] = useState<{
    fullName: string;
    nickname: string;
    phone: string;
    bio: string;
    avatarSrc: string | null;
  }>({
    fullName: "Nguyễn Hoàng Nam",
    nickname: "Nam Balo 🎒",
    phone: "0912 345 678",
    bio: "Đam mê trekking săn mây, thích chụp ảnh flycam và luôn đúng giờ trong mọi lịch trình nhóm. Phương châm: 'Đi là phải hết mình!' ⛰️📸",
    avatarSrc: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop",
  });

  // Action states
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);
  const [tempEmail, setTempEmail] = useState<string>("");

  // Helper Toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Helper Initials
  const getInitials = (name: string) => {
    if (!name || name === "Bạn") return "HN";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Fetch real profile from Supabase on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch("/api/auth/profile");
        if (res.ok) {
          const json = await res.json();
          if (json?.profile) {
            const p = json.profile;
            const loadedName = p.full_name || fullName;
            const loadedPhone = p.phone || phone;
            const loadedEmail = p.email || email;
            const loadedAvatar = p.avatar_url || avatarSrc;

            setFullName(loadedName);
            setPhone(loadedPhone);
            setEmail(loadedEmail);
            if (loadedAvatar) setAvatarSrc(loadedAvatar);

            setInitialData({
              fullName: loadedName,
              nickname: "Nam Balo 🎒",
              phone: loadedPhone,
              bio,
              avatarSrc: loadedAvatar || avatarSrc,
            });

            if (typeof window !== "undefined") {
              sessionStorage.setItem("user_full_name", loadedName);
              if (loadedAvatar) sessionStorage.setItem("user_avatar_url", loadedAvatar);
              if (loadedEmail) sessionStorage.setItem("user_email", loadedEmail);
            }
          }
        }
      } catch {
        // Fallback gracefully
      }
    };

    fetchUserProfile();
  }, []);

  // Save changes to Supabase DB
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          phone: phone,
        }),
      });

      if (res.ok) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("user_full_name", fullName);
        }
        setInitialData({
          fullName,
          nickname,
          phone,
          bio,
          avatarSrc,
        });
        triggerToast("Đã lưu thông tin hồ sơ cá nhân thành công!");
      } else {
        const errJson = await res.json().catch(() => ({}));
        triggerToast(errJson?.error || "Không thể cập nhật hồ sơ. Vui lòng thử lại!");
      }
    } catch (err) {
      console.error("Save profile error:", err);
      triggerToast("Có lỗi xảy ra khi kết nối máy chủ!");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset form to initial
  const handleResetForm = () => {
    setFullName(initialData.fullName);
    setNickname(initialData.nickname);
    setPhone(initialData.phone);
    setBio(initialData.bio);
    setAvatarSrc(initialData.avatarSrc);
    triggerToast("Đã khôi phục thông tin ban đầu.");
  };

  // Handle Avatar Upload directly to Supabase Storage
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      triggerToast("Kích thước ảnh tối đa 5MB!");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/auth/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.profile?.avatar_url) {
          setAvatarSrc(data.profile.avatar_url);
          if (typeof window !== "undefined") {
            sessionStorage.setItem("user_avatar_url", data.profile.avatar_url);
          }
          triggerToast("Tải ảnh đại diện mới thành công!");
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        triggerToast(errJson?.error || "Không thể tải ảnh lên. Vui lòng thử lại!");
      }
    } catch {
      // Local preview fallback
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setAvatarSrc(reader.result);
          triggerToast("Đã cập nhật ảnh đại diện xem trước!");
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Remove Avatar
  const handleRemoveAvatar = () => {
    setAvatarSrc(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("user_avatar_url");
    }
    triggerToast("Đã xóa ảnh đại diện.");
  };

  // Logout
  const handleLogout = async () => {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.clear();
      }
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcff] text-slate-800 antialiased font-sans pb-16">
      {/* 1. TOP NAVBAR (TRIPPO STANDARD HEADER) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                <span className="font-extrabold text-sm tracking-tighter">Tr</span>
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                Trippo
              </span>
            </Link>

            {/* Search Input */}
            <div className="relative hidden md:block w-72 lg:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm chuyến đi, địa điểm..."
                className="w-full bg-[#f4f6fa] border border-transparent rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
              />
            </div>
          </div>

          {/* Navigation Links (Center) */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <Link
              href="/dashboard"
              className="hover:text-indigo-600 transition-colors text-slate-900 font-bold"
            >
              Chuyến đi của tôi
            </Link>
            <a href="#kham-pha" className="hover:text-indigo-600 transition-colors">
              Khám phá địa điểm
            </a>
            <a href="#lich-trinh" className="hover:text-indigo-600 transition-colors">
              Lịch trình
            </a>
            <a href="#chi-phi" className="hover:text-indigo-600 transition-colors">
              Chi phí
            </a>
          </nav>

          {/* Actions: + Tạo chuyến đi & User Profile */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:opacity-95 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo chuyến đi mới</span>
            </Link>

            {/* Notification Bell */}
            <Link
              href="/dashboard"
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
              title="Thông báo"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            </Link>

            {/* User Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
              >
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={fullName}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    {getInitials(fullName)}
                  </div>
                )}
                <span className="text-xs font-bold text-slate-800 hidden sm:inline">
                  {fullName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs animate-fadeIn">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900">{fullName}</p>
                    <p className="text-slate-400 text-[11px] truncate">{email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-700 font-medium"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>Chuyến đi của tôi</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
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

      {/* 2. MAIN CONTENT CONTAINER */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <Link href="/dashboard" className="flex items-center gap-1 hover:text-slate-700 transition-colors">
            <span>🏠 Trang chủ</span>
          </Link>
          <span>›</span>
          <span className="text-slate-500">Cài đặt</span>
          <span>›</span>
          <span className="text-slate-900 font-bold">Hồ sơ cá nhân</span>
        </div>

        {/* Page Title & Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#eeedfd] text-[#5235ab] mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5235ab]"></span>
              <span>Tài khoản thành viên</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hồ sơ cá nhân
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Quản lý thông tin cá nhân và cách bạn hiển thị với các thành viên khác trong nhóm du lịch.
            </p>
          </div>

          {/* Right Status Badge */}
          <div className="bg-white rounded-2xl py-2 px-3.5 border border-slate-100 shadow-2xs self-start sm:self-auto shrink-0 flex items-center gap-2 text-xs font-semibold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              Đang trực tuyến • <span className="text-slate-500 font-normal">Sẵn sàng chuyến đi mới</span>
            </span>
          </div>
        </div>

        {/* Hidden File Input for Avatar Upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarFileChange}
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
        />

        {/* ========================================================
            CARD 1: ẢNH ĐẠI DIỆN
           ======================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar Container with Gradient Ring & Camera Button */}
          <div className="relative shrink-0">
            <div className="p-1 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-indigo-500 shadow-md shadow-purple-500/15">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={fullName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-2 ring-white"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl ring-2 ring-white">
                  {getInitials(fullName)}
                </div>
              )}
            </div>

            {/* Quick Camera Icon Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white text-indigo-600 hover:text-indigo-700 border border-slate-100 shadow-md flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
              title="Đổi ảnh đại diện"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Avatar Details & Actions */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2.5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Ảnh đại diện
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                Công khai
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-lg leading-relaxed">
              Hỗ trợ định dạng PNG, JPG kích thước tối đa 5MB. Ảnh rõ mặt giúp bạn bè dễ nhận ra bạn trong danh sách nhóm du lịch và bảng chia chi phí.
            </p>

            {/* Buttons */}
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#eeedfd] hover:bg-[#e2e0fb] text-[#5235ab] text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? "Đang tải lên..." : "Tải ảnh mới"}</span>
              </button>

              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa ảnh</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            CARD 2: THÔNG TIN CÁ NHÂN
           ======================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-6">
          {/* Card Header */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Thông tin cá nhân
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              * Các trường bắt buộc
            </span>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Field 1: Họ và tên */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Họ và tên <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên..."
                  className="w-full bg-[#f8f9fc] border border-slate-200/80 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Field 2: Biệt danh / Tên hiển thị trong nhóm */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Biệt danh / Tên hiển thị trong nhóm
                </label>
                <span className="text-[11px] text-slate-400">Tùy chọn</span>
              </div>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Ví dụ: Nam Balo 🎒"
                  className="w-full bg-[#f8f9fc] border border-slate-200/80 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Field 3: Số điện thoại (+84 country code) */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Số điện thoại
              </label>
              <div className="flex items-center gap-2">
                <div className="px-3 py-2.5 rounded-xl bg-[#f8f9fc] border border-slate-200/80 text-xs font-bold text-slate-700 flex items-center gap-1.5 shrink-0 select-none">
                  <span>🇻🇳</span>
                  <span>+84</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full bg-[#f8f9fc] border border-slate-200/80 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Field 4: Địa chỉ Email (with link change & verified badge) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Địa chỉ Email
                </label>
                <button
                  type="button"
                  onClick={() => setShowEmailModal(true)}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                >
                  Đổi email liên kết
                </button>
              </div>
              <div className="relative">
                <AtSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  readOnly
                  value={email}
                  className="w-full bg-[#f8f9fc] border border-slate-200/80 rounded-xl pl-9 pr-24 py-2.5 text-xs sm:text-sm font-medium text-slate-800 select-none cursor-default"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Đã xác thực</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Field 5: Giới thiệu ngắn (Bio) */}
            <div className="col-span-full">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Giới thiệu ngắn (Bio)
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  {bio.length}/300 ký tự
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={300}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Chia sẻ vài dòng về sở thích du lịch, phong cách phượt của bạn..."
                className="w-full bg-[#f8f9fc] border border-slate-200/80 rounded-xl p-3.5 text-xs sm:text-sm font-medium text-slate-800 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* ========================================================
            CARD 3: THÀNH TÍCH & HOẠT ĐỘNG NHÓM
           ======================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-5">
          {/* Card Header */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Thành tích & Hoạt động nhóm
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Dữ liệu tính từ đầu năm 2025
            </span>
          </div>

          {/* 3 Metric Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Metric 1: Chuyến đi tham gia */}
            <div className="p-4 rounded-2xl bg-[#f0f3ff] border border-indigo-100/70 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Chuyến đi tham gia
                </span>
                <span className="text-lg sm:text-xl font-extrabold text-slate-900 block mt-0.5">
                  7 chuyến đi
                </span>
                <span className="text-[10px] font-bold text-indigo-600 mt-1 inline-flex items-center gap-0.5">
                  <span>↗</span> +2 so với tháng trước
                </span>
              </div>
            </div>

            {/* Metric 2: Điểm đến đã qua */}
            <div className="p-4 rounded-2xl bg-[#fff2f2] border border-rose-100/70 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Điểm đến đã qua
                </span>
                <span className="text-lg sm:text-xl font-extrabold text-slate-900 block mt-0.5">
                  12 tỉnh thành
                </span>
                <div className="w-full bg-rose-200/50 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-rose-500 h-full w-[65%] rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Metric 3: Huy hiệu nhóm */}
            <div className="p-4 rounded-2xl bg-[#f8f5ff] border border-purple-100/70 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Huy hiệu nhóm
                </span>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ffedd5] text-[#9a3412] text-[11px] font-extrabold mt-1 border border-orange-200/80">
                  <span>Thủ quỹ uy tín ⭐</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Được 6 đồng đội bình chọn
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            BOTTOM ACTIONS
           ======================================================== */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleResetForm}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:opacity-95 shadow-md shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Đang lưu..." : "Lưu thay đổi"}</span>
          </button>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-6 border-t border-slate-200/60 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">Trippo</span>
          <span>— Lên lịch và đồng hành du lịch cùng nhau</span>
        </div>
        <p>© 2025 Trippo Technologies. Bảo lưu mọi quyền.</p>
      </footer>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3 text-xs animate-slideUp">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span className="font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* CHANGE EMAIL MODAL */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Đổi địa chỉ Email liên kết
              </h3>
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mã xác thực bảo mật sẽ được gửi đến email mới này để hoàn tất xác nhận liên kết tài khoản Trippo.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email mới
              </label>
              <input
                type="email"
                value={tempEmail}
                onChange={(e) => setTempEmail(e.target.value)}
                placeholder="nhap.email.moi@vidu.com"
                className="w-full bg-[#f8f9fc] border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  if (tempEmail && tempEmail.includes("@")) {
                    setEmail(tempEmail);
                    setShowEmailModal(false);
                    triggerToast("Đã gửi mã xác nhận đến email mới!");
                  }
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all cursor-pointer"
              >
                Gửi mã xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
