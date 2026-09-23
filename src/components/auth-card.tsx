"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Compass,
  Plane,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

type AuthTab = "login" | "register" | "forgot";

export default function AuthCard() {
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState<AuthTab>("login");

  // Form input states
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);

  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");

  const [registerName, setRegisterName] = useState<string>("");
  const [registerEmail, setRegisterEmail] = useState<string>("");
  const [registerPassword, setRegisterPassword] = useState<string>("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState<string>("");

  const [forgotEmail, setForgotEmail] = useState<string>("");

  // Loading & Message
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setStatusMessage({ type: "error", text: "Vui lòng nhập đầy đủ email và mật khẩu!" });
      return;
    }
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Email hoặc mật khẩu không chính xác");
      }
      setStatusMessage({ type: "success", text: "Đăng nhập thành công! Đang chuyển hướng..." });
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Đăng nhập thất bại" });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPassword || !registerConfirmPassword) {
      setStatusMessage({ type: "error", text: "Vui lòng điền đầy đủ các thông tin cần thiết!" });
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      setStatusMessage({ type: "error", text: "Mật khẩu xác nhận không khớp!" });
      return;
    }
    if (registerPassword.length < 6) {
      setStatusMessage({ type: "error", text: "Mật khẩu phải có tối thiểu 6 ký tự!" });
      return;
    }
    if (!agreeTerms) {
      setStatusMessage({ type: "error", text: "Vui lòng đồng ý với điều khoản sử dụng!" });
      return;
    }
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
          full_name: registerName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Đăng ký không thành công");
      }
      setStatusMessage({ type: "success", text: "Tạo tài khoản thành công! Đang chuyển hướng..." });
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Đăng ký thất bại" });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password Submit
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setStatusMessage({ type: "error", text: "Vui lòng nhập email khôi phục!" });
      return;
    }
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể gửi email khôi phục");
      }
      setStatusMessage({ type: "success", text: "Đã gửi liên kết khôi phục vào hộp thư của bạn!" });
      setTimeout(() => {
        setActiveTab("login");
      }, 3000);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Gửi yêu cầu thất bại" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
      {/* =========================================
          LEFT PANE: HERO SCENERY & BRAND STORY (50%)
          ========================================= */}
      <div className="relative w-full lg:w-1/2 min-h-[480px] lg:min-h-screen overflow-hidden flex flex-col justify-between p-7 sm:p-10 lg:p-14 text-white">
        {/* Snowy Mountain & Mist Background Image */}
        <img
          src="/images/auth/hero-bg.png"
          alt="WeTravel Purple Snowy Mountain"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Soft Purple/Pink Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e0e33]/90 via-[#2f1b4d]/40 to-[#100720]/30" />

        {/* Top Badges Bar */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          {/* Brand Pill Left */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-white text-xs font-bold tracking-wide shadow-sm">
            <Compass className="w-3.5 h-3.5 text-white" />
            <span>WETRAVEL</span>
          </div>

          {/* Hot Destinations Pill Right */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-white text-xs font-medium shadow-sm">
            <span className="w-2 h-2 rounded-full bg-pink-300 animate-pulse" />
            <span>45+ Điểm đến đang hot</span>
          </div>
        </div>

        {/* Middle/Bottom Main Typography & Story */}
        <div className="relative z-10 my-auto py-10 lg:py-0">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-200 tracking-wide mb-3">
            <Plane className="w-3.5 h-3.5 text-pink-300 transform -rotate-45" />
            <span>Hành trình không lo âu</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight drop-shadow-md">
            Cùng bạn bè tạo nên<br />
            những chuyến đi đáng<br />
            nhớ.
          </h1>

          <p className="text-xs sm:text-sm text-purple-100/90 mt-4 leading-relaxed max-w-lg font-normal">
            Lên lịch trình thông minh theo thời gian thực, chia sẻ chi phí minh bạch và khám phá thế giới cùng hội cạ cứng của bạn.
          </p>

          {/* Social Proof Glass Card */}
          <div className="mt-8 p-3.5 sm:p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xl max-w-lg">
            {/* Left: Avatar Stack with badges */}
            <div className="flex items-center gap-3">
              <div className="flex items-center -space-x-2 shrink-0">
                <img
                  src="/images/auth/badge-1.jpg"
                  alt="Adventure Awaits"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white/80 shadow-md"
                />
                <img
                  src="/images/auth/badge-2.jpg"
                  alt="Tropical Escape"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white/80 shadow-md"
                />
                <img
                  src="/images/auth/badge-3.jpg"
                  alt="Mountain Mist"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white/80 shadow-md"
                />
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white text-[11px] font-extrabold flex items-center justify-center ring-2 ring-white/80 shadow-md">
                  +1k
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-white leading-tight">
                  Hơn 1,000+ nhóm bạn
                </p>
                <p className="text-[11px] text-purple-200/80 leading-tight mt-0.5">
                  Đồng hành qua 45 quốc gia
                </p>
              </div>
            </div>

            {/* Right: Star Ratings */}
            <div className="text-left sm:text-right shrink-0">
              <div className="flex items-center sm:justify-end gap-1 text-amber-400 text-xs">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>
              <p className="text-xs font-bold text-white mt-0.5">
                4.9 / 5.0 (2.4k đánh giá)
              </p>
            </div>
          </div>
        </div>

        {/* Left Bottom Space */}
        <div className="relative z-10 text-[11px] text-purple-200/60 hidden lg:block">
          © 2025 WeTravel. Nền tảng du lịch nhóm thông minh.
        </div>
      </div>

      {/* =========================================
          RIGHT PANE: AUTHENTICATION FORMS (50%)
          ========================================= */}
      <div className="w-full lg:w-1/2 min-h-screen bg-gradient-to-b from-[#fbfcfe] via-[#f7f9fd] to-[#f4f7fc] flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-[420px] mx-auto my-auto py-6">
          {/* Top Logo & Slogan */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center mb-2">
              {/* Colorful Trippo Brand Icon */}
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[2px] shadow-md shadow-indigo-500/20">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 font-extrabold text-xs tracking-tight">
                    Trippo
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Lập kế hoạch & đồng hành mọi nẻo đường cùng bạn bè
            </p>
          </div>

          {/* Segmented Switcher: Đăng nhập / Đăng ký */}
          {activeTab !== "forgot" && (
            <div className="p-1 rounded-2xl bg-[#ebf0f7] flex max-w-sm mx-auto w-full mb-5 select-none">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("login");
                  setStatusMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                  activeTab === "login"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("register");
                  setStatusMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                  activeTab === "register"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Đăng ký
              </button>
            </div>
          )}

          {/* Google Button */}
          {activeTab !== "forgot" && (
            <button
              type="button"
              onClick={() => (window.location.href = "/api/auth/google")}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-sm font-semibold text-slate-700 flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer mb-5 active:scale-[0.99]"
            >
              {/* Google 4-color SVG */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Tiếp tục với Google</span>
            </button>
          )}

          {/* Divider */}
          {activeTab !== "forgot" && (
            <div className="relative flex items-center justify-center mb-5">
              <div className="w-full border-t border-slate-200" />
              <span className="absolute px-3 text-xs text-slate-400 bg-[#f8fafe] font-medium">
                hoặc tiếp tục với email
              </span>
            </div>
          )}

          {/* Status / Toast Notification */}
          {statusMessage && (
            <div
              className={`mb-4 p-3 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* =========================================
              TAB 1: ĐĂNG NHẬP (LOGIN FORM)
              ========================================= */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Địa chỉ email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ban@vidu.com"
                    className="w-full bg-[#f1f5f9] border border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#f1f5f9] border border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl pl-10 pr-10 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Options: Remember me & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/30 accent-indigo-600"
                  />
                  <span className="text-xs text-slate-700 font-medium">Ghi nhớ tôi</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("forgot");
                    setStatusMessage(null);
                  }}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Primary Submit Button: Purple to Pink Gradient */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl text-white font-semibold text-sm transition-all duration-300 shadow-lg shadow-indigo-500/25 cursor-pointer bg-gradient-to-r from-[#4f46e5] via-[#7c3aed] to-[#db2777] hover:from-[#4338ca] hover:via-[#6d28d9] hover:to-[#be185d] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                <span>{isLoading ? "Đang xử lý..." : "Đăng nhập ngay"}</span>
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>

              {/* Bottom Support Link */}
              <div className="text-center pt-5">
                <p className="text-xs text-slate-500">
                  Cần hỗ trợ cho nhóm của bạn?{" "}
                  <a
                    href="#support"
                    className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    Liên hệ đội ngũ Trippo 24/7
                  </a>
                </p>
              </div>
            </form>
          )}

          {/* =========================================
              TAB 2: ĐĂNG KÝ (REGISTER FORM)
              ========================================= */}
          {activeTab === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Họ và tên
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-[#f1f5f9] border border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Địa chỉ email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="ban@vidu.com"
                    className="w-full bg-[#f1f5f9] border border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full bg-[#f1f5f9] border border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl pl-10 pr-10 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full bg-[#f1f5f9] border border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl pl-10 pr-10 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 accent-indigo-600"
                  />
                  <span className="text-xs text-slate-600 leading-snug">
                    Tôi đồng ý với{" "}
                    <a href="#terms" className="text-indigo-600 hover:underline">
                      Điều khoản dịch vụ
                    </a>{" "}
                    và{" "}
                    <a href="#privacy" className="text-indigo-600 hover:underline">
                      Chính sách bảo mật
                    </a>
                  </span>
                </label>
              </div>

              {/* Submit Register Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl text-white font-semibold text-sm transition-all duration-300 shadow-lg shadow-indigo-500/25 cursor-pointer bg-gradient-to-r from-[#4f46e5] via-[#7c3aed] to-[#db2777] hover:from-[#4338ca] hover:via-[#6d28d9] hover:to-[#be185d] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-3"
              >
                <span>{isLoading ? "Đang xử lý..." : "Đăng ký tài khoản"}</span>
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="text-center pt-3">
                <p className="text-xs text-slate-500">
                  Đã có tài khoản?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("login");
                      setStatusMessage(null);
                    }}
                    className="font-bold text-indigo-600 hover:underline"
                  >
                    Đăng nhập ngay
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* =========================================
              TAB 3: QUÊN MẬT KHẨU (FORGOT FORM)
              ========================================= */}
          {activeTab === "forgot" && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-base font-bold text-slate-900">
                  Khôi phục mật khẩu
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Nhập email đăng ký của bạn để nhận liên kết đặt lại mật khẩu.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Địa chỉ email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="ban@vidu.com"
                    className="w-full bg-[#f1f5f9] border border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl text-white font-semibold text-sm transition-all duration-300 shadow-lg shadow-indigo-500/25 cursor-pointer bg-gradient-to-r from-[#4f46e5] via-[#7c3aed] to-[#db2777] hover:from-[#4338ca] hover:via-[#6d28d9] hover:to-[#be185d] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                <span>{isLoading ? "Đang gửi..." : "Gửi liên kết đặt lại mật khẩu"}</span>
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login");
                    setStatusMessage(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay lại đăng nhập</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Right */}
        <div className="text-center text-[11px] text-slate-400 pt-4">
          Bằng việc tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi.
        </div>
      </div>
    </div>
  );
}
