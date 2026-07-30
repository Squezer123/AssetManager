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
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
            Witaj, {session.user.name ?? session.user.email}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{session.user.email}</p>
        </div>

        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:mt-8 sm:p-8">
          <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
            Twoje rezerwacje
          </h2>

          {reservations.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">
              Nie masz jeszcze żadnych rezerwacji.
            </p>
          ) : (
            <>
              {/* Widok tabeli — tylko od md w górę */}
              <table className="mt-4 hidden w-full border-collapse md:table">
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

              {/* Widok kart — tylko poniżej md */}
              <div className="mt-4 space-y-3 md:hidden">
                {reservations.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {r.equipment.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {r.equipment.category}
                        </p>
                      </div>
                      <ReservationStatusBadge status={r.status} />
                    </div>

                    <p className="mt-3 text-sm text-gray-600">
                      {new Date(r.startDate).toLocaleDateString()}
                      {" — "}
                      {new Date(r.endDate).toLocaleDateString()}
                    </p>

                    <div className="mt-3 border-t pt-3">
                      <ReservationActions reservation={r} isAdmin={false} />
                    </div>
                  </div>
                ))}
              </div>
            </>
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