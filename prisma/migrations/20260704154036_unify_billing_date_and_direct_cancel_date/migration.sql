/*
  Warnings:

  - You are about to drop the column `autoCancelAfterMonths` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `billingDay` on the `Subscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "autoCancelAfterMonths",
DROP COLUMN "billingDay";
