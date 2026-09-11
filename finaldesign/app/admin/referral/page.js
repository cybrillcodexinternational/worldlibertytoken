import DashboardSurface from "../../components/dashboard/DashboardSurface";
import ReferralStudio from "../../components/referral/ReferralStudio";
import { getCurrentUser } from "@/lib/current-user";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Referral Control — World Liberty Token",
  description: "Monitor mining referral payouts from the Referral Reward Pool.",
};

export default async function AdminReferralPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/user/referral");
  }

  return (
    <DashboardSurface user={user} panel="admin" activeNav="referral">
      <ReferralStudio panel="admin" />
    </DashboardSurface>
  );
}
