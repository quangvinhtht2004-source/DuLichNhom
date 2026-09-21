"use client";

import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Globe,
  Sun,
  Moon,
  Check,
  ChevronDown,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type AuthTab = "login" | "register" | "forgot";
type Language = "vi" | "en";

export default function AuthCard() {
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [language, setLanguage] = useState<Language>("vi");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [showLangMenu, setShowLangMenu] = useState<boolean>(false);

  // Form states
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);

  // Input states
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [registerName, setRegisterName] = useState<string>("");
  const [registerEmail, setRegisterEmail] = useState<string>("");
  const [registerPassword, setRegisterPassword] = useState<string>("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState<string>("");
  const [forgotEmail, setForgotEmail] = useState<string>("");

  // Toast / Status message
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const t = {
    vi: {
      brandTag: "Quản lý du lịch nhóm",
      brandSlogan: "Khám phá thế giới cùng hội bạn thân",
      brandHeaderSub: "Shared journeys made effortless",
      tabLogin: "Đăng nhập",
      tabRegister: "Đăng ký",
      emailLabel: "Email",
      emailPlaceholder: "vidu@gmail.com",
      passwordLabel: "Mật khẩu",
      passwordPlaceholder: "••••••••",
      confirmPasswordLabel: "Xác nhận mật khẩu",
      nameLabel: "Họ và tên",
      namePlaceholder: "Nguyễn Văn A",
      rememberMe: "Ghi nhớ đăng nhập",
      forgotPassword: "Quên mật khẩu?",
      btnLogin: "Đăng nhập",
      btnRegister: "Đăng ký tài khoản",
      orContinueWith: "HOẶC TIẾP TỤC VỚI",
      googleLogin: "Đăng nhập với Google",
      googleRegister: "Đăng ký với Google",
      noAccount: "Chưa có tài khoản?",
      hasAccount: "Đã có tài khoản?",
      registerNow: "Đăng ký ngay",
      loginNow: "Đăng nhập ngay",
      agreeTerms: "Tôi đồng ý với Điều khoản sử dụng & Chính sách bảo mật",
      forgotTitle: "Khôi phục mật khẩu",
      forgotDesc: "Nhập email đã đăng ký của bạn để nhận liên kết đặt lại mật khẩu.",
      btnReset: "Gửi liên kết khôi phục",
      backToLogin: "Quay lại đăng nhập",
      copyright: "© 2025 TripTogether Inc. Crafted for collaborative wanderlust.",
      privacy: "Chính sách",
      terms: "Điều khoản",
      support: "Hỗ trợ",
      msgLoginSuccess: "Đăng nhập thành công!",
      msgRegisterSuccess: "Tạo tài khoản thành công! Chào mừng bạn.",
      msgForgotSuccess: "Đã gửi email khôi phục mật khẩu. Vui lòng kiểm tra hộp thư!",
      msgFillAll: "Vui lòng điền đầy đủ các thông tin cần thiết.",
      msgPassMismatch: "Mật khẩu xác nhận không khớp!",
      msgAgreeRequired: "Vui lòng đồng ý với điều khoản sử dụng!",
    },
    en: {
      brandTag: "Group travel manager",
      brandSlogan: "Explore the world with your best friends",
      brandHeaderSub: "Shared journeys made effortless",
      tabLogin: "Sign in",
      tabRegister: "Sign up",
      emailLabel: "Email",
      emailPlaceholder: "example@gmail.com",
      passwordLabel: "Password",
      passwordPlaceholder: "••••••••",
      confirmPasswordLabel: "Confirm Password",
      nameLabel: "Full Name",
      namePlaceholder: "John Doe",
      rememberMe: "Remember me",
      forgotPassword: "Forgot password?",
      btnLogin: "Sign in",
      btnRegister: "Create Account",
      orContinueWith: "OR CONTINUE WITH",
      googleLogin: "Sign in with Google",
      googleRegister: "Sign up with Google",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
      registerNow: "Sign up now",
      loginNow: "Sign in now",
      agreeTerms: "I agree to the Terms of Service & Privacy Policy",
      forgotTitle: "Reset password",
      forgotDesc: "Enter your registered email address to receive password reset link.",
      btnReset: "Send reset link",
      backToLogin: "Back to sign in",
      copyright: "© 2025 TripTogether Inc. Crafted for collaborative wanderlust.",
      privacy: "Privacy",
      terms: "Terms",
      support: "Support",
      msgLoginSuccess: "Signed in successfully!",
      msgRegisterSuccess: "Account created successfully! Welcome aboard.",
      msgForgotSuccess: "Password reset link sent! Check your inbox.",
      msgFillAll: "Please fill in all required fields.",
      msgPassMismatch: "Passwords do not match!",
      msgAgreeRequired: "Please accept the terms of service to proceed!",
    },
  }[language];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setStatusMessage({ type: "error", text: t.msgFillAll });
      return;
    }
    setStatusMessage({ type: "success", text: t.msgLoginSuccess });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPassword || !registerConfirmPassword) {
      setStatusMessage({ type: "error", text: t.msgFillAll });
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      setStatusMessage({ type: "error", text: t.msgPassMismatch });
      return;
    }
    if (!agreeTerms) {
      setStatusMessage({ type: "error", text: t.msgAgreeRequired });
      return;
    }
    setStatusMessage({ type: "success", text: t.msgRegisterSuccess });
    setTimeout(() => {
      setStatusMessage(null);
      setActiveTab("login");
    }, 2000);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setStatusMessage({ type: "error", text: t.msgFillAll });
      return;
    }
    setStatusMessage({ type: "success", text: t.msgForgotSuccess });
    setTimeout(() => {
      setStatusMessage(null);
      setActiveTab("login");
    }, 3000);
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col justify-between transition-colors duration-300 relative overflow-x-hidden ${
        darkMode
          ? "bg-[#0b1319] text-slate-100"
          : "bg-gradient-to-b from-[#f3f7fb] via-[#eef5fa] to-[#f6f9fc] text-slate-800"
      }`}
    >
      {/* Background Decorative Rings / Compass Pattern */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div
          className={`w-[480px] h-[480px] rounded-full border transition-all duration-700 ${
            darkMode ? "border-teal-500/10" : "border-sky-300/35"
          }`}
        />
        <div
          className={`w-[720px] h-[720px] rounded-full border transition-all duration-700 ${
            darkMode ? "border-teal-500/5" : "border-sky-200/30"
          }`}
        />
        <div
          className={`w-[980px] h-[980px] rounded-full border transition-all duration-700 ${
            darkMode ? "border-teal-500/5" : "border-sky-100/30"
          }`}
        />
        <div
          className={`w-[1240px] h-[1240px] rounded-full border transition-all duration-700 ${
            darkMode ? "border-teal-500/5" : "border-slate-200/20"
          }`}
        />
      </div>

      {/* Top Navbar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        {/* Logo Left */}
        <div className="flex items-center gap-3 select-none">
          <div className="w-10 h-10 rounded-xl bg-[#004d53] flex items-center justify-center text-white shadow-sm shadow-teal-950/20">
            {/* Plane Silhouette */}
            <svg
              className="w-5 h-5 fill-current transform rotate-[15deg]"
              viewBox="0 0 24 24"
            >
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
          </div>
          <div>
            <span
              className={`text-lg font-bold tracking-tight block leading-tight ${
                darkMode ? "text-white" : "text-slate-900"
              }`}
            >
              TripTogether
            </span>
            <span
              className={`text-[11px] block leading-tight ${
                darkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {t.brandHeaderSub}
            </span>
          </div>
        </div>

        {/* Right Controls: Language & Dark mode */}
        <div className="flex items-center gap-2.5">
          {/* Language Menu */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-all shadow-sm ${
                darkMode
                  ? "bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700"
                  : "bg-white/90 border-slate-200 text-slate-700 hover:bg-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{language.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showLangMenu && (
              <div
                className={`absolute right-0 mt-1.5 w-32 rounded-xl py-1 shadow-lg border text-xs z-30 ${
                  darkMode
                    ? "bg-slate-800 border-slate-700 text-slate-200"
                    : "bg-white border-slate-100 text-slate-700"
                }`}
              >
                <button
                  onClick={() => {
                    setLanguage("vi");
                    setShowLangMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-teal-500/10"
                >
                  <span>Tiếng Việt (VI)</span>
                  {language === "vi" && <Check className="w-3.5 h-3.5 text-teal-600" />}
                </button>
                <button
                  onClick={() => {
                    setLanguage("en");
                    setShowLangMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-teal-500/10"
                >
                  <span>English (EN)</span>
                  {language === "en" && <Check className="w-3.5 h-3.5 text-teal-600" />}
                </button>
              </div>
            )}
          </div>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Chế độ sáng" : "Chế độ tối"}
            className={`p-2 rounded-full border transition-all shadow-sm ${
              darkMode
                ? "bg-slate-800/80 border-slate-700 text-amber-300 hover:bg-slate-700"
                : "bg-white/90 border-slate-200 text-slate-600 hover:bg-white"
            }`}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div
          className={`w-full max-w-[470px] rounded-[28px] p-7 sm:p-9 transition-all duration-300 ${
            darkMode
              ? "bg-[#131d24] border border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)]"
              : "bg-white border border-slate-100 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.08)]"
          }`}
        >
          {/* Top Travel Badge */}
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-[#005159] flex items-center justify-center text-white shadow-md shadow-[#005159]/25">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Route Path with dashed segments and waypoint dots */}
                <path
                  d="M4 17.5c2-3.5 5.5-6 9.5-6 1.8 0 3.5.8 6.5-4.5"
                  strokeDasharray="2.2 2.2"
                />
                <circle cx="4" cy="17.5" r="1.5" fill="currentColor" />
                <circle cx="13.5" cy="11.5" r="1.5" fill="currentColor" />
                <path d="M16 7h4v4" />
                <path d="M20 7l-5 5" />
              </svg>
            </div>
          </div>

          {/* Brand Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <h1
                className={`text-2xl font-bold tracking-tight ${
                  darkMode ? "text-white" : "text-slate-900"
                }`}
              >
                TripTogether
              </h1>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  darkMode
                    ? "bg-teal-950/60 text-teal-300 border-teal-800/60"
                    : "bg-[#e8f3f8] text-[#136b82] border-sky-100"
                }`}
              >
                {t.brandTag}
              </span>
            </div>
            <p
              className={`text-sm mt-1.5 ${
                darkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {t.brandSlogan}
            </p>
          </div>

          {/* Toast / Status banner */}
          {statusMessage && (
            <div
              className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 animate-fadeIn ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                  : "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Segmented Control Tabs (Đăng nhập / Đăng ký) */}
          {activeTab !== "forgot" && (
            <div
              className={`p-1 rounded-2xl flex gap-1 mt-6 select-none ${
                darkMode ? "bg-slate-800/80" : "bg-[#eff3f7]"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setActiveTab("login");
                  setStatusMessage(null);
                }}
                className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  activeTab === "login"
                    ? darkMode
                      ? "bg-slate-700 text-teal-300 shadow-sm"
                      : "bg-white text-[#00525b] shadow-sm"
                    : darkMode
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t.tabLogin}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("register");
                  setStatusMessage(null);
                }}
                className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  activeTab === "register"
                    ? darkMode
                      ? "bg-slate-700 text-teal-300 shadow-sm"
                      : "bg-white text-[#00525b] shadow-sm"
                    : darkMode
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t.tabRegister}
              </button>
            </div>
          )}

          {/* TAB 1: ĐĂNG NHẬP (LOGIN FORM) */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
              {/* Email */}
              <div>
                <label
                  className={`block text-xs font-semibold mb-1.5 ${
                    darkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className={`w-full text-sm rounded-xl pl-10 pr-4 py-3 border transition-all outline-none ${
                      darkMode
                        ? "bg-slate-800/60 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-teal-500 focus:bg-slate-800"
                        : "bg-[#f8fafc] border-slate-200/90 text-slate-800 placeholder:text-slate-400 focus:border-[#005b66] focus:bg-white focus:ring-2 focus:ring-[#005b66]/15"
                    }`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  className={`block text-xs font-semibold mb-1.5 ${
                    darkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {t.passwordLabel}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className={`w-full text-sm rounded-xl pl-10 pr-10 py-3 border transition-all outline-none ${
                      darkMode
                        ? "bg-slate-800/60 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-teal-500 focus:bg-slate-800"
                        : "bg-[#f8fafc] border-slate-200/90 text-slate-800 placeholder:text-slate-400 focus:border-[#005b66] focus:bg-white focus:ring-2 focus:ring-[#005b66]/15"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#005a66] focus:ring-[#005a66]/20 accent-[#005a66]"
                  />
                  <span
                    className={`text-xs ${
                      darkMode ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {t.rememberMe}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("forgot");
                    setStatusMessage(null);
                  }}
                  className="text-xs font-semibold text-[#00606e] dark:text-teal-400 hover:underline"
                >
                  {t.forgotPassword}
                </button>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl text-white font-medium text-sm transition-all duration-200 shadow-md shadow-teal-950/15 cursor-pointer bg-gradient-to-r from-[#005159] to-[#01657c] hover:from-[#00434a] hover:to-[#015669] active:scale-[0.99]"
              >
                {t.btnLogin}
              </button>

              {/* Divider: HOẶC TIẾP TỤC VỚI */}
              <div className="relative flex items-center justify-center my-5">
                <div
                  className={`w-full border-t ${
                    darkMode ? "border-slate-800" : "border-slate-200"
                  }`}
                />
                <span
                  className={`absolute px-3 text-[11px] font-semibold tracking-wider uppercase select-none ${
                    darkMode
                      ? "bg-[#131d24] text-slate-500"
                      : "bg-white text-slate-400"
                  }`}
                >
                  {t.orContinueWith}
                </span>
              </div>

              {/* Google Button */}
              <button
                type="button"
                className={`w-full py-3 px-4 rounded-xl border text-sm font-medium flex items-center justify-center gap-2.5 transition-all shadow-sm ${
                  darkMode
                    ? "bg-slate-800/70 border-slate-700 text-slate-200 hover:bg-slate-800"
                    : "bg-[#f8fafc] border-slate-200/90 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {/* Standard Google multi-color SVG */}
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
                <span>{t.googleLogin}</span>
              </button>

              {/* Bottom Switch to Register */}
              <p
                className={`text-center text-xs mt-5 ${
                  darkMode ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {t.noAccount}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("register");
                    setStatusMessage(null);
                  }}
                  className="font-semibold text-[#00606e] dark:text-teal-400 hover:underline"
                >
                  {t.registerNow}
                </button>
              </p>
            </form>
          )}

          {/* TAB 2: ĐĂNG KÝ (REGISTER FORM) */}
          {activeTab === "register" && (
            <form onSubmit={handleRegisterSubmit} className="mt-5 space-y-3.5">
              {/* Full Name */}
              <div>
                <label
                  className={`block text-xs font-semibold mb-1.5 ${
                    darkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {t.nameLabel}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder={t.namePlaceholder}
                    className={`w-full text-sm rounded-xl pl-10 pr-4 py-2.5 border transition-all outline-none ${
                      darkMode
                        ? "bg-slate-800/60 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-teal-500 focus:bg-slate-800"
                        : "bg-[#f8fafc] border-slate-200/90 text-slate-800 placeholder:text-slate-400 focus:border-[#005b66] focus:bg-white focus:ring-2 focus:ring-[#005b66]/15"
                    }`}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  className={`block text-xs font-semibold mb-1.5 ${
                    darkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className={`w-full text-sm rounded-xl pl-10 pr-4 py-2.5 border transition-all outline-none ${
                      darkMode
                        ? "bg-slate-800/60 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-teal-500 focus:bg-slate-800"
                        : "bg-[#f8fafc] border-slate-200/90 text-slate-800 placeholder:text-slate-400 focus:border-[#005b66] focus:bg-white focus:ring-2 focus:ring-[#005b66]/15"
                    }`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  className={`block text-xs font-semibold mb-1.5 ${
                    darkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {t.passwordLabel}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className={`w-full text-sm rounded-xl pl-10 pr-10 py-2.5 border transition-all outline-none ${
                      darkMode
                        ? "bg-slate-800/60 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-teal-500 focus:bg-slate-800"
                        : "bg-[#f8fafc] border-slate-200/90 text-slate-800 placeholder:text-slate-400 focus:border-[#005b66] focus:bg-white focus:ring-2 focus:ring-[#005b66]/15"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  className={`block text-xs font-semibold mb-1.5 ${
                    darkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {t.confirmPasswordLabel}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className={`w-full text-sm rounded-xl pl-10 pr-10 py-2.5 border transition-all outline-none ${
                      darkMode
                        ? "bg-slate-800/60 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-teal-500 focus:bg-slate-800"
                        : "bg-[#f8fafc] border-slate-200/90 text-slate-800 placeholder:text-slate-400 focus:border-[#005b66] focus:bg-white focus:ring-2 focus:ring-[#005b66]/15"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
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
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-[#005a66] focus:ring-[#005a66]/20 accent-[#005a66]"
                  />
                  <span
                    className={`text-xs leading-relaxed ${
                      darkMode ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {t.agreeTerms}
                  </span>
                </label>
              </div>

              {/* Primary Register Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl text-white font-medium text-sm transition-all duration-200 shadow-md shadow-teal-950/15 cursor-pointer bg-gradient-to-r from-[#005159] to-[#01657c] hover:from-[#00434a] hover:to-[#015669] active:scale-[0.99] mt-2"
              >
                {t.btnRegister}
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-4">
                <div
                  className={`w-full border-t ${
                    darkMode ? "border-slate-800" : "border-slate-200"
                  }`}
                />
                <span
                  className={`absolute px-3 text-[11px] font-semibold tracking-wider uppercase select-none ${
                    darkMode
                      ? "bg-[#131d24] text-slate-500"
                      : "bg-white text-slate-400"
                  }`}
                >
                  {t.orContinueWith}
                </span>
              </div>

              {/* Google Button */}
              <button
                type="button"
                className={`w-full py-2.5 px-4 rounded-xl border text-sm font-medium flex items-center justify-center gap-2.5 transition-all shadow-sm ${
                  darkMode
                    ? "bg-slate-800/70 border-slate-700 text-slate-200 hover:bg-slate-800"
                    : "bg-[#f8fafc] border-slate-200/90 text-slate-700 hover:bg-slate-100"
                }`}
              >
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
                <span>{t.googleRegister}</span>
              </button>

              {/* Bottom Switch to Login */}
              <p
                className={`text-center text-xs mt-4 ${
                  darkMode ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {t.hasAccount}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login");
                    setStatusMessage(null);
                  }}
                  className="font-semibold text-[#00606e] dark:text-teal-400 hover:underline"
                >
                  {t.loginNow}
                </button>
              </p>
            </form>
          )}

          {/* TAB 3: QUÊN MẬT KHẨU (FORGOT PASSWORD FORM) */}
          {activeTab === "forgot" && (
            <form onSubmit={handleForgotSubmit} className="mt-6 space-y-4">
              <div className="text-center mb-2">
                <h2
                  className={`text-base font-bold ${
                    darkMode ? "text-white" : "text-slate-800"
                  }`}
                >
                  {t.forgotTitle}
                </h2>
                <p
                  className={`text-xs mt-1 leading-relaxed ${
                    darkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {t.forgotDesc}
                </p>
              </div>

              <div>
                <label
                  className={`block text-xs font-semibold mb-1.5 ${
                    darkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className={`w-full text-sm rounded-xl pl-10 pr-4 py-3 border transition-all outline-none ${
                      darkMode
                        ? "bg-slate-800/60 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-teal-500 focus:bg-slate-800"
                        : "bg-[#f8fafc] border-slate-200/90 text-slate-800 placeholder:text-slate-400 focus:border-[#005b66] focus:bg-white focus:ring-2 focus:ring-[#005b66]/15"
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl text-white font-medium text-sm transition-all duration-200 shadow-md shadow-teal-950/15 cursor-pointer bg-gradient-to-r from-[#005159] to-[#01657c] hover:from-[#00434a] hover:to-[#015669] active:scale-[0.99]"
              >
                {t.btnReset}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login");
                    setStatusMessage(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t.backToLogin}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer Bottom */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <p className={darkMode ? "text-slate-500" : "text-slate-500"}>
          {t.copyright}
        </p>

        <div
          className={`flex items-center gap-5 font-medium ${
            darkMode ? "text-slate-400" : "text-slate-600"
          }`}
        >
          <a href="#privacy" className="hover:underline">
            {t.privacy}
          </a>
          <a href="#terms" className="hover:underline">
            {t.terms}
          </a>
          <a href="#support" className="hover:underline">
            {t.support}
          </a>
        </div>
      </footer>
    </div>
  );
}
