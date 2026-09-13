import DashboardSurface from "../../components/dashboard/DashboardSurface";
import SettingsStudio from "../../components/settings/SettingsStudio";
import { getCurrentUser } from "@/lib/current-user";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Settings — World Liberty Token",
  description: "Manage profile, security, wallet, notifications, and account preferences.",
};

export default async function UserSettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardSurface user={user} panel="user" activeNav="settings">
      <SettingsStudio panel="user" />
    </DashboardSurface>
  );
}
