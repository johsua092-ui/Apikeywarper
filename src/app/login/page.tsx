"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
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
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (e.code === "auth/user-not-found" || e.code === "auth/invalid-credential")
        setError("Email atau password salah");
      else setError(e.message ?? "Gagal masuk");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-stone-100">Masuk Linkey</h1>
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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-lg border border-stone-800 bg-stone-900 px-4 py-2 text-stone-200 outline-none transition placeholder:text-stone-600 focus:border-indigo-700"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
        <p className="text-center text-sm text-stone-600">
          Belum punya akun?{" "}
          <a href="/register" className="text-indigo-400 hover:underline">
            Daftar
          </a>
        </p>
      </form>
    </div>
  );
}
