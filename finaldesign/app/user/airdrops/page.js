import DashboardSurface from "../../components/dashboard/DashboardSurface";
import AirdropStudio from "../../components/airdrops/AirdropStudio";
import { getCurrentUser } from "@/lib/current-user";
import { redirect } from "next/navigation";

export const metadata = {
  title: "My Airdrops — World Liberty Token",
  description: "Track Saturday-night presale airdrops and withdraw received SOL.",
};

export default async function UserAirdropsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardSurface user={user} panel="user" activeNav="airdrops">
      <AirdropStudio panel="user" />
    </DashboardSurface>
  );
}
