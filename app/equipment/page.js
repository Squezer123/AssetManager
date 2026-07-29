import Link from "next/link";
import prisma from "../../lib/prisma.js";
import { withMinDelay } from "../../lib/withMinDelay.js";

export default async function EquipmentPage() {
  const equipment = await withMinDelay(
    prisma.equipment.findMany({
      include: {
        reservations: {
          where: {
            status: "ACTIVE",
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  );

  const total = equipment.length;
  const rented = equipment.filter((item) => item.reservations.length > 0).length;
  const available = equipment.filter(
    (item) => item.status === "AVAILABLE" && item.reservations.length === 0
  ).length;

  return (
    <main className="min-h-screen bg-slate-100">
      <nav className="border-b bg-white shadow-sm"></nav>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <h2 className="text-4xl font-bold text-slate-900">Dashboard</h2>
        <p className="mt-2 text-slate-600">
          Welcome to the Asset Management System.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">Total equipment</p>
            <h3 className="mt-2 text-4xl font-bold">{total}</h3>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">Available</p>
            <h3 className="mt-2 text-4xl font-bold text-green-600">
              {available}
            </h3>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">Currently rented</p>
            <h3 className="mt-2 text-4xl font-bold text-orange-500">
              {rented}
            </h3>
          </div>
        </div>

        <div className="mt-12 rounded-xl bg-white p-6 shadow">
          <h3 className="mb-6 text-2xl font-semibold">Latest equipment</h3>

          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="py-3">Name</th>
                <th>Category</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {equipment.map((item) => {
                const isRented = item.reservations.length > 0;
                const label =
                  item.status === "MAINTENANCE"
                    ? "Maintenance"
                    : item.status === "RETIRED"
                    ? "Retired"
                    : isRented
                    ? "Rented"
                    : "Available";

                return (
                  <tr
                    key={item.id}
                    className="group relative cursor-pointer border-b transition-colors hover:bg-blue-100 hover:ring-2 hover:ring-inset hover:ring-blue-300"
                  >
                    <td className="px-4 py-4 font-medium text-slate-900">
                      <Link href={`../equipment/${item.id}`} className="absolute inset-0">
                        <span className="sr-only">Zobacz {item.name}</span>
                      </Link>
                      <span className="flex items-center gap-2">
                        {item.name}
                        <span className="text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                          →
                        </span>
                      </span>
                    </td>
                    <td>{item.category ?? "—"}</td>
                    <td>{item.description ?? "—"}</td>
                    <td>
                      <span
                        className={`rounded-full px-3 py-1 text-sm ${
                          label === "Available"
                            ? "bg-green-100 text-green-700"
                            : label === "Rented"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}