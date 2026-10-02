"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Wallet,
  CreditCard,
  Scale,
  TrendingUp,
  TrendingDown,
  PieChart,
  Plus,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Layers,
  Loader2,
  RotateCcw,
  Zap,
  Trash2,
  ArrowRight,
  ArrowRightLeft,
  Check,
  User,
  ShieldCheck,
  Search,
  Filter,
  Receipt,
  Calendar,
  ArrowUpDown,
  Eye,
  X,
  Maximize2,
  Image as ImageIcon,
  Pencil,
  Upload,
  Camera,
  Percent,
  CheckSquare,
  Square,
} from "lucide-react";

// ==========================================
// TYPES
// ==========================================
export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  textColor: string;
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: "food", name: "Ẩm thực & Cà phê", icon: "🍜", color: "#F59E0B", bgColor: "bg-amber-500", textColor: "text-amber-700" },
  { id: "hotel", name: "Lưu trú & Homestay", icon: "🏨", color: "#6366F1", bgColor: "bg-indigo-500", textColor: "text-indigo-700" },
  { id: "transport", name: "Di chuyển & Xăng xe", icon: "🚗", color: "#10B981", bgColor: "bg-emerald-500", textColor: "text-emerald-700" },
  { id: "tickets", name: "Vé tham quan & Vui chơi", icon: "🎟️", color: "#0EA5E9", bgColor: "bg-sky-500", textColor: "text-sky-700" },
  { id: "shopping", name: "Mua sắm & Đặc sản", icon: "🛍️", color: "#EC4899", bgColor: "bg-pink-500", textColor: "text-pink-700" },
  { id: "other", name: "Chi phí khác", icon: "📌", color: "#8B5CF6", bgColor: "bg-purple-500", textColor: "text-purple-700" },
];

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  user_id: string;
  amount_owed: number;
  percentage: number | null;
  is_settled: boolean;
  settled_at: string | null;
}

export interface ExpenseItem {
  id: string;
  trip_id: string;
  paid_by: string;
  amount: number;
  currency: string;
  description: string;
  category: string | null;
  expense_date: string;
  split_method: string;
  receipt_image_url: string | null;
  created_by: string;
  created_at: string;
  expense_splits?: ExpenseSplit[];
}

export interface MemberProfile {
  user_id: string;
  role: string;
  status: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
  } | null;
}

export interface SimplifiedDebt {
  fromUserId: string;
  toUserId: string;
  amount: number;
  isSettled: boolean;
}

interface ExpenseViewProps {
  tripId: string;
  tripName?: string;
  onOpenAddModal?: () => void;
}

export default function ExpenseView({
  tripId,
  tripName = "Chuyến đi",
  onOpenAddModal,
}: ExpenseViewProps) {
  // API Data States
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUserName, setCurrentUserName] = useState<string>("Bạn");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const [settlingKey, setSettlingKey] = useState<string | null>(null);

  // Sub-tab Khối 2: Công nợ ("unsettled" | "settled")
  const [debtTab, setDebtTab] = useState<"unsettled" | "settled">("unsettled");

  // Khối 3: Bộ lọc & Tìm kiếm (Chức năng 23.0)
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterPaidBy, setFilterPaidBy] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterSort, setFilterSort] = useState<string>("newest");

  // Modals Khối 3
  const [selectedExpenseForDetail, setSelectedExpenseForDetail] = useState<ExpenseItem | null>(null);
  const [deleteExpenseConfirm, setDeleteExpenseConfirm] = useState<ExpenseItem | null>(null);
  const [isDeletingExpense, setIsDeletingExpense] = useState<boolean>(false);
  const [receiptLightbox, setReceiptLightbox] = useState<string | null>(null);

  // ==========================================
  // KHỐI 4: STATE MODAL THÊM & SỬA KHOẢN CHI (CN 19.0 & 20.0)
  // ==========================================
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState<boolean>(false);
  const [expenseModalMode, setExpenseModalMode] = useState<"add" | "edit">("add");
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  // Form Fields
  const [formAmount, setFormAmount] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formPaidBy, setFormPaidBy] = useState<string>("");
  const [formCategory, setFormCategory] = useState<string>("food");
  const [formDate, setFormDate] = useState<string>("");
  const [formSplitMethod, setFormSplitMethod] = useState<"equal" | "percentage" | "custom">("equal");

  // Receipt image
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState<boolean>(false);

  // Split details
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]); // equal
  const [percentageMap, setPercentageMap] = useState<Record<string, number>>({}); // percentage
  const [customAmountMap, setCustomAmountMap] = useState<Record<string, number>>({}); // custom

  const [isSubmittingExpense, setIsSubmittingExpense] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Fetch current profile, members & expenses from real APIs
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      const [profileRes, membersRes, expensesRes] = await Promise.all([
        fetch("/api/auth/profile"),
        fetch(`/api/trips/${tripId}/members`),
        fetch(`/api/trips/${tripId}/expenses`),
      ]);

      let myUserId = "";
      let myUserName = "Bạn";

      if (profileRes.ok) {
        const pData = await profileRes.json();
        const profileObj = pData?.profile || pData?.user;
        if (profileObj?.id) {
          myUserId = profileObj.id;
          myUserName = profileObj.full_name || profileObj.email?.split("@")[0] || "Bạn";
        }
      }

      // Fallback: nếu API chưa có id, lấy trực tiếp từ Supabase auth session client-side
      if (!myUserId) {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.id) {
            myUserId = user.id;
            myUserName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Bạn";
          }
        } catch (e) {
          console.error("Lỗi lấy user session:", e);
        }
      }

      if (myUserId) {
        setCurrentUserId(myUserId);
        setCurrentUserName(myUserName);
      }

      if (membersRes.ok) {
        const mData = await membersRes.json();
        if (mData?.members) {
          setMembers(mData.members);
        }
      }

      if (expensesRes.ok) {
        const eData = await expensesRes.json();
        if (eData?.expenses) {
          setExpenses(eData.expenses);
        }
      }
    } catch (err: any) {
      console.error("Lỗi khi tải dữ liệu chi phí:", err);
      showToast("Không thể tải thông tin chi phí.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper lấy thông tin thành viên (Tên, Avatar, Initials)
  const getMemberInfo = useCallback(
    (userId: string) => {
      const member = members.find((m) => m.user_id === userId);
      const isMe = userId === currentUserId;
      const rawName = member?.profiles?.full_name || member?.profiles?.email?.split("@")[0] || "Thành viên";
      const initials = (member?.profiles?.full_name || "TV").trim().slice(0, 2).toUpperCase();
      return {
        id: userId,
        name: isMe ? `${rawName} (Bạn)` : rawName,
        rawName,
        avatar: member?.profiles?.avatar_url || null,
        initials,
        isMe,
      };
    },
    [members, currentUserId]
  );

  // Định dạng tiền tệ VNĐ
  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(Math.abs(num)) + " ₫";
  };

  // Định dạng ngày hiển thị DD/MM/YYYY
  const formatDateDisplay = (dateStr: string | null | undefined) => {
    if (!dateStr) return "";
    try {
      const [y, m, d] = dateStr.split("T")[0].split("-");
      return `${d}/${m}/${y}`;
    } catch {
      return dateStr;
    }
  };

  // ==========================================
  // KHỐI 4: LOGIC TÍNH TOÁN & HANDLERS MODAL (CN 19.0 & 20.0)
  // ==========================================
  const parsedFormAmount = useMemo(() => {
    return Number(formAmount.replace(/\D/g, "")) || 0;
  }, [formAmount]);

  const handleAmountChange = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (!digits) {
      setFormAmount("");
      return;
    }
    const num = Number(digits);
    setFormAmount(num.toLocaleString("vi-VN"));
  };

  const addQuickAmount = (delta: number) => {
    const next = parsedFormAmount + delta;
    setFormAmount(next.toLocaleString("vi-VN"));
  };

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants((prev) => {
      if (prev.includes(userId)) {
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const selectAllParticipants = () => {
    setSelectedParticipants(members.map((m) => m.user_id));
  };

  const deselectAllParticipants = () => {
    if (members.length > 0) {
      setSelectedParticipants([members[0].user_id]);
    }
  };

  const handlePercentageChange = (userId: string, val: string) => {
    const num = val === "" ? 0 : Math.max(0, Math.min(100, Number(val)));
    setPercentageMap((prev) => ({ ...prev, [userId]: num }));
  };

  const distributeEqualPercentage = () => {
    if (members.length === 0) return;
    const basePct = Math.floor(100 / members.length);
    const remainder = 100 - basePct * members.length;
    const newMap: Record<string, number> = {};
    members.forEach((m, idx) => {
      newMap[m.user_id] = basePct + (idx === members.length - 1 ? remainder : 0);
    });
    setPercentageMap(newMap);
  };

  const handleCustomMemberAmountChange = (userId: string, val: string) => {
    const digits = val.replace(/\D/g, "");
    const num = digits ? Number(digits) : 0;
    setCustomAmountMap((prev) => ({ ...prev, [userId]: num }));
  };

  const distributeEqualCustom = () => {
    if (members.length === 0 || parsedFormAmount <= 0) return;
    const base = Math.floor(parsedFormAmount / members.length);
    const remainder = parsedFormAmount - base * members.length;
    const newMap: Record<string, number> = {};
    members.forEach((m, idx) => {
      newMap[m.user_id] = base + (idx === members.length - 1 ? remainder : 0);
    });
    setCustomAmountMap(newMap);
  };

  const totalPercentage = useMemo(() => {
    return members.reduce((sum, m) => sum + (Number(percentageMap[m.user_id]) || 0), 0);
  }, [members, percentageMap]);

  const totalCustomAmount = useMemo(() => {
    return members.reduce((sum, m) => sum + (Number(customAmountMap[m.user_id]) || 0), 0);
  }, [members, customAmountMap]);

  // Mở modal thêm mới
  const handleOpenAddExpense = () => {
    setExpenseModalMode("add");
    setEditingExpenseId(null);
    setFormAmount("");
    setFormDescription("");
    setFormPaidBy(currentUserId || members[0]?.user_id || "");
    setFormCategory("food");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormSplitMethod("equal");
    setReceiptFile(null);
    setReceiptPreviewUrl(null);
    setFormError(null);

    const allMemberIds = members.map((m) => m.user_id);
    setSelectedParticipants(allMemberIds);

    if (allMemberIds.length > 0) {
      const basePct = Math.floor(100 / allMemberIds.length);
      const remainder = 100 - basePct * allMemberIds.length;
      const initialPctMap: Record<string, number> = {};
      allMemberIds.forEach((id, idx) => {
        initialPctMap[id] = basePct + (idx === allMemberIds.length - 1 ? remainder : 0);
      });
      setPercentageMap(initialPctMap);

      const initialCustomMap: Record<string, number> = {};
      allMemberIds.forEach((id) => {
        initialCustomMap[id] = 0;
      });
      setCustomAmountMap(initialCustomMap);
    }

    setIsExpenseModalOpen(true);
  };

  // Mở modal sửa
  const handleOpenEditExpense = (expense: ExpenseItem) => {
    setExpenseModalMode("edit");
    setEditingExpenseId(expense.id);
    setFormAmount(Number(expense.amount).toLocaleString("vi-VN"));
    setFormDescription(expense.description);
    setFormPaidBy(expense.paid_by);
    setFormCategory(expense.category || "food");
    setFormDate(
      expense.expense_date
        ? expense.expense_date.split("T")[0]
        : new Date().toISOString().split("T")[0]
    );
    setFormSplitMethod(
      (expense.split_method as "equal" | "percentage" | "custom") || "equal"
    );
    setReceiptFile(null);
    setReceiptPreviewUrl(expense.receipt_image_url || null);
    setFormError(null);

    const splits = expense.expense_splits || [];
    const allMemberIds = members.map((m) => m.user_id);

    if (expense.split_method === "equal") {
      const participantIds = splits.map((s) => s.user_id);
      setSelectedParticipants(
        participantIds.length > 0 ? participantIds : allMemberIds
      );
    } else {
      setSelectedParticipants(allMemberIds);
    }

    const pctMap: Record<string, number> = {};
    const customMap: Record<string, number> = {};

    allMemberIds.forEach((id) => {
      const s = splits.find((item) => item.user_id === id);
      pctMap[id] =
        s?.percentage ??
        (allMemberIds.length > 0 ? Math.round(100 / allMemberIds.length) : 0);
      customMap[id] = s?.amount_owed ?? 0;
    });

    setPercentageMap(pctMap);
    setCustomAmountMap(customMap);

    setIsExpenseModalOpen(true);
  };

  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setFormError("Chỉ chấp nhận ảnh định dạng JPG, PNG hoặc WEBP");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError("Kích thước ảnh tối đa 5MB");
      return;
    }
    setReceiptFile(file);
    setReceiptPreviewUrl(URL.createObjectURL(file));
    setFormError(null);
  };

  const handleRemoveReceipt = () => {
    setReceiptFile(null);
    setReceiptPreviewUrl(null);
  };

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!parsedFormAmount || parsedFormAmount <= 0) {
      setFormError("Vui lòng nhập số tiền chi tiêu hợp lệ (> 0 ₫)");
      return;
    }
    if (!formDescription.trim()) {
      setFormError("Vui lòng nhập tên / mô tả khoản chi");
      return;
    }
    if (!formPaidBy) {
      setFormError("Vui lòng chọn người đã thanh toán");
      return;
    }

    if (formSplitMethod === "equal") {
      if (selectedParticipants.length === 0) {
        setFormError("Vui lòng chọn ít nhất 1 người tham gia chia tiền");
        return;
      }
    } else if (formSplitMethod === "percentage") {
      if (Math.round(totalPercentage) !== 100) {
        setFormError(
          `Tổng tỷ lệ phần trăm đang là ${totalPercentage}%. Vui lòng điều chỉnh để tổng bằng đúng 100%`
        );
        return;
      }
    } else if (formSplitMethod === "custom") {
      if (Math.round(totalCustomAmount) !== Math.round(parsedFormAmount)) {
        setFormError(
          `Tổng tiền phân bổ (${formatVND(totalCustomAmount)}) chưa khớp với tổng hóa đơn (${formatVND(parsedFormAmount)}). Chênh lệch: ${formatVND(Math.abs(parsedFormAmount - totalCustomAmount))}`
        );
        return;
      }
    }

    try {
      setIsSubmittingExpense(true);

      let finalReceiptUrl = receiptPreviewUrl;
      if (receiptFile) {
        setIsUploadingReceipt(true);
        const fd = new FormData();
        fd.append("file", receiptFile);
        const resUpload = await fetch(
          `/api/trips/${tripId}/expenses/upload-receipt`,
          {
            method: "POST",
            body: fd,
          }
        );
        const uploadData = await resUpload.json();
        if (!resUpload.ok) {
          throw new Error(uploadData.error || "Lỗi tải ảnh hóa đơn");
        }
        finalReceiptUrl = uploadData.publicUrl;
        setIsUploadingReceipt(false);
      }

      const payload: Record<string, any> = {
        amount: parsedFormAmount,
        description: formDescription.trim(),
        paid_by: formPaidBy,
        category: formCategory,
        expense_date: formDate,
        split_method: formSplitMethod,
        receipt_image_url: finalReceiptUrl,
      };

      if (formSplitMethod === "equal") {
        payload.participants = selectedParticipants;
      } else if (formSplitMethod === "percentage") {
        payload.splits = members.map((m) => ({
          user_id: m.user_id,
          percentage: Number(percentageMap[m.user_id]) || 0,
        }));
      } else if (formSplitMethod === "custom") {
        payload.splits = members.map((m) => ({
          user_id: m.user_id,
          amount_owed: Number(customAmountMap[m.user_id]) || 0,
        }));
      }

      if (expenseModalMode === "add") {
        const res = await fetch(`/api/trips/${tripId}/expenses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || "Không thể tạo khoản chi");
        showToast("Đã thêm khoản chi mới thành công!", "success");
      } else {
        const res = await fetch(
          `/api/trips/${tripId}/expenses/${editingExpenseId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        const resData = await res.json();
        if (!res.ok)
          throw new Error(resData.error || "Không thể cập nhật khoản chi");
        showToast("Đã cập nhật khoản chi thành công!", "success");
      }

      setIsExpenseModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setFormError(err.message || "Đã xảy ra lỗi khi lưu khoản chi");
    } finally {
      setIsSubmittingExpense(false);
      setIsUploadingReceipt(false);
    }
  };

  // ==========================================
  // TÍNH TOÁN CÁC CHỈ SỐ TÀI CHÍNH (KHỐI 1) TỪ API
  // ==========================================
  
  // 1. Tổng chi tiêu nhóm
  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [expenses]);

  // 2. Số tiền người dùng hiện tại đã ứng trước (item.paid_by === currentUserId)
  const userPaidAmount = useMemo(() => {
    if (!currentUserId) return 0;
    return expenses
      .filter((item) => item.paid_by === currentUserId)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [expenses, currentUserId]);

  // 3. Phần chi phí thực tế người dùng phải gánh chịu
  const userShareAmount = useMemo(() => {
    if (!currentUserId) return 0;
    return expenses.reduce((sum, item) => {
      const splits = item.expense_splits || [];
      const mySplit = splits.find((s) => s.user_id === currentUserId);
      return sum + (mySplit ? Number(mySplit.amount_owed || 0) : 0);
    }, 0);
  }, [expenses, currentUserId]);

  // 4. Số dư ròng (Net Balance): Dương = được nhận lại (+), Âm = cần trả thêm (-)
  const netBalance = useMemo(() => {
    return userPaidAmount - userShareAmount;
  }, [userPaidAmount, userShareAmount]);

  // 5. Phân bổ chi tiêu theo Danh mục
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((item) => {
      const catKey = item.category || "other";
      map[catKey] = (map[catKey] || 0) + Number(item.amount || 0);
    });

    return EXPENSE_CATEGORIES.map((cat) => {
      const amount = map[cat.id] || 0;
      const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
      return {
        ...cat,
        amount,
        percentage: Math.round(percentage * 10) / 10,
      };
    }).filter((c) => c.amount > 0);
  }, [expenses, totalAmount]);

  // ==========================================
  // TÍNH TOÁN CÔNG NỢ THÔNG MINH (KHỐI 2 - CN 21.0 & 24.0)
  // ==========================================

  // 1. Các khoản nợ CHƯA thanh toán (Unsettled Debts)
  const unsettledDebts = useMemo(() => {
    const debtMatrix: Record<string, number> = {};

    expenses.forEach((e) => {
      const splits = e.expense_splits || [];
      splits.forEach((s) => {
        if (!s.is_settled && s.user_id !== e.paid_by) {
          const key = `${s.user_id}->${e.paid_by}`;
          debtMatrix[key] = (debtMatrix[key] || 0) + Number(s.amount_owed || 0);
        }
      });
    });

    const processedPairs = new Set<string>();
    const result: SimplifiedDebt[] = [];

    Object.keys(debtMatrix).forEach((key) => {
      const [uA, uB] = key.split("->");
      const pairKey = [uA, uB].sort().join("<->");
      if (processedPairs.has(pairKey)) return;
      processedPairs.add(pairKey);

      const aOwesB = debtMatrix[`${uA}->${uB}`] || 0;
      const bOwesA = debtMatrix[`${uB}->${uA}`] || 0;
      const diff = aOwesB - bOwesA;

      if (diff > 0) {
        result.push({
          fromUserId: uA,
          toUserId: uB,
          amount: Math.round(diff),
          isSettled: false,
        });
      } else if (diff < 0) {
        result.push({
          fromUserId: uB,
          toUserId: uA,
          amount: Math.round(Math.abs(diff)),
          isSettled: false,
        });
      }
    });

    return result;
  }, [expenses]);

  // 2. Các khoản nợ ĐÃ thanh toán (Settled Debts)
  const settledDebts = useMemo(() => {
    const settledMatrix: Record<string, number> = {};

    expenses.forEach((e) => {
      const splits = e.expense_splits || [];
      splits.forEach((s) => {
        if (s.is_settled && s.user_id !== e.paid_by) {
          const key = `${s.user_id}->${e.paid_by}`;
          settledMatrix[key] = (settledMatrix[key] || 0) + Number(s.amount_owed || 0);
        }
      });
    });

    return Object.entries(settledMatrix).map(([key, amount]) => {
      const [fromUserId, toUserId] = key.split("->");
      return {
        fromUserId,
        toUserId,
        amount: Math.round(amount),
        isSettled: true,
      };
    });
  }, [expenses]);

  // Handler: Đánh dấu đã thanh toán (Feature 24.0)
  const handleSettleDebt = async (fromUserId: string, toUserId: string, isSettled: boolean = true) => {
    const opKey = `${fromUserId}->${toUserId}`;
    try {
      setSettlingKey(opKey);
      const res = await fetch(`/api/trips/${tripId}/expenses/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_user: fromUserId,
          to_user: toUserId,
          is_settled: isSettled,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể cập nhật trạng thái thanh toán.");
      }

      showToast(
        isSettled
          ? "Đã xác nhận thanh toán công nợ thành công!"
          : "Đã hoàn tác trạng thái thanh toán công nợ.",
        "success"
      );
      await fetchData();
    } catch (err: any) {
      showToast(err.message || "Lỗi cập nhật thanh toán.", "error");
    } finally {
      setSettlingKey(null);
    }
  };

  // ==========================================
  // BỘ LỌC VÀ TÌM KIẾM KHOẢN CHI (KHỐI 3 - CN 23.0)
  // ==========================================
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // 1. Lọc theo từ khóa tìm kiếm
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((e) => e.description.toLowerCase().includes(q));
    }

    // 2. Lọc theo Người đã trả tiền
    if (filterPaidBy !== "all") {
      result = result.filter((e) => e.paid_by === filterPaidBy);
    }

    // 3. Lọc theo Danh mục
    if (filterCategory !== "all") {
      result = result.filter((e) => (e.category || "other") === filterCategory);
    }

    // 4. Sắp xếp
    if (filterSort === "newest") {
      result.sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime());
    } else if (filterSort === "oldest") {
      result.sort((a, b) => new Date(a.expense_date).getTime() - new Date(b.expense_date).getTime());
    } else if (filterSort === "highest") {
      result.sort((a, b) => Number(b.amount) - Number(a.amount));
    } else if (filterSort === "lowest") {
      result.sort((a, b) => Number(a.amount) - Number(b.amount));
    }

    return result;
  }, [expenses, searchQuery, filterPaidBy, filterCategory, filterSort]);

  // Handler: Xóa một khoản chi (Feature 23.0)
  const handleDeleteSingleExpense = async () => {
    if (!deleteExpenseConfirm) return;
    try {
      setIsDeletingExpense(true);
      const res = await fetch(`/api/trips/${tripId}/expenses/${deleteExpenseConfirm.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Không thể xóa khoản chi.");
      }

      showToast("Đã xóa khoản chi thành công!", "success");
      setDeleteExpenseConfirm(null);
      await fetchData();
    } catch (err: any) {
      showToast(err.message || "Lỗi xóa khoản chi.", "error");
    } finally {
      setIsDeletingExpense(false);
    }
  };

  // ==========================================
  // SEED & CLEAR DATA ĐỂ TEST API
  // ==========================================
  const handleSeedMockData = async () => {
    if (members.length === 0) {
      showToast("Chuyến đi chưa có đủ thành viên để nạp chi phí mẫu.", "error");
      return;
    }

    try {
      setIsSeeding(true);
      const ownerId = members.find((m) => m.role === "owner")?.user_id || currentUserId;
      const otherMemberId = members.find((m) => m.user_id !== ownerId)?.user_id || ownerId;

      const sampleItems = [
        {
          amount: 650000,
          description: "Lẩu gà lá é Tao Ngộ & Nước ngọt",
          category: "food",
          paid_by: ownerId,
          split_method: "equal",
          expense_date: "2026-10-15",
        },
        {
          amount: 1800000,
          description: "Tiền phòng Homestay Đà Lạt 2 đêm",
          category: "hotel",
          paid_by: ownerId,
          split_method: "equal",
          expense_date: "2026-10-15",
        },
        {
          amount: 400000,
          description: "Vé cáp treo đồi Robin & Cổng trời",
          category: "tickets",
          paid_by: otherMemberId,
          split_method: "equal",
          expense_date: "2026-10-16",
        },
        {
          amount: 350000,
          description: "Thuê 2 xe máy & Đổ xăng dạo phố",
          category: "transport",
          paid_by: ownerId,
          split_method: "equal",
          expense_date: "2026-10-16",
        },
      ];

      for (const item of sampleItems) {
        await fetch(`/api/trips/${tripId}/expenses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
      }

      showToast("Đã nạp 4 khoản chi mẫu vào CSDL Supabase thành công!");
      await fetchData();
    } catch (err: any) {
      showToast(err.message || "Lỗi nạp dữ liệu mẫu.", "error");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearAllExpenses = async () => {
    if (expenses.length === 0) return;
    try {
      setIsClearing(true);
      for (const e of expenses) {
        await fetch(`/api/trips/${tripId}/expenses/${e.id}`, {
          method: "DELETE",
        });
      }
      showToast("Đã dọn dẹp các khoản chi thử nghiệm thành công!");
      await fetchData();
    } catch (err: any) {
      showToast(err.message || "Lỗi dọn dẹp khoản chi.", "error");
    } finally {
      setIsClearing(false);
    }
  };

  // Render skeleton loading
  if (isLoading) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-pulse">
        <div className="h-28 bg-white rounded-3xl border border-slate-200/80 shadow-xs" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="h-32 bg-slate-200 rounded-3xl" />
          <div className="h-32 bg-slate-200 rounded-3xl" />
          <div className="h-32 bg-slate-200 rounded-3xl" />
          <div className="h-32 bg-slate-200 rounded-3xl" />
        </div>
        <div className="h-44 bg-white rounded-3xl border border-slate-200/80 shadow-xs" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl border flex items-center gap-3 animate-slideUp text-sm font-semibold transition-all ${
            toast.type === "success"
              ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-200/50"
              : toast.type === "info"
              ? "bg-indigo-600 text-white border-indigo-500 shadow-indigo-200/50"
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

      {/* =========================================================================
          KHỐI 1: THẺ TỔNG QUAN TÀI CHÍNH & PHÂN BỔ CHI TIÊU (CHỨC NĂNG 22.0)
      ========================================================================= */}

      {/* 1.1 TIÊU ĐỀ KHỐI VÀ NÚT HÀNH ĐỘNG */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <PieChart className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Tổng quan tài chính & Chi phí
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Đã gắn API thật</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Tài khoản hiện tại: <strong className="text-indigo-600">{currentUserName}</strong> • Dữ liệu tính toán trực tiếp từ CSDL Supabase.
          </p>
        </div>

        {/* Nút hành động kiểm tra API */}
        <div className="flex flex-wrap items-center gap-2">
          {expenses.length === 0 ? (
            <button
              onClick={handleSeedMockData}
              disabled={isSeeding}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Tự động ghi 4 khoản chi mẫu vào Supabase để kiểm tra số liệu"
            >
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />}
              <span>{isSeeding ? "Đang nạp CSDL..." : "⚡ Nạp 4 khoản chi mẫu"}</span>
            </button>
          ) : (
            <button
              onClick={handleClearAllExpenses}
              disabled={isClearing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/80 transition-all cursor-pointer"
              title="Xóa toàn bộ khoản chi để đưa số liệu về 0"
            >
              {isClearing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              <span>Reset dữ liệu</span>
            </button>
          )}

          <button
            onClick={handleOpenAddExpense}
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-100 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Thêm khoản chi mới</span>
          </button>
        </div>
      </div>

      {/* 1.2 HÀNG 4 THẺ THỐNG KÊ TÀI CHÍNH (FINANCIAL KPI CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Thẻ 1: Tổng chi tiêu nhóm */}
        <div className="relative overflow-hidden bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tổng chi tiêu nhóm
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {formatVND(totalAmount)}
            </h3>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <span>{expenses.length} khoản chi</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>{members.length} thành viên</span>
            </p>
          </div>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-indigo-50/50 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Thẻ 2: Bạn đã ứng trước */}
        <div className="relative overflow-hidden bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Bạn đã ứng trước
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black text-purple-700 tracking-tight">
              {formatVND(userPaidAmount)}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Số tiền bạn đã bỏ túi chi trả
            </p>
          </div>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-purple-50/50 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Thẻ 3: Phần chi của bạn */}
        <div className="relative overflow-hidden bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Phần chi của bạn
            </span>
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              {formatVND(userShareAmount)}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Chi phí thực tế bạn cần chịu
            </p>
          </div>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-sky-50/50 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Thẻ 4: Số dư ròng (Net Balance) */}
        <div
          className={`relative overflow-hidden rounded-3xl p-5 border transition-all group ${
            netBalance > 0
              ? "bg-gradient-to-br from-emerald-50/90 to-teal-50/50 border-emerald-200 shadow-xs shadow-emerald-100"
              : netBalance < 0
              ? "bg-gradient-to-br from-rose-50/90 to-orange-50/50 border-rose-200 shadow-xs shadow-rose-100"
              : "bg-white border-slate-200/80 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                netBalance > 0 ? "text-emerald-700" : netBalance < 0 ? "text-rose-700" : "text-slate-500"
              }`}
            >
              {netBalance > 0 ? "Bạn được nhận lại" : netBalance < 0 ? "Bạn cần trả thêm" : "Đã quyết toán"}
            </span>
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                netBalance > 0
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                  : netBalance < 0
                  ? "bg-rose-600 text-white shadow-md shadow-rose-200"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {netBalance > 0 ? (
                <TrendingUp className="w-5 h-5" />
              ) : netBalance < 0 ? (
                <TrendingDown className="w-5 h-5" />
              ) : (
                <Scale className="w-5 h-5" />
              )}
            </div>
          </div>
          <div className="space-y-1">
            <h3
              className={`text-2xl sm:text-3xl font-black tracking-tight ${
                netBalance > 0 ? "text-emerald-700" : netBalance < 0 ? "text-rose-700" : "text-slate-800"
              }`}
            >
              {netBalance > 0 ? `+${formatVND(netBalance)}` : netBalance < 0 ? `-${formatVND(netBalance)}` : "0 ₫"}
            </h3>
            <p
              className={`text-xs font-semibold ${
                netBalance > 0 ? "text-emerald-600" : netBalance < 0 ? "text-rose-600" : "text-slate-500"
              }`}
            >
              {netBalance > 0 ? "🎉 Nhóm còn nợ bạn" : netBalance < 0 ? "⚠️ Cần chuyển khoản bù" : "✅ Hoàn tất công nợ"}
            </p>
          </div>
        </div>
      </div>

      {/* 1.3 THANH PHÂN BỔ CHI TIÊU THEO DANH MỤC (CATEGORY BREAKDOWN BAR) */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <PieChart className="w-4 h-4" />
            </span>
            <h3 className="text-base font-extrabold text-slate-900">
              Phân bổ chi tiêu theo danh mục
            </h3>
          </div>
          <span className="text-xs font-medium text-slate-400">
            Tổng cộng: <strong className="text-slate-700">{formatVND(totalAmount)}</strong>
          </span>
        </div>

        {expenses.length === 0 ? (
          <div className="py-8 text-center bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Chưa có khoản chi nào được ghi nhận trong chuyến đi này.
            </p>
            <p className="text-xs text-slate-400">
              Bạn có thể bấm nút <strong>"⚡ Nạp 4 khoản chi mẫu"</strong> ở trên để thử nghiệm tính toán công nợ và phân bổ danh mục.
            </p>
          </div>
        ) : (
          <>
            {/* Thanh tiến độ đa đoạn (Multi-segment bar) */}
            <div className="w-full h-4 sm:h-5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              {categoryBreakdown.map((cat) => (
                <div
                  key={cat.id}
                  style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                  title={`${cat.name}: ${formatVND(cat.amount)} (${cat.percentage}%)`}
                  className="h-full transition-all duration-700 hover:opacity-90 relative group/seg cursor-pointer"
                />
              ))}
            </div>

            {/* Bảng chi tiết từng danh mục bên dưới */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
              {categoryBreakdown.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-xs transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">{cat.icon}</span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 truncate" title={cat.name}>
                      {cat.name}
                    </p>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                        {formatVND(cat.amount)}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        {cat.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* =========================================================================
          KHỐI 2: BẢNG CÔNG NỢ THÔNG MINH ("AI NỢ AI BAO NHIÊU") & ĐÁNH DẤU THANH TOÁN (CN 21.0 & 24.0)
      ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
        {/* Header Khối 2 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <ArrowRightLeft className="w-5 h-5" />
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Bảng công nợ thông minh & Quyết toán
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                Mục D • CN 21.0 & 24.0
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Tự động tối giản hóa giao dịch trả nợ theo mô hình "Ai nợ ai bao nhiêu" để nhóm thanh toán nhanh nhất.
            </p>
          </div>

          {/* Sub-tabs chuyển giữa: Cần thanh toán & Đã quyết toán */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl self-start sm:self-auto">
            <button
              onClick={() => setDebtTab("unsettled")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                debtTab === "unsettled"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Cần thanh toán</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  debtTab === "unsettled" ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-600"
                }`}
              >
                {unsettledDebts.length}
              </span>
            </button>

            <button
              onClick={() => setDebtTab("settled")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                debtTab === "settled"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Đã quyết toán</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  debtTab === "settled" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                }`}
              >
                {settledDebts.length}
              </span>
            </button>
          </div>
        </div>

        {/* Tab 1: Cần thanh toán (Unsettled Debts) */}
        {debtTab === "unsettled" && (
          <div>
            {unsettledDebts.length === 0 ? (
              <div className="py-12 text-center bg-slate-50/60 rounded-3xl border border-dashed border-slate-200 space-y-3">
                <div className="w-14 h-14 mx-auto rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h4 className="text-base font-bold text-slate-800">
                    Sòng phẳng & Tuyệt vời!
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Không còn khoản công nợ nào cần thanh toán giữa các thành viên trong chuyến đi.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unsettledDebts.map((debt) => {
                  const fromInfo = getMemberInfo(debt.fromUserId);
                  const toInfo = getMemberInfo(debt.toUserId);
                  const opKey = `${debt.fromUserId}->${debt.toUserId}`;
                  const isOperating = settlingKey === opKey;

                  // Kiểm tra vai trò của người dùng hiện tại
                  const isPayer = fromInfo.isMe; // Tôi là người nợ
                  const isReceiver = toInfo.isMe; // Tôi là người nhận

                  return (
                    <div
                      key={opKey}
                      className="relative overflow-hidden bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-4"
                    >
                      {/* Sơ đồ dòng tiền: Người nợ -> Số tiền -> Người nhận */}
                      <div className="flex items-center justify-between gap-3">
                        {/* Người nợ (From) */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs shrink-0 border border-rose-200">
                            {fromInfo.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                              {fromInfo.name}
                            </p>
                            <span className="inline-block text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                              Người nợ
                            </span>
                          </div>
                        </div>

                        {/* Mũi tên chuyển khoản & Số tiền */}
                        <div className="flex flex-col items-center justify-center shrink-0 px-2">
                          <span className="text-xs sm:text-sm font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
                            {formatVND(debt.amount)}
                          </span>
                          <div className="flex items-center gap-1 text-slate-300 mt-1">
                            <span className="w-6 h-0.5 bg-slate-200" />
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                        </div>

                        {/* Người nhận (To) */}
                        <div className="flex items-center gap-2.5 min-w-0 text-right justify-end">
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                              {toInfo.name}
                            </p>
                            <span className="inline-block text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                              Người nhận
                            </span>
                          </div>
                          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs shrink-0 border border-emerald-200">
                            {toInfo.initials}
                          </div>
                        </div>
                      </div>

                      {/* Nút hành động đánh dấu đã thanh toán (Feature 24.0) */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                        <span className="text-[11px] text-slate-500 font-medium">
                          {isPayer
                            ? "Bạn cần chuyển khoản số tiền này"
                            : isReceiver
                            ? "Bạn sẽ nhận được số tiền này"
                            : "Thanh toán nội bộ nhóm"}
                        </span>

                        <button
                          onClick={() => handleSettleDebt(debt.fromUserId, debt.toUserId, true)}
                          disabled={isOperating}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
                          title="Đánh dấu các thành viên đã chuyển khoản dứt điểm nợ"
                        >
                          {isOperating ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          )}
                          <span>
                            {isPayer
                              ? "Tôi đã chuyển khoản"
                              : isReceiver
                              ? "Xác nhận đã nhận"
                              : "Xác nhận đã trả"}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Đã quyết toán (Settled Debts) */}
        {debtTab === "settled" && (
          <div>
            {settledDebts.length === 0 ? (
              <div className="py-10 text-center bg-slate-50/60 rounded-3xl border border-dashed border-slate-200 space-y-2">
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Chưa có khoản công nợ nào được đánh dấu hoàn tất.
                </p>
                <p className="text-xs text-slate-400">
                  Khi bạn bấm "Xác nhận đã trả" ở Tab Cần thanh toán, các giao dịch sẽ hiển thị ở đây.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {settledDebts.map((debt) => {
                  const fromInfo = getMemberInfo(debt.fromUserId);
                  const toInfo = getMemberInfo(debt.toUserId);
                  const opKey = `${debt.fromUserId}->${debt.toUserId}`;
                  const isOperating = settlingKey === opKey;

                  return (
                    <div
                      key={opKey}
                      className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-700">
                            {fromInfo.name}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs font-bold text-slate-700">
                            {toInfo.name}
                          </span>
                        </div>

                        <span className="text-xs sm:text-sm font-extrabold text-slate-800">
                          {formatVND(debt.amount)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Đã quyết toán xong</span>
                        </span>

                        <button
                          onClick={() => handleSettleDebt(debt.fromUserId, debt.toUserId, false)}
                          disabled={isOperating}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200/80 transition-colors cursor-pointer"
                          title="Hoàn tác để chuyển khoản này về Cần thanh toán"
                        >
                          {isOperating ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3 h-3" />
                          )}
                          <span>Hoàn tác</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          KHỐI 3: DANH SÁCH LỊCH SỬ KHOẢN CHI & BỘ LỌC TÌM KIẾM (CHỨC NĂNG 23.0)
      ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
        {/* Header Khối 3 & Thanh công cụ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Receipt className="w-5 h-5" />
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Lịch sử chi tiêu ({filteredExpenses.length})
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                Mục D • CN 23.0
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Danh sách toàn bộ các khoản chi tiêu đã phát sinh trong chuyến đi, hỗ trợ lọc và xem chi tiết phân chia.
            </p>
          </div>

          <button
            onClick={handleOpenAddExpense}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Thêm khoản chi</span>
          </button>
        </div>

        {/* Thanh tìm kiếm và các bộ lọc nhanh */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Ô tìm kiếm theo tên khoản chi */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm khoản chi (lẩu, homestay...)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 2. Lọc theo Người trả tiền */}
          <div>
            <select
              value={filterPaidBy}
              onChange={(e) => setFilterPaidBy(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="all">Tất cả người trả tiền</option>
              {members.map((m) => (
                <option key={m.user_id} value={m.user_id}>
                  {m.user_id === currentUserId
                    ? `Bạn (${currentUserName})`
                    : m.profiles?.full_name || "Thành viên"}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Lọc theo Danh mục */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="all">Tất cả danh mục chi</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Sắp xếp */}
          <div>
            <select
              value={filterSort}
              onChange={(e) => setFilterSort(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="newest">Ngày chi: Mới nhất trước</option>
              <option value="oldest">Ngày chi: Cũ nhất trước</option>
              <option value="highest">Số tiền: Cao nhất trước</option>
              <option value="lowest">Số tiền: Thấp nhất trước</option>
            </select>
          </div>
        </div>

        {/* Danh sách các thẻ khoản chi */}
        {filteredExpenses.length === 0 ? (
          <div className="py-12 text-center bg-slate-50/60 rounded-3xl border border-dashed border-slate-200 space-y-2">
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Không tìm thấy khoản chi nào phù hợp với bộ lọc hiện tại.
            </p>
            {(searchQuery || filterPaidBy !== "all" || filterCategory !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterPaidBy("all");
                  setFilterCategory("all");
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại bộ lọc</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExpenses.map((expense) => {
              const cat = EXPENSE_CATEGORIES.find((c) => c.id === (expense.category || "other")) || EXPENSE_CATEGORIES[5];
              const paidInfo = getMemberInfo(expense.paid_by);
              const splits = expense.expense_splits || [];
              const mySplit = splits.find((s) => s.user_id === currentUserId);
              const isMyExpense = expense.paid_by === currentUserId;

              return (
                <div
                  key={expense.id}
                  className="group bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Cột trái: Icon danh mục & Chi tiết nội dung */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 border shadow-2xs group-hover:scale-105 transition-transform ${cat.bgColor}/10 border-${cat.color}/20`}
                      style={{ backgroundColor: `${cat.color}15`, borderColor: `${cat.color}30` }}
                    >
                      {cat.icon}
                    </div>

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded-md text-[11px] font-bold border"
                          style={{
                            backgroundColor: `${cat.color}10`,
                            color: cat.color,
                            borderColor: `${cat.color}30`,
                          }}
                        >
                          {cat.name}
                        </span>

                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDateDisplay(expense.expense_date)}</span>
                        </span>

                        {expense.receipt_image_url && (
                          <button
                            onClick={() => setReceiptLightbox(expense.receipt_image_url)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-colors cursor-pointer"
                            title="Xem hóa đơn đính kèm"
                          >
                            <ImageIcon className="w-3 h-3" />
                            <span>Xem hóa đơn</span>
                          </button>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                        {expense.description}
                      </h4>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                        <span>
                          Người trả: <strong className="text-slate-800">{paidInfo.name}</strong>
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>
                          {expense.split_method === "equal"
                            ? `Chia đều (${splits.length} người)`
                            : expense.split_method === "percentage"
                            ? "Chia theo %"
                            : "Chia tùy chỉnh"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cột phải: Số tiền, Phần của bạn & Nút hành động */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <p className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        {formatVND(expense.amount)}
                      </p>
                      {mySplit && (
                        <p className="text-[11px] font-semibold text-slate-500">
                          Phần của bạn: <strong className="text-indigo-600">{formatVND(mySplit.amount_owed)}</strong>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Nút xem chi tiết phân chia */}
                      <button
                        onClick={() => setSelectedExpenseForDetail(expense)}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        title="Xem chi tiết phân chia ai nợ bao nhiêu"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Nút chỉnh sửa khoản chi */}
                      <button
                        onClick={() => handleOpenEditExpense(expense)}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        title="Chỉnh sửa khoản chi này"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {/* Nút xóa khoản chi */}
                      <button
                        onClick={() => setDeleteExpenseConfirm(expense)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Xóa khoản chi này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL: CHI TIẾT PHÂN CHIA KHOẢN CHI (EXPENSE DETAIL MODAL)
      ========================================================================= */}
      {selectedExpenseForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Chi tiết khoản chi & Phân chia
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {formatDateDisplay(selectedExpenseForDetail.expense_date)} • {selectedExpenseForDetail.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedExpenseForDetail(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thông tin tổng quát */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Tổng số tiền:</span>
                <p className="text-base font-black text-slate-900 mt-0.5">
                  {formatVND(selectedExpenseForDetail.amount)}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Người đã thanh toán:</span>
                <p className="text-sm font-bold text-indigo-700 mt-0.5">
                  {getMemberInfo(selectedExpenseForDetail.paid_by).name}
                </p>
              </div>
            </div>

            {/* Bảng chi tiết từng người gánh bao nhiêu */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Phân bổ cho từng thành viên:
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {(selectedExpenseForDetail.expense_splits || []).map((split) => {
                  const mInfo = getMemberInfo(split.user_id);
                  const isPayer = split.user_id === selectedExpenseForDetail.paid_by;

                  return (
                    <div
                      key={split.id || split.user_id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[11px]">
                          {mInfo.initials}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{mInfo.name}</p>
                          <span className="text-[10px] text-slate-400">
                            {isPayer ? "Đã trả tiền trước" : split.is_settled ? "Đã thanh toán" : "Chưa thanh toán"}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-extrabold text-slate-900">
                          {formatVND(split.amount_owed)}
                        </p>
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isPayer || split.is_settled
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {isPayer ? "Người chi trả" : split.is_settled ? "Đã trả nợ ✅" : "Đang nợ ⏳"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ảnh hóa đơn nếu có */}
            {selectedExpenseForDetail.receipt_image_url && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block mb-2">Hóa đơn / Biên lai:</span>
                <div
                  onClick={() => setReceiptLightbox(selectedExpenseForDetail.receipt_image_url)}
                  className="relative group w-32 h-24 rounded-2xl overflow-hidden border border-slate-200 cursor-zoom-in"
                >
                  <img
                    src={selectedExpenseForDetail.receipt_image_url}
                    alt="Hóa đơn"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedExpenseForDetail(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: XÁC NHẬN XÓA KHOẢN CHI
      ========================================== */}
      {deleteExpenseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-center animate-scaleUp">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">
                Xác nhận xóa khoản chi?
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Bạn có chắc muốn xóa khoản chi <strong className="text-slate-800">"{deleteExpenseConfirm.description}"</strong> trị giá <strong className="text-slate-800">{formatVND(deleteExpenseConfirm.amount)}</strong>?
                Toàn bộ các phần chia nợ liên quan cũng sẽ bị hủy.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteExpenseConfirm(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isDeletingExpense}
                onClick={handleDeleteSingleExpense}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isDeletingExpense && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Xóa khoản chi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: LIGHTBOX PHÓNG TO HÓA ĐƠN
      ========================================== */}
      {receiptLightbox && (
        <div
          onClick={() => setReceiptLightbox(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn cursor-zoom-out"
        >
          <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl">
            <img
              src={receiptLightbox}
              alt="Hóa đơn phóng to"
              className="w-full h-full object-contain max-h-[85vh] rounded-2xl"
            />
            <button
              onClick={() => setReceiptLightbox(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          KHỐI 4: MODAL THÊM / CHỈNH SỬA KHOẢN CHI & 3 CÁCH CHIA TIỀN (CN 19.0 & 20.0)
      ========================================================================= */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full my-6 p-5 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp max-h-[92vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  {expenseModalMode === "add" ? (
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <Pencil className="w-5 h-5 stroke-[2.5]" />
                  )}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    {expenseModalMode === "add" ? "Thêm khoản chi mới" : "Chỉnh sửa khoản chi"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {tripName} • Nhập thông tin & chọn cách chia tiền linh hoạt
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form nội dung */}
            <form onSubmit={handleSubmitExpense} className="space-y-5">
              {/* 1. SỐ TIỀN CHI TIÊU */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Số tiền chi tiêu (VNĐ) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0"
                    autoFocus
                    className="w-full text-2xl sm:text-3xl font-black text-slate-900 pl-4 pr-12 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-hidden transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg sm:text-xl font-black text-slate-400">
                    ₫
                  </span>
                </div>

                {/* Các nút thêm nhanh số tiền */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-400 mr-1">Cộng nhanh:</span>
                  {[
                    { label: "+50k", val: 50000 },
                    { label: "+100k", val: 100000 },
                    { label: "+200k", val: 200000 },
                    { label: "+500k", val: 500000 },
                    { label: "+1Tr", val: 1000000 },
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => addQuickAmount(chip.val)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-colors cursor-pointer"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. TÊN KHOẢN CHI / MÔ TẢ */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nội dung chi tiêu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ví dụ: Ăn tối lẩu gà lá é, Tiền thuê xe máy, Vé Cáp treo..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-hidden transition-all"
                />
              </div>

              {/* 3. NGƯỜI THANH TOÁN & NGÀY CHI TIÊU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Người thanh toán */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Người thanh toán <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formPaidBy}
                    onChange={(e) => setFormPaidBy(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-hidden transition-all cursor-pointer"
                  >
                    {members.map((m) => {
                      const info = getMemberInfo(m.user_id);
                      return (
                        <option key={m.user_id} value={m.user_id}>
                          {info.name} {info.isMe ? "(Bạn)" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Ngày chi tiêu */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Ngày chi tiêu
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-hidden transition-all cursor-pointer"
                  />
                </div>
              </div>

              {/* 4. DANH MỤC CHI TIÊU */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Danh mục chi tiêu
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EXPENSE_CATEGORIES.map((cat) => {
                    const isSelected = formCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormCategory(cat.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-200 text-indigo-900 font-extrabold shadow-2xs"
                            : "bg-slate-50/80 border-slate-200 hover:bg-slate-100 text-slate-700 font-medium"
                        }`}
                      >
                        <span className="text-lg">{cat.icon}</span>
                        <span className="text-xs truncate">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. ĐÍNH KÈM HÓA ĐƠN / BIÊN LAI */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Hóa đơn / Biên lai kèm theo
                </label>

                {receiptPreviewUrl ? (
                  <div className="relative inline-block border border-slate-200 rounded-2xl overflow-hidden group">
                    <img
                      src={receiptPreviewUrl}
                      alt="Ảnh hóa đơn"
                      className="w-32 h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setReceiptLightbox(receiptPreviewUrl)}
                        className="p-1.5 rounded-lg bg-white/90 text-slate-800 hover:bg-white text-xs font-bold"
                        title="Xem ảnh"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveReceipt}
                        className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold"
                        title="Xóa ảnh"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/60 hover:bg-indigo-50/20 rounded-2xl cursor-pointer transition-colors">
                    <div className="flex flex-col items-center justify-center pt-2 pb-2 text-center">
                      <Upload className="w-5 h-5 text-indigo-500 mb-1" />
                      <p className="text-xs text-slate-600 font-bold">
                        Bấm để chọn ảnh hóa đơn / bill
                      </p>
                      <p className="text-[10px] text-slate-400">PNG, JPG hoặc WEBP (Tối đa 5MB)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleReceiptFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* ==========================================
                  6. CƠ CHẾ 3 CÁCH CHIA TIỀN (CN 20.0)
              ========================================== */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Cách thức phân chia tiền (3 phương thức)
                  </label>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Tổng tiền: <strong className="text-indigo-600">{formatVND(parsedFormAmount)}</strong>
                  </span>
                </div>

                {/* 3 Tab Selector */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/90 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setFormSplitMethod("equal")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      formSplitMethod === "equal"
                        ? "bg-white text-indigo-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    1. Chia đều
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormSplitMethod("percentage")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      formSplitMethod === "percentage"
                        ? "bg-white text-indigo-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    2. Theo tỷ lệ %
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormSplitMethod("custom")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      formSplitMethod === "custom"
                        ? "bg-white text-indigo-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    3. Tùy chỉnh tiền
                  </button>
                </div>

                {/* --- TAB 1: CHIA ĐỀU (EQUAL) --- */}
                {formSplitMethod === "equal" && (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600">
                        Người tham gia:{" "}
                        <strong className="text-indigo-600">
                          {selectedParticipants.length} / {members.length}
                        </strong>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={selectAllParticipants}
                          className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                        >
                          Chọn tất cả
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={deselectAllParticipants}
                          className="text-[11px] font-bold text-slate-500 hover:underline cursor-pointer"
                        >
                          Bỏ chọn
                        </button>
                      </div>
                    </div>

                    {selectedParticipants.length > 0 && parsedFormAmount > 0 && (
                      <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-2.5 text-xs font-medium text-indigo-900 flex items-center justify-between">
                        <span>Mỗi người được chọn sẽ trả:</span>
                        <strong className="text-sm font-black text-indigo-700">
                          {formatVND(Math.round(parsedFormAmount / selectedParticipants.length))}
                        </strong>
                      </div>
                    )}

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {members.map((m) => {
                        const isSelected = selectedParticipants.includes(m.user_id);
                        const info = getMemberInfo(m.user_id);
                        const perPerson =
                          selectedParticipants.length > 0
                            ? Math.round(parsedFormAmount / selectedParticipants.length)
                            : 0;

                        return (
                          <div
                            key={m.user_id}
                            onClick={() => toggleParticipant(m.user_id)}
                            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-white border-indigo-200 shadow-2xs"
                                : "bg-slate-100/50 border-slate-200/60 opacity-60"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-indigo-600" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400" />
                              )}
                              <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-700">
                                {info.avatar ? (
                                  <img
                                    src={info.avatar}
                                    alt={info.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  info.name.charAt(0).toUpperCase()
                                )}
                              </div>
                              <span className="text-xs font-bold text-slate-800">
                                {info.name} {info.isMe ? "(Bạn)" : ""}
                              </span>
                            </div>

                            <span className="text-xs font-extrabold text-slate-700">
                              {isSelected ? formatVND(perPerson) : "0 ₫"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* --- TAB 2: THEO TỶ LỆ % (PERCENTAGE) --- */}
                {formSplitMethod === "percentage" && (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600">Tổng tỷ lệ:</span>
                        <span
                          className={`text-xs font-black px-2 py-0.5 rounded-md ${
                            Math.round(totalPercentage) === 100
                              ? "bg-emerald-100 text-emerald-800"
                              : totalPercentage < 100
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {totalPercentage}% / 100%
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={distributeEqualPercentage}
                        className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                      >
                        Chia đều %
                      </button>
                    </div>

                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {members.map((m) => {
                        const info = getMemberInfo(m.user_id);
                        const pct = Number(percentageMap[m.user_id]) || 0;
                        const owed = Math.round((parsedFormAmount * pct) / 100);

                        return (
                          <div
                            key={m.user_id}
                            className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-700 shrink-0">
                                {info.avatar ? (
                                  <img
                                    src={info.avatar}
                                    alt={info.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  info.name.charAt(0).toUpperCase()
                                )}
                              </div>
                              <span className="text-xs font-bold text-slate-800 truncate">
                                {info.name} {info.isMe ? "(Bạn)" : ""}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-xs font-bold text-indigo-600">
                                {formatVND(owed)}
                              </span>
                              <div className="relative w-20">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={percentageMap[m.user_id] ?? ""}
                                  onChange={(e) =>
                                    handlePercentageChange(m.user_id, e.target.value)
                                  }
                                  className="w-full text-right pr-6 py-1 px-2 text-xs font-extrabold rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                  %
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* --- TAB 3: TÙY CHỈNH SỐ TIỀN (CUSTOM) --- */}
                {formSplitMethod === "custom" && (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600">Đã chia:</span>
                        <span
                          className={`text-xs font-black px-2 py-0.5 rounded-md ${
                            Math.round(totalCustomAmount) === Math.round(parsedFormAmount)
                              ? "bg-emerald-100 text-emerald-800"
                              : totalCustomAmount < parsedFormAmount
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {formatVND(totalCustomAmount)} / {formatVND(parsedFormAmount)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={distributeEqualCustom}
                        className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                      >
                        Chia đều tiền
                      </button>
                    </div>

                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {members.map((m) => {
                        const info = getMemberInfo(m.user_id);
                        const val = customAmountMap[m.user_id] || 0;

                        return (
                          <div
                            key={m.user_id}
                            className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-700 shrink-0">
                                {info.avatar ? (
                                  <img
                                    src={info.avatar}
                                    alt={info.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  info.name.charAt(0).toUpperCase()
                                )}
                              </div>
                              <span className="text-xs font-bold text-slate-800 truncate">
                                {info.name} {info.isMe ? "(Bạn)" : ""}
                              </span>
                            </div>

                            <div className="relative w-36 shrink-0">
                              <input
                                type="text"
                                value={val ? val.toLocaleString("vi-VN") : ""}
                                onChange={(e) =>
                                  handleCustomMemberAmountChange(m.user_id, e.target.value)
                                }
                                placeholder="0"
                                className="w-full text-right pr-6 py-1 px-2.5 text-xs font-extrabold rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                ₫
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* THÔNG BÁO LỖI NẾU CÓ */}
              {formError && (
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* FOOTER ACTIONS */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingExpense || isUploadingReceipt}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {(isSubmittingExpense || isUploadingReceipt) && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  <span>
                    {isUploadingReceipt
                      ? "Đang tải ảnh..."
                      : isSubmittingExpense
                      ? "Đang lưu..."
                      : expenseModalMode === "add"
                      ? "Thêm khoản chi"
                      : "Lưu thay đổi"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
