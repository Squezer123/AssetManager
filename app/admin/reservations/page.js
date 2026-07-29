import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ReservationActions from "@/components/reservationactions";

export default async function AdminReservationsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const reservations = await prisma.reservation.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      equipment: {
        select: {
          id: true,
          name: true,
          category: true,
          bufferDays: true,
          reservations: {
            where: { status: "ACTIVE" },
            select: { id: true, startDate: true, endDate: true },
          },
        },
      },
    },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Rezerwacje</h1>
          <p className="mt-1 text-slate-600">
            Wszystkie rezerwacje w systemie ({reservations.length})
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          ← Wróć do dashboardu
        </Link>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        {reservations.length === 0 ? (
          <p className="text-sm text-slate-500">Brak rezerwacji w systemie.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-left text-sm text-slate-500">
                <th className="py-3">Sprzęt</th>
                <th>Użytkownik</th>
                <th>Od</th>
                <th>Do</th>
                <th>Status</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id} className="border-b text-sm">
                  <td className="py-3 font-medium text-slate-900">
                    {r.equipment.name}
                    <span className="ml-2 text-xs text-slate-400">
                      {r.equipment.category}
                    </span>
                  </td>
                  <td className="text-slate-600">
                    {r.user.name ?? r.user.email}
                  </td>
                  <td className="text-slate-600">
                    {new Date(r.startDate).toLocaleDateString()}
                  </td>
                  <td className="text-slate-600">
                    {new Date(r.endDate).toLocaleDateString()}
                  </td>
                  <td>
                    <ReservationStatusBadge status={r.status} />
                  </td>
                  <td className="py-3">
                    <ReservationActions reservation={r} isAdmin={true} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ReservationStatusBadge({ status }) {
  const styles = {
    ACTIVE: "bg-green-100 text-green-700",
    RETURNED: "bg-gray-200 text-gray-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs ${styles[status]}`}>
      {status}
    </span>
  );
}