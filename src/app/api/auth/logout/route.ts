import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  (await cookies()).delete("user-id");

  return NextResponse.json({ success: true });
}