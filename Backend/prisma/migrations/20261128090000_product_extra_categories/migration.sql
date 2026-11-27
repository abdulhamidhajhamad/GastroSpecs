-- A product can also be listed in other subcategories besides its own.
CREATE TABLE "product_extra_categories" (
    "productId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    CONSTRAINT "product_extra_categories_pkey" PRIMARY KEY ("productId","categoryId")
);
CREATE INDEX "product_extra_categories_categoryId_idx" ON "product_extra_categories"("categoryId");
ALTER TABLE "product_extra_categories" ADD CONSTRAINT "product_extra_categories_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_extra_categories" ADD CONSTRAINT "product_extra_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
