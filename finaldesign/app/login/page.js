import AuthShell from "../components/auth/AuthShell";
import LoginForm from "../components/auth/LoginForm";

export const metadata = {
  title: "Login — World Liberty Token",
  description: "Sign in to your World Liberty Token account.",
};

export default function LoginPage() {
  return (
    <AuthShell
      crumb="Login"
      kicker="Account"
      title={
        <>
          Welcome Back
          <br />
          To The Ecosystem.
        </>
      }
      description="Sign in to access your WLT account, follow ecosystem updates, and stay connected with the community."
      highlights={["Secure Access", "Community", "Ecosystem Tools"]}
    >
      <LoginForm />
    </AuthShell>
  );
}
