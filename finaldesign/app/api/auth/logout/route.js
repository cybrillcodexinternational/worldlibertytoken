import { NextResponse } from "next/server";
import { deleteSessionByToken, IMPERSONATOR_COOKIE, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (token) {
    await deleteSessionByToken(token);
  }

  const response = NextResponse.json({ success: true, message: "Logged out." });
  const expired = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
  response.cookies.set(SESSION_COOKIE, "", expired);
  response.cookies.set(IMPERSONATOR_COOKIE, "", expired);

  return response;
}
