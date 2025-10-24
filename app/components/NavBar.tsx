"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function NavBar({ initialPage = "landing" }: { initialPage?: string }) {
  const [currentPage] = useState(initialPage);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  const router = useRouter();

  async function handleSignOut() {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    router.push('/');
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // fetch current user when on dashboard
  React.useEffect(() => {
    if (!isDashboard) return;
    let mounted = true;
        (async () => {
      try {
        const res = await fetch('/api/v1/auth/me');
        if (!res.ok) return;
        const json = await res.json();
            if (json?.success && mounted) {
              setUserEmail(json.data.user.email || null);
              setUserName(json.data.user.name || null);
            }
      } catch {
        // ignore
      }
    })();
    return () => { mounted = false };
  }, [isDashboard]);
  return (
    <>
      <nav className={`fixed inset-x-0 top-0 z-50 ${isDashboard ? 'bg-[#0f1114] border-b border-[#26232a]' : 'bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <div className="shrink-0 flex items-center">
              <div className="w-10 h-10 bg-[#1e7f8c] rounded-lg flex items-center justify-center">
                <i className="fas fa-brain text-white text-lg" aria-hidden />
              </div>
              <span className={`ml-3 text-xl font-bold ${isDashboard ? 'text-white' : 'text-gray-900 dark:text-white'}`}>BudgetIQ</span>
            </div>
          </div>

          {/* Landing nav */}
          {currentPage === "landing" && !isDashboard ? (
            <>
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/#features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Features
                </Link>
                <Link href="/#how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  How it works
                </Link>
                <Link href="/#testimonials" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Testimonials
                </Link>
                <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Log in
                </Link>
                <Link href="/signup" className="bg-[#1e7f8c] text-white px-4 py-2 rounded-lg hover:bg-[#156169]">
                  Sign up
                </Link>
              </div>

              {/* mobile menu button */}
              <div className="md:hidden">
                <button
                  aria-label="Toggle menu"
                  aria-expanded={menuOpen}
                  className="p-2 text-gray-600 dark:text-gray-300"
                  onClick={() => setMenuOpen((s) => !s)}
                >
                  <i className={menuOpen ? "fas fa-times" : "fas fa-bars"} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="search transactions and categories"
                  className={`w-64 px-4 py-2 text-base ${isDashboard ? 'bg-[#14141a] border-[#222229] text-white placeholder-gray-500' : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e7f8c]`}
                />
                <button type="submit" className={`absolute right-3 top-3 ${isDashboard ? 'text-gray-500' : 'text-gray-400'}`}>
                  <i className="fas fa-search" />
                </button>
              </form>
              {(userName || userEmail) && <div className={`text-sm ${isDashboard ? 'text-gray-300' : 'text-gray-700 dark:text-gray-300'}`}>Welcome, {userName || userEmail}</div>}
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${isDashboard ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'}`}>US</span>
                  <button className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm">1</button>
                  <button onClick={handleSignOut} className={`ml-3 px-3 py-1 text-sm rounded ${isDashboard ? 'bg-[#14141a] text-gray-300 hover:bg-[#1a1a1f]' : 'bg-gray-100 dark:bg-gray-700'}`}>Sign out</button>
              </div>
            </div>
          )}
        </div>
      </div>
      </nav>
      {menuOpen && (
      <div className={`md:hidden fixed inset-x-0 top-16 z-40 ${isDashboard ? 'bg-[#0f1114] border-b border-[#26232a]' : 'bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700'}`}>
        <div className="px-4 py-4 space-y-2">
              {!isDashboard && (
            <>
              <Link href="/#features" className="block text-gray-700 dark:text-gray-300">Features</Link>
              <Link href="/#how-it-works" className="block text-gray-700 dark:text-gray-300">How it works</Link>
              <Link href="/#testimonials" className="block text-gray-700 dark:text-gray-300">Testimonials</Link>
              <Link href="/login" className="block text-gray-700 dark:text-gray-300">Log in</Link>
                  <Link href="/signup" className="block text-[#1e7f8c]">Sign up</Link>
            </>
          )}
              {isDashboard && (
                <>
                  <form onSubmit={handleSearch} className="relative mb-4">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="search transactions..."
                      className="w-full px-4 py-2 text-base bg-[#14141a] border-[#222229] text-white placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e7f8c]"
                    />
                    <button type="submit" className="absolute right-3 top-3 text-gray-500">
                      <i className="fas fa-search" />
                    </button>
                  </form>
                  <button onClick={handleSignOut} className="block text-left w-full text-gray-300">Sign out</button>
                </>
              )}
        </div>
      </div>
      )}
    </>
  );
}

