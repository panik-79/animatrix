import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ReminderRepository } from "@/core/repositories/reminder-repository";

export async function GET() {
  try {
    const user = await getSessionUser();
    const settings = await ReminderRepository.getNotificationSettings(user?.id);
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("GET /api/settings/notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notification settings" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser();
    const body = await request.json();
    const { emailNotifications, emailTiming } = body;

    const result = await ReminderRepository.updateNotificationSettings(
      user?.id,
      Boolean(emailNotifications),
      emailTiming || "ON_RELEASE"
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("PATCH /api/settings/notifications error:", error);
    return NextResponse.json({ error: "Failed to update notification settings" }, { status: 500 });
  }
}
