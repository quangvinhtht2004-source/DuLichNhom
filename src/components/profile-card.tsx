"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  User,
  Shield,
  Bell,
  ChevronRight,
  Camera,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Lock,
  Info,
  CheckCircle,
  X,
  KeyRound,
  Eye,
  EyeOff,
  RotateCcw,
  Briefcase,
  ChevronDown,
  LogOut,
  Compass,
} from "lucide-react";

export default function ProfileCard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sidebar Tab
  const [activeSidebarTab, setActiveSidebarTab] = useState<"profile" | "security" | "notifications">("profile");

  // User menu dropdown
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  // Success toast state
  const [showToast, setShowToast] = useState<boolean>(true);

  // Profile Form State
  const [avatarSrc, setAvatarSrc] = useState<string>(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop"
  );
  const [fullName, setFullName] = useState<string>("Lê Hải Yến");
  const [phone, setPhone] = useState<string>("+84 912 345 678");
  const [email] = useState<string>("haiyen.traveler@gmail.com");
  const [bio, setBio] = useState<string>(
    "Đam mê trekking, chụp ảnh phong cảnh và tổ chức các tour khám phá vùng cao cùng bạn bè. Thích lập kế hoạch chi tiết và chia sẻ chi phí minh bạch."
  );

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [showCurrentPass, setShowCurrentPass] = useState<boolean>(false);
  const [showNewPass, setShowNewPass] = useState<boolean>(false);
  const [showConfirmPass, setShowConfirmPass] = useState<boolean>(false);

  // Status message for password
  const [passwordToast, setPasswordToast] = useState<string | null>(null);

  // Handle Avatar Upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setAvatarSrc(reader.result);
          setShowToast(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Save Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setShowToast(true);
  };

  // Handle Reset Form
  const handleResetProfile = () => {
    setFullName("Lê Hải Yến");
    setPhone("+84 912 345 678");
    setBio(
      "Đam mê trekking, chụp ảnh phong cảnh và tổ chức các tour khám phá vùng cao cùng bạn bè. Thích lập kế hoạch chi tiết và chia sẻ chi phí minh bạch."
    );
  };

  // Handle Update Password
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordToast("Vui lòng điền đầy đủ thông tin mật khẩu!");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordToast("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordToast("Mật khẩu mới phải có tối thiểu 8 ký tự!");
      return;
    }
    setPasswordToast("Đổi mật khẩu thành công!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordToast(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans pb-16">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#004d53] flex items-center justify-center text-white shadow-sm">
              <svg
                className="w-4 h-4 fill-current transform rotate-[15deg]"
                viewBox="0 0 24 24"
              >
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              TripTogether
            </span>
          </Link>

          {/* Center Navigation Pills */}
          <nav className="hidden md:flex items-center gap-1 bg-[#f1f5f8] p-1 rounded-full border border-slate-200/60">
            <Link
              href="/dashboard"
              className="text-slate-600 hover:text-slate-900 px-4 py-1.5 rounded-full text-xs font-medium transition-all"
            >
              Chuyến đi của tôi
            </Link>
            <button className="text-slate-600 hover:text-slate-900 px-4 py-1.5 rounded-full text-xs font-medium transition-all">
              Khám phá
            </button>
            <button className="text-slate-600 hover:text-slate-900 px-4 py-1.5 rounded-full text-xs font-medium transition-all">
              Lập kế hoạch nhóm
            </button>
          </nav>

          {/* Right User Actions */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-slate-200 hover:border-slate-300 transition-all bg-white"
              >
                <img
                  src={avatarSrc}
                  alt={fullName}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                />
                <span className="text-xs font-semibold text-slate-700">
                  {fullName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs animate-fadeIn">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-semibold text-slate-900">{fullName}</p>
                    <p className="text-slate-400 text-[11px]">{email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-700"
                  >
                    <Compass className="w-3.5 h-3.5 text-slate-400" />
                    <span>Chuyến đi của tôi</span>
                  </Link>
                  <button
                    onClick={() => router.push("/")}
                    className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-rose-50 text-rose-600"
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

      {/* 2. BREADCRUMBS, TITLE & SUCCESS TOAST */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <Link href="/dashboard" className="hover:text-slate-800">
                Trang chủ
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-slate-700 font-medium">Cài đặt tài khoản</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hồ sơ cá nhân
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Quản lý thông tin tài khoản và tùy chọn bảo mật cho các chuyến đi nhóm
            </p>
          </div>

          {/* Success Toast Notification */}
          {showToast && (
            <div className="bg-white border border-slate-200/90 shadow-lg shadow-slate-200/50 rounded-2xl p-4 flex items-start gap-3 max-w-md animate-fadeIn">
              <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="flex-1 pr-2">
                <h4 className="text-xs font-bold text-slate-900">
                  Cập nhật hồ sơ thành công!
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Thông tin cá nhân của bạn đã được lưu an toàn trên TripTogether.
                </p>
              </div>
              <button
                onClick={() => setShowToast(false)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. MAIN 2-COLUMN LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT SIDEBAR (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Sidebar Navigation */}
            <div className="bg-white rounded-3xl p-3 border border-slate-200/70 shadow-sm space-y-1">
              <button
                onClick={() => setActiveSidebarTab("profile")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                  activeSidebarTab === "profile"
                    ? "bg-[#004d53] text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4" />
                  <span>Hồ sơ cá nhân</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveSidebarTab("security")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                  activeSidebarTab === "security"
                    ? "bg-[#004d53] text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4" />
                  <span>Bảo mật & Đăng nhập</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-100">
                  2FA
                </span>
              </button>

              <button
                onClick={() => setActiveSidebarTab("notifications")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                  activeSidebarTab === "notifications"
                    ? "bg-[#004d53] text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4" />
                  <span>Thông báo chuyến đi</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              </button>
            </div>

            {/* Traveler Status Card */}
            <div className="bg-[#f0f8f9] rounded-3xl p-5 border border-teal-100 shadow-sm">
              <div className="flex items-center gap-2 text-[#004d53]">
                <Briefcase className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Trạng thái lữ hành
                </h3>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Đã tham gia <span className="font-bold text-slate-900">14 chuyến đi</span> cùng{" "}
                <span className="font-bold text-slate-900">28 bạn đồng hành</span> trên TripTogether.
              </p>

              {/* Profile Completion Bar */}
              <div className="mt-4 pt-3 border-t border-teal-100/80">
                <div className="w-full h-2 rounded-full bg-teal-100 overflow-hidden">
                  <div
                    className="h-full bg-[#004d53] rounded-full transition-all duration-500"
                    style={{ width: "82%" }}
                  />
                </div>
                <div className="text-right mt-1.5">
                  <span className="text-[11px] font-semibold text-slate-500">
                    Độ hoàn thiện hồ sơ: <strong className="text-slate-800">82%</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT MAIN CONTENT (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* CARD 1: THÔNG TIN CÁ NHÂN & ẢNH ĐẠI DIỆN */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/70 shadow-sm">
              {/* Avatar and Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-100">
                {/* Avatar with Camera Button */}
                <div className="relative group shrink-0">
                  <img
                    src={avatarSrc}
                    alt={fullName}
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-slate-100 shadow-sm"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Đổi ảnh đại diện"
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#004d53] text-white flex items-center justify-center border-2 border-white shadow-md hover:bg-[#00393d] transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Name, Badges and Guidelines */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">
                      {fullName}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e6f4f8] text-[#0f6c82] border border-cyan-100">
                      Trưởng nhóm lữ hành
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Thành viên thân thiết
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1">
                    Ảnh định dạng JPG, PNG hoặc GIF. Dung lượng tối đa 5MB. Khuyên dùng ảnh vuông tối thiểu 400x400px.
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      Hà Nội, Việt Nam
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Tham gia từ Tháng 3, 2023
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleSaveProfile} className="mt-6 space-y-5">
                {/* Row 1: Full Name & Phone Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Họ và tên <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-[#004d53] focus:ring-2 focus:ring-[#004d53]/15 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Số điện thoại <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-[#004d53] focus:ring-2 focus:ring-[#004d53]/15 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Email (Locked) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Địa chỉ Email
                    </label>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Đã xác thực
                    </span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      disabled
                      value={email}
                      className="w-full text-xs sm:text-sm rounded-xl pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 text-slate-500 cursor-not-allowed outline-none"
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="flex items-center gap-1 text-[11px] text-slate-400 mt-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Email đăng nhập không thể thay đổi trực tiếp. Vui lòng liên hệ hỗ trợ viên nếu cần đổi email chính.
                    </span>
                  </p>
                </div>

                {/* Row 3: Bio / Về bản thân */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Giới thiệu ngắn (Bio / Về bản thân)
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {bio.length}/300 ký tự
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={300}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl p-3 bg-white border border-slate-200 focus:border-[#004d53] focus:ring-2 focus:ring-[#004d53]/15 outline-none transition-all"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleResetProfile}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#004d53] hover:bg-[#00383d] text-white text-xs font-semibold shadow-md shadow-teal-950/15 transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <span>✓ Lưu thay đổi</span>
                  </button>
                </div>
              </form>
            </div>

            {/* CARD 2: ĐỔI MẬT KHẨU */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/70 shadow-sm">
              <div className="flex items-start gap-3 pb-5 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-[#e6f4f8] text-[#007084] flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Đổi mật khẩu
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Nên sử dụng mật khẩu mạnh gồm chữ hoa, chữ thường, số và ký tự đặc biệt để bảo vệ tài khoản nhóm.
                  </p>
                </div>
              </div>

              {passwordToast && (
                <div className="mt-4 p-3 rounded-xl text-xs bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-sky-600" />
                  <span>{passwordToast}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="mt-5 space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Mật khẩu hiện tại
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full text-xs sm:text-sm rounded-xl pl-10 pr-10 py-2.5 bg-white border border-slate-200 focus:border-[#004d53] focus:ring-2 focus:ring-[#004d53]/15 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showNewPass ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Ít nhất 8 ký tự"
                        className="w-full text-xs sm:text-sm rounded-xl pl-10 pr-10 py-2.5 bg-white border border-slate-200 focus:border-[#004d53] focus:ring-2 focus:ring-[#004d53]/15 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Xác nhận mật khẩu mới
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu mới"
                        className="w-full text-xs sm:text-sm rounded-xl pl-10 pr-10 py-2.5 bg-white border border-slate-200 focus:border-[#004d53] focus:ring-2 focus:ring-[#004d53]/15 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Criteria Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium border ${
                      newPassword.length >= 8 && /\d/.test(newPassword)
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}
                  >
                    ✓ Tối thiểu 8 ký tự kèm chữ số
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium border ${
                      /[A-Z]/.test(newPassword)
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}
                  >
                    ✓ Có ít nhất một ký tự viết hoa
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium bg-slate-50 text-slate-500 border border-slate-200">
                    ✓ Không trùng ngày sinh
                  </span>
                </div>

                {/* Submit Password */}
                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#006070] hover:bg-[#004d5a] text-white text-xs font-semibold shadow-md transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Cập nhật mật khẩu</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* 4. FOOTER */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 mt-12 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#004d53] flex items-center justify-center text-white text-[10px]">
            ✈
          </div>
          <span className="font-bold text-slate-800">TripTogether</span>
          <span>© 2025 TripTogether Inc. Tất cả quyền được bảo lưu.</span>
        </div>

        <div className="flex items-center gap-5">
          <a href="#dieukhoan" className="hover:underline">
            Điều khoản sử dụng
          </a>
          <a href="#quyenriengtu" className="hover:underline">
            Chính sách bảo mật
          </a>
          <a href="#trogiup" className="hover:underline">
            Trung tâm trợ giúp
          </a>
          <a href="#hotro" className="hover:underline">
            Liên hệ hỗ trợ
          </a>
        </div>
      </footer>
    </div>
  );
}

