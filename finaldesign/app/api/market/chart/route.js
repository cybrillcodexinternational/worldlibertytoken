import { NextResponse } from "next/server";
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { getCoinChart, listRanges } from "@/lib/market";

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

    const id = request.nextUrl.searchParams.get("id") || "";
    const range = request.nextUrl.searchParams.get("range") || "24H";
    const allowed = listRanges();
    const safeRange = allowed.includes(range) ? range : "24H";
    const chart = await getCoinChart(id, safeRange);
    if (!chart.ok) {
      return NextResponse.json({ message: chart.message || "Could not load chart." }, { status: 502 });
    }
    return NextResponse.json(chart);
  } catch (error) {
    return NextResponse.json(
      { message: "Could not load chart.", error: error.message },
      { status: 500 }
    );
  }
}
