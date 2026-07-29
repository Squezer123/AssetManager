const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  await prisma.reservation.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@firma.pl",
      password: passwordHash,
      name: "Admin Testowy",
      role: "ADMIN",
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: "jan.kowalski@firma.pl",
      password: passwordHash,
      name: "Jan Kowalski",
      role: "USER",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "anna.nowak@firma.pl",
      password: passwordHash,
      name: "Anna Nowak",
      role: "USER",
    },
  });

  const laptop = await prisma.equipment.create({
    data: {
      name: "MacBook Pro 14\" M3",
      description: "Laptop developerski, 16GB RAM, 512GB SSD",
      category: "Laptopy",
      status: "AVAILABLE",
      bufferDays: 1,
    },
  });

  const projector = await prisma.equipment.create({
    data: {
      name: "Projektor Epson EB-X41",
      description: "Projektor do sal konferencyjnych",
      category: "Prezentacje",
      status: "AVAILABLE",
      bufferDays: 0,
    },
  });

  const camera = await prisma.equipment.create({
    data: {
      name: "Aparat Canon EOS R6",
      description: "Aparat do materiałów marketingowych",
      category: "Foto/Wideo",
      status: "AVAILABLE",
      bufferDays: 1,
    },
  });

  await prisma.equipment.create({
    data: {
      name: "Monitor Dell 27\" 4K",
      description: "Monitor zewnętrzny do stanowiska hybrydowego",
      category: "Akcesoria",
      status: "MAINTENANCE",
      bufferDays: 0,
    },
  });

  await prisma.reservation.create({
    data: {
      userId: user1.id,
      equipmentId: laptop.id,
      startDate: new Date("2026-08-03"),
      endDate: new Date("2026-08-07"),
      status: "ACTIVE",
    },
  });

  await prisma.reservation.create({
    data: {
      userId: user2.id,
      equipmentId: camera.id,
      startDate: new Date("2026-08-10"),
      endDate: new Date("2026-08-12"),
      status: "RETURNED",
      returnedAt: new Date("2026-08-12"),
    },
  });

  console.log("Seed zakończony:");
  console.log({ admin: admin.email, user1: user1.email, user2: user2.email });
  console.log("Sprzęt:", [laptop.name, projector.name, camera.name]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });