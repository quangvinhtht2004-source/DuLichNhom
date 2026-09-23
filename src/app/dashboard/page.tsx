import TripDashboard from "@/components/trip-dashboard";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Đà Lạt 4N3Đ – Săn mây cùng nhóm | TripTogether",
  description: "Trang tổng quan lịch trình, chi phí và phân công công việc chuyến đi Đà Lạt cùng bạn bè.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialProfile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, phone, created_at, updated_at")
      .eq("id", user.id)
      .single();

    initialProfile = {
      full_name:
        data?.full_name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "Bạn",
      avatar_url:
        data?.avatar_url ||
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        null,
      email: user.email,
    };
  }

  return <TripDashboard initialProfile={initialProfile} />;
}

