"use client";

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";


export default function SignUpPage() {
  const [signupForm, setSignupForm] = useState({ name: "", email: "", password: "", terms: false });
  const [showPassword, setShowPassword] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setSignupForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signupForm.terms) {
      setModalMessage("Please accept the terms and conditions.");
      setShowModal(true);
      return;
    }
    if (signupForm.password.length < 8) {
      setModalMessage("Password must be at least 8 characters long.");
      setShowModal(true);
      return;
    }
    // call signup API
    (async () => {
      try {
        const res = await fetch('/api/v1/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: signupForm.name, email: signupForm.email, password: signupForm.password }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error?.message || 'Signup failed');
        // redirect to dashboard on success
        router.push('/dashboard');
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setModalMessage(errorMessage);
        setShowModal(true);
      }
    })();
  }

  const router = useRouter();

  return (
    <div className="min-h-screen pt-16 bg-[#0b1220] dark:bg-gray-900 flex items-center">
      <div className="flex w-full min-h-[calc(100vh-64px)]">
  <div className="hidden lg:flex lg:w-1/2 items-center p-12 text-white bg-[#1e7f8c]">
          <div className="max-w-md self-center">
            <h2 className="text-3xl font-bold mb-8">Start your financial journey with BudgetIQ</h2>
            <p className="text-lg mb-12 text-[#e6f7f8]">
              Join thousands of users who are taking control of their finances with our AI-powered
              budgeting platform.
            </p>

            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-brain text-xl text-white" aria-hidden />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Smart Budgeting</h3>
                  <p className="text-[#e6f7f8]">Set up categories and track spending automatically.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-lightbulb text-xl text-white" aria-hidden />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Personalized Insights</h3>
                  <p className="text-[#e6f7f8]">Get tailored financial advice based on your patterns.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-chart-line text-xl text-white" aria-hidden />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Future Projections</h3>
                  <p className="text-[#e6f7f8]">Predict future expenses and plan ahead with forecasting.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 bg-white dark:bg-gray-800 p-8 lg:p-12 flex items-center justify-center">
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create an account</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">Enter your information to get started</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                <input
                  name="name"
                  value={signupForm.name}
                  onChange={handleChange}
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e7f8c] bg-white dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  name="email"
                  value={signupForm.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e7f8c] bg-white dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <input
                    name="password"
                    value={signupForm.password}
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e7f8c] bg-white dark:bg-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-3 text-gray-400"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"} />
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Password must be at least 8 characters long</p>
              </div>

              <div className="flex items-center">
                <input name="terms" checked={signupForm.terms} onChange={handleChange} type="checkbox" className="mr-3 rounded" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  I agree to the <a href="#" className="text-[#1e7f8c] hover:underline">Terms of Service</a> and{' '}
                  <a href="#" className="text-[#1e7f8c] hover:underline">Privacy Policy</a>
                </span>
              </div>

              <button type="submit" className="w-full bg-[#1e7f8c] text-white py-3 rounded-lg hover:bg-[#156169] text-base font-medium">
                Create account
              </button>
            </form>

            <p className="text-center text-gray-600 dark:text-gray-300 mt-6">
              Already have an account?{' '}
              <Link href="/signin" className="text-[#1e7f8c] hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
            <p className="text-gray-700 dark:text-gray-300 mb-4">{modalMessage}</p>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-[#1e7f8c] text-white rounded hover:bg-[#156169]"
                onClick={() => setShowModal(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
