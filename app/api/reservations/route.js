import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

const BUSINESS_HOUR_START = 8;
const BUSINESS_HOUR_END = 18;

function startOfDay(d) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function validateReservationDates(startDate, endDate, isHourlyMode) {
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { error: 'Pola "startDate" i "endDate" muszą być poprawnymi datami' };
  }

  if (!isHourlyMode) {
    const start = startOfDay(startDate);
    const end = startOfDay(endDate);
    const today = startOfDay(new Date());

    if (start < today) {
      return { error: "Data rozpoczęcia nie może być w przeszłości" };
    }
    if (end < start) {
      return { error: "Data zakończenia nie może być wcześniejsza niż data rozpoczęcia" };
    }

    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 30) {
      return { error: "Rezerwacja nie może przekraczać 30 dni" };
    }

    return { startDate: start, endDate: end };
  }

  // Tryb godzinowy
  const now = new Date();
  if (startDate < now) {
    return { error: "Wybrany termin jest w przeszłości" };
  }
  if (endDate <= startDate) {
    return { error: "Godzina zakończenia musi być późniejsza niż godzina rozpoczęcia" };
  }

  const sameDay =
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getDate() === endDate.getDate();
  if (!sameDay) {
    return { error: "Rezerwacja godzinowa musi mieścić się w obrębie jednego dnia" };
  }

  const isWholeHour = (d) => d.getMinutes() === 0 && d.getSeconds() === 0;
  if (!isWholeHour(startDate) || !isWholeHour(endDate)) {
    return { error: "Godziny rezerwacji muszą zaczynać się o pełnej godzinie" };
  }

  if (
    startDate.getHours() < BUSINESS_HOUR_START ||
    endDate.getHours() > BUSINESS_HOUR_END ||
    (endDate.getHours() === BUSINESS_HOUR_END && endDate.getMinutes() > 0)
  ) {
    return {
      error: `Rezerwacja musi mieścić się w godzinach ${BUSINESS_HOUR_START}:00-${BUSINESS_HOUR_END}:00`,
    };
  }

  const diffHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
  if (diffHours < 1) {
    return { error: "Minimalny czas rezerwacji to 1 godzina" };
  }

  return { startDate, endDate };
}

async function findCollision(equipment, startDate, endDate) {
  const isHourlyMode = equipment.bufferDays === 0;

  const baseWhere = {
    equipmentId: equipment.id,
    status: "ACTIVE",
  };

  if (isHourlyMode) {
    return prisma.reservation.findFirst({
      where: {
        ...baseWhere,
        startDate: { lt: endDate },
        endDate: { gt: startDate },
      },
    });
  }

  const bufferMs = equipment.bufferDays * 24 * 60 * 60 * 1000;
  const rangeStart = new Date(startDate.getTime() - bufferMs);
  const rangeEnd = new Date(endDate.getTime() + bufferMs);

  return prisma.reservation.findFirst({
    where: {
      ...baseWhere,
      startDate: { lte: rangeEnd },
      endDate: { gte: rangeStart },
    },
  });
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Musisz być zalogowany" }, { status: 401 });
    }

    const isAdmin = session.user.role === "ADMIN";

    const reservations = isAdmin
      ? await prisma.reservation.findMany({
          include: {
            user: { select: { id: true, name: true, email: true } },
            equipment: true,
          },
          orderBy: { startDate: "desc" },
        })
      : await prisma.reservation.findMany({
          where: { userId: session.user.id },
          include: { equipment: true },
          orderBy: { startDate: "desc" },
        });

    return NextResponse.json({ data: reservations });
  } catch (error) {
    console.error("GET /api/reservations error:", error);
    return NextResponse.json({ error: "Nie udało się pobrać rezerwacji" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Musisz być zalogowany" }, { status: 401 });
    }

    const body = await request.json();
    const { equipmentId, startDate: rawStart, endDate: rawEnd } = body;

    if (!equipmentId) {
      return NextResponse.json({ error: 'Pole "equipmentId" jest wymagane' }, { status: 400 });
    }

    const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } });

    if (!equipment) {
      return NextResponse.json({ error: "Sprzęt nie znaleziony" }, { status: 404 });
    }

    if (equipment.status !== "AVAILABLE") {
      return NextResponse.json(
        { error: `Sprzęt nie jest dostępny (status: ${equipment.status})` },
        { status: 409 }
      );
    }

    const isHourlyMode = equipment.bufferDays === 0;
    const result = validateReservationDates(new Date(rawStart), new Date(rawEnd), isHourlyMode);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const { startDate, endDate } = result;

    const overlapping = await findCollision(equipment, startDate, endDate);
    if (overlapping) {
      return NextResponse.json(
        { error: "Sprzęt jest już zarezerwowany w tym terminie" },
        { status: 409 }
      );
    }

    const reservation = await prisma.reservation.create({
      data: {
        userId: session.user.id,
        equipmentId: equipment.id,
        startDate,
        endDate,
        status: "ACTIVE",
      },
      include: { equipment: true },
    });

    return NextResponse.json({ data: reservation }, { status: 201 });
  } catch (error) {
    console.error("POST /api/reservations error:", error);
    return NextResponse.json({ error: "Nie udało się utworzyć rezerwacji" }, { status: 500 });
  }
}