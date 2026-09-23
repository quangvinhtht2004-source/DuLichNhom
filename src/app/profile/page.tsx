import ProfileCard from "@/components/profile-card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân | TripTogether",
  description: "Quản lý thông tin tài khoản và tùy chọn bảo mật cho các chuyến đi nhóm TripTogether.",
};

export default function ProfilePage() {
  return <ProfileCard />;
}

