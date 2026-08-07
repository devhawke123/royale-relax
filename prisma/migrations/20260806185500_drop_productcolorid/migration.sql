
-- DropForeignKey
ALTER TABLE "ProductImage" DROP CONSTRAINT "ProductImage_productColorId_fkey";

-- DropIndex
DROP INDEX "ProductImage_productColorId_idx";

-- AlterTable
ALTER TABLE "ProductImage" DROP COLUMN "productColorId",
ALTER COLUMN "productId" SET NOT NULL;

