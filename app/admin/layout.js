import AdminNav from "@/components/adminnav";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <AdminNav />
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}