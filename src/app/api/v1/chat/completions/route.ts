import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth";
import { proxyChatCompletion } from "@/lib/proxy/upstream";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");

  if (!token) {
    return NextResponse.json(
      { error: { message: "Unauthorized — missing API key", type: "auth_error" } },
      { status: 401 }
    );
  }

  const user = await validateApiKey(token);
  if (!user) {
    return NextResponse.json(
      { error: { message: "API key tidak valid", type: "auth_error" } },
      { status: 401, headers: { "WWW-Authenticate": "Bearer" } }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body || !body.model || !body.messages) {
    return NextResponse.json(
      {
        error: {
          message: "Body harus berisi 'model' (string) dan 'messages' (array)",
          type: "invalid_request",
        },
      },
      { status: 400 }
    );
  }

  const { model, messages, stream, ...extraBody } = body;

  const userRef = adminDb.collection("users").doc(user.uid);
  const userSnap = await userRef.get();
  if (!userSnap.exists) {
    return NextResponse.json(
      { error: { message: "User tidak ditemukan", type: "auth_error" } },
      { status: 404 }
    );
  }

  const tokenBalance = userSnap.data()?.tokenBalance ?? 0;

  const result = await proxyChatCompletion(model, messages, { stream: false, ...extraBody });

  if (result.status !== 200) {
    return NextResponse.json(result.body, { status: result.status });
  }

  const { promptTokens, completionTokens, totalTokens } = result.usage;
  if (totalTokens > tokenBalance) {
    return NextResponse.json(
      {
        error: {
          message: `Saldo token tidak mencukupi. Dibutuhkan ${totalTokens}, saldo: ${tokenBalance}`,
          type: "insufficient_balance",
        },
      },
      { status: 402 }
    );
  }

  const usageId = adminDb.collection("_").doc().id;
  const batch = adminDb.batch();
  batch.update(userRef, {
    tokenBalance: FieldValue.increment(-totalTokens),
    totalUsageTokens: FieldValue.increment(totalTokens),
    lastActivity: FieldValue.serverTimestamp(),
  });
  batch.set(
    adminDb.collection("users").doc(user.uid).collection("usage").doc(usageId),
    {
      model,
      promptTokens,
      completionTokens,
      totalTokens,
      timestamp: FieldValue.serverTimestamp(),
    }
  );
  await batch.commit();

  const data = result.body as Record<string, unknown>;

  const response = NextResponse.json({
    id: data.id ?? `chatcmpl-${usageId}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: (data as any).choices ?? [],
    usage: {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: totalTokens,
    },
  });

  return response;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
}
