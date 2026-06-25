import { NextRequest, NextResponse } from "next/server";
import { getRoute, MODEL_ROUTES } from "@/lib/auth";

export async function GET() {
  const models = Object.entries(MODEL_ROUTES).map(([id, route]) => ({
    id,
    object: "model",
    created: 1626777600,
    owned_by: route.upstream,
    permission: [],
  }));

  return NextResponse.json({ object: "list", data: models });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
