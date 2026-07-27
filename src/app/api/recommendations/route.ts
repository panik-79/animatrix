/**
 * GET /api/recommendations
 *
 * Query params:
 *   limit        — number of results (default: 20, max: 50)
 *   sessionMood  — ephemeral mood context: cozy | epic | dark | hype | mind-bending | romantic | wholesome | nostalgic
 *   debug        — "true" to include per-signal score breakdown in each result
 *   refresh      — "true" to bypass result cache and recompute
 *
 * Authentication: requires a valid session cookie.
 * Returns 401 if unauthenticated, 200 with RecommendationResult on success.
 */

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getRecommendations } from "@/core/services/recommendation";
import { LIMITS } from "@/core/services/recommendation/config";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const rawLimit = parseInt(searchParams.get("limit") ?? String(LIMITS.DEFAULT_RESULT_COUNT), 10);
    const limit = Math.min(50, Math.max(1, isNaN(rawLimit) ? LIMITS.DEFAULT_RESULT_COUNT : rawLimit));

    const sessionMood = searchParams.get("sessionMood") ?? undefined;
    const debug = searchParams.get("debug") === "true";
    const forceRefresh = searchParams.get("refresh") === "true";

    const result = await getRecommendations(user.id, {
      limit,
      sessionMood,
      debug,
      forceRefresh,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[recommendations] Error:", message);
    return NextResponse.json(
      { error: "Failed to generate recommendations", detail: message },
      { status: 500 }
    );
  }
}
