import TripDashboard from "@/components/trip-dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đà Lạt 4N3Đ – Săn mây cùng nhóm | TripTogether",
  description: "Trang tổng quan lịch trình, chi phí và phân công công việc chuyến đi Đà Lạt cùng bạn bè.",
};

export default function DashboardPage() {
  return <TripDashboard />;
}

