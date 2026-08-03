-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "hasDrawer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasStorage" BOOLEAN NOT NULL DEFAULT false;
