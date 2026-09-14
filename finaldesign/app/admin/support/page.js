import DashboardSurface from "../../components/dashboard/DashboardSurface";
import SupportStudio from "../../components/support/SupportStudio";
import { getCurrentUser } from "@/lib/current-user";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Support Desk — World Liberty Token",
  description: "Answer and manage member support tickets.",
};

export default async function AdminSupportPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/user/support");
  }

  return (
    <DashboardSurface user={user} panel="admin" activeNav="support">
      <SupportStudio panel="admin" />
    </DashboardSurface>
  );
}
