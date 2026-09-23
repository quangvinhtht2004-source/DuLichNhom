"use client";

import React, { useState, useRef, useMemo } from "react";
import {
  Plane,
  X,
  Sparkles,
  Image as ImageIcon,
  MapPin,
  Calendar,
  Lock,
  UserPlus,
  ArrowRight,
  Check,
  Compass,
} from "lucide-react";

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTripCreated: (newTrip: any) => void;
}

export default function CreateTripModal({
  isOpen,
  onClose,
  onTripCreated,
}: CreateTripModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Presets matching mockup
  const presetList = [
    {
      id: "preset-1",
      name: "Biển đảo",
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "preset-2",
      name: "Săn mây",
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "preset-3",
      name: "Đèo mạo hiểm",
      url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "preset-4",
      name: "Cắm trại",
      url: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=800&auto=format&fit=crop",
    },
  ];

  // Form State
  const [coverImage, setCoverImage] = useState<string>(presetList[1].url);
  const [selectedPresetTitle, setSelectedPresetTitle] = useState<string>("Săn mây Đà Lạt");
  const [tripName, setTripName] = useState<string>(
    "Oanh tạc Đà Lạt 3N2Đ cùng Hội bạn thân 🌲"
  );
  const [destination, setDestination] = useState<string>(
    "Đà Lạt, Lâm Đồng, Việt Nam"
  );
  const [startDate, setStartDate] = useState<string>("15/10/2026");
  const [endDate, setEndDate] = useState<string>("18/10/2026");
  const [description, setDescription] = useState<string>(
    "Mục tiêu chuyến đi: Ăn sập chợ đêm Đà Lạt, săn mây đồi Robin lúc bình minh, ghé quán cà phê thung lũng và chụp 1000 tấm ảnh film sống ảo cùng hội bạn thân!"
  );
  const [isPrivate, setIsPrivate] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Calculate duration string (e.g. "3 ngày 2 đêm")
  const durationText = useMemo(() => {
    try {
      const partsStart = startDate.split("/");
      const partsEnd = endDate.split("/");
      if (partsStart.length === 3 && partsEnd.length === 3) {
        const d1 = new Date(
          parseInt(partsStart[2]),
          parseInt(partsStart[1]) - 1,
          parseInt(partsStart[0])
        );
        const d2 = new Date(
          parseInt(partsEnd[2]),
          parseInt(partsEnd[1]) - 1,
          parseInt(partsEnd[0])
        );
        const diffTime = Math.abs(d2.getTime() - d1.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 0) {
          return `${diffDays} ngày ${Math.max(1, diffDays - 1)} đêm`;
        }
      }
    } catch {
      // Fallback
    }
    return "3 ngày 2 đêm";
  }, [startDate, endDate]);

  // Handle local image upload
  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setCoverImage(reader.result);
          setSelectedPresetTitle(file.name.replace(/\.[^/.]+$/, ""));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit to Supabase API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripName.trim()) {
      setErrorMsg("Vui lòng nhập tên chuyến đi");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tripName.trim(),
          destination: destination.trim(),
          start_date: startDate,
          end_date: endDate,
          cover_image_url: coverImage,
          description: description.trim(),
          is_private: isPrivate,
        }),
      });

      const data = await res.json();

      if (res.ok && data?.trip) {
        onTripCreated(data.trip);
        onClose();
      } else {
        setErrorMsg(data?.error || "Không thể tạo chuyến đi");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 relative animate-scaleUp text-slate-900 overflow-hidden">
        {/* 1. MODAL HEADER (Pinned top - never cut off) */}
        <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between gap-4 shrink-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Plane className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>Lên kế hoạch chuyến đi mới</span>
                <span>✈️</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                Bắt đầu chuyến phiêu lưu tiếp theo cùng những người bạn đồng hành.
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

        {/* SCROLLABLE FORM BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-slate-900">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* 2. COVER IMAGE SECTION */}
          <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <span>Ảnh bìa chuyến đi</span>
              <span className="text-slate-400 font-normal text-[11px]">(Tùy chọn)</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const randomPreset =
                  presetList[Math.floor(Math.random() * presetList.length)];
                setCoverImage(randomPreset.url);
                setSelectedPresetTitle(randomPreset.name);
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gợi ý ảnh đẹp</span>
            </button>
          </div>

          {/* Big Banner Preview */}
          <div className="relative h-44 sm:h-48 rounded-2xl overflow-hidden group shadow-2xs">
            <img
              src={coverImage}
              alt="Trip cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent"></div>

            {/* Top Right Status Badge */}
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              <span>Đang chọn: {selectedPresetTitle}</span>
            </div>

            {/* Bottom Left Guide & Bottom Right Change Button */}
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
              <div className="text-white text-[11px] max-w-[240px]">
                <p className="font-semibold text-xs leading-tight">
                  Kéo thả ảnh hoặc chọn preset bên dưới
                </p>
                <p className="text-white/70 text-[10px] mt-0.5">
                  Hỗ trợ JPG, PNG, WEBP &lt; 5MB
                </p>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-800 text-xs font-bold backdrop-blur-md shadow-md transition-all cursor-pointer shrink-0"
              >
                <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Thay ảnh</span>
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleCustomImageUpload}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />
          </div>

          {/* 4 Preset Thumbnails */}
          <div className="grid grid-cols-4 gap-2">
            {presetList.map((preset, idx) => {
              const isSelected = coverImage === preset.url;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setCoverImage(preset.url);
                    setSelectedPresetTitle(preset.name);
                  }}
                  className={`group relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer text-left ${
                    isSelected
                      ? "border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs"
                      : "border-transparent hover:border-slate-300"
                  }`}
                >
                  <div className="h-13 sm:h-15 w-full relative">
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-900/20"></div>
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-1 sm:p-1.5 bg-[#f8f9fc] border-t border-slate-100">
                    <span
                      className={`text-[10px] font-bold block truncate ${
                        isSelected ? "text-indigo-700" : "text-slate-700"
                      }`}
                    >
                      {idx + 1}. {preset.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. TRIP NAME */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Tên chuyến đi <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            required
            placeholder="Ví dụ: Oanh tạc Đà Lạt 3N2Đ cùng Hội bạn thân"
            className="w-full bg-[#f8f9fc] border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* 4. DESTINATION */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Điểm đến <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
              placeholder="Nhập địa điểm (ví dụ: Đà Lạt, Lâm Đồng)"
              className="w-full bg-[#f8f9fc] border border-slate-200/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          {/* Quick city suggestions */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="text-[11px] text-slate-400">Gợi ý hot:</span>
            {["Đà Lạt", "Phú Quốc", "Hà Giang", "Hội An"].map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setDestination(`${city}, Việt Nam`)}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* 5. TRIP DATES */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Thời gian chuyến đi <span className="text-rose-500">*</span>
            </label>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[11px] font-bold border border-rose-100">
              <Compass className="w-3 h-3" />
              <span>✨ {durationText}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="15/10/2026"
                className="w-full bg-[#f8f9fc] border border-slate-200/80 rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="18/10/2026"
                className="w-full bg-[#f8f9fc] border border-slate-200/80 rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* 6. SHORT DESCRIPTION */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Mô tả ngắn chuyến đi
            </label>
            <span className="text-[11px] text-slate-400 font-normal">Tùy chọn</span>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Chia sẻ mục tiêu, hoạt động hoặc phong cách chuyến đi của nhóm..."
            className="w-full bg-[#f8f9fc] border border-slate-200/80 rounded-xl p-3 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none leading-relaxed"
          />
        </div>

        {/* 7. PRIVATE TRIP TOGGLE */}
        <div className="bg-[#f8f9fc] rounded-2xl p-3.5 border border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-100/70 text-indigo-700 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Chuyến đi riêng tư
              </span>
              <span className="text-[11px] text-slate-500 block">
                Chỉ thành viên được mời qua link hoặc email mới thấy nội dung
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

        {/* 8. MEMBERS PREVIEW */}
        <div className="bg-[#f8f9fc] rounded-2xl p-3 border border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex -space-x-1.5">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
                HN
              </div>
              <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
                MA
              </div>
              <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
                TL
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
                +2
              </div>
            </div>
            <span className="text-xs font-medium text-slate-600">
              Bạn và 4 người khác sẽ tham gia
            </span>
          </div>

          <button
            type="button"
            onClick={() => alert("Tính năng mời email sẽ gửi link tham gia chuyến đi.")}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Mời thêm</span>
          </button>
        </div>

        </div>

        {/* 9. MODAL FOOTER (Pinned bottom - never cut off) */}
        <div className="p-4 sm:px-6 sm:py-3.5 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 z-10">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
            <span>Tự động lưu nháp theo thời gian thực</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:opacity-95 shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? "Đang tạo..." : "Tạo chuyến đi & Lên lịch trình"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

