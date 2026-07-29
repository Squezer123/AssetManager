const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  await prisma.reservation.deleteMany();
  await prisma.laptopSpec.deleteMany();
  await prisma.phoneSpec.deleteMany();
  await prisma.cameraSpec.deleteMany();
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
      name: 'MacBook Pro 14" M3',
      description: "Laptop developerski, 16GB RAM, 512GB SSD",
      category: "LAPTOP",
      status: "AVAILABLE",
      bufferDays: 1,
      imageUrl: "https://placehold.co/600x400?text=MacBook+Pro",
      laptopSpec: {
        create: {
          manufacturer: "Apple",
          cpu: "M3 Pro",
          ram: "16GB",
          storage: "512GB SSD",
          os: "macOS Sonoma",
        },
      },
    },
  });

  const phone = await prisma.equipment.create({
    data: {
      name: "iPhone 15",
      description: "Telefon służbowy do testów i prezentacji",
      category: "PHONE",
      status: "AVAILABLE",
      bufferDays: 0,
      imageUrl: "https://placehold.co/600x400?text=MacBook+Pro",
      phoneSpec: {
        create: {
          manufacturer: "Apple",
          model: "iPhone 15",
          storage: "128GB",
          os: "iOS 17",
          imei: "123456789012345",
        },
      },
    },
  });

  const camera = await prisma.equipment.create({
    data: {
      name: "Canon EOS R6",
      description: "Aparat do materiałów marketingowych",
      category: "CAMERA",
      status: "AVAILABLE",
      bufferDays: 1,
      imageUrl: "https://placehold.co/600x400?text=MacBook+Pro",
      cameraSpec: {
        create: {
          manufacturer: "Canon",
          sensorType: "Full-frame CMOS",
          resolution: "20MP",
          lensMount: "RF",
        },
      },
    },
  });

  const projector = await prisma.equipment.create({
    data: {
      name: "Projektor Epson EB-X41",
      description: "Projektor do sal konferencyjnych",
      category: "OTHER",
      status: "AVAILABLE",
      bufferDays: 0,
    },
  });

  await prisma.equipment.create({
    data: {
      name: 'Monitor Dell 27" 4K',
      description: "Monitor zewnętrzny do stanowiska hybrydowego",
      category: "OTHER",
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
  console.log("Sprzęt:", [laptop.name, phone.name, camera.name, projector.name]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });