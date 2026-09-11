import DashboardSurface from "../../components/dashboard/DashboardSurface";
import MiningStudio from "../../components/mining/MiningStudio";
import { getCurrentUser } from "@/lib/current-user";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Mining — World Liberty Token",
  description: "Start a 24-hour WLT mining cycle and track live yield.",
};

export default async function UserMiningPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardSurface user={user} panel="user" activeNav="mining">
      <MiningStudio />
    </DashboardSurface>
  );
}
