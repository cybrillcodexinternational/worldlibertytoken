import DashboardSurface from "../components/dashboard/DashboardSurface";
import { getCurrentUser } from "@/lib/current-user";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin Panel — World Liberty Token",
  description: "Administration panel for World Liberty Token.",
};

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/user");
  }

  return <DashboardSurface user={user} panel="admin" />;
}
