"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase/client";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Create user doc with initial token balance 0
      await setDoc(doc(db, "users", cred.user.uid), {
        email: cred.user.email,
        tokenBalance: 0,
        totalUsageTokens: 0,
        createdAt: serverTimestamp(),
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (e.code === "auth/email-already-in-use") setError("Email sudah terdaftar");
      else if (e.code === "auth/weak-password") setError("Password minimal 6 karakter");
      else setError(e.message ?? "Gagal daftar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Daftar Linkey</h1>
        {error && <p className="rounded bg-red-900/50 p-2 text-sm text-red-300">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-4 py-2 outline-none focus:border-indigo-500"
        />
        <input
          type="password"
          placeholder="Password (min 6)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-4 py-2 outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-indigo-600 py-2 font-medium transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? "Memproses..." : "Daftar"}
        </button>
        <p className="text-center text-sm text-zinc-500">
          Sudah punya akun?{" "}
          <a href="/login" className="text-indigo-400 hover:underline">
            Masuk
          </a>
        </p>
      </form>
    </div>
  );
}
