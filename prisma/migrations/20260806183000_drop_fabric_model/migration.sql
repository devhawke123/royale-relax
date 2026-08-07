
-- DropForeignKey
ALTER TABLE "FabricColor" DROP CONSTRAINT "FabricColor_fabricId_fkey";

-- DropIndex
DROP INDEX "FabricColor_fabricId_idx";

-- AlterTable
ALTER TABLE "FabricColor" DROP COLUMN "fabricId",
ALTER COLUMN "productId" SET NOT NULL;

-- DropTable
DROP TABLE "Fabric";

