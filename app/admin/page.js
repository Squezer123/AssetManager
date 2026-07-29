import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboard() {
  const [total, available, maintenance, retired, activeReservations] =
    await Promise.all([
      prisma.equipment.count(),
      prisma.equipment.count({ where: { status: "AVAILABLE" } }),
      prisma.equipment.count({ where: { status: "MAINTENANCE" } }),
      prisma.equipment.count({ where: { status: "RETIRED" } }),
      prisma.reservation.count({ where: { status: "ACTIVE" } }),
    ]);

  const byCategory = await prisma.equipment.groupBy({
    by: ["category"],
    _count: true,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-slate-600">Przegląd stanu sprzętu firmowego</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard label="Wszystkie" value={total} />
        <StatCard label="Dostępne" value={available} accent="text-green-600" />
        <StatCard label="Serwis" value={maintenance} accent="text-orange-600" />
        <StatCard label="Wycofane" value={retired} accent="text-gray-500" />
        <StatCard label="Aktywne rezerwacje" value={activeReservations} accent="text-blue-600" />
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-slate-800">Wg kategorii</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {byCategory.map((c) => (
            <div key={c.category} className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">{c.category}</p>
              <p className="text-2xl font-bold text-slate-900">{c._count}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <Link
          href="/admin/equipment/new"
          className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
        >
          + Dodaj nowy sprzęt
        </Link>
        <Link
          href="/admin/equipment"
          className="rounded-lg border border-slate-300 px-5 py-3 text-slate-700 hover:bg-slate-50"
        >
          Zarządzaj sprzętem
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent = "text-slate-900" }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}