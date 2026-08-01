/*
  Warnings:

  - The values [HIGH,MEDIUM,LOW] on the enum `Demandlevel` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Demandlevel_new" AS ENUM ('High', 'Medium', 'Low');
ALTER TABLE "IndustryInsight" ALTER COLUMN "demandLevel" TYPE "Demandlevel_new" USING ("demandLevel"::text::"Demandlevel_new");
ALTER TYPE "Demandlevel" RENAME TO "Demandlevel_old";
ALTER TYPE "Demandlevel_new" RENAME TO "Demandlevel";
DROP TYPE "public"."Demandlevel_old";
COMMIT;
