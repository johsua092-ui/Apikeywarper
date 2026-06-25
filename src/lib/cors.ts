import { NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function corsResponse(body: unknown, init?: ResponseInit): NextResponse {
  return NextResponse.json(body, {
    ...init,
    headers: { ...CORS_HEADERS, ...init?.headers },
  });
}

export function corsOptions(allowed: string): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...CORS_HEADERS,
      Allow: allowed,
    },
  });
}
