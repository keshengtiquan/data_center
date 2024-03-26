/*
  Warnings:

  - You are about to drop the column `current_tenant` on the `sys_user` table. All the data in the column will be lost.
  - You are about to drop the column `tenant_ids` on the `sys_user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `sys_user` DROP COLUMN `current_tenant`,
    DROP COLUMN `tenant_ids`,
    ADD COLUMN `tenantId` INTEGER NULL;

-- CreateTable
CREATE TABLE `sys_tenant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contact_user_name` VARCHAR(20) NOT NULL,
    `contact_phone` VARCHAR(20) NOT NULL,
    `company_name` VARCHAR(50) NOT NULL,
    `status` CHAR(1) NOT NULL DEFAULT '0',
    `create_by` VARCHAR(255) NULL,
    `update_by` VARCHAR(255) NULL,
    `create_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update_time` DATETIME(3) NOT NULL,
    `delete_flag` INTEGER NOT NULL DEFAULT 0,
    `user_id` INTEGER NOT NULL,
    `package_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_tenant_package` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `package_name` VARCHAR(20) NOT NULL,
    `remark` VARCHAR(1000) NULL,
    `menu_ids` VARCHAR(3000) NOT NULL,
    `status` CHAR(1) NOT NULL DEFAULT '0',
    `create_by` VARCHAR(255) NULL,
    `update_by` VARCHAR(255) NULL,
    `create_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update_time` DATETIME(3) NOT NULL,
    `delete_flag` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sys_tenant` ADD CONSTRAINT `sys_tenant_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `sys_user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_tenant` ADD CONSTRAINT `sys_tenant_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `sys_tenant_package`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
