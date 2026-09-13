import DashboardSurface from "../../components/dashboard/DashboardSurface";
import SettingsStudio from "../../components/settings/SettingsStudio";
import { getCurrentUser } from "@/lib/current-user";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Settings — World Liberty Token",
  description: "Manage profile, security, wallet, notifications, and account preferences.",
};

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/user/settings");
  }

  return (
    <DashboardSurface user={user} panel="admin" activeNav="settings">
      <SettingsStudio panel="admin" />
    </DashboardSurface>
  );
}
