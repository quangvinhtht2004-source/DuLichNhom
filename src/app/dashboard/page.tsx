import TripDashboard from "@/components/trip-dashboard";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Trang tổng quan chuyến đi | Trippo",
  description: "Quản lý các chuyến đi du lịch nhóm, theo dõi lịch trình và chi phí cùng bạn bè trên Trippo.",
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
        data ? data.avatar_url : (user.user_metadata?.avatar_url || user.user_metadata?.picture || null),
      email: user.email,
    };
  }

  return <TripDashboard initialProfile={initialProfile} />;
}

