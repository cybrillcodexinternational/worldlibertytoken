import DashboardSurface from "../../components/dashboard/DashboardSurface";
import UsersStudio from "../../components/admin/UsersStudio";
import { getCurrentUser } from "@/lib/current-user";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Users — World Liberty Token",
  description: "Admin control of registered accounts.",
};

export default async function AdminUsersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/user");
  }

  return (
    <DashboardSurface user={user} panel="admin" activeNav="users">
      <UsersStudio />
    </DashboardSurface>
  );
}
