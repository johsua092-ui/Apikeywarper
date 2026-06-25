"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/keys", label: "API Keys" },
  { href: "/dashboard/usage", label: "Usage" },
  { href: "/dashboard/billing", label: "Billing" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (!u) router.push("/login");
    });
    return unsub;
  }, [router]);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center text-stone-600">
        Loading...
      </div>
    );

  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 flex-col border-r border-stone-800 bg-stone-950 p-4">
        <h2 className="mb-6 text-lg font-bold tracking-tight text-stone-100">
          Linkey
        </h2>
        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm transition ${
                pathname === item.href
                  ? "bg-stone-800 text-stone-100"
                  : "text-stone-500 hover:bg-stone-900 hover:text-stone-300"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="mt-auto">
          <button
            onClick={() => signOut(auth)}
            className="w-full rounded-md px-3 py-2 text-left text-sm text-stone-600 transition hover:bg-stone-900 hover:text-stone-400"
          >
            Keluar
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-stone-950 p-8">{children}</main>
    </div>
  );
}
