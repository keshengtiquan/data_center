-- CreateTable
CREATE TABLE `sys_user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenant_id` INTEGER NOT NULL DEFAULT 0,
    `user_type` VARCHAR(10) NOT NULL DEFAULT '',
    `user_name` VARCHAR(30) NOT NULL,
    `nick_name` VARCHAR(30) NOT NULL,
    `email` VARCHAR(60) NOT NULL DEFAULT '',
    `phone_number` VARCHAR(11) NOT NULL DEFAULT '',
    `gender` CHAR(1) NOT NULL DEFAULT '0',
    `avatar` VARCHAR(255) NULL,
    `password` VARCHAR(100) NOT NULL DEFAULT '',
    `status` CHAR(1) NOT NULL DEFAULT '0',
    `create_dept` INTEGER NULL,
    `remark` VARCHAR(500) NOT NULL DEFAULT 'null',
    `create_by` VARCHAR(255) NULL,
    `update_by` VARCHAR(255) NULL,
    `create_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update_time` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
