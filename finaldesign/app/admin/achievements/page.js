import DashboardSurface from "../../components/dashboard/DashboardSurface";
import AchievementAdminStudio from "../../components/achievements/AchievementAdminStudio";
import { getCurrentUser } from "@/lib/current-user";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Achievement Control — World Liberty Token",
  description: "Configure achievement badges, thresholds, icons, and rewards.",
};

export default async function AdminAchievementsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/user/achievements");
  }

  return (
    <DashboardSurface user={user} panel="admin" activeNav="achievements">
      <AchievementAdminStudio />
    </DashboardSurface>
  );
}
