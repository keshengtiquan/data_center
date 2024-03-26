/*
  Warnings:

  - A unique constraint covering the columns `[tenant_id]` on the table `tenant_info` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `tenant_info_tenant_id_key` ON `tenant_info`(`tenant_id`);
