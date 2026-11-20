/*
  Warnings:

  - You are about to drop the `product_business_types` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "product_business_types" DROP CONSTRAINT "product_business_types_businessTypeId_fkey";

-- DropForeignKey
ALTER TABLE "product_business_types" DROP CONSTRAINT "product_business_types_productId_fkey";

-- DropTable
DROP TABLE "product_business_types";

-- CreateTable
CREATE TABLE "business_type_categories" (
    "businessTypeId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "business_type_categories_pkey" PRIMARY KEY ("businessTypeId","categoryId")
);

-- CreateIndex
CREATE INDEX "business_type_categories_categoryId_idx" ON "business_type_categories"("categoryId");

-- AddForeignKey
ALTER TABLE "business_type_categories" ADD CONSTRAINT "business_type_categories_businessTypeId_fkey" FOREIGN KEY ("businessTypeId") REFERENCES "business_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_type_categories" ADD CONSTRAINT "business_type_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
