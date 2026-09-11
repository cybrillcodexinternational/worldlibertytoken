import { NextResponse } from "next/server";
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { getWalletStatus } from "@/lib/wallet";

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

    const status = await getWalletStatus(user.id);
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      { message: "Could not load wallet.", error: error.message },
      { status: 500 }
    );
  }
}
