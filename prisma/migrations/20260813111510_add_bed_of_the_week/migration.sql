-- CreateTable
CREATE TABLE "BedOfTheWeek" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "discountPercentage" DECIMAL(5,2) NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BedOfTheWeek_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BedOfTheWeek_productId_idx" ON "BedOfTheWeek"("productId");

-- CreateIndex
CREATE INDEX "BedOfTheWeek_isActive_idx" ON "BedOfTheWeek"("isActive");

-- CreateIndex
CREATE INDEX "BedOfTheWeek_validFrom_idx" ON "BedOfTheWeek"("validFrom");

-- AddForeignKey
ALTER TABLE "BedOfTheWeek" ADD CONSTRAINT "BedOfTheWeek_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
