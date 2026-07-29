import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

function getPhase(reservation) {
  if (reservation.status !== "ACTIVE") return "CLOSED";
  const now = new Date();
  if (new Date(reservation.startDate) > now) return "FUTURE";
  return "IN_PROGRESS";
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Musisz być zalogowany" }, { status: 401 });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { equipment: true },
    });

    if (!reservation) {
      return NextResponse.json({ error: "Rezerwacja nie znaleziona" }, { status: 404 });
    }

    const isOwner = reservation.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Brak dostępu do tej rezerwacji" }, { status: 403 });
    }

    const phase = getPhase(reservation);
    if (phase === "CLOSED") {
      return NextResponse.json(
        { error: "Ta rezerwacja jest już zamknięta (anulowana lub zwrócona)" },
        { status: 409 }
      );
    }

    const body = await request.json();
    const action = body.action;

    if (action === "cancel") {
      if (phase === "IN_PROGRESS") {
        return NextResponse.json(
          { error: "Nie można anulować rezerwacji, która już się rozpoczęła" },
          { status: 409 }
        );
      }

      const updated = await prisma.reservation.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancelledBy: session.user.id,
        },
      });
      return NextResponse.json({ data: updated });
    }

    if (action === "return") {
      if (phase === "FUTURE") {
        return NextResponse.json(
          { error: "Nie można oznaczyć zwrotu przed rozpoczęciem rezerwacji" },
          { status: 409 }
        );
      }

      const now = new Date();
      const actualEnd = now < new Date(reservation.endDate) ? now : reservation.endDate;

      const updated = await prisma.reservation.update({
        where: { id },
        data: {
          status: "RETURNED",
          returnedAt: now,
          endDate: actualEnd,
        },
      });
      return NextResponse.json({ data: updated });
    }

    if (action === "edit") {
      const newStart = phase === "FUTURE" && body.startDate
        ? new Date(body.startDate)
        : new Date(reservation.startDate);
      const newEnd = new Date(body.endDate);

      if (isNaN(newEnd.getTime())) {
        return NextResponse.json(
          { error: "Błąd walidacji", details: ['Pole "endDate" jest wymagane i musi być poprawną datą'] },
          { status: 400 }
        );
      }

      const errors = [];

      if (phase === "IN_PROGRESS") {
        if (newEnd <= new Date(reservation.endDate)) {
          errors.push("Nową datę końca można tylko wydłużyć, nie skrócić");
        }
      } else {
        if (isNaN(newStart.getTime())) {
          errors.push('Pole "startDate" jest wymagane i musi być poprawną datą');
        }
        if (newStart < new Date()) {
          errors.push("Data rozpoczęcia nie może być w przeszłości");
        }
        if (newEnd <= newStart) {
          errors.push("Data zakończenia musi być późniejsza niż data rozpoczęcia");
        }
      }

      if (errors.length > 0) {
        return NextResponse.json({ error: "Błąd walidacji", details: errors }, { status: 400 });
      }

      const equipment = reservation.equipment;
      const isHourlyMode = equipment.bufferDays === 0;

      let overlapping;
      if (isHourlyMode) {
        overlapping = await prisma.reservation.findFirst({
          where: {
            id: { not: id },
            equipmentId: equipment.id,
            status: "ACTIVE",
            startDate: { lt: newEnd },
            endDate: { gt: newStart },
          },
        });
      } else {
        const bufferMs = equipment.bufferDays * 24 * 60 * 60 * 1000;
        const rangeStart = new Date(newStart.getTime() - bufferMs);
        const rangeEnd = new Date(newEnd.getTime() + bufferMs);

        overlapping = await prisma.reservation.findFirst({
          where: {
            id: { not: id },
            equipmentId: equipment.id,
            status: "ACTIVE",
            startDate: { lte: rangeEnd },
            endDate: { gte: rangeStart },
          },
        });
      }

      if (overlapping) {
        return NextResponse.json(
          { error: "Nowy termin koliduje z inną rezerwacją tego sprzętu" },
          { status: 409 }
        );
      }

      const updated = await prisma.reservation.update({
        where: { id },
        data: { startDate: newStart, endDate: newEnd },
      });
      return NextResponse.json({ data: updated });
    }

    return NextResponse.json({ error: "Nieznana akcja" }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/reservations/[id] error:", error);
    return NextResponse.json({ error: "Nie udało się zaktualizować rezerwacji" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Musisz być zalogowany" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Tylko administrator może usuwać rezerwacje" }, { status: 403 });
    }

    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation) {
      return NextResponse.json({ error: "Rezerwacja nie znaleziona" }, { status: 404 });
    }

    await prisma.reservation.delete({ where: { id } });

    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    console.error("DELETE /api/reservations/[id] error:", error);
    return NextResponse.json({ error: "Nie udało się usunąć rezerwacji" }, { status: 500 });
  }
}