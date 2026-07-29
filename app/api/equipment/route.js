import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateEquipmentInput, validateSpecInput } from '@/lib/validation/equipment';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '20', 10);
    const search = searchParams.get('search') ?? '';
    const category = searchParams.get('category'); // LAPTOP | PHONE | CAMERA | OTHER
    const status = searchParams.get('status'); // AVAILABLE | MAINTENANCE | RETIRED

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

export async function POST(request) {
  try {
    const body = await request.json();

    const { data, errors } = validateEquipmentInput(body);
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Błąd walidacji', details: errors },
        { status: 400 }
      );
    }

    const { data: specData, errors: specErrors } = validateSpecInput(data.category, body.spec);
    if (specErrors.length > 0) {
      return NextResponse.json(
        { error: 'Błąd walidacji specyfikacji', details: specErrors },
        { status: 400 }
      );
    }

    const specRelationKey =
      data.category === 'LAPTOP' ? 'laptopSpec' :
      data.category === 'PHONE' ? 'phoneSpec' :
      data.category === 'CAMERA' ? 'cameraSpec' : null;

    const equipment = await prisma.equipment.create({
      data: {
        ...data,
        ...(specRelationKey && specData && Object.keys(specData).length > 0
          ? { [specRelationKey]: { create: specData } }
          : {}),
      },
      include: {
        laptopSpec: true,
        phoneSpec: true,
        cameraSpec: true,
      },
    });

    return NextResponse.json({ data: equipment }, { status: 201 });
  } catch (error) {
    console.error('POST /api/equipment error:', error);
    return NextResponse.json(
      { error: 'Nie udało się utworzyć sprzętu' },
      { status: 500 }
    );
  }
}