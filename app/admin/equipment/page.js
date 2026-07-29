import prisma from "@/lib/prisma";
import Link from "next/link";
import AdminEquipmentTable from "@/components/adminequipmenttable";

export default async function AdminEquipmentListPage({ searchParams }) {
  const sp = await searchParams;
  const search = sp?.search ?? "";

  const equipment = await prisma.equipment.findMany({
    where: search
      ? { name: { contains: search, mode: "insensitive" } }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      reservations: {
        where: { status: "ACTIVE" },
        select: { id: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Sprzęt</h1>
        <Link
          href="/admin/equipment/new"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700"
        >
          + Dodaj sprzęt
        </Link>
      </div>

      <form className="flex gap-2">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Szukaj po nazwie..."
          className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
        >
          Szukaj
        </button>
      </form>

      <AdminEquipmentTable equipment={equipment} />
    </div>
  );
}