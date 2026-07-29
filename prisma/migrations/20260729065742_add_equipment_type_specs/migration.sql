/*
  Warnings:

  - Added the required column `category` to the `Equipment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EquipmentCategory" AS ENUM ('LAPTOP', 'PHONE', 'CAMERA', 'OTHER');

-- AlterTable
ALTER TABLE "Equipment" DROP COLUMN "category",
ADD COLUMN     "category" "EquipmentCategory" NOT NULL;

-- CreateTable
CREATE TABLE "LaptopSpec" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "cpu" TEXT NOT NULL,
    "ram" TEXT NOT NULL,
    "storage" TEXT NOT NULL,
    "os" TEXT NOT NULL,

    CONSTRAINT "LaptopSpec_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhoneSpec" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "storage" TEXT NOT NULL,
    "os" TEXT NOT NULL,
    "imei" TEXT,

    CONSTRAINT "PhoneSpec_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CameraSpec" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "sensorType" TEXT,
    "resolution" TEXT,
    "lensMount" TEXT,

    CONSTRAINT "CameraSpec_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LaptopSpec_equipmentId_key" ON "LaptopSpec"("equipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneSpec_equipmentId_key" ON "PhoneSpec"("equipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "CameraSpec_equipmentId_key" ON "CameraSpec"("equipmentId");

-- AddForeignKey
ALTER TABLE "LaptopSpec" ADD CONSTRAINT "LaptopSpec_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneSpec" ADD CONSTRAINT "PhoneSpec_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CameraSpec" ADD CONSTRAINT "CameraSpec_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
