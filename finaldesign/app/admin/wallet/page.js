import DashboardSurface from "../../components/dashboard/DashboardSurface";
import WalletStudio from "../../components/wallet/WalletStudio";
import { getCurrentUser } from "@/lib/current-user";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Wallet Control — World Liberty Token",
  description: "Admin wallet custody for mined WLT, presale allocation, and commissions.",
};

export default async function AdminWalletPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/user/wallet");
  }

  return (
    <DashboardSurface user={user} panel="admin" activeNav="wallet">
      <WalletStudio panel="admin" />
    </DashboardSurface>
  );
}
