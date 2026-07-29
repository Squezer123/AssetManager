import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const equipment = await prisma.equipment.findUnique({
      where: { id }, 
      include: {
        laptopSpec: true,
        phoneSpec: true,
        cameraSpec: true,
        reservations: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            startDate: true,
            endDate: true,
            userId: true,
          },
        },
      },
    });

    if (!equipment) {
      return NextResponse.json(
        { error: 'Sprzęt nie znaleziony' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: equipment });
  } catch (error) {
    console.error('GET /api/equipment/[id] error:', error);
    return NextResponse.json(
      { error: 'Nie udało się pobrać sprzętu' },
      { status: 500 }
    );
  }
}