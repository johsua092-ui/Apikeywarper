import { adminDb } from "@/lib/firebase/admin";
import crypto from "crypto";

// Model → upstream mapping + harga per 1K token (dalam token unit)
const MODEL_ROUTES: Record<
  string,
  { upstream: "freemodel" | "openrouter"; upstreamModel: string; costPer1K: number }
> = {
  // freemodel.dev — GPT (gratis via token mereka)
  "gpt-5.5": { upstream: "freemodel", upstreamModel: "gpt-5.5", costPer1K: 0.01 },
  "gpt-5.4": { upstream: "freemodel", upstreamModel: "gpt-5.4", costPer1K: 0.005 },
  "gpt-5.4-mini": { upstream: "freemodel", upstreamModel: "gpt-5.4-mini", costPer1K: 0.001 },
  "gpt-5.3-codex": { upstream: "freemodel", upstreamModel: "gpt-5.3-codex", costPer1K: 0.02 },
  // OpenRouter — Claude (berbayar markup)
  "claude-opus-4-8": { upstream: "openrouter", upstreamModel: "anthropic/claude-opus-4.8", costPer1K: 0.05 },
  "claude-opus-4-7": { upstream: "openrouter", upstreamModel: "anthropic/claude-opus-4.7", costPer1K: 0.05 },
  "claude-sonnet-4-6": { upstream: "openrouter", upstreamModel: "anthropic/claude-sonnet-4.6", costPer1K: 0.03 },
  "claude-haiku-3-5": { upstream: "openrouter", upstreamModel: "anthropic/claude-haiku-latest", costPer1K: 0.01 },
};

type Route = (typeof MODEL_ROUTES)[keyof MODEL_ROUTES] | null;
export function getRoute(model: string): Route {
  return MODEL_ROUTES[model] ?? null;
}

export const UPSTREAMS = {
  freemodel: {
    base: "https://freemodel.dev",
    token: () => process.env.FREEMODEL_TOKEN!,
    // chat path: from test, /api/v1/chat/completions gave 401, maybe /api/chat gave 401
    // try standard OpenAI path
    chatPath: "/api/v1/chat/completions",
  },
  openrouter: {
    base: "https://openrouter.ai",
    token: () => process.env.OPENROUTER_API_KEY!,
    chatPath: "/api/v1/chat/completions",
  },
} as const;

export function getUserIdFromKey(key: string): string | null {
  // key format: sk-<hex>
  return key.startsWith("sk-") ? key.slice(3) : null;
}

export async function validateApiKey(
  rawKey: string
): Promise<{ uid: string; keyDoc: string } | null> {
  if (!rawKey.startsWith("sk-")) return null;
  const keyBody = rawKey.slice(3);
  const hash = crypto.createHash("sha256").update(keyBody).digest("hex");

  // prefix 8 char utk index
  const prefix = keyBody.slice(0, 8);

  const snapshot = await adminDb
    .collectionGroup("keys")
    .where("prefix", "==", prefix)
    .get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.keyHash === hash) {
      return { uid: doc.ref.parent.parent?.id!, keyDoc: doc.ref.path };
    }
  }
  return null;
}

export function generateApiKey(): string {
  const random = crypto.randomBytes(24).toString("hex");
  const key = `sk-${random}`;
  return key;
}

export function hashKey(keyBody: string): string {
  return crypto.createHash("sha256").update(keyBody).digest("hex");
}

export { MODEL_ROUTES };
