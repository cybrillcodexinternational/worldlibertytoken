import AuthShell from "../components/auth/AuthShell";
import RegisterForm from "../components/auth/RegisterForm";

export const metadata = {
  title: "Register — Robotic Networks Research",
  description: "Create an account to follow robotics research and save learning resources.",
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
          Research Account.
        </>
      }
      description="Create an account to follow research topics, save resources, and keep up with robotics and intelligent systems."
      highlights={["Research Library", "Topic Updates", "Community"]}
    >
      <RegisterForm />
    </AuthShell>
  );
}
