import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '20', 10);
    const search = searchParams.get('search') ?? '';
    const category = searchParams.get('category'); 
    const status = searchParams.get('status'); 

    const where = {
      ...(search && {
        name: { contains: search, mode: 'insensitive' },
      }),
      ...(category && { category }),
      ...(status && { status }),
    };

    const [equipment, total] = await Promise.all([
      prisma.equipment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          laptopSpec: true,
          phoneSpec: true,
          cameraSpec: true,
        },
      }),
      prisma.equipment.count({ where }),
    ]);

    return NextResponse.json({
      data: equipment,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/equipment error:', error);
    return NextResponse.json(
      { error: 'Nie udało się pobrać sprzętu' },
      { status: 500 }
    );
  }
}