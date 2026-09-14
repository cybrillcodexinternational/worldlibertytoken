import DashboardSurface from "../../components/dashboard/DashboardSurface";
import SupportStudio from "../../components/support/SupportStudio";
import { getCurrentUser } from "@/lib/current-user";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Support — World Liberty Token",
  description: "Open and track support tickets for wallet, presale, mining, and account help.",
};

export default async function UserSupportPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardSurface user={user} panel="user" activeNav="support">
      <SupportStudio panel="user" />
    </DashboardSurface>
  );
}
