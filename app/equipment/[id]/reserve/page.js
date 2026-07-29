import { notFound, redirect } from "next/navigation";
import prisma from "../../../../lib/prisma";
import { auth } from "../../../../auth";
import ReservationCalendar from "@/components/reservationcalendar";
import Link from "next/link";

export default async function ReservePage({ params }) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?callbackUrl=/equipment/${id}/reserve`);
  }

  const equipment = await prisma.equipment.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      category: true,
      status: true,
      bufferDays: true,
      reservations: {
        where: { status: "ACTIVE" },
        select: { id: true, startDate: true, endDate: true },
      },
    },
  });

  if (!equipment) {
    notFound();
  }

  if (equipment.status !== "AVAILABLE") {
    redirect(`/equipment/${id}`);
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="mx-auto max-w-xl px-6 py-10">
        <Link
          href={`/equipment/${equipment.id}`}
          className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Back to equipment
        </Link>

        <div className="mt-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Reserve {equipment.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{equipment.category}</p>
        </div>

        <div className="mt-6">
          <ReservationCalendar equipment={equipment} />
        </div>
      </section>
    </main>
  );
}