-- CreateTable
CREATE TABLE `sys_tenant_user` (
    `user_id` INTEGER NOT NULL,
    `tenant_id` INTEGER NOT NULL,

    PRIMARY KEY (`user_id`, `tenant_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sys_tenant_user` ADD CONSTRAINT `sys_tenant_user_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `sys_user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_tenant_user` ADD CONSTRAINT `sys_tenant_user_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `sys_tenant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
