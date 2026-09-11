import DashboardSurface from "../../components/dashboard/DashboardSurface";
import PresaleStudio from "../../components/presale/PresaleStudio";
import { getCurrentUser } from "@/lib/current-user";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Buy / Presale — World Liberty Token",
  description: "Connect Phantom and buy WLT at $0.50 during presale.",
};

export default async function UserPresalePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardSurface user={user} panel="user" activeNav="presale">
      <PresaleStudio panel="user" />
    </DashboardSurface>
  );
}
