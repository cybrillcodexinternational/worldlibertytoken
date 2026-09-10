import DashboardSurface from "../components/dashboard/DashboardSurface";
import { getCurrentUser } from "@/lib/current-user";
import { redirect } from "next/navigation";

export const metadata = {
  title: "User Panel — World Liberty Token",
  description: "User dashboard for World Liberty Token.",
};

export default async function UserPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <DashboardSurface user={user} panel="user" />;
}
