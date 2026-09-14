import { NextResponse } from "next/server";
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth";
import {
  getSupportDesk,
  replySupportTicket,
  setSupportTicketPriority,
  setSupportTicketStatus,
} from "@/lib/support";

async function requireAdmin(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return { error: NextResponse.json({ message: "Sign in required." }, { status: 401 }) };
  }
  const user = await getUserBySessionToken(token);
  if (!user) {
    return { error: NextResponse.json({ message: "Sign in required." }, { status: 401 }) };
  }
  if (user.role !== "admin") {
    return { error: NextResponse.json({ message: "Admin access required." }, { status: 403 }) };
  }
  return { user };
}

export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return auth.error;
    }
    const url = new URL(request.url);
    return NextResponse.json(
      await getSupportDesk(auth.user.id, {
        admin: true,
        ticketId: url.searchParams.get("id"),
        status: url.searchParams.get("status"),
        search: url.searchParams.get("q"),
      })
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Could not load support admin.", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return auth.error;
    }
    const body = await request.json();
    const action = String(body.action || "reply");
    let result;
    if (action === "reply") {
      result = await replySupportTicket(auth.user.id, body, { admin: true });
    } else if (action === "status") {
      result = await setSupportTicketStatus(auth.user.id, body, { admin: true });
    } else if (action === "priority") {
      result = await setSupportTicketPriority(auth.user.id, body);
    } else {
      return NextResponse.json({ message: "Unknown admin action." }, { status: 400 });
    }
    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: result.code || 400 });
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: "Support admin action failed.", error: error.message },
      { status: 500 }
    );
  }
}
