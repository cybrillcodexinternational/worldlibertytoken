import DashboardSurface from "../components/dashboard/DashboardSurface";
import { getCurrentUser } from "@/lib/current-user";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard — World Liberty Token",
  description: "Main dashboard overview for World Liberty Token members.",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const panel = user.role === "admin" ? "admin" : "user";

  return <DashboardSurface user={user} panel={panel} />;
}
