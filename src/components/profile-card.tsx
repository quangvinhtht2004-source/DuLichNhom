"use client";

import React, { useState, useEffect, useRef } from "react";
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
  AlertCircle,
  Check,
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

  // Sidebar Tab
  const [activeSidebarTab, setActiveSidebarTab] = useState<"profile" | "security" | "notifications">("profile");

  // User menu dropdown
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  // Success/error toast state
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastInfo, setToastInfo] = useState<{
    type: "success" | "error";
    title: string;
    text: string;
  } | null>(null);

  // Profile Form State
  const [avatarSrc, setAvatarSrc] = useState<string | null>(serverProfile?.avatar_url || null);
  const [fullName, setFullName] = useState<string>(serverProfile?.full_name || "");
  const [phone, setPhone] = useState<string>(serverProfile?.phone || "");
  const [email, setEmail] = useState<string>(serverProfile?.email || "");
  const [joinDate, setJoinDate] = useState<string>(() => {
    if (serverProfile?.created_at) {
      const d = new Date(serverProfile.created_at);
      return `Tham gia từ Tháng ${d.getMonth() + 1}, ${d.getFullYear()}`;
    }
    return "Mới tham gia";
  });
  const [bio, setBio] = useState<string>(
    "Đam mê du lịch, khám phá và chia sẻ các chuyến đi cùng bạn bè."
  );

  const [initialProfile, setInitialProfile] = useState<{
    fullName: string;
    phone: string;
    avatarSrc: string | null;
  } | null>(
    serverProfile
      ? {
          fullName: serverProfile.full_name || "",
          phone: serverProfile.phone || "",
          avatarSrc: serverProfile.avatar_url || null,
        }
      : null
  );

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [showCurrentPass, setShowCurrentPass] = useState<boolean>(false);
  const [showNewPass, setShowNewPass] = useState<boolean>(false);
  const [showConfirmPass, setShowConfirmPass] = useState<boolean>(false);
  const [authProvider, setAuthProvider] = useState<string>("email");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState<boolean>(false);

  // Status message for password
  const [passwordToast, setPasswordToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Load Profile from API on Mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/profile");
        if (res.ok) {
          const json = await res.json();
          const p = json?.profile;
          if (p) {
            const name = p.full_name || "";
            const tel = p.phone || "";
            const mail = p.email || "";
            const ava = p.avatar_url || null;
            if (p.provider) setAuthProvider(p.provider);

            setFullName(name);
            setPhone(tel);
            setEmail(mail);
            setAvatarSrc(ava);

            if (typeof window !== "undefined") {
              if (name) sessionStorage.setItem("user_full_name", name);
              if (ava) sessionStorage.setItem("user_avatar_url", ava);
              if (mail) sessionStorage.setItem("user_email", mail);
            }

            if (p.created_at) {
              const d = new Date(p.created_at);
              setJoinDate(`Tham gia từ Tháng ${d.getMonth() + 1}, ${d.getFullYear()}`);
            }

            setInitialProfile({
              fullName: name,
              phone: tel,
              avatarSrc: ava,
            });
          }
        } else if (res.status === 401) {
          router.push("/");
        }
      } catch (err) {
        console.error("Lỗi tải thông tin hồ sơ:", err);
      }
    };
    fetchProfile();
  }, [router]);

  // Helper: Get user initials
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Handle Avatar Upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setAvatarSrc(reader.result);
        }
      };
      reader.readAsDataURL(file);

      setIsUploadingAvatar(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/auth/profile/avatar", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data?.profile?.avatar_url) {
          setAvatarSrc(data.profile.avatar_url);
          setToastInfo({
            type: "success",
            title: "Cập nhật ảnh đại diện thành công!",
            text: "Ảnh đại diện mới đã được cập nhật an toàn.",
          });
          setShowToast(true);
          setTimeout(() => setShowToast(false), 4000);
        } else {
          throw new Error(data.error || "Không thể tải lên ảnh đại diện");
        }
      } catch (err: any) {
        setToastInfo({
          type: "error",
          title: "Tải ảnh đại diện thất bại",
          text: err.message || "Vui lòng thử lại sau.",
        });
        setShowToast(true);
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setToastInfo(null);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          phone: phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể cập nhật hồ sơ");
      }
      setInitialProfile({
        fullName: fullName,
        phone: phone,
        avatarSrc: avatarSrc,
      });
      if (typeof window !== "undefined") {
        sessionStorage.setItem("user_full_name", fullName);
      }
      setToastInfo({
        type: "success",
        title: "Cập nhật hồ sơ thành công!",
        text: "Thông tin cá nhân của bạn đã được lưu an toàn trên TripTogether.",
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } catch (err: any) {
      setToastInfo({
        type: "error",
        title: "Cập nhật thất bại",
        text: err.message || "Vui lòng kiểm tra lại thông tin.",
      });
      setShowToast(true);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Reset Form
  const handleResetProfile = () => {
    if (initialProfile) {
      setFullName(initialProfile.fullName);
      setPhone(initialProfile.phone);
      setAvatarSrc(initialProfile.avatarSrc);
    }
  };

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

  // Helper: check birthday patterns
  const isBirthdayPattern = (pwd: string) => {
    if (!pwd) return false;
    const delimitedDate = /\b(0[1-9]|[12]\d|3[01])[-/.](0[1-9]|1[0-2])[-/.](19\d{2}|20\d{2}|\d{2})\b/;
    const delimitedDateRev = /\b(19\d{2}|20\d{2})[-/.](0[1-9]|1[0-2])[-/.](0[1-9]|[12]\d|3[01])\b/;
    if (delimitedDate.test(pwd) || delimitedDateRev.test(pwd)) return true;

    const ddmmyyyy = /(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])(19\d{2}|20\d{2})/;
    const yyyymmdd = /(19\d{2}|20\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])/;
    const mmddyyyy = /(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])(19\d{2}|20\d{2})/;
    if (ddmmyyyy.test(pwd) || yyyymmdd.test(pwd) || mmddyyyy.test(pwd)) return true;

    const ddmmyy = /(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])(\d{2})/;
    const yymmdd = /(\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])/;
    if (ddmmyy.test(pwd) || yymmdd.test(pwd)) return true;

    return false;
  };

  const isTypingNewPass = newPassword.length > 0;
  const hasMinLengthAndDigit = newPassword.length >= 8 && /\d/.test(newPassword);
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasBirthday = isTypingNewPass && isBirthdayPattern(newPassword);
  const isBirthdaySafe = isTypingNewPass && !hasBirthday;

  // Handle Update Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (authProvider !== "google" && !currentPassword) {
      setPasswordToast({ type: "error", text: "Vui lòng nhập mật khẩu hiện tại!" });
      return;
    }

    if (!newPassword) {
      setPasswordToast({ type: "error", text: "Vui lòng nhập mật khẩu mới!" });
      return;
    }

    if (!hasMinLengthAndDigit) {
      setPasswordToast({
        type: "error",
        text: "Mật khẩu mới phải có tối thiểu 8 ký tự và chứa ít nhất một chữ số!",
      });
      return;
    }

    if (!hasUppercase) {
      setPasswordToast({
        type: "error",
        text: "Mật khẩu mới phải chứa ít nhất một ký tự viết hoa (A-Z)!",
      });
      return;
    }

    if (hasBirthday) {
      setPasswordToast({
        type: "error",
        text: "Mật khẩu mới không được chứa định dạng ngày tháng năm sinh!",
      });
      return;
    }

    if (!confirmPassword) {
      setPasswordToast({ type: "error", text: "Vui lòng nhập lại mật khẩu mới để xác nhận!" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordToast({ type: "error", text: "Mật khẩu mới và xác nhận mật khẩu không khớp!" });
      return;
    }

    if (currentPassword && currentPassword === newPassword) {
      setPasswordToast({
        type: "error",
        text: "Mật khẩu mới không được trùng với mật khẩu hiện tại!",
      });
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordToast(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: newPassword,
          current_password: currentPassword || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Đổi mật khẩu thất bại");
      }
      setPasswordToast({ type: "success", text: "Đổi mật khẩu thành công!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordToast({ type: "error", text: err.message || "Đổi mật khẩu thất bại" });
    } finally {
      setIsUpdatingPassword(false);
      setTimeout(() => setPasswordToast(null), 5000);
    }
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
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-slate-200 hover:border-slate-300 transition-all bg-white cursor-pointer"
              >
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={fullName || "User"}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#004d53] text-white font-bold text-[10px] flex items-center justify-center ring-1 ring-slate-200">
                    {getInitials(fullName)}
                  </div>
                )}
                <span className="text-xs font-semibold text-slate-700">
                  {fullName || "Tài khoản"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs animate-fadeIn">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-semibold text-slate-900">{fullName || "Người dùng"}</p>
                    <p className="text-slate-400 text-[11px] truncate">{email || "Đang tải..."}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-700"
                  >
                    <Compass className="w-3.5 h-3.5 text-slate-400" />
                    <span>Chuyến đi của tôi</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-rose-50 text-rose-600 cursor-pointer"
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

          {/* Success / Error Toast Notification */}
          {showToast && toastInfo && (
            <div className="bg-white border border-slate-200/90 shadow-lg shadow-slate-200/50 rounded-2xl p-4 flex items-start gap-3 max-w-md animate-fadeIn">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  toastInfo.type === "success"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-rose-50 text-rose-600"
                }`}
              >
                {toastInfo.type === "success" ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 pr-2">
                <h4 className="text-xs font-bold text-slate-900">
                  {toastInfo.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  {toastInfo.text}
                </p>
              </div>
              <button
                onClick={() => setShowToast(false)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md cursor-pointer"
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
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={fullName || "User"}
                      className="w-24 h-24 rounded-full object-cover ring-4 ring-slate-100 shadow-sm"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#004d53] to-teal-500 text-white font-bold text-2xl flex items-center justify-center ring-4 ring-slate-100 shadow-sm">
                      {getInitials(fullName)}
                    </div>
                  )}
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
                    disabled={isUploadingAvatar}
                    title="Đổi ảnh đại diện"
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#004d53] text-white flex items-center justify-center border-2 border-white shadow-md hover:bg-[#00393d] transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Name, Badges and Guidelines */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">
                      {fullName || "Đang tải tên..."}
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
                      Việt Nam
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {joinDate}
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
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#004d53] hover:bg-[#00383d] text-white text-xs font-semibold shadow-md shadow-teal-950/15 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60"
                  >
                    <span>{isSaving ? "Đang lưu..." : "✓ Lưu thay đổi"}</span>
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
                <div
                  className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                    passwordToast.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {passwordToast.type === "success" ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{passwordToast.text}</span>
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
                  {/* 1. Tối thiểu 8 ký tự kèm chữ số */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border transition-all duration-150 ${
                      hasMinLengthAndDigit
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold shadow-xs"
                        : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}
                  >
                    {hasMinLengthAndDigit ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <span className="text-slate-400">✓</span>
                    )}
                    <span>Tối thiểu 8 ký tự kèm chữ số</span>
                  </span>

                  {/* 2. Có ít nhất một ký tự viết hoa */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border transition-all duration-150 ${
                      hasUppercase
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold shadow-xs"
                        : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}
                  >
                    {hasUppercase ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <span className="text-slate-400">✓</span>
                    )}
                    <span>Có ít nhất một ký tự viết hoa</span>
                  </span>

                  {/* 3. Không trùng ngày sinh */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border transition-all duration-150 ${
                      hasBirthday
                        ? "bg-rose-50 text-rose-700 border-rose-300 font-semibold shadow-xs"
                        : isBirthdaySafe
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold shadow-xs"
                        : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}
                  >
                    {hasBirthday ? (
                      <X className="w-3.5 h-3.5 text-rose-600" />
                    ) : isBirthdaySafe ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <span className="text-slate-400">✓</span>
                    )}
                    <span>
                      {hasBirthday ? "Trùng định dạng ngày sinh" : "Không trùng ngày sinh"}
                    </span>
                  </span>
                </div>

                {/* Submit Password */}
                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#006070] hover:bg-[#004d5a] text-white text-xs font-semibold shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{isUpdatingPassword ? "Đang cập nhật..." : "Cập nhật mật khẩu"}</span>
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

