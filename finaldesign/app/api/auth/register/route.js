import { NextResponse } from "next/server";
import {
  createSession,
  createUser,
  ensureAuthSchema,
  getUserByEmail,
  hashPassword,
  SESSION_COOKIE,
} from "@/lib/auth";
import {
  bindReferrer,
  ensureReferralSchema,
  ensureUserReferralCode,
  REF_COOKIE,
} from "@/lib/referral";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const body = await request.json();
    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const referralCode = String(
      body.referralCode || request.cookies.get(REF_COOKIE)?.value || ""
    ).trim();

    if (fullName.length < 2) {
      return NextResponse.json({ success: false, message: "Enter your full name." }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ success: false, message: "Enter a valid email address." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    await ensureAuthSchema();
    await ensureReferralSchema();

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const userId = await createUser({
      fullName,
      email,
      passwordHash,
      role: "user",
    });

    await ensureUserReferralCode(userId);
    if (referralCode) {
      await bindReferrer(userId, referralCode);
    }

    const { token, maxAge } = await createSession(userId, true);

    const response = NextResponse.json({
      success: true,
      message: "Registration successful.",
      role: "user",
      redirectTo: "/user",
    });

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge,
    });
    response.cookies.set(REF_COOKIE, "", {
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Registration failed.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
