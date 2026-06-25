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

  const snapshot = await adminDb
    .collection("users")
    .doc(uid)
    .collection("usage")
    .orderBy("timestamp", "desc")
    .limit(100)
    .get();

  const usage = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    timestamp: d.data().timestamp?.toMillis() ?? Date.now(),
  }));

  return NextResponse.json({ usage });
}
