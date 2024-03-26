/*
  Warnings:

  - You are about to drop the column `companyDeptId` on the `sys_user` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `sys_user` DROP FOREIGN KEY `sys_user_companyDeptId_fkey`;

-- AlterTable
ALTER TABLE `sys_user` DROP COLUMN `companyDeptId`,
    ADD COLUMN `company_dept_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `sys_user` ADD CONSTRAINT `sys_user_company_dept_id_fkey` FOREIGN KEY (`company_dept_id`) REFERENCES `sys_comoany_dept`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
