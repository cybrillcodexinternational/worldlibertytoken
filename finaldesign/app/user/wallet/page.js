import DashboardSurface from "../../components/dashboard/DashboardSurface";
import WalletStudio from "../../components/wallet/WalletStudio";
import { getCurrentUser } from "@/lib/current-user";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Wallet — World Liberty Token",
  description: "Connect Phantom and control mined, presale, and referral balances.",
};

export default async function UserWalletPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardSurface user={user} panel="user" activeNav="wallet">
      <WalletStudio panel="user" />
    </DashboardSurface>
  );
}
