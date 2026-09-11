import DashboardSurface from "../../components/dashboard/DashboardSurface";
import ReferralStudio from "../../components/referral/ReferralStudio";
import { getCurrentUser } from "@/lib/current-user";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Referral Program — World Liberty Token",
  description: "Earn 10%, 5%, and 3% from mined WLT across three network levels.",
};

export default async function UserReferralPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardSurface user={user} panel="user" activeNav="referral">
      <ReferralStudio panel="user" />
    </DashboardSurface>
  );
}
