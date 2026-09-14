import { NextResponse } from "next/server";
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { createSupportTicket, replySupportTicket, setSupportTicketStatus } from "@/lib/support";

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
    const action = String(body.action || "create");
    let result;

    if (action === "create") {
      result = await createSupportTicket(user.id, body);
    } else if (action === "reply") {
      result = await replySupportTicket(user.id, body);
    } else if (action === "close") {
      result = await setSupportTicketStatus(user.id, { ...body, status: "closed" });
    } else if (action === "reopen") {
      result = await setSupportTicketStatus(user.id, { ...body, status: "open" });
    } else {
      return NextResponse.json({ message: "Unknown support action." }, { status: 400 });
    }

    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: result.code || 400 });
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: "Could not update support.", error: error.message },
      { status: 500 }
    );
  }
}
