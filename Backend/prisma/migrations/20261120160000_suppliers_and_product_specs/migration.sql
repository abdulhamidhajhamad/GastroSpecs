-- CreateEnum
CREATE TYPE "EnergyType" AS ENUM ('electric', 'gas', 'dual');

-- CreateEnum
CREATE TYPE "GasType" AS ENUM ('lpg', 'natural_gas');

-- DropIndex
DROP INDEX "products_categoryId_idx";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "codePrefix" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "certifications" TEXT[],
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "currentAmps" DOUBLE PRECISION,
ADD COLUMN     "currentAmpsCalculated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "depthMm" INTEGER,
ADD COLUMN     "displayRank" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "energyType" "EnergyType",
ADD COLUMN     "frequencyHz" INTEGER,
ADD COLUMN     "gasTypes" "GasType"[],
ADD COLUMN     "heightMm" INTEGER,
ADD COLUMN     "phases" INTEGER,
ADD COLUMN     "powerKw" DOUBLE PRECISION,
ADD COLUMN     "voltage" INTEGER,
ADD COLUMN     "weightKg" DOUBLE PRECISION,
ADD COLUMN     "widthMm" INTEGER;

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "nameLocal" TEXT,
    "country" TEXT,
    "city" TEXT,
    "address" TEXT,
    "website" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_contacts" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "wechat" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_products" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "supplierModel" TEXT NOT NULL,
    "priceAmount" INTEGER,
    "priceCurrency" TEXT,
    "catalogPage" INTEGER,
    "sourceImageKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_normalizedName_key" ON "suppliers"("normalizedName");

-- CreateIndex
CREATE INDEX "supplier_contacts_supplierId_idx" ON "supplier_contacts"("supplierId");

-- CreateIndex
CREATE INDEX "supplier_products_productId_idx" ON "supplier_products"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_products_supplierId_supplierModel_key" ON "supplier_products"("supplierId", "supplierModel");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_products_supplierId_productId_key" ON "supplier_products"("supplierId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "categories_codePrefix_key" ON "categories"("codePrefix");

-- CreateIndex
CREATE UNIQUE INDEX "products_code_key" ON "products"("code");

-- CreateIndex
CREATE INDEX "products_categoryId_displayRank_idx" ON "products"("categoryId", "displayRank");

-- AddForeignKey
ALTER TABLE "supplier_contacts" ADD CONSTRAINT "supplier_contacts_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_products" ADD CONSTRAINT "supplier_products_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_products" ADD CONSTRAINT "supplier_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

