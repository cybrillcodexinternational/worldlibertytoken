import DashboardSurface from "../../components/dashboard/DashboardSurface";
import MarketStudio from "../../components/market/MarketStudio";
import { getCurrentUser } from "@/lib/current-user";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Market & Charts — World Liberty Token",
  description: "Live top 30 crypto market board and trade charts.",
};

export default async function AdminMarketPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/user/market");
  }

  return (
    <DashboardSurface user={user} panel="admin" activeNav="market">
      <MarketStudio />
    </DashboardSurface>
  );
}
