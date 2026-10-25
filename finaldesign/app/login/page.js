import AuthShell from "../components/auth/AuthShell";
import LoginForm from "../components/auth/LoginForm";

export const metadata = {
  title: "Login — Robotic Networks Research",
  description: "Sign in to your Robotic Networks Research account.",
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
      description="Sign in to access your research library, saved resources, and the latest robotics insights."
      highlights={["Research Library", "Saved Resources", "Project Updates"]}
    >
      <LoginForm />
    </AuthShell>
  );
}
