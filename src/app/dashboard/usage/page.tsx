"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/client";
import { getIdToken } from "firebase/auth";

type UsageItem = {
  id: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  timestamp: number;
};

export default function UsagePage() {
  const [usage, setUsage] = useState<UsageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = auth.currentUser;
      if (!u) return;
      const token = await getIdToken(u);
      const res = await fetch("/api/usage", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setUsage(data.usage ?? []);
      setLoading(false);
    })();
  }, []);

  const totalTokens = usage.reduce((a, b) => a + b.totalTokens, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-stone-100">Usage</h1>
      <p className="mt-1 text-sm text-stone-500">
        Total token dipakai:{" "}
        <span className="font-semibold text-stone-200">{totalTokens.toLocaleString()}</span>
      </p>

      {loading ? (
        <p className="mt-6 text-stone-600">Loading...</p>
      ) : usage.length === 0 ? (
        <p className="mt-6 text-stone-600">Belum ada pemakaian.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {usage.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-stone-800 bg-stone-900 p-3 text-sm"
            >
              <div>
                <p className="font-medium text-stone-200">{item.model}</p>
                <p className="text-xs text-stone-600">
                  {new Date(item.timestamp).toLocaleString("id-ID")}
                </p>
              </div>
              <div className="text-right text-xs text-stone-500">
                <p>Prompt: {item.promptTokens.toLocaleString()}</p>
                <p>Completion: {item.completionTokens.toLocaleString()}</p>
                <p className="font-medium text-stone-200">Total: {item.totalTokens.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
