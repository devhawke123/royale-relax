-- MySQL 8 only allows DEFAULT on TEXT/BLOB via an expression default. Prisma
-- emits a literal (`DEFAULT ''`) which MySQL rejects (error 1101), so these
-- statements are hand-written as `DEFAULT ('')`.

-- AlterTable
ALTER TABLE `FabricColor` MODIFY `description` TEXT NOT NULL DEFAULT ('');

-- AlterTable
ALTER TABLE `Product` MODIFY `shortDescription` TEXT NOT NULL DEFAULT (''),
    MODIFY `description` TEXT NOT NULL DEFAULT ('');
