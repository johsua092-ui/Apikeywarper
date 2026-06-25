import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifyFirebaseToken } from "@/lib/firebase/verify";

async function getUid(req: NextRequest): Promise<string | null> {
  return verifyFirebaseToken(req);
}

export async function GET(req: NextRequest) {
  const uid = await getUid(req);
  if (!uid)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const snap = await adminDb.collection("users").doc(uid).get();
  if (!snap.exists)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const data = snap.data()!;
  return NextResponse.json({
    uid: snap.id,
    email: data.email ?? null,
    tokenBalance: data.tokenBalance ?? 0,
    totalUsageTokens: data.totalUsageTokens ?? 0,
    createdAt: data.createdAt?.toMillis() ?? 0,
  });
}
