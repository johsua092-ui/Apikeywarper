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
      <h1 className="text-2xl font-bold">Usage</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Total token dipakai: <span className="font-semibold text-white">{totalTokens.toLocaleString()}</span>
      </p>

      {loading ? (
        <p className="mt-6 text-zinc-500">Loading...</p>
      ) : usage.length === 0 ? (
        <p className="mt-6 text-zinc-500">Belum ada pemakaian.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {usage.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-sm"
            >
              <div>
                <p className="font-medium">{item.model}</p>
                <p className="text-xs text-zinc-500">
                  {new Date(item.timestamp).toLocaleString("id-ID")}
                </p>
              </div>
              <div className="text-right text-xs text-zinc-400">
                <p>Prompt: {item.promptTokens.toLocaleString()}</p>
                <p>Completion: {item.completionTokens.toLocaleString()}</p>
                <p className="font-medium text-white">Total: {item.totalTokens.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
