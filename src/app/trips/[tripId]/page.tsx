import ItineraryView from "@/components/itinerary-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lịch trình chi tiết chuyến đi | Trippo",
  description: "Xem và quản lý lịch trình chi tiết theo từng ngày, mốc giờ và hoạt động chuyến đi.",
};

interface PageProps {
  params: Promise<{ tripId: string }>;
}

export default async function TripDetailPage({ params }: PageProps) {
  const { tripId } = await params;
  return <ItineraryView tripId={tripId} />;
}

