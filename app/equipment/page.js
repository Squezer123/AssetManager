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

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-4xl">Dashboard</h2>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          Welcome to the Asset Management System.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-6">
          <div className="rounded-xl bg-white p-4 shadow sm:p-6">
            <p className="text-xs text-gray-500 sm:text-sm">Total equipment</p>
            <h3 className="mt-2 text-2xl font-bold sm:text-4xl">{total}</h3>
          </div>

          <div className="rounded-xl bg-white p-4 shadow sm:p-6">
            <p className="text-xs text-gray-500 sm:text-sm">Available</p>
            <h3 className="mt-2 text-2xl font-bold text-green-600 sm:text-4xl">
              {available}
            </h3>
          </div>

          <div className="col-span-2 rounded-xl bg-white p-4 shadow sm:col-span-1 sm:p-6">
            <p className="text-xs text-gray-500 sm:text-sm">Currently rented</p>
            <h3 className="mt-2 text-2xl font-bold text-orange-500 sm:text-4xl">
              {rented}
            </h3>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-white p-4 shadow sm:mt-12 sm:p-6">
          <h3 className="mb-4 text-lg font-semibold sm:mb-6 sm:text-2xl">Latest equipment</h3>

          <table className="hidden w-full border-collapse md:table">
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

          <div className="space-y-3 md:hidden">
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
                <Link
                  key={item.id}
                  href={`../equipment/${item.id}`}
                  className="block rounded-md border border-slate-100 p-4 active:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${
                        label === "Available"
                          ? "bg-green-100 text-green-700"
                          : label === "Rented"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {label}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">{item.category ?? "—"}</p>

                  {item.description && (
                    <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}