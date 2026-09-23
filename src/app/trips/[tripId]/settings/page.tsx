import TripSettings from "@/components/trip-settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cài đặt chuyến đi | Trippo",
  description: "Quản lý thông tin chung, phân quyền thành viên và thiết lập chuyến đi.",
};

interface PageProps {
  params: Promise<{ tripId: string }>;
}

export default async function TripSettingsPage({ params }: PageProps) {
  const { tripId } = await params;
  return <TripSettings tripId={tripId} />;
}
