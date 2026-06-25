import { NextRequest, NextResponse } from "next/server";
import { auth } from "firebase-admin/auth";

export async function verifyFirebaseToken(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  if (!token) return null;

  try {
    const decoded = await auth().verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}
