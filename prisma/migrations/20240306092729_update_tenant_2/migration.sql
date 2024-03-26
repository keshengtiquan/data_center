/*
  Warnings:

  - You are about to drop the column `user_id` on the `sys_tenant` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `sys_tenant` DROP FOREIGN KEY `sys_tenant_user_id_fkey`;

-- AlterTable
ALTER TABLE `sys_tenant` DROP COLUMN `user_id`;
