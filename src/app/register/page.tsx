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
        <h1 className="text-2xl font-bold tracking-tight text-stone-100">Daftar Linkey</h1>
        {error && (
          <p className="rounded-lg border border-red-900/50 bg-red-950 p-2 text-sm text-red-400">
            {error}
          </p>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border border-stone-800 bg-stone-900 px-4 py-2 text-stone-200 outline-none transition placeholder:text-stone-600 focus:border-indigo-700"
        />
        <input
          type="password"
          placeholder="Password (min 6)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full rounded-lg border border-stone-800 bg-stone-900 px-4 py-2 text-stone-200 outline-none transition placeholder:text-stone-600 focus:border-indigo-700"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? "Memproses..." : "Daftar"}
        </button>
        <p className="text-center text-sm text-stone-600">
          Sudah punya akun?{" "}
          <a href="/login" className="text-indigo-400 hover:underline">
            Masuk
          </a>
        </p>
      </form>
    </div>
  );
}
