import { NextResponse } from "next/server";
import { MODEL_ROUTES } from "@/lib/auth";
import { corsResponse, corsOptions } from "@/lib/cors";

export async function GET() {
  const models = Object.entries(MODEL_ROUTES).map(([id, route]) => ({
    id,
    object: "model",
    created: 1626777600,
    owned_by: route.upstream,
    permission: [],
  }));

  return corsResponse({ object: "list", data: models });
}

export async function OPTIONS() {
  return corsOptions("GET, OPTIONS");
}
