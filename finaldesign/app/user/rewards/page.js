import DashboardSurface from "../../components/dashboard/DashboardSurface";
import RewardsStudio from "../../components/rewards/RewardsStudio";
import { getCurrentUser } from "@/lib/current-user";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Daily Rewards — World Liberty Token",
  description: "Catch seven WLT coins to claim your daily reward.",
};

export default async function UserRewardsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardSurface user={user} panel="user" activeNav="rewards">
      <RewardsStudio panel="user" />
    </DashboardSurface>
  );
}
