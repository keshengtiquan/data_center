/*
  Warnings:

  - You are about to drop the column `chiefEngineer` on the `tenant_info` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `tenant_info` DROP COLUMN `chiefEngineer`,
    ADD COLUMN `chief_engineer` INTEGER NULL,
    ADD COLUMN `design_address` VARCHAR(191) NULL,
    ADD COLUMN `design_contact` VARCHAR(191) NULL,
    ADD COLUMN `design_tel` VARCHAR(191) NULL,
    ADD COLUMN `develop_address` VARCHAR(191) NULL,
    ADD COLUMN `develop_contact` VARCHAR(191) NULL,
    ADD COLUMN `develop_tel` VARCHAR(191) NULL,
    ADD COLUMN `end_date` DATETIME(3) NULL,
    ADD COLUMN `safety_director` INTEGER NULL,
    ADD COLUMN `start_date` DATETIME(3) NULL,
    ADD COLUMN `supervisor_address` VARCHAR(191) NULL,
    ADD COLUMN `supervisor_contact` VARCHAR(191) NULL,
    ADD COLUMN `supervisor_tel` VARCHAR(191) NULL;
