import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import ReservationActions from "@/components/reservationactions";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const reservations = await prisma.reservation.findMany({
    where: { userId: session.user.id },
    include: {
      equipment: {
        select: {
          id: true,
          name: true,
          category: true,
          imageUrl: true,
        },
      },
    },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900">
            Witaj, {session.user.name ?? session.user.email}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{session.user.email}</p>
        </div>

        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Twoje rezerwacje
          </h2>

          {reservations.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">
              Nie masz jeszcze żadnych rezerwacji.
            </p>
          ) : (
            <table className="mt-4 w-full border-collapse">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500">
                  <th className="py-3">Sprzęt</th>
                  <th>Kategoria</th>
                  <th>Od</th>
                  <th>Do</th>
                  <th>Status</th>
                  <th>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id} className="border-b text-sm">
                    <td className="py-3 font-medium text-gray-900">
                      {r.equipment.name}
                    </td>
                    <td className="text-gray-600">{r.equipment.category}</td>
                    <td className="text-gray-600">
                      {new Date(r.startDate).toLocaleDateString()}
                    </td>
                    <td className="text-gray-600">
                      {new Date(r.endDate).toLocaleDateString()}
                    </td>
                    <td>
                      <ReservationStatusBadge status={r.status} />
                    </td>
                    <td className="py-3">
                      <ReservationActions reservation={r} isAdmin={false} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
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