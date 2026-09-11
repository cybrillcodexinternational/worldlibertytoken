import DashboardSurface from "../../components/dashboard/DashboardSurface";
import WalletStudio from "../../components/wallet/WalletStudio";
import { getCurrentUser } from "@/lib/current-user";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Transactions — World Liberty Token",
  description: "Admin ledger of mining, presale, referral, and withdrawal activity.",
};

export default async function AdminTransactionsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/user/transactions");
  }

  return (
    <DashboardSurface user={user} panel="admin" activeNav="transactions">
      <WalletStudio panel="admin" defaultTab="activity" />
    </DashboardSurface>
  );
}
