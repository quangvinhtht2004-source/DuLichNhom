import ProfileCard from "@/components/profile-card";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân | TripTogether",
  description: "Quản lý thông tin tài khoản và tùy chọn bảo mật cho các chuyến đi nhóm TripTogether.",
};

export default async function ProfilePage() {
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
        "",
      avatar_url:
        data?.avatar_url ||
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        null,
      phone: data?.phone || user.phone || "",
      email: user.email,
      created_at: data?.created_at || user.created_at,
    };
  }

  return <ProfileCard initialProfile={initialProfile} />;
}

