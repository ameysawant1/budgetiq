"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const signIn = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setMessage("");
    if (!email) return setError("Please enter your email.");
    if (!password) return setError("Please enter your password.");
    (async () => {
      try {
        const res = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const json = await res.json();
        if (!res.ok) return setError(json?.error?.message || 'Sign in failed');
        setMessage('Signed in successfully. Redirecting...');
        router.push('/dashboard');
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
      }
    })();
  };

  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Sign in to your account</p>
        </div>

        <form onSubmit={signIn} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e7f8c] bg-white dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e7f8c] bg-white dark:bg-gray-700"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="mr-2 rounded"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">Remember me</span>
            </label>

            <Link href="#" className="text-sm text-[#1e7f8c] hover:underline">Forgot password?</Link>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}
          {message && <div className="text-sm text-green-600">{message}</div>}

          <button
            type="submit"
            className="w-full bg-[#1e7f8c] text-white py-3 rounded-lg hover:bg-[#156169] text-base font-medium"
          >
            Sign in
          </button>
        </form>

        <p className="text-center text-gray-600 dark:text-gray-300">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#1e7f8c] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
