-- CreateTable
CREATE TABLE `tenant_info` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenant_id` INTEGER NOT NULL,
    `project_name` VARCHAR(100) NOT NULL,
    `project_address` VARCHAR(100) NOT NULL,
    `manager` INTEGER NOT NULL,
    `chiefEngineer` INTEGER NOT NULL,
    `development_organization` VARCHAR(100) NOT NULL,
    `design_organization` VARCHAR(100) NOT NULL,
    `supervisor_organization` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tenant_info` ADD CONSTRAINT `tenant_info_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `sys_tenant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
