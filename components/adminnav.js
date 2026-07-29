import Link from "next/link";

export default function AdminNav() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/admin" className="text-lg font-bold text-slate-900">
          Panel Admina
        </Link>
        <nav className="flex gap-6 text-sm font-medium text-slate-600">
          <Link href="/admin" className="hover:text-blue-600">
            Dashboard
          </Link>
          <Link href="/admin/equipment" className="hover:text-blue-600">
            Sprzęt
          </Link>
          <Link href="/equipment" className="hover:text-blue-600">
            Widok publiczny
          </Link>
        </nav>
      </div>
    </header>
  );
}