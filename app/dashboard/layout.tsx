import Sidebar from "../components/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen md:flex">
      <Sidebar />
      {/* main area collapses to full width on small screens; top padding avoids overlap with fixed NavBar */}
      <main className="flex-1 p-6 pt-16 bg-[#070708]">
        {children}
      </main>
    </div>
  );
}
