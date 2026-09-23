"use client";

import React, { useState } from "react";
import {
  X,
  UserPlus,
  Link as LinkIcon,
  Copy,
  Check,
  Send,
  ShieldCheck,
  ChevronDown,
  Ticket,
  Mail,
  Sparkles,
} from "lucide-react";

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripName?: string;
}

export default function InviteFriendsModal({
  isOpen,
  onClose,
  tripName = "Oanh tạc Đà Lạt 3N2Đ 🌲",
}: InviteFriendsModalProps) {
  const [role, setRole] = useState<string>("Xem & Cùng đóng góp ý kiến");
  const [showRoleDropdown, setShowRoleDropdown] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedPin, setCopiedPin] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>("");
  const [inviteSentToast, setInviteSentToast] = useState<string | null>(null);

  const inviteLink = "https://trippo.app/join/dalat-2026-xyz";
  const pinCode = "DL2026";

  const closeFriends = [
    { name: "Minh Anh", email: "minhanh@gmail.com", avatar: "MA" },
    { name: "Tuấn Lê", email: "tuanle@gmail.com", avatar: "TL" },
    { name: "Hảo My", email: "haomy@gmail.com", avatar: "HM" },
  ];

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyPin = () => {
    navigator.clipboard?.writeText(pinCode);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2500);
  };

  const handleSendEmail = (emailToSend?: string) => {
    const target = emailToSend || emailInput;
    if (!target || !target.includes("@")) {
      return;
    }
    setInviteSentToast(`Đã gửi lời mời tham gia đến ${target}!`);
    setEmailInput("");
    setTimeout(() => setInviteSentToast(null), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 relative animate-scaleUp text-slate-900 overflow-hidden">
        {/* 1. HEADER */}
        <div className="p-5 sm:px-7 sm:pt-6 sm:pb-4 border-b border-slate-100 flex items-start justify-between gap-4 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/25">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                <span>Chuyến đi: {tripName}</span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>Mời bạn bè vào chuyến đi</span>
                <span>👥</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                Cùng nhau lên lịch trình sống ảo và chia tiền nhóm sòng phẳng, tiện lợi.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. BODY CONTENT (SCROLLABLE) */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-5 text-xs">
          {inviteSentToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-semibold flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{inviteSentToast}</span>
            </div>
          )}

          {/* DEFAULT PERMISSION SELECTOR */}
          <div className="p-3.5 rounded-2xl bg-[#f0f3ff] border border-indigo-100/70 flex items-center justify-between gap-3 relative">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <UserPlus className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Quyền hạn mặc định
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {role}
                </span>
              </div>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-indigo-600 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
              >
                <span>Thay đổi</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30 text-xs animate-fadeIn">
                  {[
                    "Xem & Cùng đóng góp ý kiến",
                    "Chỉ xem lịch trình & chi phí",
                    "Đồng trưởng nhóm (Toàn quyền)",
                  ].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setRole(r);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 font-medium ${
                        role === r ? "text-indigo-600 font-bold bg-indigo-50/50" : "text-slate-700"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* OPTION 1: CHIA SẺ LIÊN KẾT TRỰC TIẾP */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <LinkIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span>1. Chia sẻ liên kết trực tiếp</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Hết hạn sau 7 ngày</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="w-full bg-[#f8f9fc] border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-mono outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shrink-0 shadow-sm ${
                  copiedLink
                    ? "bg-emerald-600"
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Đã sao chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép link</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Bất kỳ ai có liên kết này đều có thể gửi yêu cầu tham gia đội hình du hí.
            </p>
          </div>

          {/* OPTION 2: MÃ THAM GIA NHANH (PIN CODE) */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Ticket className="w-3.5 h-3.5 text-indigo-600" />
              <span>2. Mã tham gia nhanh (PIN Code)</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50/60 via-purple-50/40 to-pink-50/40 border border-indigo-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 shadow-2xs">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Nhập mã trực tiếp trên App
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Mở Trippo → Chọn Nhập PIN đoàn
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3.5 py-1.5 rounded-xl bg-white border border-indigo-200 shadow-xs font-mono font-extrabold text-sm text-indigo-700 tracking-wider">
                  {pinCode}
                </div>
                <button
                  type="button"
                  onClick={handleCopyPin}
                  className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 transition-colors cursor-pointer"
                  title="Sao chép mã PIN"
                >
                  {copiedPin ? (
                    <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* OPTION 3: MỜI TRỰC TIẾP QUA EMAIL */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Mail className="w-3.5 h-3.5 text-rose-500" />
              <span>3. Mời trực tiếp qua Email</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Nhập email của bạn bè..."
                className="w-full bg-[#f8f9fc] border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <button
                type="button"
                onClick={() => handleSendEmail()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer shrink-0 shadow-sm"
              >
                <span>Gửi lời mời</span>
                <Send className="w-3 h-3" />
              </button>
            </div>

            {/* Quick Friend Chips */}
            <div className="flex items-center gap-1.5 pt-1 flex-wrap">
              <span className="text-[11px] text-slate-400">Bạn thân hay đi cùng:</span>
              {closeFriends.map((f) => (
                <button
                  key={f.email}
                  type="button"
                  onClick={() => handleSendEmail(f.email)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  <div className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold">
                    {f.avatar}
                  </div>
                  <span>{f.name} +</span>
                </button>
              ))}
            </div>
          </div>

          {/* SECURITY NOTICE */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Thành viên mới cần được trưởng nhóm hoặc phó nhóm duyệt quyền trước khi xem ví chung và bảng quyết toán tài chính chuyến đi.
            </p>
          </div>
        </div>

        {/* 3. MODAL FOOTER */}
        <div className="p-4 sm:px-7 sm:py-4 border-t border-slate-100 bg-white flex items-center justify-end gap-2.5 shrink-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
}

