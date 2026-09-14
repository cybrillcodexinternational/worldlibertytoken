import { NextResponse } from "next/server";
import {
  createSession,
  ensureAuthSchema,
  getUserByEmail,
  SESSION_COOKIE,
  verifyPassword,
} from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const remember = Boolean(body.remember);

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

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid email or password." }, { status: 401 });
    }

    if (user.status === "blocked") {
      return NextResponse.json(
        { success: false, message: "This account is blocked. Contact support." },
        { status: 403 }
      );
    }

    const passwordOk = await verifyPassword(password, user.password_hash);
    if (!passwordOk) {
      return NextResponse.json({ success: false, message: "Invalid email or password." }, { status: 401 });
    }

    const { token, maxAge } = await createSession(user.id, remember);
    const redirectTo = user.role === "admin" ? "/admin" : "/user";

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      role: user.role,
      redirectTo,
    });

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Login failed.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
