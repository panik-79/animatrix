import { NextResponse } from "next/server";
import { LibraryRepository } from "@/core/repositories/library-repository";

export async function GET() {
  try {
    const stats = await LibraryRepository.getStats();
    return NextResponse.json({ stats });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to compute stats" }, { status: 500 });
  }
}
