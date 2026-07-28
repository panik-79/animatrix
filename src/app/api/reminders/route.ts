import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ReminderRepository } from "@/core/repositories/reminder-repository";

export async function GET() {
  try {
    const user = await getSessionUser();
    const reminders = await ReminderRepository.getReminders(user?.id);
    return NextResponse.json({ reminders });
  } catch (error: any) {
    console.error("GET /api/reminders error:", error);
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    const body = await request.json();
    const { animeId, title, imageUrl } = body;

    if (!animeId || !title) {
      return NextResponse.json({ error: "animeId and title are required" }, { status: 400 });
    }

    const result = await ReminderRepository.toggleReminder({
      userId: user?.id,
      animeId,
      title,
      imageUrl,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("POST /api/reminders error:", error);
    return NextResponse.json({ error: "Failed to toggle reminder" }, { status: 500 });
  }
}
