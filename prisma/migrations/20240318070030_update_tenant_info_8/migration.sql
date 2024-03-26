/*
  Warnings:

  - You are about to drop the `tenant_info` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `tenant_info` DROP FOREIGN KEY `tenant_info_tenant_id_fkey`;

-- DropTable
DROP TABLE `tenant_info`;

-- CreateTable
CREATE TABLE `sys_tenant_info` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenant_id` INTEGER NOT NULL,
    `project_name` VARCHAR(100) NULL,
    `project_address` VARCHAR(100) NULL,
    `manager` INTEGER NULL,
    `chief_engineer` INTEGER NULL,
    `safety_director` INTEGER NULL,
    `start_date` VARCHAR(191) NULL,
    `end_date` VARCHAR(191) NULL,
    `project_nature` VARCHAR(191) NULL,
    `development_organization` VARCHAR(100) NULL,
    `develop_contact` VARCHAR(191) NULL,
    `develop_address` VARCHAR(191) NULL,
    `develop_tel` VARCHAR(191) NULL,
    `design_organization` VARCHAR(100) NULL,
    `design_contact` VARCHAR(191) NULL,
    `design_address` VARCHAR(191) NULL,
    `design_tel` VARCHAR(191) NULL,
    `supervisor_organization` VARCHAR(100) NULL,
    `supervisor_contact` VARCHAR(191) NULL,
    `supervisor_address` VARCHAR(191) NULL,
    `supervisor_tel` VARCHAR(191) NULL,
    `company_dept_id` INTEGER NOT NULL,

    UNIQUE INDEX `sys_tenant_info_tenant_id_key`(`tenant_id`),
    UNIQUE INDEX `sys_tenant_info_company_dept_id_key`(`company_dept_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sys_tenant_info` ADD CONSTRAINT `sys_tenant_info_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `sys_tenant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_tenant_info` ADD CONSTRAINT `sys_tenant_info_company_dept_id_fkey` FOREIGN KEY (`company_dept_id`) REFERENCES `sys_comoany_dept`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
