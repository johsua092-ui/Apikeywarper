"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase/client";
import { doc, onSnapshot } from "firebase/firestore";

type UserData = {
  email: string;
  tokenBalance: number;
  totalUsageTokens: number;
  createdAt: number;
};

export default function DashboardPage() {
  const [data, setData] = useState<UserData | null>(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (!u) return;
      const ref = doc(db, "users", u.uid);
      const unsub2 = onSnapshot(ref, (snap) => {
        if (snap.exists()) setData(snap.data() as UserData);
      });
      return unsub2;
    });
    return unsub;
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Overview</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4">
          <p className="text-sm text-zinc-400">Saldo Token</p>
          <p className="mt-1 text-3xl font-bold text-indigo-400">
            {data?.tokenBalance?.toLocaleString() ?? "—"}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4">
          <p className="text-sm text-zinc-400">Total Token Dipakai</p>
          <p className="mt-1 text-3xl font-bold">
            {data?.totalUsageTokens?.toLocaleString() ?? "—"}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4">
          <p className="text-sm text-zinc-400">Email</p>
          <p className="mt-1 truncate text-lg">{data?.email ?? "—"}</p>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-zinc-700 bg-zinc-800 p-4">
        <h2 className="font-semibold">Panduan</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Gunakan endpoint berikut dengan API key kamu:
        </p>
        <pre className="mt-3 overflow-x-auto rounded bg-zinc-900 p-3 text-xs text-zinc-500">
          <code>{`curl https://linkey.vercel.app/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"model": "gpt-5.4-mini", "messages": [{"role": "user", "content": "Halo!"}]}'`}</code>
        </pre>
        <p className="mt-2 text-sm text-zinc-500">
          Ganti <span className="font-mono text-indigo-400">YOUR_API_KEY</span> dengan key yang kamu buat dari menu "API Keys".
        </p>
      </div>
    </div>
  );
}
