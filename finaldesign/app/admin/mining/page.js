import DashboardSurface from "../../components/dashboard/DashboardSurface";
import MiningStudio from "../../components/mining/MiningStudio";
import { getCurrentUser } from "@/lib/current-user";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Mining Control — World Liberty Token",
  description: "Run and monitor 24-hour WLT mining cycles.",
};

export default async function AdminMiningPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/user/mining");
  }

  return (
    <DashboardSurface user={user} panel="admin" activeNav="mining">
      <MiningStudio />
    </DashboardSurface>
  );
}
