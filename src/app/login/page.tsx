"use client";

import { useActionState } from "react";
import { login } from "./actions";
import { DEMO_USERNAME, DEMO_PASSWORD } from "@/lib/auth";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 p-8">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hello22-logo.png"
              alt="hello22.ai"
              className="h-9 w-auto"
              width={2086}
              height={426}
            />
            <h1 className="font-serif text-2xl font-bold tracking-tight text-stone-900">
              Welcome back
            </h1>
            <p className="text-sm text-stone-500">
              Sign in to read the latest stories
            </p>
          </div>

          <form action={formAction} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="username"
                className="mb-1 block text-sm font-medium text-zinc-700"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-zinc-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Enter password"
              />
            </div>

            {state?.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 rounded-lg border border-dashed border-blue-300 bg-blue-50 p-4 text-sm">
            <p className="mb-2 font-semibold text-blue-700">
              Demo Credentials
            </p>
            <div className="flex flex-col gap-1 font-mono text-zinc-700">
              <p>
                Username: <span className="font-bold">{DEMO_USERNAME}</span>
              </p>
              <p>
                Password: <span className="font-bold">{DEMO_PASSWORD}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
