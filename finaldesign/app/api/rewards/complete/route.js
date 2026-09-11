import { NextResponse } from "next/server";
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { playScratchCard } from "@/lib/rewards";

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

    const result = await playScratchCard(user.id);
    if (!result.ok) {
      return NextResponse.json(result, { status: result.code });
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: "Could not scratch this card.", error: error.message },
      { status: 500 }
    );
  }
}
