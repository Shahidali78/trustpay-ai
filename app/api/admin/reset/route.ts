import { NextResponse } from "next/server";
import { resetDemoData } from "@/lib/demo-seed";

export async function POST() {
  await resetDemoData();
  return NextResponse.json({ ok: true });
}
