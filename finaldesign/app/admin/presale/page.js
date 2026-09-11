import DashboardSurface from "../../components/dashboard/DashboardSurface";
import PresaleStudio from "../../components/presale/PresaleStudio";
import { getCurrentUser } from "@/lib/current-user";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Presale Control — World Liberty Token",
  description: "Monitor WLT presale purchases and investor commissions.",
};

export default async function AdminPresalePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/user/presale");
  }

  return (
    <DashboardSurface user={user} panel="admin" activeNav="presale">
      <PresaleStudio panel="admin" />
    </DashboardSurface>
  );
}
