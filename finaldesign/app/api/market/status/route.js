import { NextResponse } from "next/server";
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { getTopMarkets } from "@/lib/market";

export const dynamic = "force-dynamic";

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

    const status = await getTopMarkets();
    if (!status.ok) {
      return NextResponse.json({ message: status.message || "Could not load markets." }, { status: 502 });
    }
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      { message: "Could not load markets.", error: error.message },
      { status: 500 }
    );
  }
}
