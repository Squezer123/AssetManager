"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Nieprawidłowy email lub hasło");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-slate-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-5 rounded-xl bg-white p-8 shadow"
      >
        <h1 className="text-2xl font-bold text-slate-900">Logowanie</h1>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Hasło</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Logowanie..." : "Zaloguj się"}
        </button>
      </form>
    </main>
  );
}