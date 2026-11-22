-- Each venue orders its equipment its own way.
ALTER TABLE "business_type_categories" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
