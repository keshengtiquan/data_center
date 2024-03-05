/*
  Warnings:

  - You are about to drop the column `create_dept` on the `sys_user` table. All the data in the column will be lost.
  - You are about to drop the column `tenant_id` on the `sys_user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `sys_user` DROP COLUMN `create_dept`,
    DROP COLUMN `tenant_id`,
    MODIFY `nick_name` VARCHAR(30) NULL,
    MODIFY `email` VARCHAR(60) NULL,
    MODIFY `phone_number` VARCHAR(11) NULL,
    ALTER COLUMN `password` DROP DEFAULT;
