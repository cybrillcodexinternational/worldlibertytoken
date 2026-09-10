import { NextResponse } from "next/server";
import { testDatabaseConnection } from "@/lib/db";

export async function GET() {
  try {
    const ok = await testDatabaseConnection();
    return NextResponse.json({
      success: ok,
      database: process.env.DATABASE_NAME || "worldlibertytoken",
      host: process.env.DATABASE_HOST || "localhost",
      message: ok ? "MySQL connection successful" : "MySQL connection failed",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        database: process.env.DATABASE_NAME || "worldlibertytoken",
        host: process.env.DATABASE_HOST || "localhost",
        message: "MySQL connection failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
