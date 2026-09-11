"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Link2, Lock, Mail, User } from "lucide-react";
import styles from "../../auth/auth.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REF_COOKIE = "wlt_ref";

function readCookie(name) {
  if (typeof document === "undefined") {
    return "";
  }
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function writeRefCookie(code) {
  const maxAge = 30 * 24 * 60 * 60;
  document.cookie = `${REF_COOKIE}=${encodeURIComponent(code)}; path=/; max-age=${maxAge}; samesite=lax`;
}

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    const fromUrl = String(searchParams.get("ref") || "").trim();
    const fromCookie = readCookie(REF_COOKIE).trim();
    const code = fromUrl || fromCookie;
    if (!code) {
      return;
    }
    setReferralCode(code.toUpperCase());
    writeRefCookie(code.toUpperCase());
  }, [searchParams]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setNote("");

    if (name.trim().length < 2) {
      setError("Enter your full name.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!accepted) {
      setError("Please accept the terms to continue.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: name,
          email,
          password,
          referralCode,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        setError(payload.message || "Registration failed.");
        return;
      }

      setSuccess(payload.message || "Registration successful.");
      setNote("Redirecting to your panel...");
      router.push(payload.redirectTo || "/user");
      router.refresh();
    } catch {
      setError("Unable to register right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.panel}>
      <p className={styles.panelKicker}>Join The Ecosystem</p>
      <h2 className={styles.panelTitle}>Create your account</h2>
      <p className={styles.panelText}>
        Register to participate in World Liberty Token — built for people,
        utility, and a brighter tomorrow.
      </p>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <label className={styles.field}>
          <span className={styles.label}>Full name</span>
          <span className={styles.inputWrap}>
            <User className={styles.leadIcon} size={16} />
            <input
              type="text"
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </span>
        </label>

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
              autoComplete="new-password"
              placeholder="At least 8 characters"
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

        <label className={styles.field}>
          <span className={styles.label}>Confirm password</span>
          <span className={styles.inputWrap}>
            <Lock className={styles.leadIcon} size={16} />
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
            />
          </span>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Referral code</span>
          <span className={styles.inputWrap}>
            <Link2 className={styles.leadIcon} size={16} />
            <input
              type="text"
              autoComplete="off"
              placeholder="Optional invite code"
              value={referralCode}
              onChange={(event) => setReferralCode(event.target.value.toUpperCase())}
            />
          </span>
        </label>

        <label className={styles.check}>
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
          />
          <span>I agree to the Terms of Service and Privacy Policy.</span>
        </label>

        {error ? <p className={styles.error}>{error}</p> : null}
        {success ? <p className={styles.success}>{success}</p> : null}
        {note ? <p className={styles.note}>{note}</p> : null}

        <button className={styles.submit} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Account"}
          <ArrowRight size={16} strokeWidth={2.2} />
        </button>
      </form>

      <p className={styles.switch}>
        Already have an account?{" "}
        <Link className={styles.link} href="/login">
          Login
        </Link>
      </p>
    </div>
  );
}
