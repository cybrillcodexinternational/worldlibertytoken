import DashboardSurface from "../../components/dashboard/DashboardSurface";
import AirdropAdminStudio from "../../components/airdrops/AirdropAdminStudio";
import { getCurrentUser } from "@/lib/current-user";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Airdrop Control — World Liberty Token",
  description: "Configure private presale airdrop rates and Saturday-night distribution.",
};

export default async function AdminAirdropsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/user/airdrops");
  }

  return (
    <DashboardSurface user={user} panel="admin" activeNav="airdrops">
      <AirdropAdminStudio />
    </DashboardSurface>
  );
}
