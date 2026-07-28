import { NextResponse } from "next/server";
import { ScheduleRepository } from "@/core/repositories/schedule-repository";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "weekly";
    const dayParam = searchParams.get("day") || undefined;

    if (mode === "next_season") {
      const result = await ScheduleRepository.getUpcomingSeasonSchedule();
      return NextResponse.json(result);
    }

    if (mode === "year_outlook") {
      const result = await ScheduleRepository.getYearOutlookSchedule();
      return NextResponse.json(result);
    }

    const result = await ScheduleRepository.getScheduleByDay(dayParam);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("GET /api/schedule error:", error);
    return NextResponse.json({ error: "Failed to fetch schedule data" }, { status: 500 });
  }
}
