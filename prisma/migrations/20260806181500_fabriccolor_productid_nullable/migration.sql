
-- AlterTable
ALTER TABLE "FabricColor" ADD COLUMN     "productId" TEXT;

-- CreateIndex
CREATE INDEX "FabricColor_productId_idx" ON "FabricColor"("productId");

-- AddForeignKey
ALTER TABLE "FabricColor" ADD CONSTRAINT "FabricColor_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

