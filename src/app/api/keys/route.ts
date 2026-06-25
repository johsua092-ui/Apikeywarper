import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { verifyFirebaseToken } from "@/lib/firebase/verify";

async function getUid(req: NextRequest): Promise<string | null> {
  return verifyFirebaseToken(req);
}

export async function GET(req: NextRequest) {
  const uid = await getUid(req);
  if (!uid)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const snapshot = await adminDb.collection("users").doc(uid).collection("keys").get();
  const keys = snapshot.docs.map((d) => ({
    id: d.id,
    prefix: d.data().prefix,
    createdAt: d.data().createdAt?.toMillis() ?? 0,
    lastUsed: d.data().lastUsed?.toMillis() ?? null,
    active: d.data().active ?? true,
  }));

  return NextResponse.json({ keys });
}

export async function POST(req: NextRequest) {
  const uid = await getUid(req);
  if (!uid)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { generateApiKey, hashKey } = await import("@/lib/auth");

  const raw = generateApiKey();
  const keyBody = raw.slice(3);
  const keyHash = hashKey(keyBody);
  const prefix = keyBody.slice(0, 8);

  const keyId = adminDb.collection("_").doc().id;
  await adminDb
    .collection("users")
    .doc(uid)
    .collection("keys")
    .doc(keyId)
    .set({
      prefix,
      keyHash,
      createdAt: FieldValue.serverTimestamp(),
      active: true,
    });

  return NextResponse.json({ key: raw, id: keyId }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const uid = await getUid(req);
  if (!uid)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const keyId = searchParams.get("id");
  if (!keyId)
    return NextResponse.json({ error: "Missing key id" }, { status: 400 });

  await adminDb
    .collection("users")
    .doc(uid)
    .collection("keys")
    .doc(keyId)
    .update({ active: false });

  return NextResponse.json({ success: true });
}
