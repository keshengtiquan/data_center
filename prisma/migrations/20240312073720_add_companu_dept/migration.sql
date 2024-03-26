-- AlterTable
ALTER TABLE `sys_user` ADD COLUMN `companyDeptId` INTEGER NULL;

-- CreateTable
CREATE TABLE `sys_comoany_dept` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `parent_id` INTEGER NOT NULL DEFAULT 0,
    `dept_name` VARCHAR(30) NOT NULL,
    `create_by` VARCHAR(255) NULL,
    `update_by` VARCHAR(255) NULL,
    `create_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update_time` DATETIME(3) NOT NULL,
    `delete_flag` INTEGER NOT NULL DEFAULT 0,
    `leaderId` INTEGER NULL,
    `userId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sys_user` ADD CONSTRAINT `sys_user_companyDeptId_fkey` FOREIGN KEY (`companyDeptId`) REFERENCES `sys_comoany_dept`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
