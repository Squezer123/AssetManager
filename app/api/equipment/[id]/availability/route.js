import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const equipment = await prisma.equipment.findUnique({
      where: { id },
      select: {
        id: true,
        bufferDays: true,
        status: true,
        reservations: {
          where: { status: 'ACTIVE' },
          select: { id: true, startDate: true, endDate: true },
        },
      },
    });

    if (!equipment) {
      return NextResponse.json({ error: 'Sprzęt nie znaleziony' }, { status: 404 });
    }

    return NextResponse.json({ data: equipment });
  } catch (error) {
    console.error('GET /api/equipment/[id]/availability error:', error);
    return NextResponse.json({ error: 'Nie udało się pobrać dostępności' }, { status: 500 });
  }
}