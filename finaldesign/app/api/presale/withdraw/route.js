import { NextResponse } from "next/server";
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { withdrawCommission } from "@/lib/presale";

export async function POST(request) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      return NextResponse.json({ message: "Sign in required." }, { status: 401 });
    }

    const user = await getUserBySessionToken(token);
    if (!user) {
      return NextResponse.json({ message: "Sign in required." }, { status: 401 });
    }

    const body = await request.json();
    const result = await withdrawCommission(user.id, {
      amount: body.amount,
      walletAddress: body.walletAddress,
      signature: body.signature,
    });

    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: result.code });
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: "Withdrawal could not be completed.", error: error.message },
      { status: 500 }
    );
  }
}
