import { NextResponse } from "next/server";
import { deleteSessionByToken, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (token) {
    await deleteSessionByToken(token);
  }

  const response = NextResponse.json({ success: true, message: "Logged out." });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
