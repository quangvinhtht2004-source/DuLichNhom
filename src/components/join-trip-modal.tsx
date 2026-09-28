"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  KeyRound,
  X,
  ArrowRight,
  Loader2,
  Sparkles,
  ClipboardPaste,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface JoinTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (tripId: string) => void;
}

export default function JoinTripModal({
  isOpen,
  onClose,
  onSuccess,
}: JoinTripModalProps) {
  const router = useRouter();
  const [pinCode, setPinCode] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setPinCode(text.trim().toUpperCase());
        setErrorMessage(null);
      }
    } catch {
      // ignore
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = pinCode.trim();
    if (!code) {
      setErrorMessage("Vui lòng nhập mã PIN / Mã mời chuyến đi.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const res = await fetch("/api/trips/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Không thể tham gia chuyến đi với mã này.");
      }

      const tripId = data.member?.trip_id;
      if (tripId) {
        if (onSuccess) onSuccess(tripId);
        onClose();
        router.push(`/trips/${tripId}`);
      } else {
        onClose();
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Mã PIN không hợp lệ hoặc đã hết hạn.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 sm:p-7 relative animate-scaleUp text-slate-900 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 mb-0.5">
                <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                <span>Gia nhập nhóm</span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Nhập mã PIN chuyến đi
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
          Nhập mã PIN hoặc mã mời gồm 6-8 ký tự do trưởng nhóm cung cấp để cùng lên lịch trình và chia sẻ chi phí chuyến đi.
        </p>

        {/* Form */}
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Mã PIN chuyến đi
            </label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                required
                value={pinCode}
                onChange={(e) => {
                  setPinCode(e.target.value.toUpperCase());
                  setErrorMessage(null);
                }}
                placeholder="VD: A1B2C3D4 hoặc DL2026"
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-hidden text-center text-lg sm:text-xl font-mono font-extrabold tracking-widest text-indigo-900 bg-slate-50/50 uppercase transition-all"
              />
              <button
                type="button"
                onClick={handlePaste}
                title="Dán từ Clipboard"
                className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-white hover:bg-indigo-50 text-indigo-600 border border-slate-200 text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dán</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-600 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !pinCode.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 shadow-md shadow-indigo-200 transition-all disabled:opacity-50 cursor-pointer active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang kiểm tra...</span>
                </>
              ) : (
                <>
                  <span>Tham gia chuyến đi</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

