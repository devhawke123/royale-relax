-- CreateTable
CREATE TABLE "Fabric" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fabric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FabricColor" (
    "id" TEXT NOT NULL,
    "fabricId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "colorName" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FabricColor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Fabric_slug_key" ON "Fabric"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Fabric_name_key" ON "Fabric"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FabricColor_code_key" ON "FabricColor"("code");

-- CreateIndex
CREATE INDEX "FabricColor_fabricId_idx" ON "FabricColor"("fabricId");

-- AddForeignKey
ALTER TABLE "FabricColor" ADD CONSTRAINT "FabricColor_fabricId_fkey" FOREIGN KEY ("fabricId") REFERENCES "Fabric"("id") ON DELETE CASCADE ON UPDATE CASCADE;
