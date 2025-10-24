"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname() || "/dashboard";

  const nav = [
    { href: "/dashboard", label: "Dashboard", icon: "fas fa-chart-pie" },
    { href: "/dashboard/transactions", label: "Transactions", icon: "fas fa-exchange-alt" },
    { href: "/dashboard/budget", label: "Budget", icon: "fas fa-calculator" },
  ];

  const transactions = [
    { href: "/dashboard/smart-categorization", label: "Smart Categorization", icon: "fas fa-brain" },
    { href: "/dashboard/receipt-upload", label: "Receipt Upload", icon: "fas fa-upload" },
    { href: "/dashboard/recurring", label: "Recurring Transactions", icon: "fas fa-sync" },
    { href: "/dashboard/search", label: "Search Transactions", icon: "fas fa-search" },
    { href: "/dashboard/split-expenses", label: "Split Expenses", icon: "fas fa-users" },
    { href: "/dashboard/multi-currency", label: "Multi Currency", icon: "fas fa-globe" },
  ];

  return (
  <aside className="hidden md:block w-64 bg-[#0f1114] border-r border-[#26232a] min-h-screen p-6 relative">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 bg-[#1e7f8c] rounded flex items-center justify-center"> 
          <i className="fas fa-wallet text-white" />
        </div>
        <div className="font-semibold text-white">BudgetIQ</div>
      </div>

      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">MAIN</div>
      <nav className="space-y-3 text-sm text-gray-400">
        {nav.map((n) => {
          const active = pathname === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 p-2 rounded ${active ? "bg-[#18303a] text-[#8ae3cf]" : "hover:bg-[#16181b] text-gray-300"}`}
            >
              <i className={`${n.icon} w-4`} />
              <span>{n.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 mt-8">TRANSACTIONS</div>
      <nav className="space-y-3 text-sm text-gray-400">
        {transactions.map((t) => {
          const active = pathname === t.href || pathname.startsWith(t.href + "/");
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex items-center gap-3 p-2 rounded ${active ? "bg-[#18303a] text-[#8ae3cf]" : "hover:bg-[#16181b] text-gray-300"}`}
            >
              <i className={`${t.icon} w-4`} />
              <span>{t.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 md:w-64 w-full p-6">
        <button className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-400 hover:bg-[#16181b] rounded-lg">
          <i className="fas fa-sign-out-alt mr-3" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

