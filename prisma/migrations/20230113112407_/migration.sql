/*
  Warnings:

  - The primary key for the `Report` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Report` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[document_id]` on the table `Report` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `catch_year` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `document_id` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `document_type` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eqiupment_type` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_catch_date` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_edited` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lat` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lon` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_weight` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quota_type` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receive_nation` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receive_place` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `round_weight` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `species_id` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vessel_id` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Report" DROP CONSTRAINT "Report_pkey",
DROP COLUMN "id",
ADD COLUMN     "catch_year" INTEGER NOT NULL,
ADD COLUMN     "document_id" INTEGER NOT NULL,
ADD COLUMN     "document_type" INTEGER NOT NULL,
ADD COLUMN     "eqiupment_type" INTEGER NOT NULL,
ADD COLUMN     "last_catch_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "last_edited" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "lat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "lon" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "product_weight" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "quota_type" INTEGER NOT NULL,
ADD COLUMN     "receive_nation" TEXT NOT NULL,
ADD COLUMN     "receive_place" TEXT NOT NULL,
ADD COLUMN     "round_weight" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "species_id" TEXT NOT NULL,
ADD COLUMN     "vessel_id" INTEGER NOT NULL,
ADD CONSTRAINT "Report_pkey" PRIMARY KEY ("document_id");

-- CreateTable
CREATE TABLE "Species" (
    "id" TEXT NOT NULL,
    "no" TEXT NOT NULL,
    "en" TEXT NOT NULL,
    "la" TEXT NOT NULL,

    CONSTRAINT "Species_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Species_id_key" ON "Species"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Report_document_id_key" ON "Report"("document_id");
