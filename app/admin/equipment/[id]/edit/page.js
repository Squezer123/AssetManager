import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import EquipmentForm from "@/components/equipmentform";

export default async function EditEquipmentPage({ params }) {
  const { id } = await params;

  const equipment = await prisma.equipment.findUnique({
    where: { id },
    include: {
      laptopSpec: true,
      phoneSpec: true,
      cameraSpec: true,
    },
  });

  if (!equipment) {
    notFound();
  }

  return <EquipmentForm initialData={equipment} />;
}