"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase/client";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

type TxItem = {
  id: string;
  amount: number;
  note: string;
  timestamp: number;
};

export default function BillingPage() {
  const [txs, setTxs] = useState<TxItem[]>([]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (!u) return;
      const q = query(
        collection(db, "users", u.uid, "tx"),
        orderBy("timestamp", "desc")
      );
      const unsub2 = onSnapshot(q, (snap) => {
        const items: TxItem[] = [];
        snap.forEach((d) => {
          const data = d.data();
          items.push({
            id: d.id,
            amount: data.amount,
            note: data.note ?? "",
            timestamp: data.timestamp?.toMillis() ?? Date.now(),
          });
        });
        setTxs(items);
      });
      return unsub2;
    });
    return unsub;
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-stone-100">Billing</h1>
      <p className="mt-1 text-sm text-stone-500">
        Riwayat penambahan saldo. Saldo ditambahkan oleh admin langsung dari database.
      </p>

      {txs.length === 0 ? (
        <p className="mt-6 text-stone-600">Belum ada transaksi.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {txs.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-lg border border-stone-800 bg-stone-900 p-3 text-sm"
            >
              <div>
                <p className="font-medium text-emerald-400">
                  +{tx.amount.toLocaleString()} token
                </p>
                {tx.note && <p className="text-xs text-stone-600">{tx.note}</p>}
              </div>
              <p className="text-xs text-stone-600">
                {new Date(tx.timestamp).toLocaleDateString("id-ID")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
