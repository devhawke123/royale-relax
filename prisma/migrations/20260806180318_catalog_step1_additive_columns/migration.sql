-- CreateEnum
CREATE TYPE "StockPolicy" AS ENUM ('TRACKED', 'MADE_TO_ORDER');

-- CreateEnum
CREATE TYPE "BedStyle" AS ENUM ('DIVAN', 'OTTOMAN', 'SLEIGH', 'PANEL', 'UPHOLSTERED', 'WINGED', 'CHESTERFIELD');

-- CreateEnum
CREATE TYPE "MattressType" AS ENUM ('POCKET_SPRUNG', 'MEMORY_FOAM', 'PILLOW_TOP', 'HYBRID', 'LATEX');

-- CreateEnum
CREATE TYPE "Firmness" AS ENUM ('SOFT', 'MEDIUM', 'MEDIUM_FIRM', 'FIRM');

-- CreateEnum
CREATE TYPE "FabricStatus" AS ENUM ('ACTIVE', 'DISCONTINUED');

-- AlterEnum
ALTER TYPE "ProductStatus" ADD VALUE 'ARCHIVED';

-- AlterTable
ALTER TABLE "FabricColor" ADD COLUMN     "status" "FabricStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "stockQty" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "bedStyle" "BedStyle",
ADD COLUMN     "careInstructions" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "depthCm" INTEGER,
ADD COLUMN     "firmness" "Firmness",
ADD COLUMN     "frameMaterial" TEXT,
ADD COLUMN     "leadTimeDays" INTEGER,
ADD COLUMN     "mattressType" "MattressType",
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "ratingAvg" DECIMAL(3,2),
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "saleEndsAt" TIMESTAMP(3),
ADD COLUMN     "saleStartsAt" TIMESTAMP(3),
ADD COLUMN     "shortDescription" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "specSheetUrl" TEXT,
ADD COLUMN     "stockPolicy" "StockPolicy" NOT NULL DEFAULT 'MADE_TO_ORDER',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "warrantyMonths" INTEGER;

-- AlterTable
ALTER TABLE "ProductSize" ADD COLUMN     "heightCm" INTEGER,
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "leadTimeDays" INTEGER,
ADD COLUMN     "lengthCm" INTEGER,
ADD COLUMN     "priceOverride" DECIMAL(10,2),
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "widthCm" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "ProductSize_sku_key" ON "ProductSize"("sku");

