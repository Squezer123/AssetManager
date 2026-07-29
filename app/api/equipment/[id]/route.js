import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateEquipmentInput, validateSpecInput } from '@/lib/validation/equipment';

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

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.equipment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Sprzęt nie znaleziony' },
        { status: 404 }
      );
    }

    const { data, errors } = validateEquipmentInput(body, { partial: true });
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Błąd walidacji', details: errors },
        { status: 400 }
      );
    }

    const finalCategory = data.category ?? existing.category;

    let specUpdate = {};
    if (body.spec) {
      const { data: specData, errors: specErrors } = validateSpecInput(finalCategory, body.spec);
      if (specErrors.length > 0) {
        return NextResponse.json(
          { error: 'Błąd walidacji specyfikacji', details: specErrors },
          { status: 400 }
        );
      }

      const specRelationKey =
        finalCategory === 'LAPTOP' ? 'laptopSpec' :
        finalCategory === 'PHONE' ? 'phoneSpec' :
        finalCategory === 'CAMERA' ? 'cameraSpec' : null;

      if (specRelationKey && specData) {
        specUpdate = {
          [specRelationKey]: {
            upsert: {
              create: specData,
              update: specData,
            },
          },
        };
      }
    }

    const equipment = await prisma.equipment.update({
      where: { id },
      data: { ...data, ...specUpdate },
      include: {
        laptopSpec: true,
        phoneSpec: true,
        cameraSpec: true,
      },
    });

    return NextResponse.json({ data: equipment });
  } catch (error) {
    console.error('PUT /api/equipment/[id] error:', error);
    return NextResponse.json(
      { error: 'Nie udało się zaktualizować sprzętu' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const existing = await prisma.equipment.findUnique({
      where: { id },
      include: {
        reservations: {
          where: { status: 'ACTIVE' },
          select: { id: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Sprzęt nie znaleziony' },
        { status: 404 }
      );
    }

    if (existing.reservations.length > 0) {
      return NextResponse.json(
        { error: 'Nie można usunąć sprzętu z aktywnymi rezerwacjami' },
        { status: 409 }
      );
    }

    await prisma.equipment.delete({ where: { id } });

    return NextResponse.json({ data: { id } }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/equipment/[id] error:', error);
    return NextResponse.json(
      { error: 'Nie udało się usunąć sprzętu' },
      { status: 500 }
    );
  }
}