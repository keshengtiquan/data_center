-- DropForeignKey
ALTER TABLE `sys_tenant` DROP FOREIGN KEY `sys_tenant_user_id_fkey`;

-- AlterTable
ALTER TABLE `sys_tenant` MODIFY `user_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `sys_tenant` ADD CONSTRAINT `sys_tenant_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `sys_user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
