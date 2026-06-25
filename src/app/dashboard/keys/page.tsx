"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/client";
import { getIdToken } from "firebase/auth";

type KeyItem = {
  id: string;
  prefix: string;
  createdAt: number;
  lastUsed: number | null;
  active: boolean;
};

export default function KeysPage() {
  const [keys, setKeys] = useState<KeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState<string | null>(null);

  async function fetchKeys() {
    const u = auth.currentUser;
    if (!u) return;
    const token = await getIdToken(u);
    const res = await fetch("/api/keys", { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setKeys(data.keys ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchKeys();
  }, []);

  async function generateKey() {
    const u = auth.currentUser;
    if (!u) return;
    setNewKey(null);
    const token = await getIdToken(u);
    const res = await fetch("/api/keys", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setNewKey(data.key);
    setKeys((prev) => [
      { id: data.id, prefix: data.key.slice(3, 11), createdAt: Date.now(), lastUsed: null, active: true },
      ...prev,
    ]);
  }

  async function revokeKey(id: string) {
    const u = auth.currentUser;
    if (!u) return;
    const token = await getIdToken(u);
    await fetch(`/api/keys?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, active: false } : k)));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-stone-100">API Keys</h1>
        <button
          onClick={generateKey}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          + Buat Key Baru
        </button>
      </div>

      {newKey && (
        <div className="mt-4 rounded-lg border border-indigo-900/50 bg-indigo-950 p-4">
          <p className="text-sm text-indigo-400">
            Key baru berhasil dibuat! Salin sekarang — tidak akan ditampilkan lagi.
          </p>
          <pre className="mt-2 select-all rounded-lg bg-stone-950 p-3 text-sm text-indigo-300">
            {newKey}
          </pre>
        </div>
      )}

      {loading ? (
        <p className="mt-6 text-stone-600">Loading...</p>
      ) : keys.length === 0 ? (
        <p className="mt-6 text-stone-600">Belum ada API key. Klik tombol di atas untuk membuat.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {keys.map((k) => (
            <div
              key={k.id}
              className="flex items-center justify-between rounded-lg border border-stone-800 bg-stone-900 p-4"
            >
              <div>
                <p className="font-mono text-sm text-stone-300">
                  sk-{k.prefix}...
                </p>
                <p className="mt-1 text-xs text-stone-600">
                  Dibuat {new Date(k.createdAt).toLocaleDateString("id-ID")}
                  {k.lastUsed &&
                    ` · Terakhir dipakai ${new Date(k.lastUsed).toLocaleDateString("id-ID")}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`h-2 w-2 rounded-full ${k.active ? "bg-emerald-500" : "bg-red-500"}`}
                />
                {k.active && (
                  <button
                    onClick={() => revokeKey(k.id)}
                    className="text-sm text-red-500 transition hover:text-red-400"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
