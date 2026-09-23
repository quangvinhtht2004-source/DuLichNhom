"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Heart,
  Calendar,
  MapPin,
  Vote,
  CreditCard,
  WifiOff,
  Info,
  ArrowRight,
  Clock,
  Share2,
  ShieldCheck,
  Check,
} from "lucide-react";

interface TripInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  onDecline?: () => void;
}

export default function TripInviteModal({
  isOpen,
  onClose,
  onAccept,
  onDecline,
}: TripInviteModalProps) {
  const [isAccepting, setIsAccepting] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleAcceptClick = () => {
    setIsAccepting(true);
    setTimeout(() => {
      setIsAccepting(false);
      onAccept();
      onClose();
    }, 600);
  };

  const handleDeclineClick = () => {
    if (onDecline) onDecline();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      {/* Centered Modal Card */}
      <div className="relative max-w-md w-full max-h-[94vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-scaleUp text-slate-900 my-4">
        {/* TOP BRAND PILL & CLOSE */}
        <div className="pt-4 pb-2 px-6 flex items-center justify-between shrink-0 bg-white">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold text-slate-800 bg-slate-100 border border-slate-200/70">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500"></span>
            <span>Trippo</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* SCROLLABLE INVITATION BODY */}
        <div className="px-5 sm:px-6 pb-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* SPECIAL INVITE TAG */}
          <div className="text-center pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100/80 shadow-2xs">
              <Sparkles className="w-3 h-3 text-rose-500" />
              <span>Lời mời du lịch đặc biệt</span>
            </span>
          </div>

          {/* INVITER PROFILE */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"
                alt="Minh Anh"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] shadow-xs">
                <Heart className="w-2.5 h-2.5 fill-white" />
              </span>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                Minh Anh <span className="font-normal text-slate-600 text-xs">đã rủ bạn tham gia</span>
              </h4>
              <p className="text-[11px] text-indigo-600 font-semibold mt-0.5 flex items-center gap-1">
                <span>● Trưởng nhóm</span>
                <span>•</span>
                <span>Chuyến đi cùng hội bạn</span>
              </p>
            </div>
          </div>

          {/* PERSONAL QUOTE */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100/70 text-indigo-950 font-medium italic relative text-xs leading-relaxed">
            <span className="text-indigo-400 font-serif text-lg leading-none select-none">“</span>
            <span>
              Đi săn mây và ăn lẩu gà lá é với tụi mình nha! Nhóm đang thiếu tay lái cứng để vượt đèo nè 🚙🌲
            </span>
            <span className="text-indigo-400 font-serif text-lg leading-none select-none">”</span>
          </div>

          {/* TRIP HERO CARD */}
          <div className="relative h-44 rounded-2xl overflow-hidden group shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop"
              alt="Đà Lạt"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-slate-950/20"></div>

            {/* Badges on Top */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900/60 backdrop-blur-md text-white border border-white/20">
                <MapPin className="w-3 h-3 text-rose-400" />
                <span>Đà Lạt, Lâm Đồng</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-600 text-white shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                <span>Sắp khởi hành</span>
              </span>
            </div>

            {/* Trip Info Bottom */}
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3 text-white">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200 block">
                  Chuyến đi mùa thu
                </span>
                <h3 className="text-base sm:text-lg font-extrabold tracking-tight leading-tight">
                  Oanh tạc Đà Lạt 🌲
                </h3>
              </div>

              <div className="px-3 py-1 rounded-xl bg-white/95 text-indigo-700 font-extrabold text-xs shadow-md shrink-0">
                3N2Đ
              </div>
            </div>
          </div>

          {/* META: TIME & MEETING LOCATION */}
          <div className="space-y-2">
            {/* Start Date */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    Thời gian khởi hành
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    15/10/2026 — 18/10/2026
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                Thứ Năm • Sáng sớm
              </span>
            </div>

            {/* Meeting Point */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">
                  Điểm tập kết
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Đồi Đa Phú & Hồ Tuyền Lâm, Đà Lạt
                </span>
              </div>
            </div>
          </div>

          {/* FRIENDS READY */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center -space-x-2">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"
                alt="Friend"
                className="w-7 h-7 rounded-full object-cover ring-2 ring-white shadow-2xs"
              />
              <img
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop"
                alt="Friend"
                className="w-7 h-7 rounded-full object-cover ring-2 ring-white shadow-2xs"
              />
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"
                alt="Friend"
                className="w-7 h-7 rounded-full object-cover ring-2 ring-white shadow-2xs"
              />
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-2xs">
                +1
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-600">
              <strong className="text-slate-900">4 bạn bè</strong> đã sẵn sàng
            </span>
          </div>

          {/* 3 FEATURE TILES */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col items-center">
              <Vote className="w-4 h-4 text-indigo-600 mb-1" />
              <span className="font-bold text-[11px] text-slate-900">Bầu chọn quán</span>
              <span className="text-[10px] text-slate-500">Đã có 5 gợi ý</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-purple-50/60 border border-purple-100 flex flex-col items-center">
              <CreditCard className="w-4 h-4 text-purple-600 mb-1" />
              <span className="font-bold text-[11px] text-slate-900">Chia tiền 1 chạm</span>
              <span className="text-[10px] text-slate-500">Tự động chia đều</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-rose-50/60 border border-rose-100 flex flex-col items-center">
              <WifiOff className="w-4 h-4 text-rose-600 mb-1" />
              <span className="font-bold text-[11px] text-slate-900">Lịch offline</span>
              <span className="text-[10px] text-slate-500">Xem khi mất sóng</span>
            </div>
          </div>

          {/* NOTICE */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-2 text-slate-500">
            <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-[10px] leading-relaxed">
              Bạn cần tài khoản <strong className="text-indigo-600">Trippo</strong> để cập nhật vị trí thời gian thực và biểu quyết thời gian xuất phát.
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleAcceptClick}
              disabled={isAccepting}
              className="w-full py-3 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:opacity-95 shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isAccepting ? "Đang tham gia..." : "Chấp nhận & Tham gia ngay"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDeclineClick}
                className="flex-1 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Để dịp khác</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="p-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shrink-0"
                title="Chia sẻ lời mời"
              >
                {copiedShare ? (
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* SECURITY FOOTER */}
          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-slate-400" />
              <span>Được bảo vệ bởi hệ sinh thái du lịch riêng tư Trippo • Rời nhóm bất cứ lúc nào</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

