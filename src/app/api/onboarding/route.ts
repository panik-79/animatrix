import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { PreferenceRepository } from "@/core/repositories/preference-repository";
import { UserRepository } from "@/core/repositories/user-repository";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { genres, favoriteAnimeIds, moods, avoidTags, preferredLength, preferredEra, complete } = body;

    // Save preferences
    await PreferenceRepository.savePreferences(user.id, {
      genres,
      favoriteAnimeIds,
      moods,
      avoidTags,
      preferredLength,
      preferredEra,
    });

    if (complete) {
      await UserRepository.updateOnboardingStatus(user.id, true);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save onboarding preferences" }, { status: 500 });
  }
}
