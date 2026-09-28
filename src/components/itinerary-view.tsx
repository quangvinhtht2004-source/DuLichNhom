"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Plus,
  Trash2,
  Edit3,
  Sliders,
  ChevronUp,
  ChevronDown,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
  Users,
  Compass,
  Sparkles,
  Info,
  Maximize2,
  GripVertical,
  ExternalLink,
  Zap,
} from "lucide-react";
import { formatDateToDisplay, normalizeDateToISO } from "@/lib/date-utils";

// ==========================================
// TYPES & DATA STRUCTURES
// ==========================================
export interface ItineraryItem {
  id: string;
  day_id: string;
  title: string;
  start_time: string | null;
  end_time: string | null;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  note: string | null;
  image_url: string | null;
  position: number;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ItineraryDay {
  id: string;
  trip_id: string;
  day_index: number;
  day_date: string;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
  itinerary_items?: ItineraryItem[];
}

export interface TripDetail {
  id: string;
  name: string;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  cover_image_url: string | null;
  created_by?: string;
  trip_members?: Array<{
    id: string;
    user_id: string;
    role: string;
    status: string;
  }>;
}

export interface ActivityCategory {
  id: string;
  label: string;
  icon: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  { id: "sightseeing", label: "Tham quan", icon: "📸", bgClass: "bg-sky-50", textClass: "text-sky-700", borderClass: "border-sky-200" },
  { id: "food", label: "Ăn uống", icon: "🍜", bgClass: "bg-amber-50", textClass: "text-amber-700", borderClass: "border-amber-200" },
  { id: "transport", label: "Di chuyển", icon: "🚗", bgClass: "bg-emerald-50", textClass: "text-emerald-700", borderClass: "border-emerald-200" },
  { id: "hotel", label: "Lưu trú", icon: "🏨", bgClass: "bg-indigo-50", textClass: "text-indigo-700", borderClass: "border-indigo-200" },
  { id: "shopping", label: "Mua sắm", icon: "🛍️", bgClass: "bg-pink-50", textClass: "text-pink-700", borderClass: "border-pink-200" },
  { id: "entertainment", label: "Giải trí", icon: "🎪", bgClass: "bg-purple-50", textClass: "text-purple-700", borderClass: "border-purple-200" },
  { id: "other", label: "Khác", icon: "📌", bgClass: "bg-slate-100", textClass: "text-slate-700", borderClass: "border-slate-200" },
];

/**
 * Trích xuất nhãn phân loại và tiêu đề sạch từ chuỗi tiêu đề của hoạt động
 */
export function parseActivityTitle(rawTitle: string): {
  category: ActivityCategory;
  cleanTitle: string;
} {
  if (!rawTitle) {
    return { category: ACTIVITY_CATEGORIES[6], cleanTitle: "" };
  }

  const trimmed = rawTitle.trim();
  for (const cat of ACTIVITY_CATEGORIES) {
    if (trimmed.startsWith(cat.icon)) {
      return {
        category: cat,
        cleanTitle: trimmed.slice(cat.icon.length).trim(),
      };
    }
    if (trimmed.startsWith(`[${cat.label}]`)) {
      return {
        category: cat,
        cleanTitle: trimmed.slice(`[${cat.label}]`.length).trim(),
      };
    }
  }

  // Tự động nhận diện theo từ khóa phổ biến nếu chưa có icon tiền tố
  const lower = trimmed.toLowerCase();
  if (
    lower.includes("ăn") ||
    lower.includes("uống") ||
    lower.includes("cà phê") ||
    lower.includes("cafe") ||
    lower.includes("bún") ||
    lower.includes("phở") ||
    lower.includes("lẩu") ||
    lower.includes("nướng") ||
    lower.includes("bánh") ||
    lower.includes("trà sữa")
  ) {
    return { category: ACTIVITY_CATEGORIES[1], cleanTitle: trimmed };
  }
  if (
    lower.includes("xe") ||
    lower.includes("bay") ||
    lower.includes("đón") ||
    lower.includes("di chuyển") ||
    lower.includes("tàu") ||
    lower.includes("chuyến bay") ||
    lower.includes("thuê xe")
  ) {
    return { category: ACTIVITY_CATEGORIES[2], cleanTitle: trimmed };
  }
  if (
    lower.includes("khách sạn") ||
    lower.includes("homestay") ||
    lower.includes("check-in phòng") ||
    lower.includes("check-out") ||
    lower.includes("nghỉ ngơi") ||
    lower.includes("resort")
  ) {
    return { category: ACTIVITY_CATEGORIES[3], cleanTitle: trimmed };
  }
  if (
    lower.includes("chợ") ||
    lower.includes("mua") ||
    lower.includes("quà") ||
    lower.includes("siêu thị") ||
    lower.includes("đặc sản")
  ) {
    return { category: ACTIVITY_CATEGORIES[4], cleanTitle: trimmed };
  }
  if (
    lower.includes("tham quan") ||
    lower.includes("check-in") ||
    lower.includes("chụp ảnh") ||
    lower.includes("đỉnh") ||
    lower.includes("thác") ||
    lower.includes("hồ") ||
    lower.includes("chùa") ||
    lower.includes("nhà thờ") ||
    lower.includes("cổng trời") ||
    lower.includes("rừng")
  ) {
    return { category: ACTIVITY_CATEGORIES[0], cleanTitle: trimmed };
  }
  if (
    lower.includes("bar") ||
    lower.includes("pub") ||
    lower.includes("hát") ||
    lower.includes("karaoke") ||
    lower.includes("show") ||
    lower.includes("nhạc") ||
    lower.includes("trại") ||
    lower.includes("lửa trại")
  ) {
    return { category: ACTIVITY_CATEGORIES[5], cleanTitle: trimmed };
  }

  return { category: ACTIVITY_CATEGORIES[6], cleanTitle: trimmed };
}

/**
 * Lấy thứ trong tuần tiếng Việt
 */
export function getWeekdayName(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    if (!y || !m || !d) return "";
    const date = new Date(y, m - 1, d);
    const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    return days[date.getDay()] || "";
  } catch {
    return "";
  }
}

/**
 * Lấy phân loại buổi trong ngày dựa vào giờ bắt đầu
 */
export function getTimeSession(startTime: string | null): { label: string; icon: string; color: string } | null {
  if (!startTime) return null;
  const [hourStr] = startTime.split(":");
  const hour = parseInt(hourStr, 10);
  if (isNaN(hour)) return null;
  if (hour >= 5 && hour < 12) {
    return { label: "Buổi sáng", icon: "☀️", color: "bg-amber-50 text-amber-700 border-amber-200" };
  }
  if (hour >= 12 && hour < 18) {
    return { label: "Buổi chiều", icon: "⛅", color: "bg-sky-50 text-sky-700 border-sky-200" };
  }
  return { label: "Buổi tối", icon: "🌙", color: "bg-indigo-50 text-indigo-700 border-indigo-200" };
}

interface ItineraryViewProps {
  tripId: string;
}

export default function ItineraryView({ tripId }: ItineraryViewProps) {
  const router = useRouter();

  // Data states
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [activeDayId, setActiveDayId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modals: Day Form
  const [showDayModal, setShowDayModal] = useState<boolean>(false);
  const [dayModalMode, setDayModalMode] = useState<"add" | "edit">("add");
  const [targetDay, setTargetDay] = useState<ItineraryDay | null>(null);
  const [dayFormDate, setDayFormDate] = useState<string>("");
  const [dayFormNotes, setDayFormNotes] = useState<string>("");

  // Modals: Item Form
  const [showItemModal, setShowItemModal] = useState<boolean>(false);
  const [itemModalMode, setItemModalMode] = useState<"add" | "edit">("add");
  const [targetItem, setTargetItem] = useState<ItineraryItem | null>(null);
  const [itemFormDayId, setItemFormDayId] = useState<string>("");
  const [itemFormCategory, setItemFormCategory] = useState<ActivityCategory>(ACTIVITY_CATEGORIES[0]);
  const [itemFormTitle, setItemFormTitle] = useState<string>("");
  const [itemFormStartTime, setItemFormStartTime] = useState<string>("");
  const [itemFormEndTime, setItemFormEndTime] = useState<string>("");
  const [itemFormLocation, setItemFormLocation] = useState<string>("");
  const [itemFormNote, setItemFormNote] = useState<string>("");
  const [itemFormFile, setItemFormFile] = useState<File | null>(null);
  const [itemFormPreview, setItemFormPreview] = useState<string | null>(null);

  // Drag and drop states (Feature 14.0)
  const [draggedItem, setDraggedItem] = useState<{ dayId: string; index: number } | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<{ dayId: string; index: number } | null>(null);

  // Delete Confirm Modal (Feature 15.0)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "day" | "item";
    dayId: string;
    itemId?: string;
    title: string;
  } | null>(null);

  // Lightbox Modal
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Upload Photo directly on Item
  const itemPhotoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingItemTarget, setUploadingItemTarget] = useState<{ dayId: string; itemId: string } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Fetch Trip details & Itinerary days
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [tripRes, itinRes] = await Promise.all([
        fetch(`/api/trips/${tripId}`),
        fetch(`/api/trips/${tripId}/itinerary`),
      ]);

      if (tripRes.status === 401 || itinRes.status === 401) {
        showToast("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!", "error");
        setTimeout(() => router.push("/login"), 1500);
        return;
      }

      if (tripRes.status === 403 || itinRes.status === 403) {
        showToast("Bạn không có quyền truy cập vào chuyến đi này!", "error");
        setTimeout(() => router.push("/dashboard"), 1500);
        return;
      }

      if (tripRes.ok) {
        const tripData = await tripRes.json();
        if (tripData?.trip) setTrip(tripData.trip);
      }

      if (itinRes.ok) {
        const itinData = await itinRes.json();
        if (itinData?.days) {
          const sortedDays = (itinData.days as ItineraryDay[]).map((d) => ({
            ...d,
            itinerary_items: (d.itinerary_items || []).sort(
              (a, b) => a.position - b.position
            ),
          }));
          setDays(sortedDays);
        }
      }
    } catch (err: any) {
      console.error("Lỗi khi tải dữ liệu:", err);
      showToast("Không thể tải thông tin chuyến đi.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tripId]);

  // Duration text
  const durationText = useMemo(() => {
    if (!trip?.start_date || !trip?.end_date) return "Đang cập nhật";
    try {
      const s = new Date(trip.start_date);
      const e = new Date(trip.end_date);
      const diffTime = e.getTime() - s.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > 0) {
        return `${diffDays} ngày ${Math.max(1, diffDays - 1)} đêm`;
      }
    } catch {}
    return "Lịch trình chuyến đi";
  }, [trip]);

  // Auto-generate missing dates list (Feature 12.0)
  const missingTripDates = useMemo(() => {
    if (!trip?.start_date || !trip?.end_date) return [];
    const s = normalizeDateToISO(trip.start_date);
    const e = normalizeDateToISO(trip.end_date);
    if (!s || !e) return [];

    const existingDates = new Set(days.map((d) => d.day_date));
    const missing: string[] = [];

    const curr = new Date(s + "T00:00:00");
    const end = new Date(e + "T00:00:00");

    let count = 0;
    while (curr <= end && count < 30) {
      const iso = curr.toISOString().split("T")[0];
      if (!existingDates.has(iso)) {
        missing.push(iso);
      }
      curr.setDate(curr.getDate() + 1);
      count++;
    }
    return missing;
  }, [trip, days]);

  // Handler: Auto-generate missing days in bulk
  const handleAutoGenerateDays = async () => {
    if (missingTripDates.length === 0) return;
    try {
      setIsSubmitting(true);
      let successCount = 0;
      for (const dateStr of missingTripDates) {
        const res = await fetch(`/api/trips/${tripId}/itinerary`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ day_date: dateStr }),
        });
        if (res.ok) successCount++;
      }
      showToast(`Đã tự động khởi tạo ${successCount} ngày theo thời gian chuyến đi!`);
      await fetchData();
    } catch (err: any) {
      showToast(err.message || "Lỗi tự động tạo ngày.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Active items list based on active tab
  const displayedDays = useMemo(() => {
    if (activeDayId === "all") return days;
    return days.filter((d) => d.id === activeDayId);
  }, [days, activeDayId]);

  // ==========================================
  // DAY OPERATIONS (Feature 12.0)
  // ==========================================
  const openAddDayModal = () => {
    setDayModalMode("add");
    setTargetDay(null);
    if (days.length > 0) {
      const lastDay = days[days.length - 1];
      try {
        const next = new Date(lastDay.day_date);
        next.setDate(next.getDate() + 1);
        setDayFormDate(next.toISOString().split("T")[0]);
      } catch {
        setDayFormDate("");
      }
    } else if (trip?.start_date) {
      const iso = normalizeDateToISO(trip.start_date);
      setDayFormDate(iso || "");
    } else {
      setDayFormDate(new Date().toISOString().split("T")[0]);
    }
    setDayFormNotes("");
    setShowDayModal(true);
  };

  const openEditDayModal = (day: ItineraryDay) => {
    setDayModalMode("edit");
    setTargetDay(day);
    setDayFormDate(day.day_date);
    setDayFormNotes(day.notes || "");
    setShowDayModal(true);
  };

  const handleSaveDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dayFormDate) {
      showToast("Vui lòng chọn ngày lịch trình.", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      if (dayModalMode === "add") {
        const res = await fetch(`/api/trips/${tripId}/itinerary`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            day_date: dayFormDate,
            notes: dayFormNotes.trim() || undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Không thể tạo ngày mới.");
        }

        showToast("Đã thêm ngày mới vào lịch trình thành công!");
        setShowDayModal(false);
        await fetchData();
        if (data?.day?.id) setActiveDayId(data.day.id);
      } else if (targetDay) {
        const res = await fetch(`/api/trips/${tripId}/itinerary/${targetDay.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            day_date: dayFormDate,
            notes: dayFormNotes.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Không thể cập nhật ngày.");
        }

        showToast("Đã cập nhật thông tin ngày thành công!");
        setShowDayModal(false);
        await fetchData();
      }
    } catch (err: any) {
      showToast(err.message || "Có lỗi xảy ra khi lưu ngày.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDay = async (dayId: string) => {
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/trips/${tripId}/itinerary/${dayId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Không thể xóa ngày.");
      }

      showToast("Đã xóa ngày khỏi lịch trình!");
      setDeleteConfirm(null);
      if (activeDayId === dayId) setActiveDayId("all");
      await fetchData();
    } catch (err: any) {
      showToast(err.message || "Có lỗi khi xóa ngày.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // ITEM (ACTIVITY) OPERATIONS (Feature 13.0 & 15.0)
  // ==========================================
  const openAddItemModal = (dayId?: string) => {
    setItemModalMode("add");
    setTargetItem(null);
    setItemFormDayId(dayId || (activeDayId !== "all" ? activeDayId : days[0]?.id || ""));
    setItemFormCategory(ACTIVITY_CATEGORIES[0]);
    setItemFormTitle("");
    setItemFormStartTime("");
    setItemFormEndTime("");
    setItemFormLocation("");
    setItemFormNote("");
    setItemFormFile(null);
    setItemFormPreview(null);
    setShowItemModal(true);
  };

  const openEditItemModal = (dayId: string, item: ItineraryItem) => {
    setItemModalMode("edit");
    setTargetItem(item);
    setItemFormDayId(dayId);
    const { category, cleanTitle } = parseActivityTitle(item.title);
    setItemFormCategory(category);
    setItemFormTitle(cleanTitle || item.title);
    setItemFormStartTime(item.start_time || "");
    setItemFormEndTime(item.end_time || "");
    setItemFormLocation(item.location_name || "");
    setItemFormNote(item.note || "");
    setItemFormFile(null);
    setItemFormPreview(item.image_url || null);
    setShowItemModal(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemFormTitle.trim()) {
      showToast("Vui lòng nhập tên hoạt động.", "error");
      return;
    }
    if (!itemFormDayId) {
      showToast("Vui lòng chọn ngày diễn ra hoạt động.", "error");
      return;
    }

    // Đính kèm icon phân loại vào tiêu đề để đồng bộ hiển thị
    const formattedTitle = `${itemFormCategory.icon} ${itemFormTitle.trim()}`;

    try {
      setIsSubmitting(true);

      if (itemModalMode === "add") {
        const res = await fetch(`/api/trips/${tripId}/itinerary/${itemFormDayId}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formattedTitle,
            start_time: itemFormStartTime.trim() || null,
            end_time: itemFormEndTime.trim() || null,
            location_name: itemFormLocation.trim() || null,
            note: itemFormNote.trim() || null,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Không thể tạo hoạt động.");
        }

        const newItem = data.item;

        if (itemFormFile && newItem?.id) {
          const formData = new FormData();
          formData.append("file", itemFormFile);
          await fetch(`/api/trips/${tripId}/itinerary/${itemFormDayId}/items/${newItem.id}/image`, {
            method: "POST",
            body: formData,
          });
        }

        showToast("Đã thêm hoạt động mới vào lịch trình!");
        setShowItemModal(false);
        await fetchData();
      } else if (targetItem) {
        const res = await fetch(
          `/api/trips/${tripId}/itinerary/${targetItem.day_id}/items/${targetItem.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: formattedTitle,
              start_time: itemFormStartTime.trim() || null,
              end_time: itemFormEndTime.trim() || null,
              location_name: itemFormLocation.trim() || null,
              note: itemFormNote.trim() || null,
              day_id: itemFormDayId !== targetItem.day_id ? itemFormDayId : undefined,
            }),
          }
        );

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Không thể cập nhật hoạt động.");
        }

        if (itemFormFile) {
          const finalDayId = itemFormDayId || targetItem.day_id;
          const formData = new FormData();
          formData.append("file", itemFormFile);
          await fetch(`/api/trips/${tripId}/itinerary/${finalDayId}/items/${targetItem.id}/image`, {
            method: "POST",
            body: formData,
          });
        }

        showToast("Đã cập nhật hoạt động thành công!");
        setShowItemModal(false);
        await fetchData();
      }
    } catch (err: any) {
      showToast(err.message || "Có lỗi khi lưu hoạt động.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (dayId: string, itemId: string) => {
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/trips/${tripId}/itinerary/${dayId}/items/${itemId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Không thể xóa hoạt động.");
      }

      showToast("Đã xóa hoạt động khỏi ngày!");
      setDeleteConfirm(null);
      await fetchData();
    } catch (err: any) {
      showToast(err.message || "Có lỗi khi xóa hoạt động.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // REORDER (DRAG & DROP + BUTTONS) (Feature 14.0)
  // ==========================================
  const handleReorder = async (dayId: string, itemIndex: number, direction: "up" | "down") => {
    const day = days.find((d) => d.id === dayId);
    if (!day || !day.itinerary_items) return;

    const items = [...day.itinerary_items];
    const targetIdx = direction === "up" ? itemIndex - 1 : itemIndex + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const temp = items[itemIndex];
    items[itemIndex] = items[targetIdx];
    items[targetIdx] = temp;

    setDays((prev) =>
      prev.map((d) => (d.id === dayId ? { ...d, itinerary_items: items } : d))
    );

    try {
      const orderIds = items.map((i) => i.id);
      const res = await fetch(`/api/trips/${tripId}/itinerary/${dayId}/items/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: orderIds }),
      });

      if (!res.ok) throw new Error("Không thể lưu thứ tự hoạt động.");
      showToast("Đã đổi thứ tự hoạt động.");
    } catch (err: any) {
      showToast(err.message || "Lỗi cập nhật thứ tự", "error");
      await fetchData();
    }
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, dayId: string, index: number) => {
    setDraggedItem({ dayId, index });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, dayId: string, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!dragOverIndex || dragOverIndex.dayId !== dayId || dragOverIndex.index !== index) {
      setDragOverIndex({ dayId, index });
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dayId: string, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    if (!draggedItem || draggedItem.dayId !== dayId || draggedItem.index === dropIndex) {
      setDraggedItem(null);
      return;
    }

    const day = days.find((d) => d.id === dayId);
    if (!day || !day.itinerary_items) {
      setDraggedItem(null);
      return;
    }

    const items = [...day.itinerary_items];
    const [moved] = items.splice(draggedItem.index, 1);
    items.splice(dropIndex, 0, moved);
    setDraggedItem(null);

    // Optimistic UI
    setDays((prev) =>
      prev.map((d) => (d.id === dayId ? { ...d, itinerary_items: items } : d))
    );

    try {
      const orderIds = items.map((i) => i.id);
      const res = await fetch(`/api/trips/${tripId}/itinerary/${dayId}/items/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: orderIds }),
      });

      if (!res.ok) throw new Error("Không thể lưu thứ tự hoạt động.");
      showToast("Đã kéo-thả đổi vị trí hoạt động thành công!");
    } catch (err: any) {
      showToast(err.message || "Lỗi cập nhật thứ tự", "error");
      await fetchData();
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  // Direct Image Upload for an Item
  const handleDirectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingItemTarget) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Dung lượng ảnh tối đa 5MB.", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `/api/trips/${tripId}/itinerary/${uploadingItemTarget.dayId}/items/${uploadingItemTarget.itemId}/image`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể tải ảnh lên.");
      }

      showToast("Tải ảnh hoạt động thành công!");
      await fetchData();
    } catch (err: any) {
      showToast(err.message || "Lỗi tải ảnh lên.", "error");
    } finally {
      setIsSubmitting(false);
      setUploadingItemTarget(null);
      if (itemPhotoInputRef.current) itemPhotoInputRef.current.value = "";
    }
  };

  // ==========================================
  // RENDER SKELETON LOADING
  // ==========================================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
          <div className="h-64 bg-slate-200 rounded-3xl w-full" />
          <div className="h-12 bg-slate-200 rounded-2xl w-2/3" />
          <div className="space-y-4">
            <div className="h-32 bg-slate-200 rounded-3xl" />
            <div className="h-32 bg-slate-200 rounded-3xl" />
            <div className="h-32 bg-slate-200 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 font-sans text-slate-800">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl border flex items-center gap-3 animate-slideUp text-sm font-semibold transition-all ${
            toast.type === "success"
              ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-200/50"
              : "bg-rose-600 text-white border-rose-500 shadow-rose-200/50"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Hidden file input for direct item photo upload */}
      <input
        type="file"
        ref={itemPhotoInputRef}
        onChange={handleDirectImageUpload}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200/80 hover:bg-slate-100 hover:text-slate-900 shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Bảng điều khiển</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={`/trips/${tripId}/settings`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100/80 transition-all shadow-sm"
            >
              <Sliders className="w-4 h-4" />
              <span>Cài đặt chuyến</span>
            </Link>
          </div>
        </div>

        {/* ==========================================
            HERO TRIP BANNER
        ========================================== */}
        <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 bg-slate-900 text-white">
          <div className="relative h-64 sm:h-72 w-full overflow-hidden">
            <img
              src={
                trip?.cover_image_url ||
                "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1400&auto=format&fit=crop"
              }
              alt={trip?.name || "Chi tiết chuyến đi"}
              className="w-full h-full object-cover opacity-75 transform hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/30" />

            {/* Badges on top */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold text-white flex items-center gap-1.5 shadow-sm">
                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                <span>{durationText}</span>
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-indigo-500/80 backdrop-blur-md text-xs font-bold text-white flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Mục C • Lịch trình chi tiết</span>
              </span>
            </div>

            {/* Hero Content Bottom */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                  {trip?.name || "Chuyến đi chưa đặt tên"}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-200 font-medium">
                  {trip?.destination && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-rose-400" />
                      <span>{trip.destination}</span>
                    </div>
                  )}
                  {trip?.start_date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-sky-400" />
                      <span>
                        {formatDateToDisplay(trip.start_date)}
                        {trip.end_date ? ` - ${formatDateToDisplay(trip.end_date)}` : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Members Chip */}
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20">
                <Users className="w-4 h-4 text-purple-300" />
                <span className="text-xs font-bold text-white">
                  {trip?.trip_members?.length || 1} Thành viên
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ==========================================
            DAY TABS & ACTIONS BAR (Feature 12.0)
        ========================================== */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Lịch trình các ngày
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                {days.length} ngày
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Auto-generate days button (Feature 12.0) */}
              {missingTripDates.length > 0 && (
                <button
                  onClick={handleAutoGenerateDays}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/70 shadow-xs cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                  title="Tự động tạo danh sách ngày theo ngày đi và ngày về của chuyến đi"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  <span>Tự động tạo {missingTripDates.length} ngày theo lịch</span>
                </button>
              )}

              <button
                onClick={openAddDayModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-100 cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm ngày mới</span>
              </button>
              {days.length > 0 && (
                <button
                  onClick={() => openAddItemModal()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 cursor-pointer transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm hoạt động</span>
                </button>
              )}
            </div>
          </div>

          {/* Horizontal Days Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setActiveDayId("all")}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                activeDayId === "all"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              Tất cả các ngày
            </button>

            {days.map((day) => {
              const isActive = activeDayId === day.id;
              const itemCount = day.itinerary_items?.length || 0;
              const weekday = getWeekdayName(day.day_date);
              return (
                <button
                  key={day.id}
                  onClick={() => setActiveDayId(day.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-2 cursor-pointer transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
                  }`}
                >
                  <span>
                    Ngày {day.day_index}: {weekday ? `${weekday}, ` : ""}{formatDateToDisplay(day.day_date)}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-white text-slate-600"
                    }`}
                  >
                    {itemCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ==========================================
            ACTIVE DAY DETAIL & ITINERARY TIMELINE (Feature 16.0)
        ========================================== */}
        {days.length === 0 ? (
          /* Empty state: No days */
          <div className="bg-white rounded-3xl p-10 border border-slate-200/80 text-center shadow-sm space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
              <Calendar className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-lg font-bold text-slate-800">
                Chưa có ngày nào trong lịch trình
              </h3>
              <p className="text-sm text-slate-500">
                Hãy bắt đầu tạo Ngày 1 để lên danh sách địa điểm, giờ giấc và các hoạt động thú vị!
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {missingTripDates.length > 0 && (
                <button
                  onClick={handleAutoGenerateDays}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300/80 shadow-md shadow-amber-100 transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
                  <span>Tự động tạo {missingTripDates.length} ngày theo chuyến đi</span>
                </button>
              )}
              <button
                onClick={openAddDayModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo ngày đầu tiên</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {displayedDays.map((day) => {
              const items = day.itinerary_items || [];
              const weekday = getWeekdayName(day.day_date);
              return (
                <div
                  key={day.id}
                  className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm space-y-6"
                >
                  {/* Day Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 text-xs font-extrabold border border-purple-100">
                          NGÀY {day.day_index}
                        </span>
                        <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                          {weekday ? `${weekday}, ` : ""}{formatDateToDisplay(day.day_date)}
                        </h3>
                        <span className="text-xs font-medium text-slate-400">
                          ({items.length} hoạt động)
                        </span>
                      </div>
                      {day.notes && (
                        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 font-medium italic flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{day.notes}</span>
                        </p>
                      )}
                    </div>

                    {/* Day Controls */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => openAddItemModal(day.id)}
                        className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Thêm hoạt động cho ngày này"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Thêm hoạt động</span>
                      </button>
                      <button
                        onClick={() => openEditDayModal(day)}
                        className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Chỉnh sửa ngày"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                        <span className="hidden sm:inline">Sửa ngày</span>
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({
                            type: "day",
                            dayId: day.id,
                            title: `Ngày ${day.day_index} (${formatDateToDisplay(day.day_date)})`,
                          })
                        }
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors cursor-pointer"
                        title="Xóa ngày này khỏi lịch trình"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Activity Items Timeline */}
                  {items.length === 0 ? (
                    <div className="py-8 text-center bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 space-y-3">
                      <p className="text-xs sm:text-sm text-slate-500 font-medium">
                        Chưa có hoạt động nào trong Ngày {day.day_index}.
                      </p>
                      <button
                        onClick={() => openAddItemModal(day.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 bg-white border border-slate-200 hover:bg-indigo-50 shadow-sm transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm hoạt động đầu tiên</span>
                      </button>
                    </div>
                  ) : (
                    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:top-4 before:bottom-4 before:left-3.5 before:w-0.5 before:bg-gradient-to-b before:from-indigo-300 before:via-purple-200 before:to-indigo-100">
                      {items.map((item, idx) => {
                        const hasTime = item.start_time || item.end_time;
                        const session = getTimeSession(item.start_time);
                        const { category, cleanTitle } = parseActivityTitle(item.title);
                        const isDraggingCurrent = draggedItem?.dayId === day.id && draggedItem?.index === idx;
                        const isOverTarget = dragOverIndex?.dayId === day.id && dragOverIndex?.index === idx;

                        return (
                          <div
                            key={item.id}
                            onDragOver={(e) => handleDragOver(e, day.id, idx)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, day.id, idx)}
                            className={`relative group bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 ${
                              isDraggingCurrent
                                ? "opacity-40 border-dashed border-indigo-400 scale-[0.99]"
                                : isOverTarget
                                ? "border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50/30 shadow-md translate-y-1"
                                : "border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300"
                            }`}
                          >
                            {/* Timeline Node with Step Counter */}
                            <div className="absolute -left-[30px] sm:-left-[35px] top-5 w-5 h-5 rounded-full bg-white border-2 border-indigo-600 shadow-sm flex items-center justify-center text-[10px] font-extrabold text-indigo-700">
                              {idx + 1}
                            </div>

                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              {/* Left Info */}
                              <div className="space-y-2.5 flex-1">
                                {/* Badges: Category + Session + Time */}
                                <div className="flex flex-wrap items-center gap-2">
                                  {/* Category Tag (Feature 13.0) */}
                                  <span
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border ${category.bgClass} ${category.textClass} ${category.borderClass}`}
                                  >
                                    <span>{category.icon}</span>
                                    <span>{category.label}</span>
                                  </span>

                                  {/* Session Badge (Sáng / Chiều / Tối) */}
                                  {session && (
                                    <span
                                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border ${session.color}`}
                                    >
                                      <span>{session.icon}</span>
                                      <span>{session.label}</span>
                                    </span>
                                  )}

                                  {/* Time Range Badge */}
                                  {hasTime && (
                                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 border border-slate-200">
                                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                                      <span>
                                        {item.start_time || "--:--"}
                                        {item.end_time ? ` - ${item.end_time}` : ""}
                                      </span>
                                    </span>
                                  )}

                                  {/* Location Badge with Google Maps link */}
                                  {item.location_name && (
                                    <a
                                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                        item.location_name
                                      )}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="Xem vị trí trên Google Maps"
                                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 border border-emerald-200 transition-colors"
                                    >
                                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                                      <span className="max-w-[180px] sm:max-w-xs truncate">{item.location_name}</span>
                                      <ExternalLink className="w-3 h-3 text-emerald-500" />
                                    </a>
                                  )}
                                </div>

                                {/* Title */}
                                <h4 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                  {cleanTitle || item.title}
                                </h4>

                                {/* Note */}
                                {item.note && (
                                  <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                                    {item.note}
                                  </p>
                                )}
                              </div>

                              {/* Right: Image thumbnail & Actions */}
                              <div className="flex md:flex-col items-center md:items-end gap-3 flex-shrink-0">
                                {item.image_url ? (
                                  <div className="relative group/img w-28 h-20 sm:w-36 sm:h-24 rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                                    <img
                                      src={item.image_url}
                                      alt={item.title}
                                      className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                      <button
                                        onClick={() => setLightboxImage(item.image_url)}
                                        title="Xem ảnh phóng to"
                                        className="p-1.5 rounded-xl bg-white text-slate-800 hover:bg-slate-100 shadow transition-colors cursor-pointer"
                                      >
                                        <Maximize2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setUploadingItemTarget({ dayId: day.id, itemId: item.id });
                                          itemPhotoInputRef.current?.click();
                                        }}
                                        title="Đổi ảnh khác"
                                        className="p-1.5 rounded-xl bg-white text-slate-800 hover:bg-slate-100 shadow transition-colors cursor-pointer"
                                      >
                                        <Upload className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setUploadingItemTarget({ dayId: day.id, itemId: item.id });
                                      itemPhotoInputRef.current?.click();
                                    }}
                                    className="px-3 py-1.5 rounded-xl border border-dashed border-slate-200 hover:border-indigo-300 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                                  >
                                    <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Tải ảnh</span>
                                  </button>
                                )}

                                {/* Action Controls: Drag Handle, Reorder Buttons, Edit, Delete */}
                                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/60">
                                  {/* Drag Handle (Feature 14.0) */}
                                  <div
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, day.id, idx)}
                                    onDragEnd={handleDragEnd}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white cursor-grab active:cursor-grabbing transition-colors"
                                    title="Kéo-thả để đổi thứ tự hoạt động"
                                  >
                                    <GripVertical className="w-4 h-4" />
                                  </div>

                                  {/* Up / Down Arrow Buttons (Feature 14.0) */}
                                  <button
                                    disabled={idx === 0}
                                    onClick={() => handleReorder(day.id, idx, "up")}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                                    title="Di chuyển lên trên"
                                  >
                                    <ChevronUp className="w-4 h-4" />
                                  </button>
                                  <button
                                    disabled={idx === items.length - 1}
                                    onClick={() => handleReorder(day.id, idx, "down")}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                                    title="Di chuyển xuống dưới"
                                  >
                                    <ChevronDown className="w-4 h-4" />
                                  </button>

                                  <div className="w-px h-3.5 bg-slate-200 mx-0.5" />

                                  {/* Edit Item (Feature 15.0) */}
                                  <button
                                    onClick={() => openEditItemModal(day.id, item)}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white transition-colors"
                                    title="Chỉnh sửa hoạt động"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>

                                  {/* Delete Item (Feature 15.0) */}
                                  <button
                                    onClick={() =>
                                      setDeleteConfirm({
                                        type: "item",
                                        dayId: day.id,
                                        itemId: item.id,
                                        title: cleanTitle || item.title,
                                      })
                                    }
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
                                    title="Xóa hoạt động"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ==========================================
          MODAL: THÊM / SỬA NGÀY (Feature 12.0)
      ========================================== */}
      {showDayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {dayModalMode === "add" ? "Thêm ngày mới vào lịch trình" : "Chỉnh sửa ngày lịch trình"}
              </h3>
              <button
                onClick={() => setShowDayModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDay} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ngày diễn ra (YYYY-MM-DD) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={dayFormDate}
                  onChange={(e) => setDayFormDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                />
                {dayFormDate && (
                  <p className="mt-1 text-xs text-indigo-600 font-semibold">
                    📅 {getWeekdayName(dayFormDate)}, {formatDateToDisplay(dayFormDate)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ghi chú mục tiêu ngày (Tùy chọn)
                </label>
                <textarea
                  rows={3}
                  value={dayFormNotes}
                  onChange={(e) => setDayFormNotes(e.target.value)}
                  placeholder="Ví dụ: Khám phá ẩm thực phố cổ, check-in hoàng hôn..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDayModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{dayModalMode === "add" ? "Tạo ngày mới" : "Lưu thay đổi"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: THÊM / SỬA HOẠT ĐỘNG (Feature 13.0 & 15.0)
      ========================================== */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {itemModalMode === "add" ? "Thêm hoạt động mới" : "Chỉnh sửa hoạt động"}
              </h3>
              <button
                onClick={() => setShowItemModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              {/* Day selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Chọn ngày diễn ra <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={itemFormDayId}
                  onChange={(e) => setItemFormDayId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  {days.map((d) => (
                    <option key={d.id} value={d.id}>
                      Ngày {d.day_index}: {getWeekdayName(d.day_date)}, {formatDateToDisplay(d.day_date)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Picker (Feature 13.0) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Loại hoạt động
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {ACTIVITY_CATEGORIES.map((cat) => {
                    const isSelected = itemFormCategory.id === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setItemFormCategory(cat)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tên hoạt động / Điểm đến <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={itemFormTitle}
                  onChange={(e) => setItemFormTitle(e.target.value)}
                  placeholder="Ví dụ: Ăn bánh ướt lòng gà, Check-in Quảng trường Lâm Viên..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              {/* Start & End Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Giờ bắt đầu
                  </label>
                  <input
                    type="time"
                    value={itemFormStartTime}
                    onChange={(e) => setItemFormStartTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Giờ kết thúc
                  </label>
                  <input
                    type="time"
                    value={itemFormEndTime}
                    onChange={(e) => setItemFormEndTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Địa điểm / Địa chỉ
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={itemFormLocation}
                    onChange={(e) => setItemFormLocation(e.target.value)}
                    placeholder="Ví dụ: Phường 10, TP. Đà Lạt..."
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ghi chú hoặc lời nhắc
                </label>
                <textarea
                  rows={2}
                  value={itemFormNote}
                  onChange={(e) => setItemFormNote(e.target.value)}
                  placeholder="Lưu ý: Mua vé trước, mang CCCD, mặc áo ấm..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              {/* Image Upload Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ảnh hoạt động (Tối đa 5MB)
                </label>
                <div className="flex items-center gap-3">
                  {itemFormPreview ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                      <img
                        src={itemFormPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setItemFormFile(null);
                          setItemFormPreview(null);
                        }}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : null}

                  <label className="flex-1 border border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-3 text-center cursor-pointer bg-slate-50 hover:bg-indigo-50/50 transition-colors">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            showToast("Kích thước ảnh tối đa 5MB", "error");
                            return;
                          }
                          setItemFormFile(file);
                          setItemFormPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                    />
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-indigo-600">
                      <Upload className="w-4 h-4" />
                      <span>{itemFormFile ? itemFormFile.name : "Chọn ảnh tải lên"}</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{itemModalMode === "add" ? "Thêm vào lịch trình" : "Lưu thay đổi"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: XÁC NHẬN XÓA (Feature 15.0)
      ========================================== */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-center animate-scaleUp">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">
                Xác nhận xóa {deleteConfirm.type === "day" ? "ngày lịch trình" : "hoạt động"}?
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {deleteConfirm.type === "day"
                  ? `Toàn bộ các hoạt động bên trong "${deleteConfirm.title}" cũng sẽ bị xóa. Thao tác này không thể hoàn tác.`
                  : `Bạn có chắc muốn xóa hoạt động "${deleteConfirm.title}" không? Thao tác này không thể hoàn tác.`}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  if (deleteConfirm.type === "day") {
                    handleDeleteDay(deleteConfirm.dayId);
                  } else if (deleteConfirm.itemId) {
                    handleDeleteItem(deleteConfirm.dayId, deleteConfirm.itemId);
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Xóa ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: LIGHTBOX PHÓNG TO ẢNH (Feature 16.0)
      ========================================== */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl">
            <img
              src={lightboxImage}
              alt="Ảnh phóng to"
              className="w-full h-full object-contain max-h-[85vh] rounded-2xl"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
