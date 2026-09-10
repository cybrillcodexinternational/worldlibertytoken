"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import styles from "../../auth/auth.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNote("");
    setSuccess("");

    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          remember,
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        setError(payload.message || "Login failed.");
        return;
      }

      setSuccess(payload.message || "Login successful.");
      router.push(payload.redirectTo || "/user");
      router.refresh();
    } catch {
      setError("Unable to login right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.panel}>
      <p className={styles.panelKicker}>Welcome Back</p>
      <h2 className={styles.panelTitle}>Sign in to WLT</h2>
      <p className={styles.panelText}>
        Access your World Liberty Token account and continue building with the
        ecosystem.
      </p>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <label className={styles.field}>
          <span className={styles.label}>Email</span>
          <span className={styles.inputWrap}>
            <Mail className={styles.leadIcon} size={16} />
            <input
              type="email"
              autoComplete="email"
              placeholder="you@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </span>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Password</span>
          <span className={styles.inputWrap}>
            <Lock className={styles.leadIcon} size={16} />
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              className={styles.toggle}
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </span>
        </label>

        <div className={styles.row}>
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            Remember me
          </label>
          <button
            type="button"
            className={styles.link}
            onClick={() =>
              setNote(
                "Password recovery will be available when the backend is connected."
              )
            }
          >
            Forgot password?
          </button>
        </div>

        {error ? <p className={styles.error}>{error}</p> : null}
        {success ? <p className={styles.success}>{success}</p> : null}
        {note ? <p className={styles.note}>{note}</p> : null}

        <button className={styles.submit} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing In..." : "Login"}
          <ArrowRight size={16} strokeWidth={2.2} />
        </button>
      </form>

      <p className={styles.switch}>
        New to WLT?{" "}
        <Link className={styles.link} href="/register">
          Create an account
        </Link>
      </p>
    </div>
  );
}
