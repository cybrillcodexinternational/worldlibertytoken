import { NextResponse } from "next/server";
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { getSupportDesk } from "@/lib/support";

export async function GET(request) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      return NextResponse.json({ message: "Sign in required." }, { status: 401 });
    }

    const user = await getUserBySessionToken(token);
    if (!user) {
      return NextResponse.json({ message: "Sign in required." }, { status: 401 });
    }

    const url = new URL(request.url);
    const desk = await getSupportDesk(user.id, {
      ticketId: url.searchParams.get("id"),
      status: url.searchParams.get("status"),
      search: url.searchParams.get("q"),
    });
    return NextResponse.json(desk);
  } catch (error) {
    return NextResponse.json(
      { message: "Could not load support.", error: error.message },
      { status: 500 }
    );
  }
}
