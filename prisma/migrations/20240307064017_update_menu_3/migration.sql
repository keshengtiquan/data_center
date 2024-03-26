/*
  Warnings:

  - You are about to drop the column `tenantId` on the `sys_user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `sys_user` DROP COLUMN `tenantId`;
