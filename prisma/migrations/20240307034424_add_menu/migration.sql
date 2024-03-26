-- CreateTable
CREATE TABLE `sys_menu` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(50) NOT NULL,
    `icon` VARCHAR(100) NULL,
    `path` VARCHAR(125) NOT NULL,
    `component` VARCHAR(125) NULL,
    `name` VARCHAR(100) NULL,
    `hide_in_menu` BOOLEAN NOT NULL DEFAULT false,
    `parent_id` INTEGER NOT NULL DEFAULT 0,
    `is_iframe` BOOLEAN NOT NULL DEFAULT false,
    `url` VARCHAR(500) NULL,
    `affix` BOOLEAN NOT NULL DEFAULT false,
    `hide_in_breadcrumb` BOOLEAN NOT NULL DEFAULT false,
    `hide_children_in_menu` BOOLEAN NOT NULL DEFAULT false,
    `keep_alive` BOOLEAN NOT NULL DEFAULT false,
    `target` VARCHAR(20) NULL DEFAULT '_blank',
    `redirect` VARCHAR(125) NULL,
    `menu_sort` INTEGER NOT NULL,
    `permission` VARCHAR(100) NULL,
    `status` CHAR(1) NOT NULL DEFAULT '0',
    `menuType` CHAR(1) NULL,
    `create_by` VARCHAR(255) NULL,
    `update_by` VARCHAR(255) NULL,
    `create_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update_time` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_menu_role` (
    `menu_id` INTEGER NOT NULL,
    `role_id` INTEGER NOT NULL,

    PRIMARY KEY (`menu_id`, `role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sys_menu_role` ADD CONSTRAINT `sys_menu_role_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `sys_menu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_menu_role` ADD CONSTRAINT `sys_menu_role_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `sys_role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
