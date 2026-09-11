import { Suspense } from "react";
import AuthShell from "../components/auth/AuthShell";
import RegisterForm from "../components/auth/RegisterForm";

export const metadata = {
  title: "Register — World Liberty Token",
  description: "Create your World Liberty Token account and join the ecosystem.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      crumb="Register"
      kicker="Get Started"
      title={
        <>
          Create Your
          <br />
          WLT Account.
        </>
      }
      description="Join World Liberty Token to participate in the ecosystem — built for people, utility, and a brighter tomorrow."
      highlights={["Free To Join", "Mining Referral 10/5/3", "Real Utility"]}
    >
      <Suspense fallback={null}>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
