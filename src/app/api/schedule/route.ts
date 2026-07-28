import { NextResponse } from "next/server";
import { ScheduleRepository } from "@/core/repositories/schedule-repository";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dayParam = searchParams.get("day") || undefined;

    const result = await ScheduleRepository.getScheduleByDay(dayParam);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("GET /api/schedule error:", error);
    return NextResponse.json({ error: "Failed to fetch schedule data" }, { status: 500 });
  }
}
