import DashboardSurface from "../../components/dashboard/DashboardSurface";
import AchievementStudio from "../../components/achievements/AchievementStudio";
import { getCurrentUser } from "@/lib/current-user";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Achievements — World Liberty Token",
  description: "Personal, network, mining, referral, and loyalty badges.",
};

export default async function UserAchievementsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardSurface user={user} panel="user" activeNav="achievements">
      <AchievementStudio />
    </DashboardSurface>
  );
}
