import DashboardSurface from "../../components/dashboard/DashboardSurface";
import RewardsStudio from "../../components/rewards/RewardsStudio";
import { getCurrentUser } from "@/lib/current-user";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Scratch & Win — World Liberty Token",
  description: "Scratch a daily ticket to win WLT.",
};

export default async function AdminRewardsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/user/rewards");
  }

  return (
    <DashboardSurface user={user} panel="admin" activeNav="rewards">
      <RewardsStudio panel="admin" />
    </DashboardSurface>
  );
}
