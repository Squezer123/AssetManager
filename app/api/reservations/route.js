import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { validateReservationInput } from '@/lib/validation/reservation';

export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Musisz być zalogowany, aby dokonać rezerwacji' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const { data, errors } = validateReservationInput(body);
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Błąd walidacji', details: errors },
        { status: 400 }
      );
    }

    const equipment = await prisma.equipment.findUnique({
      where: { id: data.equipmentId },
    });

    if (!equipment) {
      return NextResponse.json(
        { error: 'Sprzęt nie znaleziony' },
        { status: 404 }
      );
    }

    if (equipment.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: `Sprzęt nie jest dostępny (status: ${equipment.status})` },
        { status: 409 }
      );
    }

    const bufferMs = equipment.bufferDays * 24 * 60 * 60 * 1000;
    const rangeStart = new Date(data.startDate.getTime() - bufferMs);
    const rangeEnd = new Date(data.endDate.getTime() + bufferMs);

    const overlapping = await prisma.reservation.findFirst({
      where: {
        equipmentId: data.equipmentId,
        status: 'ACTIVE',
        startDate: { lte: rangeEnd },
        endDate: { gte: rangeStart },
      },
    });

    if (overlapping) {
      return NextResponse.json(
        {
          error:
            'Sprzęt jest już zarezerwowany w tym terminie (z uwzględnieniem bufora przygotowania)',
        },
        { status: 409 }
      );
    }

    const reservation = await prisma.reservation.create({
      data: {
        userId: session.user.id,
        equipmentId: data.equipmentId,
        startDate: data.startDate,
        endDate: data.endDate,
        status: 'ACTIVE',
      },
      include: {
        equipment: {
          select: { id: true, name: true, category: true },
        },
      },
    });

    return NextResponse.json({ data: reservation }, { status: 201 });
  } catch (error) {
    console.error('POST /api/reservations error:', error);
    return NextResponse.json(
      { error: 'Nie udało się utworzyć rezerwacji' },
      { status: 500 }
    );
  }
}