-- AlterTable
ALTER TABLE `sys_user` ADD COLUMN `current_tenant` INTEGER NULL,
    ADD COLUMN `tenant_ids` VARCHAR(100) NULL;
