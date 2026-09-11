import DashboardSurface from "../../components/dashboard/DashboardSurface";
import WalletStudio from "../../components/wallet/WalletStudio";
import { getCurrentUser } from "@/lib/current-user";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Transactions — World Liberty Token",
  description: "Full history of mined, purchased, referral, and withdrawn balances.",
};

export default async function UserTransactionsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardSurface user={user} panel="user" activeNav="transactions">
      <WalletStudio panel="user" defaultTab="activity" />
    </DashboardSurface>
  );
}
